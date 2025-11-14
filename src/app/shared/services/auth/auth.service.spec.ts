import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const API_URL = 'https://fakestoreapi.com/auth';
  const STORAGE_KEY = 'store-hub_auth';

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should load auth data from localStorage on initialization', () => {
      const authData = { token: 'test-token' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

      // Criar novo TestBed com localStorage já configurado
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: Router, useValue: router },
        ],
      });

      const newService = TestBed.inject(AuthService);

      expect(newService.token()).toBe('test-token');
      expect(newService.isAuthenticated()).toBe(true);

      // Limpar localStorage
      localStorage.clear();
    });

    it('should not set token if no data in localStorage', () => {
      expect(service.token()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('login', () => {
    it('should successfully login and store token', (done) => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = { token: 'jwt-token-123' };

      service.login(credentials).subscribe({
        next: (token) => {
          expect(token).toBe('jwt-token-123');
          expect(service.token()).toBe('jwt-token-123');
          expect(service.isAuthenticated()).toBe(true);
          expect(service.isLoading()).toBe(false);

          const storedData = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || '{}'
          );
          expect(storedData.token).toBe('jwt-token-123');
          expect(router.navigate).toHaveBeenCalledWith(['/']);
          done();
        },
      });

      expect(service.isLoading()).toBe(true);

      const req = httpMock.expectOne(`${API_URL}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should handle login error', (done) => {
      const credentials = { email: 'test@example.com', password: 'wrongpass' };

      service.login(credentials).subscribe({
        next: () => {
          fail('Should have failed');
        },
        error: (error) => {
          expect(error.message).toBe('Erro ao processar autenticação');
          expect(error.code).toBe(400);
          done();
        },
        complete: () => {
          expect(service.isLoading()).toBe(false);
        },
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should set loading to false after login completes', (done) => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = { token: 'jwt-token-123' };

      service.login(credentials).subscribe({
        complete: () => {
          expect(service.isLoading()).toBe(false);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(mockResponse);
    });
  });

  describe('requestPasswordReset', () => {
    it('should return success message', (done) => {
      const resetData = { email: 'test@example.com' };

      service.requestPasswordReset(resetData).subscribe({
        next: (response) => {
          expect(response.message).toBe(
            'Opa, sera enviado um email de recuperação para voce'
          );
          done();
        },
      });
    });

    it('should set loading to false after completion', (done) => {
      const resetData = { email: 'test@example.com' };

      service.requestPasswordReset(resetData).subscribe({
        complete: () => {
          expect(service.isLoading()).toBe(false);
          done();
        },
      });
    });
  });

  describe('logout', () => {
    it('should clear token and navigate to sign-in', () => {
      const authData = { token: 'test-token' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      service['_token'].set('test-token');

      service.logout();

      expect(service.token()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/sigin-in']);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no auth data exists', () => {
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return true when auth data exists', () => {
      const authData = { token: 'test-token' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

      expect(service.isTokenExpired()).toBe(true);
    });
  });

  describe('getTokenData', () => {
    it('should return false when no auth data exists', () => {
      expect(service.getTokenData()).toBe(false);
    });

    it('should decode and return token data', () => {
      // Token JWT de exemplo (payload: {"sub": "1", "iat": 1516239022})
      const mockToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNTE2MjM5MDIyfQ.4Adcj0vVIh8VZZKd2aUZz3p1s2T2Nd1Y8j5wqYb3N1M';
      const authData = { token: mockToken };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));

      const tokenData = service.getTokenData();

      expect(tokenData).toBeTruthy();
      expect((tokenData as any).sub).toBe('1');
      expect((tokenData as any).iat).toBe(1516239022);
    });
  });

  describe('isAuthenticated computed signal', () => {
    it('should be false when no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should be true when token exists', () => {
      service['_token'].set('some-token');
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('Signals and Observables', () => {
    it('should have readonly signals', () => {
      expect(service.token()).toBeDefined();
      expect(service.isLoading()).toBeDefined();
      expect(service.isAuthenticated()).toBeDefined();
    });

    it('should convert isAuthenticated to observable', (done) => {
      service.isAuthenticated$.subscribe((value) => {
        expect(value).toBe(false);
        done();
      });
    });
  });
});
