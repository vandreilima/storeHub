import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, shareReplay, tap, throwError } from 'rxjs';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly API_URL = 'https://fakestoreapi.com/products';
  private http = inject(HttpClient);

  private productsCache$: Observable<IProduct[]> | null = null;

  public create(product: Omit<IProductCreate, 'id'>): Observable<IProduct> {
    return this.http.post<IProduct>(this.API_URL, product).pipe(
      tap(() => this.clearCache()),
      catchError((error) => this.handleError(error, 'Erro ao criar produto'))
    );
  }

  public getById(id: number): Observable<IProduct> {
    return this.http
      .get<IProduct>(`${this.API_URL}/${id}`)
      .pipe(
        catchError((error) => this.handleError(error, 'Erro ao buscar produto'))
      );
  }

  public getByIds(ids: number[]): Observable<IProduct[]> {
    if (ids.length === 0) {
      return of([]);
    }

    return this.getAllCached().pipe(
      map((products) => products.filter((product) => ids.includes(product.id)))
    );
  }

  public getAll(): Observable<IProduct[]> {
    return this.http
      .get<IProduct[]>(this.API_URL)
      .pipe(
        catchError((error) =>
          this.handleError(error, 'Erro ao buscar produtos')
        )
      );
  }

  public getAllCached(): Observable<IProduct[]> {
    if (!this.productsCache$) {
      this.productsCache$ = this.getAll().pipe(shareReplay(1));
    }
    return this.productsCache$;
  }

  public update(id: number, product: IProductCreate): Observable<IProduct> {
    return this.http.put<IProduct>(`${this.API_URL}/${id}`, product).pipe(
      tap(() => this.clearCache()),
      catchError((error) =>
        this.handleError(error, 'Erro ao atualizar produto')
      )
    );
  }

  public delete(id: number): Observable<IProduct> {
    return this.http.delete<IProduct>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.clearCache()),
      catchError((error) => this.handleError(error, 'Erro ao excluir produto'))
    );
  }

  public clearCache(): void {
    this.productsCache$ = null;
  }

  private handleError(
    error: HttpErrorResponse,
    defaultMessage: string
  ): Observable<never> {
    console.error('Products Service Error:', {
      code: error.status || 500,
      message: defaultMessage,
      fullError: error,
    });

    const customError = new Error(defaultMessage) as Error & { code?: number };
    customError.code = error.status || 500;

    return throwError(() => customError);
  }
}
