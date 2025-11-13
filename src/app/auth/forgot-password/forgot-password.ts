import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../shared/services/auth/auth.service';
import { FORCE_FORM_FEEDBACK } from '../../shared/utils/form.utils';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Signals para controle de estado
  isEmailSent = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = false;

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit() {
    FORCE_FORM_FEEDBACK(this.forgotPasswordForm);

    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    const resetData: ResetPasswordRequest = {
      email: this.forgotPasswordForm.value.email,
    };

    this.isLoading = true;
    this.authService.requestPasswordReset(resetData).subscribe({
      next: (response) => {
        this.isEmailSent.set(true);
        this.isLoading = false;
        this.successMessage.set(
          response.message || 'E-mail de recuperação enviado com sucesso!'
        );
        console.log('E-mail de recuperação enviado');
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage.set(
          error.message || 'Erro ao enviar e-mail de recuperação'
        );
        console.error('Erro ao enviar e-mail:', error);
      },
    });
  }

  resendEmail() {
    this.onSubmit();
  }

  backToLogin() {
    this.isEmailSent.set(false);
    this.forgotPasswordForm.reset();
    this.errorMessage.set('');
    this.successMessage.set('');
  }
}
