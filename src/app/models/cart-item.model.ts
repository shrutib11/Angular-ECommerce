// export interface CartItem {
//   id: number;
//   name: string;
//   color?: string;
//   size?: string;
//   price: number;
//   quantity: number;
// }


export interface CartItem {
  id: number;
  cartId?: number;
  productId: number;
  quantity: number;
  priceAtAddTime: number;
  name: string;
  imageUrl: string;
}