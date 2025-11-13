import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TranslationService } from '../translate/translation.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const translationService = inject(TranslationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return throwError(() => error);
      }

      let errorMessages: string = '';
      let summary = 'Erro';

      errorMessages = translationService.translate('msg');

      messageService.add({
        severity: 'error',
        summary,
        detail: errorMessages,
        life: 5000, // 5 s
      });

      return throwError(() => error);
    })
  );
};
