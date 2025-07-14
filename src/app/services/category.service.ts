import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Category } from '../models/category.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = environment.categoryBaseUrl;

  constructor(private http: HttpClient) { }

  getAllCategories() : Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/GetAll`)
  }

  addCategory(categoryData : FormData) : Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>> (`${this.baseUrl}/Add`, categoryData)
  }
}
