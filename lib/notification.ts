import { ObjectId } from 'mongodb';

import { NotificationType } from '@/types/notification';

import clientPromise from './mongodb';
import { sendPushNotificationToUser } from './sendPushNotification';

/**
 * Crée une notification dans la base de données
 * @param recipientId - ID du destinataire de la notification
 * @param recipientType - Type du destinataire ('ugc' ou 'entreprise')
 * @param type - Type de notification
 * @param title - Titre de la notification
 * @param message - Message de la notification
 * @param relatedItemId - ID de l'élément lié (offre, candidature, etc.)
 * @param relatedItemType - Type de l'élément lié
 * @param imageUrl - URL de l'image à afficher (optionnel)
 * @param actionUrl - URL d'action (optionnel)
 * @param sendPush - Envoyer une notification push (optionnel, par défaut: true)
 * @returns L'ID de la notification créée
 */
export async function createNotification({
  recipientId,
  recipientType,
  type,
  title,
  message,
  relatedItemId,
  relatedItemType,
  imageUrl,
  actionUrl,
  sendPush = true,
}: {
  recipientId: string;
  recipientType: 'ugc' | 'entreprise';
  type: NotificationType;
  title: string;
  message: string;
  relatedItemId?: string;
  relatedItemType?: string;
  imageUrl?: string;
  actionUrl?: string;
  sendPush?: boolean;
}): Promise<string> {
  try {
    const client = await clientPromise;
    const db = client.db('impact');

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

    // Envoyer une notification push si demandé
    if (sendPush) {
      try {
        await sendPushNotificationToUser(recipientId, recipientType, {
          title,
          message,
          actionUrl,
          type,
          relatedItemId,
        });
      } catch (err) {
        console.error("Erreur lors de l'envoi de la notification push:", err);
        // Ne pas bloquer la création de la notification en base
      }
    }

    return result.insertedId.toString();
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    throw error;
  }
}

/**
 * Génère une notification pour un changement de statut d'une offre
 */
export async function notifyOfferStatusChange(
  offerId: string,
  offerCode: string,
  offerName: string,
  newStatus: string,
  ugcId: string
): Promise<string> {
  const title = `Statut de l'offre mis à jour`;
  const message = `L'offre "${offerName}" est maintenant ${getStatusText(newStatus)}.`;
  const actionUrl = `/ugc/offer/${offerCode}`;

  return createNotification({
    recipientId: ugcId,
    recipientType: 'ugc',
    type: NotificationType.OFFER_STATUS_CHANGE,
    title,
    message,
    relatedItemId: offerId,
    relatedItemType: 'offer',
    actionUrl,
  });
}

/**
 * Génère une notification pour un changement de statut d'une candidature
 */
export async function notifyCandidatureStatusChange(
  candidatureId: string,
  offerName: string,
  newStatus: 'accepted' | 'rejected',
  ugcId: string,
  offerCode: string
): Promise<string> {
  const isAccepted = newStatus === 'accepted';
  const title = isAccepted ? 'Candidature acceptée' : 'Candidature refusée';
  const message = isAccepted
    ? `Votre candidature pour l'offre "${offerName}" a été acceptée. Vous pouvez maintenant commencer à travailler sur cette offre.`
    : `Votre candidature pour l'offre "${offerName}" a été refusée.`;
  const actionUrl = `/ugc/offer/${offerCode}`;

  return createNotification({
    recipientId: ugcId,
    recipientType: 'ugc',
    type: NotificationType.CANDIDATURE_STATUS_CHANGE,
    title,
    message,
    relatedItemId: candidatureId,
    relatedItemType: 'candidature',
    actionUrl,
  });
}

/**
 * Génère une notification pour une nouvelle note
 */
export async function notifyNewRating(
  ratingId: string,
  rating: number,
  recipientId: string,
  recipientType: 'ugc' | 'entreprise',
  senderName: string,
  offerName?: string
): Promise<string> {
  const title = 'Nouvelle évaluation reçue';
  const message = offerName
    ? `${senderName} vous a attribué ${rating} étoiles pour l'offre "${offerName}".`
    : `${senderName} vous a attribué ${rating} étoiles.`;
  const actionUrl =
    recipientType === 'ugc' ? `/ugc/profile/${recipientId}` : `/entreprise/profile/${recipientId}`;

  return createNotification({
    recipientId,
    recipientType,
    type: NotificationType.NEW_RATING,
    title,
    message,
    relatedItemId: ratingId,
    relatedItemType: 'rating',
    actionUrl,
  });
}

/**
 * Génère une notification pour une offre en attente de validation
 */
export async function notifyOfferPendingValidation(
  offerId: string,
  offerCode: string,
  offerName: string,
  entrepriseId: string
): Promise<string> {
  const title = 'Offre en attente de validation';
  const message = `L'offre "${offerName}" est en attente de votre validation.`;
  const actionUrl = `/entreprise/offers/${offerCode}`;

  return createNotification({
    recipientId: entrepriseId,
    recipientType: 'entreprise',
    type: NotificationType.OFFER_STATUS_CHANGE,
    title,
    message,
    relatedItemId: offerId,
    relatedItemType: 'offer',
    actionUrl,
  });
}

// Fonctions utilitaires
function getStatusText(status: string): string {
  switch (status) {
    case 'created':
      return 'créée';
    case 'in_progress':
      return 'en cours';
    case 'pending_validation':
      return 'en attente de validation';
    case 'completed':
      return 'terminée';
    default:
      return status;
  }
}
