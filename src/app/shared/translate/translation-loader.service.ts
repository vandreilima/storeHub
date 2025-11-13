import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { TranslationService } from './translation.service';
import { Translation } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class TranslationLoaderService {
  constructor(
    private http: HttpClient,
    private translationService: TranslationService
  ) {}

  loadTranslations(): Observable<any> {
    const languages = ['pt', 'en', 'es'];
    const requests = languages.map((lang) =>
      this.http.get<Translation>(`/lang/i18n/${lang}.json`)
    );

    return forkJoin(requests);
  }

  initializeTranslations(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadTranslations().subscribe({
        next: (translations) => {
          translations.forEach((translation: any, index: number) => {
            const lang = ['pt', 'en', 'es'][index];
            this.translationService.setTranslations(lang, translation);
          });
          resolve();
        },
        error: (error) => {
          console.error('Error loading translations:', error);
          reject(error);
        },
      });
    });
  }
}
