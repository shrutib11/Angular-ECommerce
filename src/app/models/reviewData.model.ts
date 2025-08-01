export interface ReviewData {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
}

export interface Review {
  userId: string;
  productId: string;
  orderId: string;
  ratingValue: number;
  comment: string;
}