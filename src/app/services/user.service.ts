import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserModel } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';
import Hashids from 'hashids';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.userBaseUrl;
  private readonly hashids: Hashids;

  constructor(private http : HttpClient) {
    this.hashids = new Hashids(environment.secretSalt, 8);
   }
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

  getCurrentUserDetails(userId : number ): Observable<ApiResponse<UserModel>> {
    const hashedId = this.hashids.encode(userId);
    return this.http.get<ApiResponse<UserModel>>(`${this.baseUrl}/${hashedId}`);
  }
}
