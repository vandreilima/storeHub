import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { ConsentService } from './shared/services/consent/consent.service';
import { CookieConsent } from './shared/components/cookie-consent/cookie-consent';
import { UserService } from './shared/services/user/user.service';
import { AuthService } from './shared/services/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CookieConsent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('storeHub');
  private consentService = inject(ConsentService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  constructor() {
    this.authService.isAuthenticated$
      .pipe(
        filter((isAuthenticated) => isAuthenticated),
        switchMap(() => this.userService.getUserInfo()),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (user) => {
          console.log('Dados do usuário carregados:', user);
        },
        error: (error) => {
          console.error('Erro ao carregar dados do usuário:', error);
        },
      });
  }

  ngOnInit(): void {
    this.consentService.checkConsentStatus();
  }
}
