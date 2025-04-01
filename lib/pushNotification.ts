/**
 * Utilitaires pour gérer les notifications push
 */

/**
 * Vérifie si les notifications push sont supportées par le navigateur
 */
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Demande la permission d'envoyer des notifications
 * @returns Une promesse qui résout à 'granted', 'denied', ou 'default'
 */
export async function askNotificationPermission(): Promise<NotificationPermission> {
  try {
    if (!isPushNotificationSupported()) {
      throw new Error('Les notifications push ne sont pas supportées par ce navigateur');
    }

    return await Notification.requestPermission();
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
    throw error;
  }
}

/**
 * Enregistre l'appareil pour recevoir des notifications push
 * @returns L'abonnement push (PushSubscription)
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    if (!isPushNotificationSupported()) {
      throw new Error('Les notifications push ne sont pas supportées par ce navigateur');
    }

    // Vérifier les permissions
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permission refusée pour les notifications');
    }

    // Récupérer l'enregistrement du service worker
    const registration = await navigator.serviceWorker.ready;

    // Récupérer la clé publique VAPID depuis le serveur
    const response = await fetch('/api/notifications/vapid-key');
    if (!response.ok) {
      throw new Error('Impossible de récupérer la clé publique');
    }

    const { vapidPublicKey } = await response.json();

    // Convertir la clé publique en Uint8Array
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // S'abonner au service de notification push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    // Enregistrer l'abonnement sur le serveur
    await saveSubscription(subscription);

    return subscription;
  } catch (error) {
    console.error("Erreur lors de l'abonnement aux notifications push:", error);
    return null;
  }
}

/**
 * Désabonne l'appareil des notifications push
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) {
      throw new Error('Les notifications push ne sont pas supportées par ce navigateur');
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Supprimer l'abonnement du serveur
      await deleteSubscription(subscription);

      // Désabonner côté client
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erreur lors du désabonnement aux notifications push:', error);
    return false;
  }
}

/**
 * Vérifie si l'utilisateur est déjà abonné aux notifications push
 */
export async function isPushNotificationSubscribed(): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return !!subscription;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'abonnement:", error);
    return false;
  }
}

/**
 * Convertit une chaîne base64url en Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Enregistre l'abonnement sur le serveur
 */
async function saveSubscription(subscription: PushSubscription): Promise<void> {
  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });
}

/**
 * Supprime l'abonnement du serveur
 */
async function deleteSubscription(subscription: PushSubscription): Promise<void> {
  await fetch('/api/notifications/unsubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });
}
