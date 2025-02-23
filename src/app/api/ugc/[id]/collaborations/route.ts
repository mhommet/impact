import { NextRequest, NextResponse } from 'next/server';

import clientPromise from '../../../../../../lib/mongodb';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('impact');

    // Récupérer les collaborations récentes (candidatures acceptées)
    const collaborations = await db
      .collection('candidatures')
      .aggregate([
        {
          $match: {
            ugcId: params.id,
            status: 'accepted',
          },
        },
        {
          $lookup: {
            from: 'offres',
            localField: 'offerCode',
            foreignField: 'code',
            as: 'offer',
          },
        },
        {
          $unwind: '$offer',
        },
        {
          $lookup: {
            from: 'entreprise',
            localField: 'offer.entrepriseId',
            foreignField: 'code',
            as: 'entrepriseInfo',
          },
        },
        {
          $unwind: '$entrepriseInfo',
        },
        // Grouper par entreprise pour éviter les doublons
        {
          $sort: { updatedAt: -1 },
        },
        {
          $group: {
            _id: '$entrepriseInfo.code',
            lastCollaboration: { $first: '$$ROOT' },
          },
        },
        {
          $project: {
            _id: '$lastCollaboration._id',
            title: '$lastCollaboration.offer.name',
            description: '$lastCollaboration.offer.description',
            completedAt: '$lastCollaboration.updatedAt',
            offerCode: '$lastCollaboration.offerCode',
            entrepriseId: '$lastCollaboration.entrepriseInfo.code',
            entrepriseInfo: {
              name: '$lastCollaboration.entrepriseInfo.name',
              logo: '$lastCollaboration.entrepriseInfo.logo',
              code: '$lastCollaboration.entrepriseInfo.code',
            },
          },
        },
        {
          $sort: { completedAt: -1 },
        },
        {
          $limit: 5,
        },
      ])
      .toArray();

    return NextResponse.json(collaborations);
  } catch (e) {
    console.error('Erreur lors de la récupération des collaborations:', e);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
