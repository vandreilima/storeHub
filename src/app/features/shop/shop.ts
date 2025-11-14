import { MessageService } from 'primeng/api';
import { AuthService } from './../../shared/services/auth/auth.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { RouterLink } from '@angular/router';
import { UserService } from '../../shared/services/user/user.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { ProductsService } from '../../shared/services/products/products.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { Filters } from './components/filters/filters';
import { DialogService } from 'primeng/dynamicdialog';
import { ProductDetailModal } from './components/product-detail-modal/product-detail-modal';
import { Cart } from '../../shared/components/cart/cart';
import { CartStateService } from '../../shared/services/cart/cart-state.service';
import { TranslationService } from '../../shared/translate/translation.service';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-shop',
  imports: [
    ButtonModule,
    CardModule,
    LanguageSelectorComponent,
    TranslatePipe,
    RouterLink,
    TooltipModule,
    CommonModule,
    NgOptimizedImage,
    BadgeModule,
    Filters,
    Cart,
    ToastModule,
  ],
  providers: [DialogService, MessageService],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shop implements OnInit {
  public authService = inject(AuthService);
  private userService = inject(UserService);
  private productsService = inject(ProductsService);
  private destroyRef = inject(DestroyRef);
  private dialogService = inject(DialogService);
  private cartStateService = inject(CartStateService);
  private messageService = inject(MessageService);
  private translatePipe = inject(TranslationService);

  public allProducts = signal<IProduct[]>([]);
  public produtcList = signal<IProduct[]>([]);
  public loading = signal<boolean>(false);

  public user = toSignal(
    this.userService.userInfoSignal$.pipe(
      filter((result) => !!result?.id),
      takeUntilDestroyed(this.destroyRef)
    )
  );

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.allProducts.set(products);
          this.produtcList.set(products);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Erro ao carregar produtos:', error);
          this.loading.set(false);
        },
      });
  }

  applyFilters(filter: IProductFilter) {
    const filtered = this.allProducts().filter((product) => {
      const matchesText =
        !filter.textSearch ||
        product.title.toLowerCase().includes(filter.textSearch.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(filter.textSearch.toLowerCase());

      const matchesRating =
        !filter.rating || product.rating.rate >= filter.rating;

      const matchesCategory =
        !filter.category || product.category === filter.category;

      return matchesText && matchesRating && matchesCategory;
    });
    this.produtcList.set(filtered);
  }

  openProductDetail(productId: number): void {
    this.dialogService.open(ProductDetailModal, {
      header: 'Detalhes do Produto',
      width: '90vw',
      modal: true,
      dismissableMask: true,
      closable: true,
      closeOnEscape: true,
      data: {
        productId: productId,
      },
    });
  }

  addItem(event: MouseEvent, product: IProduct): void {
    event.stopPropagation();
    this.cartStateService
      .addItem(product)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translatePipe.translate(
              'messages.cart_item_added_title'
            ),
            detail: this.translatePipe.translate(
              'messages.cart_item_added_detail',
              { productName: product.title }
            ),
            life: 3000,
          });
        },
      });
  }

  logout(): void {
    this.cartStateService.clearCart();
    this.authService.logout();
  }
}
