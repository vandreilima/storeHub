import { AuthService } from './../../shared/services/auth/auth.service';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { Filters } from './components/filters/filters';
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
    BadgeModule,
    Filters,
  ],
  templateUrl: './shop.html',
  styleUrl: './shop.scss',
})
export class Shop implements OnInit {
  public authService = inject(AuthService);
  private userService = inject(UserService);
  private productsService = inject(ProductsService);
  private destroyRef = inject(DestroyRef);

  public allProducts: IProdutc[] = [];
  public produtcList: IProdutc[] = [];
  public loading = false;

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
    this.loading = true;
    this.productsService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (products) => {
          this.allProducts = products;
          this.produtcList = products;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar produtos:', error);
          this.loading = false;
        },
      });
  }

  applyFilters(filter: IProdutcFilter) {
    this.produtcList = this.allProducts.filter((product) => {
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
  }

  logout(): void {
    this.authService.logout();
  }
}
