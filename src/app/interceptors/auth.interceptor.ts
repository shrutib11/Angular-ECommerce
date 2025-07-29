import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppCookieService } from '../services/cookie.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(AppCookieService);
  const router = inject(Router);
  const token = cookieService.getCookie('Token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401)
        router.navigate(['/login']);

      else if(error.status === 403) 
        router.navigate(['/unauthorized'])

      return throwError(() => error);
    })
  );
};
