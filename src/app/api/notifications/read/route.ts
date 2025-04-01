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

// PUT /api/notifications/read - Marquer une ou plusieurs notifications comme lues
export async function PUT(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const { payload } = await jwtVerify(token, secretKey);
    const { userId, type } = payload as { userId: string; type: string };

    if (!userId || !type) {
      return new NextResponse("Données d'utilisateur invalides", { status: 400 });
    }

    const data = await req.json();
    const { notificationIds, all = false } = data;

    const client = await clientPromise;
    const db = client.db('impact');

    let result;

    // Si 'all' est true, marquer toutes les notifications comme lues
    if (all === true) {
      result = await db
        .collection('notifications')
        .updateMany(
          { recipientId: userId, recipientType: type, read: false },
          { $set: { read: true } }
        );

      return NextResponse.json({
        message: 'Toutes les notifications ont été marquées comme lues',
        modifiedCount: result.modifiedCount,
      });
    }

    // Sinon, marquer les notifications spécifiées comme lues
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
      return new NextResponse("Liste d'identifiants de notifications invalide", { status: 400 });
    }

    // Convertir les IDs en ObjectId
    const objectIds = notificationIds.map((id) => new ObjectId(id));

    // Vérifier que les notifications appartiennent à l'utilisateur
    result = await db.collection('notifications').updateMany(
      {
        _id: { $in: objectIds },
        recipientId: userId,
        recipientType: type,
      },
      { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
      return new NextResponse('Aucune notification correspondante trouvée', { status: 404 });
    }

    return NextResponse.json({
      message: 'Notifications marquées comme lues',
      modifiedCount: result.modifiedCount,
    });
  } catch (e) {
    console.error(e);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
