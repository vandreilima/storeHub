import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { signal } from '@angular/core';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  const API_URL = 'https://fakestoreapi.com/users';

  const mockUser: IUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    name: {
      firstname: 123,
      lastname: 456,
    },
    address: {
      city: 'New York',
      street: '123 Main St',
      number: 123,
      zipcode: '12345',
      geolocation: {
        lat: '40.7128',
        long: '-74.0060',
      },
    },
    phone: 1234567890,
    roles: [],
    __v: 0,
  };

  beforeEach(() => {
    const tokenSignal = signal<string | null>('test-token');
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getTokenData',
    ]);
    authServiceSpy.token = tokenSignal.asReadonly();
    authServiceSpy.getTokenData.and.returnValue({ sub: '1' });

    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should initialize with null user info', (done) => {
      service.userInfo.subscribe((user) => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should initialize with isLoaded false', () => {
      expect(service.isLoaded).toBe(false);
    });
  });

  describe('getUserInfo', () => {
    it('should fetch and set user info successfully', (done) => {
      service.getUserInfo().subscribe({
        next: (user) => {
          // O observable retorna o usuário original da API
          expect(user).toEqual(mockUser);
          expect(service.isLoaded).toBe(true);
          // Mas o serviço internamente adiciona roles: ['Admin']
          expect(service.userId()).toBe(1);
          expect(service.isAdmin()).toBe(true);
          expect(service.hasAdminOrManagerRole()).toBe(true);
          expect(service.userRole()).toEqual(['Admin']);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should return error when no token data exists', (done) => {
      authService.getTokenData.and.returnValue(false);

      service.getUserInfo().subscribe({
        next: (result) => {
          expect((result as any).error).toBe(true);
          done();
        },
      });
    });

    it('should handle HTTP errors', (done) => {
      service.getUserInfo().subscribe({
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('register', () => {
    it('should successfully register a new user', (done) => {
      const registerData: RegisterRequest = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      };

      service.register(registerData).subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockUser);
    });

    it('should handle registration error', (done) => {
      const registerData: RegisterRequest = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'password123',
      };

      service.register(registerData).subscribe({
        error: (error) => {
          expect(error.message).toBe('Erro ao criar sua conta');
          expect(error.code).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('Computed signals', () => {
    it('should compute userRole correctly', (done) => {
      service.getUserInfo().subscribe(() => {
        expect(service.userRole()).toEqual(['Admin']);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush(mockUser);
    });

    it('should return null for userRole when no user', () => {
      expect(service.userRole()).toBeNull();
    });

    it('should compute isAdmin correctly', (done) => {
      service.getUserInfo().subscribe(() => {
        expect(service.isAdmin()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush(mockUser);
    });

    it('should return undefined for isAdmin when no user', () => {
      expect(service.isAdmin()).toBeUndefined();
    });

    it('should compute userId correctly', (done) => {
      service.getUserInfo().subscribe(() => {
        expect(service.userId()).toBe(1);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush(mockUser);
    });

    it('should return null for userId when no user', () => {
      expect(service.userId()).toBeNull();
    });

    it('should compute hasAdminOrManagerRole correctly', (done) => {
      service.getUserInfo().subscribe(() => {
        expect(service.hasAdminOrManagerRole()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush(mockUser);
    });

    it('should return false for hasAdminOrManagerRole when no admin role', (done) => {
      const userWithoutAdminRole = { ...mockUser, roles: ['User'] };

      service['_userInfo'].set(userWithoutAdminRole as any);

      expect(service.hasAdminOrManagerRole()).toBe(false);
      done();
    });
  });

  describe('User data clearing', () => {
    it('should clear user data when method is called', () => {
      // Definir um usuário primeiro
      service['_userInfo'].set({ ...mockUser, roles: ['Admin'] } as any);
      service.isLoaded = true;

      // Chamar método privado através de reflexão
      service['clearUserData']();

      service.userInfo.subscribe((user) => {
        expect(user).toBeNull();
      });
      expect(service.isLoaded).toBe(false);
    });
  });
});
