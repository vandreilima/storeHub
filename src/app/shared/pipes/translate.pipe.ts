import {
  Pipe,
  PipeTransform,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../translate/translation.service';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription?: Subscription;
  private lastKey?: string;
  private lastParams?: { [key: string]: string };
  private lastValue?: string;

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  transform(
    key: string,
    params?: { [key: string]: string },
    cssClass?: string
  ): string {
    if (!key) return '';

    // Verificar se os parâmetros mudaram
    if (
      this.lastKey === key &&
      JSON.stringify(this.lastParams) === JSON.stringify(params) &&
      this.lastValue
    ) {
      return this.lastValue;
    }

    // Cancelar subscription anterior se existir
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Subscrever para mudanças de idioma
    this.subscription = this.translationService.currentLang$.subscribe(() => {
      this.lastValue = this.processTranslation(key, params, cssClass);
      this.cdr.markForCheck();
    });

    this.lastKey = key;
    this.lastParams = params;
    this.lastValue = this.processTranslation(key, params, cssClass);

    return this.lastValue;
  }

  private processTranslation(
    key: string,
    params?: { [key: string]: string },
    cssClass?: string
  ): string {
    let translatedText = this.translationService.translate(key, params);

    // Se uma classe CSS foi fornecida, substituir <strong> por <span> com a classe
    if (cssClass) {
      translatedText = translatedText
        .replace(/<span>/g, `<span class="${cssClass}">`)
        .replace(/<\/span>/g, '</span>');
    }

    return translatedText;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
