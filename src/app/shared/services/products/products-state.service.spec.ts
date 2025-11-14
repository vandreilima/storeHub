import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductsStateService } from './products-state.service';
import { ProductsService } from './products-api.service';

describe('ProductsStateService', () => {
  let service: ProductsStateService;
  let productsService: jasmine.SpyObj<ProductsService>;

  const mockProduct: IProduct = {
    id: 1,
    title: 'Test Product',
    price: 99.99,
    description: 'Test description',
    category: 'electronics',
    image: 'test.jpg',
    rating: { rate: 4.5, count: 100 },
  };

  const mockProducts: IProduct[] = [
    mockProduct,
    {
      id: 2,
      title: 'Another Product',
      price: 49.99,
      description: 'Another description',
      category: 'clothing',
      image: 'test2.jpg',
      rating: { rate: 4.0, count: 50 },
    },
  ];

  beforeEach(() => {
    const productsServiceSpy = jasmine.createSpyObj('ProductsService', [
      'getAllCached',
      'create',
      'update',
      'delete',
      'clearCache',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProductsStateService,
        { provide: ProductsService, useValue: productsServiceSpy },
      ],
    });

    service = TestBed.inject(ProductsStateService);
    productsService = TestBed.inject(
      ProductsService
    ) as jasmine.SpyObj<ProductsService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should have empty products array initially', () => {
      expect(service.products()).toEqual([]);
    });

    it('should not be loading initially', () => {
      expect(service.loading()).toBe(false);
    });

    it('should have no error initially', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('loadProducts', () => {
    it('should load products successfully', (done) => {
      productsService.getAllCached.and.returnValue(of(mockProducts));

      expect(service.loading()).toBe(false);

      service.loadProducts().subscribe({
        next: (products) => {
          expect(products).toEqual(mockProducts);
          expect(service.products()).toEqual(mockProducts);
          expect(service.error()).toBeNull();
          done();
        },
        complete: () => {
          expect(service.loading()).toBe(false);
        },
      });

      expect(productsService.getAllCached).toHaveBeenCalled();
    });

    it('should handle loading error', (done) => {
      const errorMessage = 'Failed to load products';
      productsService.getAllCached.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      service.loadProducts().subscribe({
        next: (products) => {
          expect(products).toEqual([]);
          expect(service.products()).toEqual([]);
          expect(service.loading()).toBe(false);
          expect(service.error()).toBe(errorMessage);
          done();
        },
      });
    });

    it('should set loading to true at start and false at end', (done) => {
      productsService.getAllCached.and.returnValue(of(mockProducts));

      expect(service.loading()).toBe(false);

      const subscription = service.loadProducts();

      // Verificar que está carregando após iniciar
      expect(service.loading()).toBe(true);

      subscription.subscribe({
        complete: () => {
          expect(service.loading()).toBe(false);
          done();
        },
      });
    });

    it('should clear previous error on new load', (done) => {
      service['_error'].set('Previous error');

      productsService.getAllCached.and.returnValue(of(mockProducts));

      service.loadProducts().subscribe({
        next: () => {
          expect(service.error()).toBeNull();
          done();
        },
      });
    });
  });

  describe('addProduct', () => {
    it('should add product successfully', (done) => {
      const newProduct: Omit<IProductCreate, 'id'> = {
        title: 'New Product',
        price: 129.99,
        description: 'New description',
        category: 'electronics',
        image: 'new.jpg',
      };

      const createdProduct: IProduct = {
        id: 3,
        ...newProduct,
        rating: { rate: 0, count: 0 },
      };

      service['_products'].set([...mockProducts]);
      productsService.create.and.returnValue(of(createdProduct));

      const subscription = service.addProduct(newProduct);

      expect(service.loading()).toBe(true);

      subscription.subscribe({
        next: (product) => {
          expect(product).toEqual(createdProduct);
          expect(service.products().length).toBe(3);
          expect(service.products()[2]).toEqual(createdProduct);
          expect(service.error()).toBeNull();
          done();
        },
        complete: () => {
          expect(service.loading()).toBe(false);
        },
      });
    });

    it('should handle add product error', (done) => {
      const newProduct: Omit<IProductCreate, 'id'> = {
        title: 'New Product',
        price: 129.99,
        description: 'New description',
        category: 'electronics',
        image: 'new.jpg',
      };

      const errorMessage = 'Failed to create product';
      productsService.create.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      service.addProduct(newProduct).subscribe({
        next: (product) => {
          expect(product).toBeNull();
          expect(service.loading()).toBe(false);
          expect(service.error()).toBe(errorMessage);
          done();
        },
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', (done) => {
      const updatedProductData: IProductCreate = {
        id: 1,
        title: 'Updated Product',
        price: 149.99,
        description: 'Updated description',
        category: 'electronics',
        image: 'updated.jpg',
      };

      const updatedProduct: IProduct = {
        ...mockProduct,
        ...updatedProductData,
      };

      service['_products'].set([...mockProducts]);
      productsService.update.and.returnValue(of(updatedProduct));

      const subscription = service.updateProduct(1, updatedProductData);

      expect(service.loading()).toBe(true);

      subscription.subscribe({
        next: (product) => {
          expect(product).toEqual(updatedProduct);
          expect(service.products()[0].title).toBe('Updated Product');
          expect(service.error()).toBeNull();
          done();
        },
        complete: () => {
          expect(service.loading()).toBe(false);
        },
      });
    });

    it('should preserve rating when updating product', (done) => {
      const updatedProductData: IProductCreate = {
        id: 1,
        title: 'Updated Product',
        price: 149.99,
        description: 'Updated description',
        category: 'electronics',
        image: 'updated.jpg',
      };

      const updatedProductWithoutRating: any = {
        id: 1,
        title: 'Updated Product',
        price: 149.99,
        description: 'Updated description',
        category: 'electronics',
        image: 'updated.jpg',
      };

      service['_products'].set([...mockProducts]);
      productsService.update.and.returnValue(of(updatedProductWithoutRating));

      service.updateProduct(1, updatedProductData).subscribe({
        next: (product) => {
          expect(service.products()[0].rating).toEqual(mockProduct.rating);
          done();
        },
      });
    });

    it('should handle update product error', (done) => {
      const updatedProductData: IProductCreate = {
        id: 1,
        title: 'Updated Product',
        price: 149.99,
        description: 'Updated description',
        category: 'electronics',
        image: 'updated.jpg',
      };

      const errorMessage = 'Failed to update product';
      productsService.update.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      service['_products'].set([...mockProducts]);

      service.updateProduct(1, updatedProductData).subscribe({
        next: (product) => {
          expect(product).toBeNull();
          expect(service.loading()).toBe(false);
          expect(service.error()).toBe(errorMessage);
          done();
        },
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', (done) => {
      service['_products'].set([...mockProducts]);
      productsService.delete.and.returnValue(of(mockProduct));

      const subscription = service.deleteProduct(1);

      expect(service.loading()).toBe(true);

      subscription.subscribe({
        next: () => {
          expect(service.products().length).toBe(1);
          expect(service.products()[0].id).toBe(2);
          expect(service.error()).toBeNull();
          done();
        },
        complete: () => {
          expect(service.loading()).toBe(false);
        },
      });
    });

    it('should handle delete product error', (done) => {
      const errorMessage = 'Failed to delete product';
      productsService.delete.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      service['_products'].set([...mockProducts]);

      service.deleteProduct(1).subscribe({
        next: () => {
          expect(service.products().length).toBe(2);
          expect(service.loading()).toBe(false);
          expect(service.error()).toBe(errorMessage);
          done();
        },
      });
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      service['_error'].set('Some error message');

      service.clearError();

      expect(service.error()).toBeNull();
    });
  });

  describe('refreshProducts', () => {
    it('should clear cache and reload products', (done) => {
      productsService.getAllCached.and.returnValue(of(mockProducts));

      service.refreshProducts();

      expect(productsService.clearCache).toHaveBeenCalled();

      setTimeout(() => {
        expect(productsService.getAllCached).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should update products after refresh', (done) => {
      const newMockProducts: IProduct[] = [
        ...mockProducts,
        {
          id: 3,
          title: 'Third Product',
          price: 79.99,
          description: 'Third description',
          category: 'books',
          image: 'test3.jpg',
          rating: { rate: 4.8, count: 200 },
        },
      ];

      productsService.getAllCached.and.returnValue(of(newMockProducts));

      service.refreshProducts();

      setTimeout(() => {
        expect(service.products().length).toBe(3);
        done();
      }, 100);
    });
  });

  describe('Signals', () => {
    it('should have readonly signals', () => {
      expect(service.products()).toBeDefined();
      expect(service.loading()).toBeDefined();
      expect(service.error()).toBeDefined();
    });

    it('should update loading signal correctly', (done) => {
      productsService.getAllCached.and.returnValue(of(mockProducts));

      expect(service.loading()).toBe(false);

      const subscription = service.loadProducts();

      expect(service.loading()).toBe(true);

      subscription.subscribe({
        complete: () => {
          expect(service.loading()).toBe(false);
          done();
        },
      });
    });
  });
});
