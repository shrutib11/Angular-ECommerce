import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { ComponentCommunicationService } from './component-communication.service';
import { SessionService } from './session.service';
import { AppCookieService } from './cookie.service';
import { CartService } from './cart.service';
import { CartModel } from '../models/cart.model';
import { AlertService } from '../shared/alert/alert.service';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloak: Keycloak;

  userCart: CartModel = {
      id: null,
      userId: 0,
    };

  constructor(
    private commService: ComponentCommunicationService,
    private sessionService : SessionService,
    private cookieService : AppCookieService,
    private cartService : CartService,
    private alertService : AlertService) {
    this.keycloak = new Keycloak({
      url: 'http://192.168.0.60:8080/',
      realm: 'my-realm',
      clientId: 'angular-client'
    });
   }

   async init(): Promise<boolean> {
    const authenticated = await this.keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      pkceMethod: 'S256',
      redirectUri: window.location.origin
    });

    this.commService.isLoggedIn(authenticated);

    if (authenticated) {
      const token = this.keycloak.token;
      const tokenParsed = this.keycloak.tokenParsed;
      const roles = this.keycloak.tokenParsed?.realm_access?.roles || [];
      const email = this.keycloak.tokenParsed?.['email'];
      const userId = this.keycloak.tokenParsed?.['userId']

      if (roles.includes('Admin')) {
        this.commService.adminRole();
      } else {
        this.commService.userRole();
      }

      this.sessionService.setEmail(this.keycloak.tokenParsed?.['email']);
      this.sessionService.setUserId(userId)
      this.sessionService.setUserRole(
        roles?.includes('Admin') ? 'Admin' : 'User'
      );
      this.cartService.getUserCart(userId).subscribe({
        next: (response) => {
          this.userCart = { ...response.result };
          this.sessionService.setCartId(this.userCart.id!);
          this.sessionService.markSessionReady();
        },
        error: (error: any) => {
          if (error.status == 404) {
            this.userCart.userId = this.sessionService.getUserId();
            this.cartService.createCart(this.userCart).subscribe({
              next: (response) => {
                this.userCart = { ...response.result };
                this.sessionService.setCartId(this.userCart.id!);
                this.sessionService.markSessionReady();
              },
              error: (error: any) => {
                this.alertService.showError(`failed to create cart : ${error.error.errorMessage}`);
              }
            })
          }
        }
      });
      this.sessionService.markSessionReady()
      this.cookieService.setCookie("Token", this.keycloak.token!, 7);
    }

    return authenticated;
  }

  login(): void {
    this.keycloak.login({
      redirectUri: window.location.origin
    });
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });

    this.keycloak.clearToken?.();
    this.sessionService.clear();
    console.log(this.sessionService.getUserId())
    this.commService.isLoggedIn(false);
    this.cookieService.deleteCookie("Token");
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  isLoggedIn(): boolean {
    return !!this.keycloak.token;
  }

  getUsername(): string | undefined {
    return this.keycloak.tokenParsed?.['preferred_username'];
  }
}
