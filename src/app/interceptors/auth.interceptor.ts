import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppCookieService } from '../services/cookie.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(AppCookieService);
  const token = cookieService.getCookie('Token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  return next(req);
};
