export interface ProductRating {
  avgRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface Review {
  userId: string;
  productId: string;
  orderId: string;
  ratingValue: number;
  comment: string;
}

export interface Rating {
  orderId: number;
  userId: number;
  productId: number;
  ratingValue: number;
  comment?: string;
  avgRating?: number;
  totalReviews?: number;
  ratingDistribution?: { [key: number]: number };
  reviewerName?: string;
  reviewDate?: Date;
  userProfile?: string;
}