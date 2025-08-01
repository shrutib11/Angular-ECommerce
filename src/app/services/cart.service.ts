import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, map, Observable, switchMap, take, tap, throwError } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { HttpClient } from '@angular/common/http';
import { CartModel } from '../models/cart.model';
import { ApiResponse } from '../models/api-response.model';
import { SessionService } from './session.service';
import Hashids from 'hashids';
import { Product } from '../models/product.model';
import { Router } from '@angular/router';

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

  constructor(private http: HttpClient,private sessionService : SessionService, private router : Router) {
    this.hashids = new Hashids(environment.secretSalt, 8);
  }

  addToCart(productId: number, quantity: number = 1, priceAtAddTime?: number): Observable<any> {
    const formData = new FormData();
    formData.append('ProductId', productId.toString());
    formData.append('Quantity', quantity.toString());
    formData.append('CartId',  this.sessionService.getCartId().toString());

    if (priceAtAddTime) {
      formData.append('PriceAtAddTime', priceAtAddTime.toString());
    }

    return this.http.post(`${this.baseUrl}/addToCart`, formData).pipe(
      tap(() => this.getCartItems().subscribe())
    );
  }

  createCart(cart : CartModel): Observable<ApiResponse<CartModel>>{
    const formData = new FormData();
    formData.append('UserId',cart.userId.toString());
    return this.http.post<ApiResponse<CartModel>>(`${this.baseUrl}/createcart`,formData);
  }

  getCartItems(): Observable<CartItem[]> {

    return this.http.get<any>(`${this.baseUrl}/GetAll/${ this.sessionService.getCartId() }`).pipe(
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

  getUserCart(userId : number) : Observable<ApiResponse<CartModel>>{
    return this.http.get<ApiResponse<CartModel>>(`${this.baseUrl}/GetUserCart/${userId}`);
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

  private updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  addOrUpdateCartItem(product: Product, isLoggedIn: boolean): Observable<void> {
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('Not logged in'));
    }

    return this.cartItems$.pipe(
      take(1),
      switchMap((items) => {
        const existingItem = items.find(item => item.productId === product.id);
        const newQuantity = existingItem ? (existingItem.quantity ?? 0) + 1 : 1;

        const request$ = existingItem
          ? this.updateItemQuantity(existingItem.id, newQuantity)
          : this.addToCart(product.id, 1, product.price);

        return request$;
      })
    );
  }

}
