import { ObjectId } from 'mongodb';

import { NextRequest, NextResponse } from 'next/server';

import clientPromise from '../../../../../lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('impact');

    // Utiliser une agrégation pour récupérer le profil UGC avec ses ratings
    const ugcProfile = await db
      .collection('ugc')
      .aggregate([
        {
          $match: {
            code: params.id,
          },
        },
        {
          $lookup: {
            from: 'ratings',
            let: { ugcCode: '$code' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$toId', '$$ugcCode'] }, { $eq: ['$type', 'ugc'] }],
                  },
                },
              },
              {
                $lookup: {
                  from: 'entreprise',
                  let: { entrepriseCode: '$fromId' },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ['$code', '$$entrepriseCode'] },
                      },
                    },
                    {
                      $project: {
                        name: 1,
                        logo: 1,
                      },
                    },
                  ],
                  as: 'entrepriseInfo',
                },
              },
              {
                $unwind: '$entrepriseInfo',
              },
              {
                $project: {
                  rating: 1,
                  comment: 1,
                  createdAt: 1,
                  entrepriseInfo: 1,
                },
              },
            ],
            as: 'ratings',
          },
        },
        {
          $addFields: {
            averageRating: {
              $cond: {
                if: { $eq: [{ $size: '$ratings' }, 0] },
                then: null,
                else: { $avg: '$ratings.rating' },
              },
            },
          },
        },
      ])
      .next();

    if (!ugcProfile) {
      return NextResponse.json({ message: 'Profil UGC non trouvé' }, { status: 404 });
    }

    return NextResponse.json(ugcProfile);
  } catch (e) {
    console.error('Erreur lors de la récupération du profil UGC:', e);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
