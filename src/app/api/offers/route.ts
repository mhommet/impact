import { jwtVerify } from 'jose';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { OfferStatus } from '@/types/offer';

import clientPromise from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification dans les cookies et l'en-tête Authorization
    const cookieStore = cookies();
    const cookieToken = cookieStore.get('token')?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // Utiliser le premier token valide trouvé
    const token = cookieToken || bearerToken;

    if (!token) {
      console.error('Token manquant dans la requête');
      return new NextResponse('Non autorisé', { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      console.log("Type d'utilisateur:", payload.type);

      // Initialize MongoDB
      const client = await clientPromise;
      const db = client.db('impact');

      // Si c'est un UGC, on renvoie toutes les offres non archivées et actives
      if (payload.type === 'ugc') {
        console.log('Récupération des offres pour UGC');

        // Vérifier d'abord les offres sans agrégation
        const simpleOffers = await db
          .collection('offres')
          .find({
            archived: { $ne: true },
            $or: [{ status: 'active' }, { status: 'created' }, { status: { $exists: false } }],
          })
          .toArray();

        console.log('Offres trouvées (sans agrégation):', simpleOffers.length);
        if (simpleOffers.length > 0) {
          console.log("Exemple d'offre:", simpleOffers[0]);
        }

        const offers = await db
          .collection('offres')
          .aggregate([
            {
              $match: {
                archived: { $ne: true },
                $or: [{ status: 'active' }, { status: 'created' }, { status: { $exists: false } }],
              },
            },
            {
              $lookup: {
                from: 'entreprise',
                localField: 'entrepriseId',
                foreignField: 'code',
                as: 'entrepriseInfo',
              },
            },
            {
              $unwind: {
                path: '$entrepriseInfo',
                preserveNullAndEmptyArrays: true,
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
                createdAt: 1,
                entrepriseId: 1,
                location: 1,
              },
            },
            {
              $sort: { createdAt: -1 },
            },
          ])
          .toArray();

        console.log(`Nombre d'offres trouvées (avec agrégation): ${offers.length}`);
        if (offers.length > 0) {
          console.log("Exemple d'offre avec agrégation:", offers);
        }

        // Pour chaque offre, compter le nombre de candidatures
        const offersWithCandidatesCount = await Promise.all(
          offers.map(async (offer) => {
            const candidatesCount = await db.collection('candidatures').countDocuments({
              offerCode: offer.code,
            });
            return {
              ...offer,
              candidatesCount,
            };
          })
        );

        return NextResponse.json(offersWithCandidatesCount);
      }

      // Si c'est une entreprise, on renvoie toutes les offres de l'entreprise
      if (payload.type === 'entreprise') {
        console.log('Récupération des offres pour entreprise');
        const entrepriseId = payload.userId;
        if (!entrepriseId) {
          return new NextResponse('ID entreprise non trouvé', { status: 400 });
        }

        // Récupérer toutes les offres de l'entreprise
        const offers = await db
          .collection('offres')
          .find({ entrepriseId })
          .sort({ createdAt: -1 })
          .toArray();

        // Pour chaque offre, compter le nombre de candidatures et ajouter les informations du UGC qui a complété l'offre
        const offersWithDetails = await Promise.all(
          offers.map(async (offer) => {
            const candidatesCount = await db.collection('candidatures').countDocuments({
              offerCode: offer.code,
            });

            // Si l'offre est complétée, récupérer les informations du UGC
            let ugcInfo = null;
            if (offer.status === OfferStatus.COMPLETED) {
              const acceptedCandidature = await db.collection('candidatures').findOne({
                offerCode: offer.code,
                status: 'accepted',
              });

              if (acceptedCandidature) {
                const ugc = await db.collection('ugc').findOne({ code: acceptedCandidature.ugcId });
                if (ugc) {
                  ugcInfo = {
                    name: ugc.name,
                    profileImage: ugc.profileImage,
                    title: ugc.title,
                  };
                }
              }
            }

            return {
              ...offer,
              candidatesCount,
              status: offer.status || OfferStatus.CREATED,
              ugcInfo,
            };
          })
        );

        return NextResponse.json(offersWithDetails);
      }

      return new NextResponse("Type d'utilisateur non autorisé", { status: 403 });
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return new NextResponse('Token invalide', { status: 401 });
    }
  } catch (e) {
    console.error('Erreur lors de la récupération des offres:', e);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    let entrepriseId;
    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.type !== 'entreprise') {
        return new NextResponse('Non autorisé - Entreprises uniquement', { status: 403 });
      }
      // Récupérer l'ID de l'entreprise depuis le token
      entrepriseId = payload.userId;
      if (!entrepriseId) {
        return new NextResponse('ID entreprise non trouvé', { status: 400 });
      }
    } catch (error) {
      return new NextResponse('Token invalide', { status: 401 });
    }

    // Récupérer les données de l'offre
    const offerData = await req.json();

    if (!offerData.name || !offerData.category || !offerData.description || !offerData.reward) {
      return new NextResponse('Données manquantes', { status: 400 });
    }

    // Générer un code unique pour l'offre (timestamp + random)
    const code = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Préparer l'objet offre
    const offer = {
      ...offerData,
      code,
      createdAt: new Date(),
      entrepriseId,
      status: OfferStatus.CREATED,
      completedAt: null,
      ugcRating: null,
      entrepriseRating: null,
    };

    // Initialize MongoDB
    const client = await clientPromise;
    const db = client.db('impact');

    // Insérer l'offre
    await db.collection('offres').insertOne(offer);

    return NextResponse.json(
      {
        message: 'Offre créée avec succès',
        code,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Erreur lors de la création de l'offre:", e);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
