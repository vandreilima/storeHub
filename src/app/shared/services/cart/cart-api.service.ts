import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartApiService {
  private readonly API_URL = 'https://fakestoreapi.com/carts';
  private http = inject(HttpClient);

  public create(userId: number, products: ICartProduct[]): Observable<ICart> {
    return this.http.post<ICart>(this.API_URL, {
      userId,
      products,
    });
  }

  public getById(id: number): Observable<ICart> {
    return this.http.get<ICart>(`${this.API_URL}/${id}`);
  }

  public getAll(): Observable<ICart[]> {
    return this.http.get<ICart[]>(this.API_URL);
  }

  public update(id: number, cart: ICart): Observable<ICart> {
    return this.http.put<ICart>(`${this.API_URL}/${id}`, cart);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
