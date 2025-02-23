export enum OfferStatus {
  CREATED = 'created',
  IN_PROGRESS = 'in_progress',
  PENDING_VALIDATION = 'pending_validation',
  COMPLETED = 'completed',
}

export interface Rating {
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UGCRating extends Rating {
  offerId: string;
  entrepriseId: string;
}

export interface EntrepriseRating extends Rating {
  offerId: string;
  ugcId: string;
}

export interface Media {
  _id: string;
  type: 'image' | 'video';
  url: string;
  createdAt: string;
  description?: string;
}

export interface Offer {
  _id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  reward: string;
  status: OfferStatus;
  createdAt: string;
  completedAt?: string;
  entrepriseId: string;
  candidatesCount: number;
  medias?: Media[];
  ugcInfo?: {
    name: string;
    profileImage: string;
    title: string;
  };
  candidatures?: Array<{
    _id: string;
    status: string;
    createdAt: string;
    ugcInfo: {
      code: string;
      name: string;
      profileImage: string;
      title: string;
    };
  }>;
  ugcRating?: Rating;
  entrepriseRating?: Rating;
}

export interface CompletedOffer extends Offer {
  completedAt: string;
  ugcRating: Rating;
  entrepriseRating: Rating;
}
