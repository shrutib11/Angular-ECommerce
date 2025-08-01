export interface ReviewItem {
  id: string;
  customerName: string;
  customerInitial: string;
  rating: number;
  date: string;
  reviewText: string;
  verified?: boolean;
}