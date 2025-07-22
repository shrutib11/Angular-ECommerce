import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserModel } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.userBaseUrl;
  constructor(private http : HttpClient) { }
  getAllUsers() : Observable<ApiResponse<UserModel[]>> {
    return this.http.get<ApiResponse<UserModel[]>>(`${this.baseUrl}/GetAllUsers`);
  }
  upsert(userData : FormData ): Observable<ApiResponse<UserModel>> {
    if(userData.get('Id') == '0' || userData.get('Id') === null || userData.get('Id') === undefined) {
      return this.http.post<ApiResponse<UserModel>>(`${this.baseUrl}/register`, userData);
    }
    else{
      return this.http.put<ApiResponse<UserModel>>(`${this.baseUrl}/update`, userData);
    }
  }
}
