import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProductsService } from '../../../../shared/services/products/products-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { BadgeModule } from 'primeng/badge';
import { CartStateService } from '../../../../shared/services/cart/cart-state.service';
import { TranslationService } from '../../../../shared/translate/translation.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-product-detail-modal',
  imports: [
    CommonModule,
    NgOptimizedImage,
    DialogModule,
    ButtonModule,
    TranslatePipe,
    BadgeModule,
  ],
  templateUrl: './product-detail-modal.html',
  styleUrl: './product-detail-modal.scss',
})
export class ProductDetailModal implements OnInit {
  private productsService = inject(ProductsService);
  private cartStateService = inject(CartStateService);
  private translatePipe = inject(TranslationService);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  public config = inject(DynamicDialogConfig);
  public ref = inject(DynamicDialogRef);

  public product: IProduct | null = null;
  public loading = false;

  ngOnInit(): void {
    const productId = this.config.data?.productId;
    if (productId) {
      this.loadProduct(productId);
    }
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productsService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar produto:', error);
          this.loading = false;
        },
      });
  }

  addItem(product: IProduct): void {
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

          this.ref.close();
        },
      });
  }
}
