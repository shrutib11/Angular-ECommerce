import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { ComponentCommunicationService } from './component-communication.service';
import { SessionService } from './session.service';
import { AppCookieService } from './cookie.service';
import { CartService } from './cart.service';
import { CartModel } from '../models/cart.model';
import { AlertService } from '../shared/alert/alert.service';
import { UserService } from './user.service';

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
    private sessionService: SessionService,
    private cookieService: AppCookieService,
    private cartService: CartService,
    private alertService: AlertService,
    private userService: UserService) {
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
      console.log('Token Parsed:', tokenParsed);
      const roles = this.keycloak.tokenParsed?.['roles'] || [];
      const email = this.keycloak.tokenParsed?.['email'];
      const sub = this.keycloak.tokenParsed?.['sub'];

      if (roles.includes('Admin')) {
        this.commService.adminRole();
      } else {
        this.commService.userRole();
      }

      this.sessionService.setEmail(email);
      this.sessionService.setUserRole(
        roles?.includes('Admin') ? 'Admin' : 'User'
      );

      this.cookieService.setCookie("Token", this.keycloak.token!, 1);

      this.userService.getUseridByKeycloakId(sub!).subscribe({
        next: (response) => {
          const userId = response.result;
          this.sessionService.setUserId(userId);

          this.cartService.getUserCart(userId).subscribe({
            next: (response) => {
              console.log("getusercart",response);
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
        },
        error: (error) => {
          console.log(error.error);
          this.alertService.showError(`failed to create cart : ${error.error.errorMessage}`);
        }
      });

      this.sessionService.markSessionReady();
    }

    if (authenticated) {
      this.startTokenRefresh();
    }

    return authenticated;
  }

  private startTokenRefresh() {
    setInterval(() => {
      this.keycloak.updateToken(30).then((refreshed) => {
        if (refreshed) {
          this.cookieService.setCookie("Token", this.keycloak.token!, 1);
        }
      }).catch(() => {
        this.logout();
      });
    }, 60000);
  }

  login(): void {
    this.keycloak.login({
      redirectUri: window.location.origin
    });
  }

  logout(): void {
    if (this.keycloak.refreshToken) {
      this.userService.logout(this.keycloak.refreshToken).subscribe({
        next: (response) => {
          // this.keycloak.logout({ redirectUri: window.location.origin });
          this.keycloak.clearToken?.();
          this.sessionService.clear();
          this.commService.isLoggedIn(false);
          this.cookieService.deleteCookie("Token");
          this.alertService.showSuccess('Logout successful');
        },
        error: (error: any) => {
          this.alertService.showError(`Logout failed : ${error.error.errorMessage}`)
        }
      });
    } else {
      this.alertService.showError('No refresh token available for logout.');
    }

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
