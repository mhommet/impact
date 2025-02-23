import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import clientPromise from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function GET(req: NextRequest, res: any) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.type !== 'entreprise' && payload.type !== 'ugc') {
        return new NextResponse('Non autorisé', { status: 403 });
      }

      // Getting params
      const seachParams = req.nextUrl.searchParams;
      const id = seachParams.get('id');

      if (!id) {
        return new NextResponse('ID not found', { status: 401 });
      }

      // Initialize MongoDB
      const client = await clientPromise;
      const db = client.db('impact');

      let offer;
      let query;

      // Try to find by _id first (for enterprise view)
      try {
        query = { _id: new ObjectId(id) };
        offer = await db.collection('offres').findOne(query);
      } catch (e) {
        // If _id is invalid, try to find by code (for UGC view)
        query = { code: id };
        offer = await db.collection('offres').findOne(query);
      }

      if (!offer) {
        return new NextResponse('Offer not found', { status: 401 });
      }

      // Récupérer les candidatures associées seulement pour les entreprises
      if (payload.type === 'entreprise') {
        const candidatures = await db
          .collection('candidatures')
          .aggregate([
            {
              $match: {
                offerCode: offer.code,
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
            { $unwind: '$ugcInfo' },
            {
              $project: {
                _id: 1,
                ugcId: 1,
                status: 1,
                createdAt: 1,
                'ugcInfo._id': 1,
                'ugcInfo.name': 1,
                'ugcInfo.profileImage': 1,
                'ugcInfo.title': 1,
              },
            },
          ])
          .toArray();

        return new NextResponse(
          JSON.stringify({
            ...offer,
            candidatures,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Pour les UGC, retourner seulement l'offre
      return new NextResponse(JSON.stringify(offer), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Token error:', error);
      return new NextResponse('Token invalide', { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching offer:', error);
    return new NextResponse('An error occurred', { status: 500 });
  }
}
