import { ObjectId } from 'mongodb';

import { NextRequest } from 'next/server';

import clientPromise from '../../../../../../lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET /api/offers/media/[id] - ID:', params.id);

  try {
    const mediaId = params.id;

    if (!mediaId) {
      console.error('ID du média manquant');
      return new Response('ID du média manquant', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('impact');

    // Log pour vérifier la connexion à la base de données
    console.log('Connexion à la base de données établie');

    // Vérifier si la collection existe
    const collections = await db.listCollections({ name: 'medias' }).toArray();
    if (collections.length === 0) {
      console.error('La collection "medias" n\'existe pas');
      return new Response('Collection de médias non trouvée', { status: 500 });
    }

    // Log pour vérifier le nombre de médias
    const totalMedias = await db.collection('medias').countDocuments();
    console.log('Nombre total de médias dans la collection:', totalMedias);

    try {
      // Convertir l'ID en ObjectId
      const objectId = new ObjectId(mediaId);
      console.log('ObjectId créé avec succès:', objectId.toString());

      // Rechercher le média dans la base de données
      const media = await db.collection('medias').findOne({
        _id: objectId,
      });

      if (!media) {
        console.error('Média non trouvé pour ID:', mediaId);

        // Récupérer quelques médias pour vérifier la structure
        const sampleMedias = await db.collection('medias').find().limit(2).toArray();
        console.log(
          'Échantillon de médias disponibles:',
          sampleMedias.map((m) => ({ id: m._id.toString(), type: m.contentType }))
        );

        return new Response('Média non trouvé', { status: 404 });
      }

      console.log('Média trouvé:', {
        id: media._id.toString(),
        type: media.contentType,
        filename: media.filename,
        size: media.data
          ? typeof media.data.length === 'number'
            ? media.data.length
            : 'unknown size'
          : 'no data',
        dataType: media.data ? typeof media.data : 'undefined',
        isBuffer: media.data instanceof Buffer,
        isObject: typeof media.data === 'object',
        hasBufferFrom: media.data && typeof media.data.buffer !== 'undefined',
        keys: media.data ? Object.keys(media.data) : [],
        bsonType: media.data && media.data._bsontype ? media.data._bsontype : 'not bson',
      });

      // Vérifier que les données sont présentes
      if (!media.data) {
        console.error('Les données du média sont manquantes');
        return new Response('Données du média manquantes', { status: 500 });
      }

      // Convertir en Buffer selon le format des données
      let buffer;

      try {
        if (media.data instanceof Buffer) {
          console.log('Les données sont déjà un Buffer');
          buffer = media.data;
        } else if (media.data._bsontype === 'Binary') {
          console.log('Les données sont de type BSON Binary');
          // Pour les objets BSON Binary, on accède directement au buffer
          buffer = media.data.buffer;
        } else if (media.data.buffer) {
          console.log('Les données ont une propriété buffer');
          buffer = Buffer.from(media.data.buffer);
        } else if (media.data.data) {
          console.log('Les données ont une propriété data');
          buffer = Buffer.from(media.data.data);
        } else if (typeof media.data === 'string') {
          console.log('Les données sont une chaîne (probablement Base64)');
          buffer = Buffer.from(media.data, 'base64');
        } else {
          console.log('Tentative de conversion générique des données en Buffer');
          // Essayer de convertir directement l'objet en Buffer
          buffer = Buffer.from(media.data);
        }

        console.log('Taille du buffer final:', buffer ? buffer.length : 'buffer null');

        if (!buffer || buffer.length === 0) {
          console.error('Buffer vide après conversion');

          // Essayer une autre approche pour les objets BSON Binary
          if (media.data._bsontype === 'Binary' && media.data.value) {
            console.log('Tentative avec media.data.value pour BSON Binary');
            buffer = Buffer.from(media.data.value(true), 'binary');
          } else if (
            media.data._bsontype === 'Binary' &&
            typeof media.data.toString === 'function'
          ) {
            console.log('Tentative avec media.data.toString() pour BSON Binary');
            buffer = Buffer.from(media.data.toString('binary'), 'binary');
          }

          if (!buffer || buffer.length === 0) {
            return new Response('Données du média invalides ou vides', { status: 500 });
          }
        }
      } catch (error) {
        console.error('Erreur lors de la conversion des données en Buffer:', error);
        return new Response('Erreur de conversion des données', { status: 500 });
      }

      // Retourner le fichier avec le bon type MIME et des en-têtes de cache
      console.log('Envoi de la réponse avec Content-Type:', media.contentType || 'image/jpeg');
      console.log('Taille finale du buffer:', buffer.length);

      return new Response(buffer, {
        headers: {
          'Content-Type': media.contentType || 'image/jpeg', // Fallback sur image/jpeg si contentType n'est pas défini
          'Content-Disposition': `inline; filename="${media.filename || 'file'}"`,
          'Cache-Control': 'public, max-age=31536000', // Cache d'un an
          'Access-Control-Allow-Origin': '*', // Permettre l'accès depuis n'importe quelle origine
        },
      });
    } catch (error) {
      console.error("Erreur lors de la conversion de l'ID en ObjectId:", error);
      return new Response('ID de média invalide', { status: 400 });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du média:', error);
    return new Response('Erreur serveur', { status: 500 });
  }
}
