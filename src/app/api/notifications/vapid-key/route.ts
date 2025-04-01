import { jwtVerify } from 'jose';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

// La clé publique VAPID doit être définie dans les variables d'environnement
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
if (!VAPID_PUBLIC_KEY) {
  console.warn("VAPID_PUBLIC_KEY n'est pas définie. Les notifications push ne fonctionneront pas.");
}

/**
 * API pour récupérer la clé publique VAPID
 * Cette clé est nécessaire pour s'abonner aux notifications push
 */
export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier et décoder le token
    await jwtVerify(token, secretKey);

    // Si la clé VAPID n'est pas définie, renvoyer une erreur
    if (!VAPID_PUBLIC_KEY) {
      return NextResponse.json(
        { message: "La clé publique VAPID n'est pas configurée sur le serveur" },
        { status: 500 }
      );
    }

    return NextResponse.json({ vapidPublicKey: VAPID_PUBLIC_KEY });
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé publique VAPID:', error);
    return NextResponse.json(
      {
        message: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
