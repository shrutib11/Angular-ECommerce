import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AppCookieService {

  constructor(private cookieService: CookieService) {}

  setCookie(name: string, value: string, days: number): void {
    this.cookieService.set(name, value, days);
  }

  getCookie(name: string): string {
    return this.cookieService.get(name);
  }

  deleteCookie(name: string): void {
    this.cookieService.delete(name);
  }

  deleteAllCookies(): void {
    this.cookieService.deleteAll();
  }
}
