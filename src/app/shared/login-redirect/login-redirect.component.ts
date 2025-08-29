import { Component, OnInit } from '@angular/core';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-login-redirect',
  imports: [],
  templateUrl: './login-redirect.component.html',
  styleUrl: './login-redirect.component.css'
})
export class LoginRedirectComponent implements OnInit{
  constructor(private keycloak: KeycloakService) {}

  ngOnInit(): void {
    if (!this.keycloak.isLoggedIn()) {
      this.keycloak.login();
    }
  }
}
