import { ProductsService } from '../../services/products/products-api.service';
import { UserService } from './../../services/user/user.service';
import { CartStateService } from '../../services/cart/cart-state.service';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { filter, switchMap } from 'rxjs';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [DrawerModule, ButtonModule, CurrencyPipe, OverlayBadgeModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart implements OnInit {
  private cartStateService = inject(CartStateService);
  private userService = inject(UserService);
  private productsService = inject(ProductsService);

  visible: boolean = false;

  cartItems = computed(() => this.cartStateService.cartItems());

  total = computed(() => {
    return this.cartItems().reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  });

  amount = computed(() => {
    return this.cartItems().length;
  });

  ngOnInit(): void {
    this.userService.userInfo
      .pipe(
        filter((user) => !!user?.id),
        switchMap((user) => {
          const { id } = user as IUser;
          return this.cartStateService.loadCartById(id);
        }),
        switchMap((cart: ICart) => {
          const productIds = cart.products.map((item) => item.productId);

          return this.productsService.getByIds(productIds).pipe(
            switchMap((products) => {
              const cartItems: ICartItem[] = products.map((product) => {
                const cartProduct = cart.products.find(
                  (item) => item.productId === product.id
                );
                return {
                  product,
                  quantity: cartProduct?.quantity || 1,
                };
              });
              return [cartItems];
            })
          );
        })
      )
      .subscribe((cartItems) => {
        const tempCart = this.cartStateService.cartItems();
        let updatedCart = [...cartItems];

        if (tempCart.length) {
          tempCart.forEach((item) => {
            if (
              !updatedCart.some((_item) => _item.product.id === item.product.id)
            ) {
              updatedCart.push(item);
            }
          });
        }

        this.cartStateService.setCartItems(updatedCart);
      });
  }

  showDrawer() {
    this.visible = true;
  }

  incrementQuantity(item: ICartItem) {
    this.cartStateService.incrementQuantity(item.product).subscribe();
  }

  decrementQuantity(item: ICartItem) {
    this.cartStateService.decrementQuantity(item.product).subscribe();
  }

  removeItem(item: ICartItem) {
    this.cartStateService.removeItem(item.product.id).subscribe();
  }
}
