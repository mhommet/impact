import { jwtVerify } from 'jose';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import clientPromise from '../../../../../lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function GET(req: NextRequest) {
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

      const client = await clientPromise;
      const db = client.db('impact');

      // Récupérer les candidatures de l'UGC avec un offerCode
      const candidatures = await db
        .collection('candidatures')
        .find({
          ugcId: payload.userId,
          offerCode: { $exists: true },
        })
        .toArray();

      console.log('Candidatures trouvées:', candidatures.length, 'pour ugcId:', payload.userId);

      if (candidatures.length === 0) {
        return NextResponse.json([]);
      }

      const offerCodes = candidatures.map((c) => c.offerCode);
      console.log("Codes d'offres à rechercher:", offerCodes);

      // Vérifier d'abord si les offres existent avec ces codes
      const offersCheck = await db
        .collection('offres')
        .find({
          code: { $in: offerCodes },
          status: 'in_progress',
        })
        .toArray();

      console.log('Offres trouvées avant agrégation:', offersCheck.length);

      // Récupérer les offres correspondantes avec les informations de l'entreprise
      // Essayer d'abord sans le $unwind pour éviter les erreurs
      const offers = await db
        .collection('offres')
        .aggregate([
          {
            $match: {
              code: { $in: offerCodes },
              status: 'in_progress',
            },
          },
          {
            $lookup: {
              from: 'entreprise', // Changé de 'entreprises' à 'entreprise' (singulier)
              localField: 'entrepriseId',
              foreignField: 'code', // Utiliser 'code' au lieu de '_id'
              as: 'entrepriseInfo',
            },
          },
          {
            $unwind: {
              path: '$entrepriseInfo',
              preserveNullAndEmptyArrays: true, // Préserver les documents même si pas de correspondance
            },
          },
          {
            $project: {
              _id: 1,
              code: 1,
              name: 1,
              description: 1,
              category: 1,
              reward: 1,
              status: 1,
              medias: 1,
              'entrepriseInfo.name': 1,
              'entrepriseInfo.logo': 1,
            },
          },
        ])
        .toArray();

      console.log('Offres trouvées après agrégation:', offers.length);
      return NextResponse.json(offers);
    } catch (error) {
      console.error('Erreur de token:', error);
      return new NextResponse('Token invalide', { status: 401 });
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
