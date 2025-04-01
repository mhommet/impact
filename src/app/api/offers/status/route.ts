import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { OfferStatus } from '@/types/offer';

import clientPromise from '../../../../../lib/mongodb';
import {
  notifyOfferPendingValidation,
  notifyOfferStatusChange,
} from '../../../../../lib/notification';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse('Non autorisé', { status: 401 });
    }

    const { payload } = await jwtVerify(token, secretKey);
    const { offerId, status } = await req.json();

    if (!offerId || !status) {
      return new NextResponse('Données manquantes', { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('impact');

    // Récupérer l'offre pour obtenir les informations nécessaires aux notifications
    const offer = await db.collection('offres').findOne({
      _id: new ObjectId(offerId),
    });

    if (!offer) {
      return new NextResponse('Offre non trouvée', { status: 404 });
    }

    // Vérifier si l'utilisateur est autorisé à modifier cette offre
    if (payload.type === 'entreprise') {
      // Logique pour les entreprises
      if (offer.entrepriseId !== payload.userId) {
        return new NextResponse('Non autorisé à modifier cette offre', { status: 403 });
      }

      // Mettre à jour le statut de l'offre
      await db
        .collection('offres')
        .updateOne({ _id: new ObjectId(offerId) }, { $set: { status, updatedAt: new Date() } });

      // Si l'entreprise valide l'offre, envoyer une notification à l'UGC assigné
      if (status === OfferStatus.COMPLETED && offer.assignedUgcId) {
        await notifyOfferStatusChange(
          offerId,
          offer.code,
          offer.title || 'Untitled Offer',
          status,
          offer.assignedUgcId
        );
      }

      return NextResponse.json({ success: true });
    } else if (payload.type === 'ugc') {
      // Logique pour les UGC - ils ne peuvent soumettre que pour validation
      if (status !== OfferStatus.PENDING_VALIDATION) {
        return new NextResponse('Statut non autorisé pour UGC', { status: 403 });
      }

      // Vérifier si l'UGC a une candidature acceptée pour cette offre
      const candidature = await db.collection('candidatures').findOne({
        ugcId: payload.userId,
        offerCode: offer.code,
        status: 'accepted',
      });

      if (!candidature) {
        return new NextResponse('Candidature acceptée non trouvée', { status: 404 });
      }

      // Mettre à jour le statut de l'offre
      await db
        .collection('offres')
        .updateOne({ _id: new ObjectId(offerId) }, { $set: { status, updatedAt: new Date() } });

      // Notifier l'entreprise que l'offre est en attente de validation
      await notifyOfferPendingValidation(
        offerId,
        offer.code,
        offer.title || 'Untitled Offer',
        offer.entrepriseId
      );

      return NextResponse.json({ success: true });
    }

    return new NextResponse("Type d'utilisateur non autorisé", { status: 403 });
  } catch (error) {
    console.error('Erreur:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
