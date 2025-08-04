import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import Hashids from 'hashids';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { ProductRating, Rating, Review } from '../models/reviewData.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private baseUrl = environment.reviewBaseUrl;
  private readonly hashids: Hashids;

  constructor(private http: HttpClient) {
    this.hashids = new Hashids(environment.secretSalt, 8);
  }

  addRating(review: FormData): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.baseUrl}/add`, review);
  }

  getRatingByProduct(productId: number): Observable<ProductRating> {
    return this.http.get<any>(`${this.baseUrl}/getbyproduct/${productId}`)
      .pipe(
        map(response => {
          const data = response.result;
          return {
            avgRating: data.avgRating || 0,
            totalReviews: data.totalReviews || 0,
            ratingDistribution: {
              5: data.ratingDistribution?.[5] || 0,
              4: data.ratingDistribution?.[4] || 0,
              3: data.ratingDistribution?.[3] || 0,
              2: data.ratingDistribution?.[2] || 0,
              1: data.ratingDistribution?.[1] || 0
            }
          } as ProductRating;
        })
      );
  }

  getCustomerRatings(productId: number): Observable<Rating[]> {
    return this.http.get<any>(`${this.baseUrl}/getcustomerratings/${productId}`)
      .pipe(
        map(response => response.result || response) 
      );
  }
}
