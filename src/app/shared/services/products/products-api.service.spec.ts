import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductsService } from './products-api.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  const API_URL = 'https://fakestoreapi.com/products';

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
    TestBed.configureTestingModule({
      providers: [
        ProductsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should create a new product', (done) => {
      const newProduct: Omit<IProductCreate, 'id'> = {
        title: 'New Product',
        price: 129.99,
        description: 'New description',
        category: 'electronics',
        image: 'new.jpg',
      };

      service.create(newProduct).subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      req.flush(mockProduct);
    });

    it('should clear cache after creating product', (done) => {
      const newProduct: Omit<IProductCreate, 'id'> = {
        title: 'New Product',
        price: 129.99,
        description: 'New description',
        category: 'electronics',
        image: 'new.jpg',
      };

      service.create(newProduct).subscribe({
        next: () => {
          expect(service['productsCache$']).toBeNull();
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockProduct);
    });

    it('should handle create error', (done) => {
      const newProduct: Omit<IProductCreate, 'id'> = {
        title: 'New Product',
        price: 129.99,
        description: 'New description',
        category: 'electronics',
        image: 'new.jpg',
      };

      service.create(newProduct).subscribe({
        error: (error) => {
          expect(error.message).toBe('Erro ao criar produto');
          expect(error.code).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getById', () => {
    it('should fetch product by id', (done) => {
      service.getById(1).subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });

    it('should handle getById error', (done) => {
      service.getById(999).subscribe({
        error: (error) => {
          expect(error.message).toBe('Erro ao buscar produto');
          expect(error.code).toBe(404);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/999`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getByIds', () => {
    it('should return empty array when no ids provided', (done) => {
      service.getByIds([]).subscribe({
        next: (products) => {
          expect(products).toEqual([]);
          done();
        },
      });
    });

    it('should fetch products by ids from cache', (done) => {
      // Primeiro, preencher o cache
      service.getAllCached().subscribe(() => {
        // Agora buscar por IDs específicos
        service.getByIds([1, 2]).subscribe({
          next: (products) => {
            expect(products.length).toBe(2);
            expect(products).toEqual(mockProducts);
            done();
          },
        });
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockProducts);
    });

    it('should filter products by specified ids only', (done) => {
      service.getAllCached().subscribe(() => {
        service.getByIds([1]).subscribe({
          next: (products) => {
            expect(products.length).toBe(1);
            expect(products[0].id).toBe(1);
            done();
          },
        });
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockProducts);
    });
  });

  describe('getAll', () => {
    it('should fetch all products', (done) => {
      service.getAll().subscribe({
        next: (products) => {
          expect(products).toEqual(mockProducts);
          expect(products.length).toBe(2);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should handle getAll error', (done) => {
      service.getAll().subscribe({
        error: (error) => {
          expect(error.message).toBe('Erro ao buscar produtos');
          expect(error.code).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getAllCached', () => {
    it('should cache products on first call', (done) => {
      service.getAllCached().subscribe({
        next: (products) => {
          expect(products).toEqual(mockProducts);
          expect(service['productsCache$']).toBeTruthy();
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockProducts);
    });

    it('should return cached products on subsequent calls', (done) => {
      // Primeira chamada
      service.getAllCached().subscribe(() => {
        // Segunda chamada - não deve fazer nova requisição HTTP
        service.getAllCached().subscribe({
          next: (products) => {
            expect(products).toEqual(mockProducts);
            done();
          },
        });
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockProducts);
      // Não deve haver segunda requisição
    });
  });

  describe('update', () => {
    it('should update a product', (done) => {
      const updatedProduct: IProductCreate = {
        id: 1,
        title: 'Updated Product',
        price: 149.99,
        description: 'Updated description',
        category: 'electronics',
        image: 'updated.jpg',
      };

      service.update(1, updatedProduct).subscribe({
        next: (product) => {
          expect(product.title).toBe('Updated Product');
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedProduct);
      req.flush({ ...mockProduct, ...updatedProduct });
    });

    it('should clear cache after updating product', (done) => {
      const updatedProduct: IProductCreate = {
        id: 1,
        title: 'Updated Product',
        price: 149.99,
        description: 'Updated description',
        category: 'electronics',
        image: 'updated.jpg',
      };

      service.update(1, updatedProduct).subscribe({
        next: () => {
          expect(service['productsCache$']).toBeNull();
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush({ ...mockProduct, ...updatedProduct });
    });

    it('should handle update error', (done) => {
      const updatedProduct: IProductCreate = {
        id: 1,
        title: 'Updated Product',
        price: 149.99,
        description: 'Updated description',
        category: 'electronics',
        image: 'updated.jpg',
      };

      service.update(1, updatedProduct).subscribe({
        error: (error) => {
          expect(error.message).toBe('Erro ao atualizar produto');
          expect(error.code).toBe(400);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('delete', () => {
    it('should delete a product', (done) => {
      service.delete(1).subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockProduct);
    });

    it('should clear cache after deleting product', (done) => {
      service.delete(1).subscribe({
        next: () => {
          expect(service['productsCache$']).toBeNull();
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush(mockProduct);
    });

    it('should handle delete error', (done) => {
      service.delete(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('Erro ao excluir produto');
          expect(error.code).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(`${API_URL}/1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
  });

  describe('clearCache', () => {
    it('should clear the products cache', (done) => {
      // Primeiro, popular o cache
      service.getAllCached().subscribe(() => {
        expect(service['productsCache$']).toBeTruthy();

        // Limpar o cache
        service.clearCache();

        expect(service['productsCache$']).toBeNull();
        done();
      });

      const req = httpMock.expectOne(API_URL);
      req.flush(mockProducts);
    });
  });

  describe('Error handling', () => {
    it('should handle error with custom status code', (done) => {
      service.getAll().subscribe({
        error: (error) => {
          expect(error.code).toBe(503);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.flush('Service Unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
      });
    });

    it('should use default error code 500 when no status provided', (done) => {
      service.getAll().subscribe({
        error: (error) => {
          expect(error.code).toBe(500);
          done();
        },
      });

      const req = httpMock.expectOne(API_URL);
      req.error(new ProgressEvent('error'));
    });
  });
});
