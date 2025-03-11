import { ObjectId } from 'mongodb';

import { NextRequest } from 'next/server';

import clientPromise from '../../../../../../../lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET /api/offers/media/base64/[id] - ID:', params.id);

  try {
    const mediaId = params.id;

    if (!mediaId) {
      console.error('ID du média manquant');
      return new Response('ID du média manquant', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('impact');

    try {
      // Convertir l'ID en ObjectId
      const objectId = new ObjectId(mediaId);

      // Rechercher le média dans la base de données
      const media = await db.collection('medias').findOne({
        _id: objectId,
      });

      if (!media) {
        console.error('Média non trouvé pour ID:', mediaId);
        return new Response('Média non trouvé', { status: 404 });
      }

      console.log('Média trouvé:', {
        id: media._id.toString(),
        type: media.contentType,
        filename: media.filename,
      });

      // Vérifier que les données sont présentes
      if (!media.data) {
        console.error('Les données du média sont manquantes');
        return new Response('Données du média manquantes', { status: 500 });
      }

      // Récupérer la chaîne Base64 directement
      let base64String;

      if (typeof media.data === 'string') {
        console.log('Les données sont déjà une chaîne');
        base64String = media.data;
      } else if (media.data._bsontype === 'Binary') {
        console.log('Conversion de BSON Binary en chaîne Base64');
        // Pour les objets BSON Binary, on peut utiliser toString('base64')
        base64String = media.data.toString('base64');
      } else if (media.data.buffer) {
        console.log('Conversion du buffer en chaîne Base64');
        base64String = Buffer.from(media.data.buffer).toString('base64');
      } else {
        console.log('Tentative de conversion générique en chaîne Base64');
        base64String = Buffer.from(media.data).toString('base64');
      }

      // Créer une URL de données (data URL)
      const dataUrl = `data:${media.contentType || 'image/jpeg'};base64,${base64String}`;

      // Retourner l'URL de données
      return new Response(dataUrl, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } catch (error) {
      console.error('Erreur lors du traitement du média:', error);
      return new Response('Erreur de traitement', { status: 500 });
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    return new Response('Erreur serveur', { status: 500 });
  }
}
