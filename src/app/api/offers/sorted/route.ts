import { jwtVerify } from 'jose';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { OfferStatus } from '@/types/offer';

import clientPromise from '../../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

// Mise à jour unique pour les offres existantes sans tags
let hasRunInitialUpdate = false;

const ensureRestaurantTags = async (db: any) => {
  if (hasRunInitialUpdate) return;

  try {
    console.log("Recherche d'offres de restaurant sans tag restauration");

    // Trouver toutes les offres de catégorie Restaurant qui n'ont pas de tags ou pas de tag de restauration
    const restaurantOffers = await db
      .collection('offres')
      .find({
        category: 'Restaurant',
        $or: [
          { tags: { $exists: false } },
          { tags: { $size: 0 } },
          { tags: { $not: { $elemMatch: { $regex: /restaur/i } } } },
        ],
      })
      .toArray();

    console.log(`Trouvé ${restaurantOffers.length} offres de restaurant à mettre à jour`);

    // Mettre à jour chaque offre pour ajouter le tag 'restauration'
    for (const offer of restaurantOffers) {
      try {
        const currentTags = offer.tags || [];
        const updatedTags = Array.isArray(currentTags)
          ? [...currentTags, 'restauration']
          : ['restauration'];

        await db
          .collection('offres')
          .updateOne({ _id: offer._id }, { $set: { tags: updatedTags } });

        console.log(`Tag restauration ajouté à l'offre: ${offer.name}`);
      } catch (innerError) {
        console.error(
          `Erreur lors de la mise à jour des tags pour l'offre ${offer?.name || 'inconnue'}:`,
          innerError
        );
        // Continuer avec la prochaine offre
      }
    }

    hasRunInitialUpdate = true;
    console.log('Mise à jour des tags terminée');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des tags:', error);
  }
};

// Vérifie si deux chaînes sont similaires
function areSimilarTags(tag1: string, tag2: string): boolean {
  // Normaliser les tags
  const normalizedTag1 = tag1.toLowerCase().trim();
  const normalizedTag2 = tag2.toLowerCase().trim();

  // Correspondance exacte - PRIORITAIRE
  if (normalizedTag1 === normalizedTag2) return true;

  // Vérifier si un tag est contenu dans l'autre
  if (normalizedTag1.includes(normalizedTag2) || normalizedTag2.includes(normalizedTag1))
    return true;

  // Cas spécial pour 'restaurant', 'restauration', etc.
  if (normalizedTag1.includes('restaur') && normalizedTag2.includes('restaur')) return true;

  // Vérifier des formes apparentées (ex: restaurant/restauration)
  const rootLength = Math.min(normalizedTag1.length, normalizedTag2.length) - 2; // Longueur minimale pour considérer une racine commune
  if (rootLength >= 4) {
    // Au moins 4 caractères pour éviter les faux positifs
    const root1 = normalizedTag1.substring(0, rootLength);
    const root2 = normalizedTag2.substring(0, rootLength);
    if (root1 === root2) return true;
  }

  return false;
}

