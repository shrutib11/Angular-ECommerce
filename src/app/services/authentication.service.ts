import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, ObservableInput } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private http : HttpClient) {
  }
  private baseUrl = environment.userBaseUrl;

  login(loginData: FormData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/login`, loginData);
  }

}
