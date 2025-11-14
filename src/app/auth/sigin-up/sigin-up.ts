import { UserService } from './../../shared/services/user/user.service';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../shared/translate/translation.service';
import { FORCE_FORM_FEEDBACK } from '../../shared/utils/form.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sigin-up',
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
  templateUrl: './sigin-up.html',
  styleUrl: './sigin-up.scss',
})
export class SignUp {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private translate = inject(TranslationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = false;

  signUpForm: FormGroup = this.fb.group(
    {
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          this.passwordHasNonAlphanumeric,
          this.passwordHasLowercase,
          this.passwordHasUppercase,
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  private passwordHasNonAlphanumeric(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasNonAlphanumeric = /[^a-zA-Z0-9]/.test(value);
    return hasNonAlphanumeric ? null : { noNonAlphanumeric: true };
  }

  private passwordHasLowercase(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasLowercase = /[a-z]/.test(value);
    return hasLowercase ? null : { noLowercase: true };
  }

  private passwordHasUppercase(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUppercase = /[A-Z]/.test(value);
    return hasUppercase ? null : { noUppercase: true };
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  onSubmit() {
    FORCE_FORM_FEEDBACK(this.signUpForm);

    if (this.signUpForm.invalid) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { userName, password, email } = this.signUpForm.getRawValue();

    const registerData: RegisterRequest = {
      username: userName,
      password,
      email,
    };

    this.isLoading = true;

    this.userService
      .register(registerData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/sigin-in']);
          this.successMessage.set(
            this.translate.translate('forms.register_success')
          );
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage.set(
            error.message || this.translate.translate('forms.register_error')
          );
          console.error('Erro no cadastro:', error);
        },
      });
  }
}
