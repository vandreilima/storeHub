import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { ProductsService } from './products-api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsStateService {
  private productsService = inject(ProductsService);

  private _products = signal<IProduct[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  public loadProducts(): Observable<IProduct[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.productsService.getAllCached().pipe(
      tap((products) => {
        this._products.set(products);
        this._loading.set(false);
      }),
      catchError((error) => {
        this._error.set(error.message || 'Erro ao carregar produtos');
        this._loading.set(false);
        return of([]);
      })
    );
  }

  public addProduct(
    product: Omit<IProduct, 'id'>
  ): Observable<IProduct | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.productsService.create(product).pipe(
      tap((newProduct) => {
        const currentProducts = this._products();
        this._products.set([...currentProducts, newProduct]);
        this._loading.set(false);
      }),
      catchError((error) => {
        this._error.set(error.message || 'Erro ao adicionar produto');
        this._loading.set(false);
        return of(null);
      })
    );
  }

  public updateProduct(
    id: number,
    product: IProduct
  ): Observable<IProduct | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.productsService.update(id, product).pipe(
      tap((updatedProduct) => {
        const currentProducts = this._products();
        const updatedProducts = currentProducts.map((p) =>
          p.id === id ? updatedProduct : p
        );
        this._products.set(updatedProducts);
        this._loading.set(false);
      }),
      catchError((error) => {
        this._error.set(error.message || 'Erro ao atualizar produto');
        this._loading.set(false);
        return of(null);
      })
    );
  }

  public deleteProduct(id: number): Observable<any> {
    this._loading.set(true);
    this._error.set(null);

    return this.productsService.delete(id).pipe(
      tap(() => {
        const currentProducts = this._products();
        const updatedProducts = currentProducts.filter((p) => p.id !== id);
        this._products.set(updatedProducts);
        this._loading.set(false);
      }),
      catchError((error) => {
        this._error.set(error.message || 'Erro ao excluir produto');
        this._loading.set(false);
        return of([]);
      })
    );
  }

  public clearError(): void {
    this._error.set(null);
  }

  public refreshProducts(): void {
    this.productsService.clearCache();
    this.loadProducts().subscribe();
  }
}
