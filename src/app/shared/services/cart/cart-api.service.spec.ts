import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CartApiService } from './cart-api.service';

describe('CartApiService', () => {
  let service: CartApiService;
  let httpMock: HttpTestingController;

  const API_URL = 'https://fakestoreapi.com/carts';

  const mockCart: ICart = {
    id: 1,
    userId: 1,
    date: '2024-01-01',
    products: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CartApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CartApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create a new cart', (done) => {
      const userId = 1;
      const products: ICartProduct[] = [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ];

      service.create(userId, products).subscribe({
        next: (cart) => {
          expect(cart).toEqual(mockCart);
          expect(cart.userId).toBe(userId);
          expect(cart.products.length).toBe(2);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ userId, products });
      req.flush(mockCart);
    });

    it('should create cart with single product', (done) => {
      const userId = 1;
      const products: ICartProduct[] = [{ productId: 1, quantity: 1 }];

      const expectedCart: ICart = {
        id: 1,
        userId: 1,
        date: '2024-01-01',
        products: [{ productId: 1, quantity: 1 }],
      };

      service.create(userId, products).subscribe({
        next: (cart) => {
          expect(cart).toEqual(expectedCart);
          expect(cart.products.length).toBe(1);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      req.flush(expectedCart);
    });
  });

  describe('getById', () => {
    it('should fetch cart by id', (done) => {
      const cartId = 1;

      service.getById(cartId).subscribe({
        next: (cart) => {
          expect(cart).toEqual(mockCart);
          expect(cart.id).toBe(cartId);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/${cartId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCart);
    });

    it('should handle different cart ids', (done) => {
      const cartId = 5;
      const differentCart: ICart = {
        ...mockCart,
        id: cartId,
        userId: 5,
      };

      service.getById(cartId).subscribe({
        next: (cart) => {
          expect(cart.id).toBe(cartId);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/${cartId}`);
      req.flush(differentCart);
    });
  });

  describe('getAll', () => {
    it('should fetch all carts', (done) => {
      const mockCarts: ICart[] = [
        mockCart,
        { ...mockCart, id: 2, userId: 2 },
        { ...mockCart, id: 3, userId: 3 },
      ];

      service.getAll().subscribe({
        next: (carts) => {
          expect(carts).toEqual(mockCarts);
          expect(carts.length).toBe(3);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      req.flush(mockCarts);
    });

    it('should return empty array when no carts exist', (done) => {
      service.getAll().subscribe({
        next: (carts) => {
          expect(carts).toEqual([]);
          expect(carts.length).toBe(0);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush([]);
    });
  });

  describe('update', () => {
    it('should update an existing cart', (done) => {
      const cartId = 1;
      const updatedCart: ICart = {
        ...mockCart,
        products: [
          { productId: 1, quantity: 3 },
          { productId: 2, quantity: 2 },
          { productId: 3, quantity: 1 },
        ],
      };

      service.update(cartId, updatedCart).subscribe({
        next: (cart) => {
          expect(cart).toEqual(updatedCart);
          expect(cart.products.length).toBe(3);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/${cartId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedCart);
      req.flush(updatedCart);
    });

    it('should update cart with removed products', (done) => {
      const cartId = 1;
      const updatedCart: ICart = {
        ...mockCart,
        products: [{ productId: 1, quantity: 1 }],
      };

      service.update(cartId, updatedCart).subscribe({
        next: (cart) => {
          expect(cart.products.length).toBe(1);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/${cartId}`);
      req.flush(updatedCart);
    });
  });

  describe('delete', () => {
    it('should delete a cart', (done) => {
      const cartId = 1;

      service.delete(cartId).subscribe({
        next: () => {
          expect().nothing();
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/${cartId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle deletion of different cart ids', (done) => {
      const cartId = 10;

      service.delete(cartId).subscribe({
        next: () => {
          expect().nothing();
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/${cartId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Error handling', () => {
    it('should handle HTTP errors on create', (done) => {
      const userId = 1;
      const products: ICartProduct[] = [{ productId: 1, quantity: 1 }];

      service.create(userId, products).subscribe({
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });

    it('should handle HTTP errors on getById', (done) => {
      service.getById(999).subscribe({
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle HTTP errors on update', (done) => {
      service.update(1, mockCart).subscribe({
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
    });
  });
});
