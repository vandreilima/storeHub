import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly API_URL = 'https://fakestoreapi.com/products';
  private http = inject(HttpClient);

  create() {}

  getById() {}

  getAll(): Observable<IProdutc[]> {
    return this.http.get<IProdutc[]>(this.API_URL);
  }

  delete() {}

  update() {}
}
