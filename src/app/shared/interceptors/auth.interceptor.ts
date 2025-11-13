import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const skipUrls = ['/auth/login', '/products'];

  const shouldSkip = skipUrls.some((url) => req.url.includes(url));

  if (shouldSkip || !authService.token()) {
    return next(req);
  }

  const clonedReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authService.token()}`),
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      }

      return throwError(() => error);
    })
  );
};
