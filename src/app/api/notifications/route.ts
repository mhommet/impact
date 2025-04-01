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

// GET /api/notifications - Récupérer les notifications de l'utilisateur
export async function GET(req: NextRequest) {
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

    // Extraire les paramètres de requête
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');
    const onlyUnread = searchParams.get('unread') === 'true';

    const client = await clientPromise;
    const db = client.db('impact');

    // Construire la requête
    const query: any = {
      recipientId: userId,
      recipientType: type,
    };

    if (onlyUnread) {
      query.read = false;
    }

    // Récupérer les notifications
    const notifications = await db
      .collection('notifications')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Compter les notifications non lues
    const unreadCount = await db
      .collection('notifications')
      .countDocuments({ recipientId: userId, recipientType: type, read: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (e) {
    console.error(e);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}

// POST /api/notifications - Créer une notification (usage interne uniquement)
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification administrative (à adapter selon votre système d'authentification)
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const { payload } = await jwtVerify(token, secretKey);

    // Option 1: Autoriser la création de notifications pour tous les utilisateurs authentifiés
    // Option 2: Restreindre aux administrateurs ou à un service interne

    const notificationData = await req.json();
    const {
      recipientId,
      recipientType,
      type,
      title,
      message,
      relatedItemId,
      relatedItemType,
      imageUrl,
      actionUrl,
    } = notificationData;

    if (!recipientId || !recipientType || !type || !title || !message) {
      return new NextResponse('Données manquantes', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('impact');

    // Insérer la notification
    const result = await db.collection('notifications').insertOne({
      recipientId,
      recipientType,
      type,
      title,
      message,
      relatedItemId,
      relatedItemType,
      read: false,
      createdAt: new Date(),
      imageUrl,
      actionUrl,
    });

    return NextResponse.json({
      id: result.insertedId,
      message: 'Notification créée avec succès',
    });
  } catch (e) {
    console.error(e);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
