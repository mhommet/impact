import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import clientPromise from '../../../../lib/mongodb';
import { notifyNewRating } from '../../../../lib/notification';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      const body = await req.json();
      console.log('Received request body:', body);

      const { offerId, toId, rating, comment, type } = body;

      // Detailed validation
      const missingFields = [];
      if (!offerId) missingFields.push('offerId');
      if (!toId) missingFields.push('toId');
      if (!rating) missingFields.push('rating');
      if (!comment) missingFields.push('comment');
      if (!type) missingFields.push('type');

      if (missingFields.length > 0) {
        return NextResponse.json(
          {
            message: 'Données manquantes',
            details: `Champs manquants: ${missingFields.join(', ')}`,
          },
          { status: 400 }
        );
      }

      const client = await clientPromise;
      const db = client.db('impact');

      // Verify that the offer exists
      let offer;
      try {
        // Essayer d'abord avec _id (si c'est un ObjectId valide)
        if (ObjectId.isValid(offerId)) {
          offer = await db.collection('offres').findOne({ _id: new ObjectId(offerId) });
        }
      } catch (error) {
        console.log('Erreur lors de la recherche par ObjectId:', error);
      }

      // Si l'offre n'est pas trouvée par _id, essayer avec le code
      if (!offer) {
        offer = await db.collection('offres').findOne({ code: offerId });
      }

      if (!offer) {
        console.log('Offre non trouvée avec ID/code:', offerId);
        return NextResponse.json({ message: 'Offre non trouvée' }, { status: 404 });
      }

      // Vérifier si un avis existe déjà
      const existingRating = await db.collection('ratings').findOne({
        offerId,
        fromId: payload.userId,
        toId,
        type,
      });

      if (existingRating) {
        return NextResponse.json(
          { message: 'Un avis a déjà été donné pour cette offre' },
          { status: 400 }
        );
      }

      // Récupérer les informations sur l'utilisateur qui émet l'avis
      const fromUserCollection = payload.type === 'ugc' ? 'ugc' : 'entreprises';
      const fromUser = await db.collection(fromUserCollection).findOne({
        code: payload.userId,
      });

      if (!fromUser) {
        return NextResponse.json({ message: 'Utilisateur émetteur non trouvé' }, { status: 404 });
      }

      const fromUserName = fromUser.name || (payload.type === 'ugc' ? 'UGC' : 'Entreprise');

      // Créer le nouvel avis
      const newRating = {
        offerId,
        fromId: payload.userId,
        toId,
        rating,
        comment,
        type,
        createdAt: new Date(),
      };

      const result = await db.collection('ratings').insertOne(newRating);

      // Mettre à jour le champ approprié dans l'offre
      const ratingField = type === 'ugc' ? 'entrepriseRating' : 'ugcRating';

      // Utiliser le même identifiant que celui utilisé pour trouver l'offre
      const updateQuery: { _id?: any; code?: string } = {};
      if (offer._id) {
        updateQuery._id = offer._id;
      } else if (offer.code) {
        updateQuery.code = offer.code;
      }

      await db.collection('offres').updateOne(updateQuery, {
        $set: {
          [ratingField]: {
            rating,
            comment,
            createdAt: new Date(),
          },
        },
      });

      // Envoyer une notification à l'utilisateur évalué
      await notifyNewRating(
        result.insertedId.toString(),
        rating,
        toId,
        type,
        fromUserName,
        offer.title
      );

      return NextResponse.json({ message: 'Avis enregistré avec succès' });
    } catch (error) {
      console.error('Erreur de token ou de traitement:', error);
      return NextResponse.json(
        {
          message: 'Erreur de traitement',
          details: error instanceof Error ? error.message : 'Erreur inconnue',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'avis:", error);
    return NextResponse.json(
      {
        message: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    if (!userId || !type) {
      return new NextResponse('Paramètres manquants', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('impact');

    const ratings = await db
      .collection('ratings')
      .aggregate([
        {
          $match: {
            toId: userId,
            type,
          },
        },
        {
          $lookup: {
            from: 'ugc',
            localField: 'fromId',
            foreignField: 'code',
            as: 'ugcInfo',
          },
        },
        {
          $unwind: '$ugcInfo',
        },
        {
          $project: {
            rating: 1,
            comment: 1,
            createdAt: 1,
            ugcInfo: {
              name: '$ugcInfo.name',
              profileImage: '$ugcInfo.profileImage',
              title: '$ugcInfo.title',
            },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
