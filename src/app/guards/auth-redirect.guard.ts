import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AlertService } from '../shared/alert/alert.service';

export const authRedirectGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const alertService = inject(AlertService);

  const token = getCookie('Token');

  if (token) {
    return true;
  } else {
    alertService.showWarning('You need to be logged in to access this page.');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}