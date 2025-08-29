import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { ComponentCommunicationService } from './component-communication.service';
import { SessionService } from './session.service';
import { AppCookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloak: Keycloak;
  constructor(private commService: ComponentCommunicationService, private sessionService : SessionService, private cookieService : AppCookieService) {
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

      if (roles.includes('Admin')) {
        this.commService.adminRole();
      } else {
        this.commService.userRole();
      }

      this.sessionService.setEmail(this.keycloak.tokenParsed?.['email']);
      this.sessionService.setUserRole(
        roles?.includes('Admin') ? 'Admin' : 'User'
      );
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
    this.commService.isLoggedIn(false);
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
