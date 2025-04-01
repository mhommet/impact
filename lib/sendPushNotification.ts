/**
 * Utilitaire pour envoyer des notifications push aux utilisateurs
 *
 * Note: Ce code doit être exécuté côté serveur uniquement
 * Il nécessite les variables d'environnement VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY
 */
import { NotificationType } from '@/types/notification';

import clientPromise from './mongodb';

interface NotificationPayload {
  title: string;
  message: string;
  actionUrl?: string;
  icon?: string;
  type?: NotificationType;
  relatedItemId?: string;
}

/**
 * Envoie une notification push à un utilisateur spécifique
 *
 * @param userId ID de l'utilisateur
 * @param userType Type d'utilisateur ('ugc' ou 'entreprise')
 * @param payload Contenu de la notification
 * @returns Promise<boolean> Succès ou échec
 */
export async function sendPushNotificationToUser(
  userId: string,
  userType: 'ugc' | 'entreprise',
  payload: NotificationPayload
): Promise<boolean> {
  try {
    // Vérification des clés VAPID
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('Les clés VAPID ne sont pas définies');
      return false;
    }

    // Import webpush (côté serveur uniquement)
    // npm install web-push
    const webpush = require('web-push');

    // Configuration de webpush avec les clés VAPID
    webpush.setVapidDetails(
      'mailto:contact@impact.fr', // Adresse e-mail de contact
      vapidPublicKey,
      vapidPrivateKey
    );

    // Récupérer les abonnements push de l'utilisateur
    const client = await clientPromise;
    const db = client.db('impact');

    const subscriptions = await db
      .collection('push_subscriptions')
      .find({ userId, userType })
      .toArray();

    if (subscriptions.length === 0) {
      console.log(`Aucun abonnement push trouvé pour l'utilisateur ${userId} (${userType})`);
      return false;
    }

    // Préparation du payload de la notification
    const notificationPayload = JSON.stringify({
      title: payload.title,
      message: payload.message,
      actionUrl: payload.actionUrl || '/notifications',
      icon: payload.icon || '/icons/icon-96x96.png',
      timestamp: new Date().getTime(),
    });

    // Options de notification
    const options = {
      TTL: 86400 * 7, // Durée de vie de 7 jours en secondes
      vapidDetails: {
        subject: 'mailto:contact@impact.fr',
        publicKey: vapidPublicKey,
        privateKey: vapidPrivateKey,
      },
    };

    // Envoi des notifications push à tous les appareils de l'utilisateur
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription.subscription, notificationPayload, options);
        return true;
      } catch (error) {
        // Si l'abonnement n'est plus valide, le supprimer
        if (error.statusCode === 404 || error.statusCode === 410) {
          await db.collection('push_subscriptions').deleteOne({ _id: subscription._id });
          console.log(`Abonnement push supprimé pour ${userId} (${userType}) : plus valide`);
        } else {
          console.error("Erreur lors de l'envoi de la notification push:", error);
        }
        return false;
      }
    });

    const results = await Promise.all(sendPromises);
    return results.some((result) => result);
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification push:", error);
    return false;
  }
}

/**
 * Envoie une notification push à plusieurs utilisateurs
 *
 * @param userIds Liste des IDs utilisateurs, avec leur type
 * @param payload Contenu de la notification
 * @returns Promise<boolean> Succès ou échec
 */
export async function sendPushNotificationToUsers(
  userIds: Array<{ userId: string; userType: 'ugc' | 'entreprise' }>,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const sendPromises = userIds.map((user) =>
      sendPushNotificationToUser(user.userId, user.userType, payload)
    );

    const results = await Promise.all(sendPromises);
    return results.some((result) => result);
  } catch (error) {
    console.error("Erreur lors de l'envoi des notifications push:", error);
    return false;
  }
}
