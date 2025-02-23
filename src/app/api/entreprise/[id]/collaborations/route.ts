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
          $match: {
            'offer.entrepriseId': params.id,
          },
        },
        {
          $lookup: {
            from: 'ugc',
            localField: 'ugcId',
            foreignField: 'code',
            as: 'ugcInfo',
          },
        },
        {
          $unwind: '$ugcInfo',
        },
        // Grouper par UGC pour éviter les doublons
        {
          $sort: { updatedAt: -1 },
        },
        {
          $group: {
            _id: '$ugcId',
            lastCollaboration: { $first: '$$ROOT' },
          },
        },
        {
          $project: {
            _id: '$lastCollaboration._id',
            completedAt: '$lastCollaboration.updatedAt',
            offerName: '$lastCollaboration.offer.name',
            ugcInfo: {
              code: '$lastCollaboration.ugcInfo.code',
              name: '$lastCollaboration.ugcInfo.name',
              profileImage: '$lastCollaboration.ugcInfo.profileImage',
              title: '$lastCollaboration.ugcInfo.title',
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
