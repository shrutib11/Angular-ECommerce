import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';
import Hashids from 'hashids';
import { ProductRating } from '../models/reviewData.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = environment.productBaseUrl;
  private readonly hashids: Hashids;

  constructor(private http: HttpClient) {
    this.hashids = new Hashids(environment.secretSalt, 8);
  }

  getAllProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/GetAll`);
  }

  getProductsByCategory(categoryId: number): Observable<ApiResponse<Product[]>> {
    const hashedId = this.hashids.encode(categoryId);
    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/GetByCategory/${hashedId}`);
  }

  getProductById(productId: number): Observable<ApiResponse<Product>> {
    const hashedId = this.hashids.encode(productId);
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/${hashedId}`);
  }

  addProduct(productData: FormData): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.baseUrl}/Add`, productData);
  }

  updateProduct(productData: FormData): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/Update`, productData);
  }

  deleteProduct(productId: number): Observable<ApiResponse<any>> {
    const hashedId = this.hashids.encode(productId);
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/Delete/${hashedId}`, {});
  }

  searchProducts(searchTerm: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/Search/${encodeURIComponent(searchTerm)}`);
  }
}
