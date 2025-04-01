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

/**
 * API pour supprimer un abonnement aux notifications push
 */
export async function POST(req: NextRequest) {
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

    // Récupérer les données d'abonnement
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ message: "Données d'abonnement invalides" }, { status: 400 });
    }

    // Connexion à MongoDB
    const client = await clientPromise;
    const db = client.db('impact');

    // Supprimer l'abonnement de la base de données
    const result = await db.collection('push_subscriptions').deleteOne({
      userId,
      userType,
      'subscription.endpoint': subscription.endpoint,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Aucun abonnement trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'abonnement push:", error);
    return NextResponse.json(
      {
        message: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
