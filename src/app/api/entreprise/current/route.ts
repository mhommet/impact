import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import clientPromise from '../../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

const DEFAULT_PROFILE_IMAGE =
  'https://tg-stockach.de/wp-content/uploads/2020/12/5f4d0f15338e20133dc69e95_dummy-profile-pic-300x300.png';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.type !== 'entreprise') {
        return new NextResponse('Non autorisé - Entreprises uniquement', { status: 403 });
      }

      const entrepriseId = payload.userId;
      if (!entrepriseId || typeof entrepriseId !== 'string') {
        return new NextResponse('ID entreprise non trouvé ou invalide', { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db('impact');

      // Chercher le profil ou en créer un nouveau s'il n'existe pas
      let entreprise = await db.collection('entreprise').findOne({ code: entrepriseId });

      if (!entreprise) {
        // Créer un profil par défaut
        const newEntreprise = {
          _id: new ObjectId(),
          code: entrepriseId,
          name: '',
          description: '',
          category: '',
          location: '',
          siret: '',
          logo: DEFAULT_PROFILE_IMAGE,
          website: '',
          stats: {
            offersPublished: 0,
            activeOffers: 0,
            totalCandidates: 0,
          },
          createdAt: new Date(),
        };

        await db.collection('entreprise').insertOne(newEntreprise);
        entreprise = newEntreprise;
      }

      return NextResponse.json(entreprise);
    } catch (error) {
      return new NextResponse('Token invalide', { status: 401 });
    }
  } catch (e) {
    console.error('Erreur lors de la récupération du profil:', e);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
