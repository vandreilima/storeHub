import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

import { MessageModule } from 'primeng/message';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../shared/services/auth/auth.service';
import { TranslationService } from '../../shared/translate/translation.service';
import { FORCE_FORM_FEEDBACK } from '../../shared/utils/form.utils';

@Component({
  selector: 'app-sigin-in',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    MessageModule,
    CommonModule,
    RouterModule,
    TranslatePipe,
  ],
  templateUrl: './sigin-in.html',
  styleUrl: './sigin-in.scss',
})
export class SiginIn {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslationService);

  errorMessage = signal<string | null>(null);
  isLoading = false;

  signInForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    FORCE_FORM_FEEDBACK(this.signInForm);
    if (this.signInForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.errorMessage.set(null);

    const credentials: LoginRequest = this.signInForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => {
        // Sucesso - o AuthService já faz o redirecionamento
        this.router.navigate(['/']);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage.set(
          error.message || this.translate.translate('forms.login_error')
        );
        console.error('Erro no login:', error);
      },
    });
  }
}
