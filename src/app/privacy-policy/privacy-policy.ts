import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

/**
 * Página de Política de Privacidade (LGPD)
 * Informa aos usuários como seus dados são coletados, usados e protegidos
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, DividerModule],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicy {
  // Data da última atualização
  readonly lastUpdated = '13 de Novembro de 2025';
}
