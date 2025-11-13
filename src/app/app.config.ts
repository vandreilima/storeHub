import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';

import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import localePt from '@angular/common/locales/pt';
import { MessageService } from 'primeng/api';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { StoreHubPreset } from '../styles/primeng-preset';
import { providePrimeNG } from 'primeng/config';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { errorInterceptor } from './shared/interceptors/error.interceptor';
import { TranslationLoaderService } from './shared/translate/translation-loader.service';

registerLocaleData(localeEn, 'en');
registerLocaleData(localeEs, 'es');
registerLocaleData(localePt, 'pt');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    MessageService,
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: StoreHubPreset,
        options: {
          darkModeSelector: 'none',
        },
      },
    }),
    { provide: LOCALE_ID, useValue: 'pt' }, // Português como padrão
    provideAppInitializer(() => {
      const translationLoader = inject(TranslationLoaderService);
      return translationLoader.initializeTranslations();
    }),
  ],
};
