import { inject, Injectable, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { CartApiService } from './cart-api.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class CartStateService {
  private cartApiService = inject(CartApiService);
  private userService = inject(UserService);

  private _cartItemsSignal = signal<ICartItem[]>([]);
  private _cartSignal = signal<ICart | null>(null);

  readonly cartItems = this._cartItemsSignal.asReadonly();
  readonly cart = this._cartSignal.asReadonly();

  public loadCartById(userId: number): Observable<ICart> {
    return this.cartApiService
      .getById(userId)
      .pipe(tap((cart) => this._cartSignal.set(cart)));
  }

  public setCartItems(items: ICartItem[]): void {
    this._cartItemsSignal.set(items);
  }

  public addItem(newItem: IProduct): Observable<ICart> {
    const userId = this.userService.userId();

    if (!userId) {
      return this._addToTempCart(newItem);
    }

    const currentCart = this._cartSignal();

    if (!currentCart) {
      return this._createNewCart(userId, newItem);
    }

    return this._addToExistingCart(currentCart, newItem);
  }

  public incrementQuantity(product: IProduct): Observable<ICart> {
    const currentItems = this._cartItemsSignal();
    const existingItemIndex = currentItems.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex === -1) {
      return of({} as ICart);
    }

    this._updateLocalQuantity(existingItemIndex, 1);

    const currentCart = this._cartSignal();
    if (!currentCart) {
      return of({} as ICart);
    }

    return this._updateCartOnServer(currentCart, product.id, 1);
  }

  public decrementQuantity(product: IProduct): Observable<ICart> {
    const currentItems = this._cartItemsSignal();
    const existingItemIndex = currentItems.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex === -1) {
      return of({} as ICart);
    }

    const currentQuantity = currentItems[existingItemIndex].quantity;

    if (currentQuantity <= 1) {
      return of({} as ICart);
    }

    this._updateLocalQuantity(existingItemIndex, -1);

    const currentCart = this._cartSignal();
    if (!currentCart) {
      return of({} as ICart);
    }

    return this._updateCartOnServer(currentCart, product.id, -1);
  }

  public removeItem(productId: number): Observable<ICart> {
    const currentItems = this._cartItemsSignal();

    const updatedItems = currentItems.filter(
      (item) => item.product.id !== productId
    );
    this._cartItemsSignal.set(updatedItems);

    const currentCart = this._cartSignal();
    if (!currentCart) {
      return of({} as ICart);
    }

    const updatedCart = structuredClone(currentCart);
    updatedCart.products = updatedCart.products.filter(
      (item) => item.productId !== productId
    );

    return this.cartApiService
      .update(currentCart.id, updatedCart)
      .pipe(tap(() => this._cartSignal.set(updatedCart)));
  }

  public clearCart(): void {
    this._cartItemsSignal.set([]);
    this._cartSignal.set(null);
  }

  private _addToTempCart(newItem: IProduct): Observable<ICart> {
    const currentItems = this._cartItemsSignal();
    const existingItemIndex = currentItems.findIndex(
      (item) => item.product.id === newItem.id
    );

    if (existingItemIndex === -1) {
      this._cartItemsSignal.set([
        ...currentItems,
        { product: newItem, quantity: 1 },
      ]);
    } else {
      this._updateLocalQuantity(existingItemIndex, 1);
    }

    return of({
      id: 0,
      userId: 0,
      products: [{ productId: newItem.id, quantity: 1 }],
      date: new Date().toISOString(),
    });
  }

  private _createNewCart(userId: number, newItem: IProduct): Observable<ICart> {
    return this.cartApiService
      .create(userId, [{ productId: newItem.id, quantity: 1 }])
      .pipe(
        tap((cart) => {
          this._cartSignal.set(cart);
          this._cartItemsSignal.set([{ product: newItem, quantity: 1 }]);
        })
      );
  }

  private _addToExistingCart(
    currentCart: ICart,
    newItem: IProduct
  ): Observable<ICart> {
    const currentItems = this._cartItemsSignal();
    const existingItemIndex = currentItems.findIndex(
      (item) => item.product.id === newItem.id
    );

    const updatedCart = structuredClone(currentCart);

    if (existingItemIndex === -1) {
      updatedCart.products.push({ productId: newItem.id, quantity: 1 });

      return this.cartApiService.update(currentCart.id, updatedCart).pipe(
        tap(() => {
          this._cartItemsSignal.set([
            ...currentItems,
            { product: newItem, quantity: 1 },
          ]);
          this._cartSignal.set(updatedCart);
        })
      );
    }

    const productIndex = updatedCart.products.findIndex(
      (p) => p.productId === newItem.id
    );

    if (productIndex !== -1) {
      updatedCart.products[productIndex].quantity += 1;
    }

    return this.cartApiService.update(currentCart.id, updatedCart).pipe(
      tap(() => {
        this._updateLocalQuantity(existingItemIndex, 1);
        this._cartSignal.set(updatedCart);
      })
    );
  }

  private _updateLocalQuantity(itemIndex: number, delta: number): void {
    const currentItems = this._cartItemsSignal();
    const updatedItems = [...currentItems];

    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      quantity: updatedItems[itemIndex].quantity + delta,
    };

    this._cartItemsSignal.set(updatedItems);
  }

  private _updateCartOnServer(
    currentCart: ICart,
    productId: number,
    delta: number
  ): Observable<ICart> {
    const updatedCart = structuredClone(currentCart);
    const productIndex = updatedCart.products.findIndex(
      (item) => item.productId === productId
    );

    if (productIndex !== -1) {
      updatedCart.products[productIndex].quantity += delta;
    }

    return this.cartApiService
      .update(currentCart.id, updatedCart)
      .pipe(tap(() => this._cartSignal.set(updatedCart)));
  }
}
