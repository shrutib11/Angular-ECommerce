import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import Hashids from 'hashids';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Review, ReviewData } from '../models/reviewData.model';

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
}
