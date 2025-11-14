import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { tap, catchError, map } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly STORAGE_KEY = 'store-hub_auth';

  private readonly API_URL = 'https://fakestoreapi.com/auth';

  private tokenSignal = signal<string | null>(null);
  private loadingSignal = signal<boolean>(false);

  readonly token = this.tokenSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();

  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  // Converte o signal isAuthenticated para Observable quando necessário
  readonly isAuthenticated$ = toObservable(this.isAuthenticated);

  constructor() {
    this.loadAuthFromStorage();
  }

  login(credentials: LoginRequest): Observable<string> {
    this.loadingSignal.set(true);

    return this.http
      .post<ApiSuccessResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        map(({ token }) => token),
        tap((token) => {
          this.handleAuthSuccess(token);
        }),
        catchError((error) => this.handleAuthError(error)),
        tap(() => this.loadingSignal.set(false))
      );
  }

  requestPasswordReset(
    data: ResetPasswordRequest
  ): Observable<{ message: string }> {
    this.loadingSignal.set(true);

    return of({
      message: 'Opa, sera enviado um email de recuperação para voce',
    }).pipe(
      catchError((error) => this.handleAuthError(error)),
      tap(() => this.loadingSignal.set(false))
    );
  }

  logout(): void {
    this.tokenSignal.set(null);

    localStorage.removeItem(this.STORAGE_KEY);

    this.router.navigate(['/sigin-in']);
  }

  isTokenExpired(): boolean {
    const authData = this.getStoredAuthData();

    if (!authData) {
      return true;
    }

    return true;
  }

  private handleAuthSuccess(token: string): void {
    this.tokenSignal.set(token);

    const authData: AuthStorageData = {
      token: token,
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));

    this.router.navigate(['/']);
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro ao processar autenticação';

    console.error('Auth Error:', {
      code: 400,
      message: errorMessage,
      fullError: error,
    });

    const customError = new Error(errorMessage) as Error & { code?: number };
    customError.code = 400;

    return throwError(() => customError);
  }

  private loadAuthFromStorage(): void {
    const authData = this.getStoredAuthData();

    if (authData) {
      this.tokenSignal.set(authData.token);
    }
  }

  private getStoredAuthData(): AuthStorageData | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  public getTokenData() {
    const data = this.getStoredAuthData();

    if (!data) return false;

    const { token } = data;

    return jwtDecode(token);
  }
}
