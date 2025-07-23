import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { HttpClient } from '@angular/common/http';
import Hashids from 'hashids';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private baseUrl = environment.cartBaseUrl;

  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();
  private readonly hashids: Hashids;

  constructor(private http: HttpClient) {
    this.hashids = new Hashids(environment.secretSalt, 8);
  }

  addToCart(productId: number, quantity: number = 1, priceAtAddTime?: number): Observable<any> {
    const formData = new FormData();
    formData.append('ProductId', productId.toString());
    formData.append('Quantity', quantity.toString());
    formData.append('CartId', "1");

    if (priceAtAddTime) {
      formData.append('PriceAtAddTime', priceAtAddTime.toString());
    }

    return this.http.post(`${this.baseUrl}/addToCart`, formData).pipe(
      tap(() => this.getCartItems().subscribe())
    );
  }

  getCartItems(): Observable<CartItem[]> {

    return this.http.get<any>(`${this.baseUrl}/GetAll/1`).pipe(
      map(response => {
        const items: CartItem[] = (response.result || []).map((entry: any) => {
          return {
            ...entry.cartItem,
            name: entry.product?.name || '',
            imageUrl: entry.product?.imageUrl || ''
          };
        });

        this.cartItemsSubject.next(items);

        const itemCount = items.length;
        this.updateCartCount(itemCount);

        return items;
      })
    );
  }

  removeFromCart(itemId: number): Observable<any> {
    const hashedId = this.hashids.encode(itemId);
    return this.http.patch(`${this.baseUrl}/${hashedId}/delete-item`, {}).pipe(
      tap(() => this.getCartItems().subscribe())
    );
  }

  updateItemQuantity(itemId: number, quantity: number): Observable<any> {
    const formData = new FormData();
    formData.append('Id', itemId.toString());
    formData.append('Quantity', quantity.toString());

    return this.http.patch(`${this.baseUrl}/update-quantity`, formData).pipe(
      tap(() => this.getCartItems().subscribe())
    );
  }

  // Private method to update cart count
  private updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }
}
