import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CartStateService } from './cart-state.service';
import { CartApiService } from './cart-api.service';
import { UserService } from '../user/user.service';
import { signal } from '@angular/core';

describe('CartStateService', () => {
  let service: CartStateService;
  let cartApiService: jasmine.SpyObj<CartApiService>;
  let userService: jasmine.SpyObj<UserService>;

  const mockProduct: IProduct = {
    id: 1,
    title: 'Test Product',
    price: 99.99,
    description: 'Test description',
    category: 'electronics',
    image: 'test.jpg',
    rating: { rate: 4.5, count: 100 },
  };

  const mockCart: ICart = {
    id: 1,
    userId: 1,
    date: '2024-01-01',
    products: [{ productId: 1, quantity: 2 }],
  };

  beforeEach(() => {
    const cartApiServiceSpy = jasmine.createSpyObj('CartApiService', [
      'create',
      'getById',
      'update',
      'delete',
    ]);
    const userIdSignal = signal<number | null>(1);
    const userServiceSpy = jasmine.createSpyObj('UserService', [], {
      userId: userIdSignal.asReadonly(),
    });

    TestBed.configureTestingModule({
      providers: [
        CartStateService,
        { provide: CartApiService, useValue: cartApiServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
      ],
    });

    service = TestBed.inject(CartStateService);
    cartApiService = TestBed.inject(
      CartApiService
    ) as jasmine.SpyObj<CartApiService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadCartById', () => {
    it('should load cart by userId and set cart signal', (done) => {
      cartApiService.getById.and.returnValue(of(mockCart));

      service.loadCartById(1).subscribe({
        next: (cart) => {
          expect(cart).toEqual(mockCart);
          expect(service.cart()).toEqual(mockCart);
          done();
        },
      });

      expect(cartApiService.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('setCartItems', () => {
    it('should set cart items', () => {
      const items: ICartItem[] = [
        { product: mockProduct, quantity: 2 },
      ];

      service.setCartItems(items);

      expect(service.cartItems()).toEqual(items);
    });
  });

  describe('addItem', () => {
    it('should create new cart when no cart exists and user is logged in', (done) => {
      cartApiService.create.and.returnValue(of(mockCart));

      service.addItem(mockProduct).subscribe({
        next: (cart) => {
          expect(cart).toEqual(mockCart);
          expect(service.cart()).toEqual(mockCart);
          expect(service.cartItems().length).toBe(1);
          expect(service.cartItems()[0].product).toEqual(mockProduct);
          expect(service.cartItems()[0].quantity).toBe(1);
          done();
        },
      });

      expect(cartApiService.create).toHaveBeenCalledWith(1, [
        { productId: mockProduct.id, quantity: 1 },
      ]);
    });

    it('should add to temp cart when user is not logged in', (done) => {
      const userIdSignal = signal<number | null>(null);
      Object.defineProperty(userService, 'userId', {
        get: () => userIdSignal.asReadonly(),
      });

      service.addItem(mockProduct).subscribe({
        next: (cart) => {
          expect(cart.userId).toBe(0);
          expect(service.cartItems().length).toBe(1);
          expect(service.cartItems()[0].product).toEqual(mockProduct);
          expect(service.cartItems()[0].quantity).toBe(1);
          done();
        },
      });
    });

    it('should add to existing cart', (done) => {
      service['_cartSignal'].set(mockCart);
      const updatedCart = {
        ...mockCart,
        products: [...mockCart.products, { productId: 2, quantity: 1 }],
      };
      cartApiService.update.and.returnValue(of(updatedCart));

      const newProduct = { ...mockProduct, id: 2 };

      service.addItem(newProduct).subscribe({
        next: () => {
          expect(cartApiService.update).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should increment quantity if product already exists in cart', (done) => {
      service['_cartSignal'].set(mockCart);
      service['_cartItems'].set([{ product: mockProduct, quantity: 1 }]);

      const updatedCart = {
        ...mockCart,
        products: [{ productId: 1, quantity: 2 }],
      };
      cartApiService.update.and.returnValue(of(updatedCart));

      service.addItem(mockProduct).subscribe({
        next: () => {
          expect(service.cartItems()[0].quantity).toBe(2);
          done();
        },
      });
    });
  });

  describe('incrementQuantity', () => {
    it('should increment product quantity', (done) => {
      service['_cartSignal'].set(mockCart);
      service['_cartItems'].set([{ product: mockProduct, quantity: 1 }]);

      const updatedCart = {
        ...mockCart,
        products: [{ productId: 1, quantity: 2 }],
      };
      cartApiService.update.and.returnValue(of(updatedCart));

      service.incrementQuantity(mockProduct).subscribe({
        next: () => {
          expect(service.cartItems()[0].quantity).toBe(2);
          done();
        },
      });
    });

    it('should return empty cart if product not found', (done) => {
      service.incrementQuantity(mockProduct).subscribe({
        next: (cart) => {
          expect(cart).toEqual({} as ICart);
          done();
        },
      });
    });

    it('should return empty cart if no cart exists', (done) => {
      service['_cartItems'].set([{ product: mockProduct, quantity: 1 }]);

      service.incrementQuantity(mockProduct).subscribe({
        next: (cart) => {
          expect(cart).toEqual({} as ICart);
          done();
        },
      });
    });
  });

  describe('decrementQuantity', () => {
    it('should decrement product quantity', (done) => {
      service['_cartSignal'].set(mockCart);
      service['_cartItems'].set([{ product: mockProduct, quantity: 3 }]);

      const updatedCart = {
        ...mockCart,
        products: [{ productId: 1, quantity: 2 }],
      };
      cartApiService.update.and.returnValue(of(updatedCart));

      service.decrementQuantity(mockProduct).subscribe({
        next: () => {
          expect(service.cartItems()[0].quantity).toBe(2);
          done();
        },
      });
    });

    it('should not decrement below 1', (done) => {
      service['_cartItems'].set([{ product: mockProduct, quantity: 1 }]);

      service.decrementQuantity(mockProduct).subscribe({
        next: (cart) => {
          expect(cart).toEqual({} as ICart);
          expect(service.cartItems()[0].quantity).toBe(1);
          done();
        },
      });
    });

    it('should return empty cart if product not found', (done) => {
      service.decrementQuantity(mockProduct).subscribe({
        next: (cart) => {
          expect(cart).toEqual({} as ICart);
          done();
        },
      });
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', (done) => {
      service['_cartSignal'].set(mockCart);
      service['_cartItems'].set([
        { product: mockProduct, quantity: 1 },
        { product: { ...mockProduct, id: 2 }, quantity: 1 },
      ]);

      const updatedCart = {
        ...mockCart,
        products: [{ productId: 2, quantity: 1 }],
      };
      cartApiService.update.and.returnValue(of(updatedCart));

      service.removeItem(1).subscribe({
        next: () => {
          expect(service.cartItems().length).toBe(1);
          expect(service.cartItems()[0].product.id).toBe(2);
          done();
        },
      });
    });

    it('should return empty cart if no cart exists', (done) => {
      service['_cartItems'].set([{ product: mockProduct, quantity: 1 }]);

      service.removeItem(1).subscribe({
        next: (cart) => {
          expect(cart).toEqual({} as ICart);
          expect(service.cartItems().length).toBe(0);
          done();
        },
      });
    });
  });

  describe('clearCart', () => {
    it('should clear all cart items and cart', () => {
      service['_cartSignal'].set(mockCart);
      service['_cartItems'].set([{ product: mockProduct, quantity: 1 }]);

      service.clearCart();

      expect(service.cartItems()).toEqual([]);
      expect(service.cart()).toBeNull();
    });
  });

  describe('Signals', () => {
    it('should have readonly signals', () => {
      expect(service.cartItems()).toBeDefined();
      expect(service.cart()).toBeDefined();
    });

    it('should update signals correctly', () => {
      const items: ICartItem[] = [{ product: mockProduct, quantity: 2 }];
      service.setCartItems(items);

      expect(service.cartItems()).toEqual(items);
    });
  });

  describe('Private methods - _addToTempCart', () => {
    it('should add new item to temp cart', (done) => {
      const userIdSignal = signal<number | null>(null);
      Object.defineProperty(userService, 'userId', {
        get: () => userIdSignal.asReadonly(),
      });

      service.addItem(mockProduct).subscribe({
        next: (cart) => {
          expect(cart.id).toBe(0);
          expect(cart.userId).toBe(0);
          expect(service.cartItems().length).toBe(1);
          done();
        },
      });
    });

    it('should increment quantity in temp cart if item exists', (done) => {
      const userIdSignal = signal<number | null>(null);
      Object.defineProperty(userService, 'userId', {
        get: () => userIdSignal.asReadonly(),
      });

      service['_cartItems'].set([{ product: mockProduct, quantity: 1 }]);

      service.addItem(mockProduct).subscribe({
        next: () => {
          expect(service.cartItems()[0].quantity).toBe(2);
          done();
        },
      });
    });
  });
});
