import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, ObservableInput } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ComponentCommunicationService } from './component-communication.service';
import { Router } from '@angular/router';
import { AlertService } from '../shared/alert/alert.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private http : HttpClient,
    private cookieService : CookieService,
    private modelservice : ComponentCommunicationService,
    private router : Router,
    private sessionService : SessionService,
    private alertService : AlertService) {
  }
  private baseUrl = environment.userBaseUrl;

  login(loginData: FormData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/login`, loginData);
  }

  logout(): Observable<ApiResponse<any>> {
    const refreshtoken = this.cookieService.get('RefreshToken');
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/logout`,
      JSON.stringify(refreshtoken),
    { headers: { 'Content-Type': 'application/json' } });
  }

  refreshToken(refreshtoken : string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/refresh-token`,
      JSON.stringify(refreshtoken),
    { headers: { 'Content-Type': 'application/json' } });
  }

  ClearSession(showMessage:boolean): void {
    this.cookieService.deleteAll();
    this.sessionService.clear();
    this.modelservice.isLoggedIn(false);

    if (showMessage) {
      this.alertService.showWarning("Your session has expired. Please log in again.");
    }
  }
}
