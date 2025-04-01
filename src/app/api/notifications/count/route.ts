import { jwtVerify } from 'jose';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import clientPromise from '../../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier et décoder le token
    const { payload } = await jwtVerify(token, secretKey);
    const userId = payload.userId as string;
    const userType = payload.type as string;

    if (!userId || !userType) {
      return NextResponse.json({ message: 'Données utilisateur invalides' }, { status: 400 });
    }

    // Connexion à MongoDB
    const client = await clientPromise;
    const db = client.db('impact');

    // Compter le nombre de notifications non lues
    const unreadCount = await db.collection('notifications').countDocuments({
      recipientId: userId,
      recipientType: userType,
      read: false,
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de notifications:', error);
    return NextResponse.json(
      {
        message: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
