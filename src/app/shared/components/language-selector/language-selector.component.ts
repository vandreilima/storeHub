import { TranslationService } from '../../translate/translation.service';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
interface Language {
  label: string;
  value: string;
  flag: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, SelectModule, FormsModule],
  template: `
    <div class="language-selector">
      <p-select
        [options]="languages"
        [(ngModel)]="selectedLanguage"
        (onChange)="onLanguageChange($event)"
        optionLabel="label"
        optionValue="value"
        [showClear]="false"
      >
        <ng-template pTemplate="selectedItem" let-selectedOption>
          @if (selectedOption) {
          <div class="language-item">
            <span class="flag">{{ selectedOption.flag }}</span>
          </div>
          }
        </ng-template>
        <ng-template pTemplate="item" let-language>
          <div class="language-item">
            <span class="flag">{{ language.flag }}</span>
          </div>
        </ng-template>
      </p-select>
    </div>
  `,
  styles: [
    `
      .language-selector {
        display: inline-block;
      }

      .language-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .flag {
        font-size: 16px;
      }

      .label {
        font-size: 14px;
      }
    `,
  ],
})
export class LanguageSelectorComponent {
  private translationService = inject(TranslationService);

  languages: Language[] = [
    { label: 'Português', value: 'pt', flag: '🇧🇷' },
    { label: 'English', value: 'en', flag: '🇺🇸' },
    { label: 'Español', value: 'es', flag: '🇪🇸' },
  ];

  selectedLanguage: string = this.translationService.getCurrentLanguage();

  onLanguageChange(event: { value: string }): void {
    if (event?.value) {
      this.translationService.setLanguage(event.value);
    }
  }
}
