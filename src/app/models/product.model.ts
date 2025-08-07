export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  productImageFile: any;
  productImage: string;
  avgRating: number;
  totalReviews: number;
  productMedias: ProductMedia[];
}

export interface ProductMedia {
  id: number;
  productId: number;
  mediaUrl: string;
  mediaFile:any;
  mediaType: string; // 'image' or 'video'
  displayOrder: number;
}