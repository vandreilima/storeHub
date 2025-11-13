import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConsentService } from '../../services/consent/consent.service';

/**
 * Componente de banner de consentimento de cookies (LGPD)
 * Exibe banner para aceite de cookies e tracking (Microsoft Clarity)
 */
@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieConsent {
  private consentService = inject(ConsentService);

  // Signals públicos do serviço
  showBanner = this.consentService.showBanner;

  /**
   * Aceita todos os cookies
   */
  acceptAll(): void {
    this.consentService.acceptAll();
  }

  /**
   * Aceita apenas cookies essenciais
   */
  acceptEssentialOnly(): void {
    this.consentService.acceptEssentialOnly();
  }
}
