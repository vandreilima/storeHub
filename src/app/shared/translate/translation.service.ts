import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Translation {
  [key: string]: string | Translation;
}

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private currentLang = new BehaviorSubject<string>(
    localStorage.getItem('selectedLanguage') || 'pt'
  );
  public currentLang$ = this.currentLang.asObservable();

  private translations: { [lang: string]: Translation } = {
    pt: {},
    en: {},
    es: {},
  };

  constructor() {
    this.setLanguage(this.currentLang.value);
  }

  setLanguage(lang: string): void {
    if (!this.translations[lang]) return;

    this.currentLang.next(lang);
    localStorage.setItem('selectedLanguage', lang);
    document.documentElement.lang = lang;
  }

  getCurrentLanguage(): string {
    return this.currentLang.value;
  }

  setTranslations(lang: string, translations: Translation): void {
    this.translations[lang] = translations;
  }

  translate(key: string, params?: { [key: string]: string }): string {
    const translation = key
      .split('.')
      .reduce(
        (o: any, k) => o?.[k],
        this.translations[this.currentLang.value]
      ) as string;

    if (!translation) {
      console.warn(
        `Translation not found for key: ${key} in language: ${this.currentLang.value}`
      );
      return key;
    }

    return params
      ? translation.replace(
          /\{\{(\w+)\}\}/g,
          (match, key) => params[key] || match
        )
      : translation;
  }
}
