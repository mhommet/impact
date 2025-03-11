import { ObjectId } from 'mongodb';

import { NextRequest } from 'next/server';

import clientPromise from '../../../../../../../lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET /api/offers/media/raw/[id] - ID:', params.id);

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

      // Récupérer les données binaires
      let buffer;

      try {
        if (media.data._bsontype === 'Binary') {
          // Pour les objets BSON Binary, on peut utiliser value() pour obtenir le buffer
          console.log('Utilisation de media.data.value() pour BSON Binary');
          const value = media.data.value(true);
          buffer = Buffer.from(value);
        } else if (media.data.buffer) {
          console.log('Utilisation de media.data.buffer');
          buffer = Buffer.from(media.data.buffer);
        } else if (typeof media.data === 'string') {
          console.log('Conversion de la chaîne en buffer');
          buffer = Buffer.from(media.data, 'base64');
        } else {
          console.log('Tentative de conversion générique en buffer');
          buffer = Buffer.from(media.data);
        }

        console.log('Taille du buffer:', buffer.length);

        if (buffer.length === 0) {
          throw new Error('Buffer vide après conversion');
        }
      } catch (error) {
        console.error('Erreur lors de la conversion des données:', error);

        // Dernière tentative: utiliser directement les données brutes
        console.log("Tentative d'utilisation directe des données brutes");
        buffer = media.data;
      }

      // Retourner les données binaires avec le bon type MIME
      return new Response(buffer, {
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