// Fonction utilitaire pour calculer le score de correspondance entre les tags
function calculateMatchScore(offerTags: string[] = [], ugcTags: string[] = []): number {
  // Vérification rapide pour les tableaux vides
  if (
    !offerTags ||
    !ugcTags ||
    !Array.isArray(offerTags) ||
    !Array.isArray(ugcTags) ||
    offerTags.length === 0 ||
    ugcTags.length === 0
  ) {
    console.log('Tableaux de tags vides ou invalides détectés');
    return 0;
  }

  try {
    // Normaliser les tags
    const normalizedOfferTags = offerTags
      .filter((tag) => tag && typeof tag === 'string')
      .map((tag) => tag.toLowerCase().trim());

    const normalizedUgcTags = ugcTags
      .filter((tag) => tag && typeof tag === 'string')
      .map((tag) => tag.toLowerCase().trim());

    // Éliminer les doublons
    const uniqueOfferTags = Array.from(new Set(normalizedOfferTags));
    const uniqueUgcTags = Array.from(new Set(normalizedUgcTags));

    if (uniqueOfferTags.length === 0 || uniqueUgcTags.length === 0) {
      console.log('Après normalisation, tableaux vides détectés');
      return 0;
    }

    // Logique simplifiée : compter le nombre de tags de l'offre que l'utilisateur possède
    let matchCount = 0;

    // Parcourir chaque tag de l'offre
    uniqueOfferTags.forEach((offerTag) => {
      // Vérifier si l'utilisateur a ce tag (correspondance exacte)
      if (uniqueUgcTags.includes(offerTag)) {
        matchCount++;
        console.log(`Tag correspondant trouvé: ${offerTag}`);
      }
      // Vérifier aussi le cas spécial "restaur"
      else if (
        offerTag.includes('restaur') &&
        uniqueUgcTags.some((tag) => tag.includes('restaur'))
      ) {
        matchCount++;
        console.log(`Correspondance restaurant trouvée: ${offerTag}`);
      }
    });

    if (matchCount === 0) {
      console.log('Aucun tag correspondant');
      return 0;
    }

    // Le score est simplement le pourcentage de tags correspondants
    const score = matchCount / uniqueOfferTags.length;
    console.log(
      `Score basé sur ${matchCount}/${uniqueOfferTags.length} tags correspondants: ${Math.round(score * 100)}%`
    );

    return score;
  } catch (error) {
    console.error('Erreur lors du calcul du score de correspondance:', error);
    return 0;
  }
}

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
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

      const ugcId = payload.userId;
      if (!ugcId) {
        return new NextResponse('ID UGC non trouvé', { status: 400 });
      }

      const client = await clientPromise;
      const db = client.db('impact');

      // Exécuter la mise à jour initiale des tags
      await ensureRestaurantTags(db);

      // Récupérer le profil UGC pour obtenir ses tags
      const ugc = await db.collection('ugc').findOne({ code: ugcId });

      if (!ugc) {
        return new NextResponse('Profil UGC non trouvé', { status: 404 });
      }

      console.log('Profil UGC récupéré:', {
        code: ugc.code,
        name: ugc.name,
        skills: ugc.skills,
        skillsType: ugc.skills ? typeof ugc.skills : 'undefined',
        isArray: ugc.skills ? Array.isArray(ugc.skills) : false,
      });

      const ugcTags = ugc.skills || [];

      // Récupérer toutes les offres actives
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
              tags: 1,
              createdAt: 1,
              entrepriseId: 1,
              location: 1,
              'entrepriseInfo.name': 1,
              'entrepriseInfo.logo': 1,
            },
          },
        ])
        .toArray();

      // Pour chaque offre, calculer un score de correspondance avec les tags de l'UGC
      // et ajouter le nombre de candidatures
      const offersWithScore = await Promise.all(
        offers.map(async (offer) => {
          try {
            const candidatesCount = await db.collection('candidatures').countDocuments({
              offerCode: offer.code,
            });

            // Examiner les tags de l'offre
            console.log("Tags de l'offre avant calcul:", {
              offerName: offer.name,
              offerCode: offer.code,
              tags: offer.tags,
              tagsType: offer.tags ? typeof offer.tags : 'undefined',
              isArray: offer.tags ? Array.isArray(offer.tags) : false,
            });

            // Garantir qu'il y a au moins un tag basé sur la catégorie
            let processedTags = offer.tags;

            if (!processedTags || !Array.isArray(processedTags) || processedTags.length === 0) {
              console.log(`L'offre ${offer.name} n'a pas de tags, création d'un tag par défaut`);
              // Ajouter un tag par défaut basé sur la catégorie
              if (offer.category) {
                processedTags = [offer.category.toLowerCase()];

                // Si la catégorie est restaurant, ajouter explicitement "restauration"
                if (offer.category.toLowerCase() === 'restaurant') {
                  processedTags.push('restauration');
                }

                // S'assurer qu'il n'y a pas de doublons
                processedTags = Array.from(new Set(processedTags));

                console.log(`Tags par défaut créés: ${processedTags.join(', ')}`);

                // Mettre à jour l'offre dans la base de données avec ces tags
                try {
                  await db
                    .collection('offres')
                    .updateOne({ _id: offer._id }, { $set: { tags: processedTags } });
                  console.log(`Tags par défaut enregistrés pour l'offre ${offer.name}`);
                } catch (error) {
                  console.error(
                    `Erreur lors de la mise à jour des tags pour l'offre ${offer.name}:`,
                    error
                  );
                }
              }
            } else {
              // S'assurer que les tags existants n'ont pas de doublons
              processedTags = Array.from(new Set(processedTags));

              // Mettre à jour l'offre si les tags ont été changés (doublons supprimés)
              if (processedTags.length !== offer.tags.length) {
                try {
                  await db
                    .collection('offres')
                    .updateOne({ _id: offer._id }, { $set: { tags: processedTags } });
                  console.log(`Tags dédupliqués et mis à jour pour l'offre ${offer.name}`);
                } catch (error) {
                  console.error(
                    `Erreur lors de la mise à jour des tags pour l'offre ${offer.name}:`,
                    error
                  );
                }
              }
            }

            const matchScore = calculateMatchScore(processedTags, ugcTags);

            return {
              ...offer,
              tags: processedTags || [], // S'assurer que les tags sont toujours un tableau
              candidatesCount,
              matchScore,
            };
          } catch (error) {
            console.error(
              `Erreur lors du traitement de l'offre ${offer?.name || 'inconnue'}:`,
              error
            );
            // Retourner l'offre sans score en cas d'erreur
            return {
              ...offer,
              tags: offer.tags || [],
              candidatesCount: 0,
              matchScore: 0,
            };
          }
        })
      );

      // Trier les offres par score de correspondance (du plus élevé au plus bas)
      const sortedOffers = offersWithScore.sort((a, b) => b.matchScore - a.matchScore);

      return NextResponse.json(sortedOffers);
    } catch (error) {
      console.error('Erreur de token:', error);
      return new NextResponse('Token invalide', { status: 401 });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
