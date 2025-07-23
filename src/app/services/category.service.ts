import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Category } from '../models/category.model';
import { environment } from '../../environments/environment';
import Hashids from 'hashids';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = environment.categoryBaseUrl;
  private readonly hashids: Hashids;

  constructor(private http: HttpClient) {
    this.hashids = new Hashids(environment.secretSalt, 8);
   }

  getAllCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/GetAll`)
  }

  getCategoryById(categoryId: string): Observable<ApiResponse<Category>> {
    const hashedId = this.hashids.encode(categoryId);
    return this.http.get<ApiResponse<Category>>(`${this.baseUrl}/${hashedId}`);
  }

  addCategory(categoryData: FormData): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.baseUrl}/Add`, categoryData)
  }

  updateCategory(categoryData: FormData): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.baseUrl}/Update`, categoryData)
  }

  deleteCategory(categoryId: string): Observable<ApiResponse<any>> {
    const hashedId = this.hashids.encode(categoryId);
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/Delete/${hashedId}`, {});
  }
}
