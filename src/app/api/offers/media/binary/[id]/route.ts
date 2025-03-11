import { ObjectId } from 'mongodb';

import { NextRequest } from 'next/server';

import clientPromise from '../../../../../../../lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET /api/offers/media/binary/[id] - ID:', params.id);

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

      // Récupérer les données binaires directement
      let binaryData;

      if (media.data.buffer) {
        console.log('Utilisation de media.data.buffer');
        binaryData = media.data.buffer;
      } else if (typeof media.data === 'string') {
        console.log('Conversion de la chaîne en buffer');
        binaryData = Buffer.from(media.data, 'base64');
      } else {
        console.log('Tentative de récupération directe des données');
        binaryData = media.data;
      }

      // Retourner le fichier avec le bon type MIME
      return new Response(binaryData, {
        headers: {
          'Content-Type': media.contentType || 'image/jpeg',
          'Content-Disposition': `inline; filename="${media.filename || 'file'}"`,
          'Cache-Control': 'no-cache',
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
