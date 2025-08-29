import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../services/keycloak.service';

export const authRedirectGuard: CanActivateFn = (route, state) => {
  const keycloak = inject(KeycloakService);
  const router = inject(Router);

  if (keycloak.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

