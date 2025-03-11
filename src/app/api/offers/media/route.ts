import { jwtVerify } from 'jose';
import { Document, ObjectId, UpdateFilter } from 'mongodb';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { Media, OfferStatus } from '@/types/offer';

import clientPromise from '../../../../../lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

// Limites de taille en octets
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 Mo

// Types MIME autorisés
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.type !== 'ugc') {
        return new NextResponse('Non autorisé - UGC uniquement', { status: 403 });
      }

      const formData = await req.formData();
      const file = formData.get('file') as File;
      const offerCode = formData.get('offerCode') as string;
      const description = formData.get('description') as string;
      const type = file.type.startsWith('image/') ? 'image' : 'video';

      if (!file || !offerCode) {
        return new NextResponse("Fichier ou code de l'offre manquant", { status: 400 });
      }

      // Vérifier le type MIME
      if (type === 'image' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return new NextResponse(
          `Type d'image non autorisé. Types acceptés : ${ALLOWED_IMAGE_TYPES.join(', ')}`,
          { status: 400 }
        );
      }

      if (type === 'video' && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return new NextResponse(
          `Type de vidéo non autorisé. Types acceptés : ${ALLOWED_VIDEO_TYPES.join(', ')}`,
          { status: 400 }
        );
      }

      // Vérifier la taille du fichier
      const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
      if (file.size > maxSize) {
        const sizeInMb = maxSize / (1024 * 1024);
        return new NextResponse(
          `Fichier trop volumineux. Taille maximale pour les ${type}s : ${sizeInMb} Mo`,
          { status: 400 }
        );
      }

      // Vérifier que l'offre existe et est en cours
      const client = await clientPromise;
      const db = client.db('impact');

      const offer = await db.collection('offres').findOne({
        code: offerCode,
        status: OfferStatus.IN_PROGRESS,
      });

      if (!offer) {
        return new NextResponse('Offre non trouvée ou non en cours', { status: 404 });
      }

      // Vérifier que l'UGC est bien celui qui a été accepté pour cette offre
      const candidature = await db.collection('candidatures').findOne({
        offerCode,
        ugcId: payload.userId,
        status: 'accepted',
      });

      if (!candidature) {
        return new NextResponse("Vous n'êtes pas autorisé à ajouter des médias à cette offre", {
          status: 403,
        });
      }

      // Convertir le fichier en Buffer pour le stockage
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Stocker le fichier dans la base de données
      const media = {
        _id: new ObjectId(),
        type,
        data: buffer,
        filename: file.name,
        contentType: file.type,
        description,
        createdAt: new Date().toISOString(),
        offerCode,
        ugcId: payload.userId,
        size: file.size, // Ajouter la taille pour référence
      };

      await db.collection('medias').insertOne(media);

      // Ajouter la référence du média à l'offre
      await db.collection('offres').updateOne({ code: offerCode }, {
        $push: {
          medias: {
            _id: media._id.toString(),
            type,
            url: `/api/offers/media/${media._id}`,
            createdAt: media.createdAt,
            description,
          },
        },
      } as { $push: { [key: string]: any } });

      return NextResponse.json({
        message: 'Média ajouté avec succès',
        mediaId: media._id,
      });
    } catch (error) {
      console.error('Erreur de token:', error);
      return new NextResponse('Token invalide', { status: 401 });
    }
  } catch (error) {
    console.error("Erreur lors de l'upload du média:", error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Extraire l'ID du média de l'URL de manière plus robuste
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const mediaId = pathParts[pathParts.length - 1];

    console.log('URL complète:', req.url);
    console.log('Chemin:', url.pathname);
    console.log('Parties du chemin:', pathParts);
    console.log('ID du média extrait:', mediaId);

    if (!mediaId) {
      return new NextResponse('ID du média manquant', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('impact');

    // Vérifier si la collection existe et contient des données
    const collections = await db.listCollections({ name: 'medias' }).toArray();
    if (collections.length === 0) {
      console.error('La collection "medias" n\'existe pas');
      return new NextResponse('Collection de médias non trouvée', { status: 500 });
    }

    // Compter le nombre total de médias
    const totalMedias = await db.collection('medias').countDocuments();
    console.log('Nombre total de médias dans la collection:', totalMedias);

    try {
      // Essayer de convertir l'ID en ObjectId
      const objectId = new ObjectId(mediaId);
      console.log('ObjectId créé avec succès:', objectId);

      const media = await db.collection('medias').findOne({
        _id: objectId,
      });

      if (!media) {
        console.log('Média non trouvé pour ID:', mediaId);

        // Récupérer quelques médias pour vérifier la structure
        const sampleMedias = await db.collection('medias').find().limit(2).toArray();
        console.log(
          'Échantillon de médias disponibles:',
          sampleMedias.map((m) => ({ id: m._id.toString(), type: m.contentType }))
        );

        return new NextResponse('Média non trouvé', { status: 404 });
      }

      console.log('Média trouvé:', {
        id: media._id.toString(),
        type: media.contentType,
        filename: media.filename,
        size: media.data ? media.data.length : 0,
      });

      // Vérifier que les données sont bien un Buffer
      if (!media.data) {
        console.error('Les données du média sont manquantes');
        return new NextResponse('Données du média manquantes', { status: 500 });
      }

      // Convertir en Buffer si ce n'est pas déjà le cas
      const buffer = media.data instanceof Buffer ? media.data : Buffer.from(media.data);

      // Retourner le fichier avec le bon type MIME
      return new Response(buffer, {
        headers: {
          'Content-Type': media.contentType || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${media.filename || 'file'}"`,
          'Cache-Control': 'public, max-age=31536000', // Cache d'un an
        },
      });
    } catch (error) {
      console.error("Erreur lors de la conversion de l'ID en ObjectId:", error);
      return new NextResponse('ID de média invalide', { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du média:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
