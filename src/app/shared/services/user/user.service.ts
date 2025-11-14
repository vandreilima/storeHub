import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = 'https://fakestoreapi.com/users';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isLoaded = false;

  private _userInfo = signal<IUser | null>(null);
  public userInfo = toObservable(this._userInfo);
  readonly userRole = computed(() => this._userInfo()?.roles || null);

  readonly isAdmin = computed(() => this._userInfo()?.roles.includes('Admin'));

  readonly userId = computed(() => this._userInfo()?.id ?? null);

  readonly hasAdminOrManagerRole = computed(() => {
    const role = this._userInfo()?.roles;
    return role?.includes('Admin');
  });

  constructor() {
    effect(() => {
      const token = this.authService.token();
      if (!token) {
        this.clearUserData();
      }
    });
  }

  public getUserInfo(): Observable<IUser | { error: boolean }> {
    const tokenData = this.authService.getTokenData();

    if (!tokenData)
      return of({
        error: true,
      });

    return this.http.get<IUser>(`${this.API_URL}/${tokenData.sub}`).pipe(
      tap((user) => {
        const userInfo = {
          ...user,
          roles: ['Admin'],
        };

        this._userInfo.set(userInfo);
        this.isLoaded = true;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  public register(data: RegisterRequest): Observable<IUser> {
    return this.http
      .post<IUser>(`${this.API_URL}`, data)
      .pipe(catchError((error) => this.handleUserError(error)));
  }

  private clearUserData(): void {
    this._userInfo.set(null);
    this.isLoaded = false;
  }

  private handleUserError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Erro ao criar sua conta';

    console.error('User Error:', {
      code: 400,
      message: errorMessage,
      fullError: error,
    });

    const customError = new Error(errorMessage) as Error & { code?: number };
    customError.code = 400;

    return throwError(() => customError);
  }
}
