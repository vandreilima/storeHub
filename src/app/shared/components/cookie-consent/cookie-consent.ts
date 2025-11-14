import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConsentService } from '../../services/consent/consent.service';

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

  showBanner = this.consentService.showBanner;

  acceptAll(): void {
    this.consentService.acceptAll();
  }

  acceptEssentialOnly(): void {
    this.consentService.acceptEssentialOnly();
  }
}
