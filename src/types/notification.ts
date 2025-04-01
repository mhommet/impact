export enum NotificationType {
  OFFER_STATUS_CHANGE = 'offer_status_change', // Changement de statut d'une offre
  CANDIDATURE_STATUS_CHANGE = 'candidature_status_change', // Acceptation/refus d'une candidature
  NEW_RATING = 'new_rating', // Nouvelle note reçue
  NEW_MESSAGE = 'new_message', // Nouveau message reçu
  PAYMENT_CONFIRMATION = 'payment_confirmation', // Confirmation de paiement
}

export interface Notification {
  _id?: string;
  recipientId: string; // ID du destinataire
  recipientType: 'ugc' | 'entreprise'; // Type de destinataire
  type: NotificationType; // Type de notification
  title: string; // Titre de la notification
  message: string; // Message de la notification
  relatedItemId?: string; // ID de l'élément lié (offre, candidature, etc.)
  relatedItemType?: string; // Type de l'élément lié
  read: boolean; // Statut de lecture
  createdAt: Date; // Date de création
  imageUrl?: string; // URL de l'image à afficher (optionnel)
  actionUrl?: string; // URL d'action (optionnel)
}
