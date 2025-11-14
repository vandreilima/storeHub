import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly API_URL = 'https://fakestoreapi.com/products';
  private http = inject(HttpClient);

  // Cache de produtos - faz apenas 1 requisição e compartilha o resultado
  private productsCache$: Observable<IProduct[]> | null = null;

  public create() {}

  public getById(id: number): Observable<IProduct> {
    return this.http.get<IProduct>(`${this.API_URL}/${id}`);
  }

  public getByIds(ids: number[]): Observable<IProduct[]> {
    if (ids.length === 0) {
      return of([]);
    }

    // mocando uma situação que nao seria necessario em um cenario real
    return this.getAllCached().pipe(
      map((products) => products.filter((product) => ids.includes(product.id)))
    );
  }

  public getAll(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.API_URL);
  }

  // Método que mantém cache dos produtos
  public getAllCached(): Observable<IProduct[]> {
    if (!this.productsCache$) {
      this.productsCache$ = this.getAll().pipe(shareReplay(1));
    }
    return this.productsCache$;
  }

  public delete() {}

  public update() {}
}
