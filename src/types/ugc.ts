export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  pinterest?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Portfolio {
  contracts: number;
  photos: number;
  comments: number;
}

export interface UGC {
  _id?: string;
  code: string;
  userId?: string;
  name: string;
  description: string;
  bio?: string;
  location: string;
  title: string;
  profileImage: string;
  skills?: string[]; // Tableau de tags de l'UGC
  socialLinks: SocialLinks;
  portfolio: Portfolio;
  averageRating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
