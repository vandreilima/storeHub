import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = 'https://fakestoreapi.com/users';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  isLoaded = false;

  private userInfoSignal = signal<IUser | null>(null);
  public userInfoSignal$ = toObservable(this.userInfoSignal);
  readonly userRole = computed(() => this.userInfoSignal()?.roles || null);

  readonly isAdmin = computed(() =>
    this.userInfoSignal()?.roles.includes('Admin')
  );

  readonly hasAdminOrManagerRole = computed(() => {
    const role = this.userInfoSignal()?.roles;
    return role?.includes('Admin');
  });

  getUserInfo(): Observable<IUser | { error: boolean }> {
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

        this.userInfoSignal.set(userInfo);
        this.isLoaded = true;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<IUser> {
    return this.http
      .post<IUser>(`${this.API_URL}`, data)
      .pipe(catchError((error) => this.handleUserError(error)));
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
