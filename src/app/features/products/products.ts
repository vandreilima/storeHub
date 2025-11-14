import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';
import { Filters } from '../../shared/components/products/filters/filters';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Button } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../shared/services/auth/auth.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../shared/services/user/user.service';
import { filter } from 'rxjs';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ProductsStateService } from '../../shared/services/products/products-state.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products',
  imports: [
    LanguageSelectorComponent,
    Filters,
    CommonModule,
    CardModule,
    Button,
    ToastModule,
    TranslatePipe,
    TooltipModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    RatingModule,
    ConfirmDialogModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private productsStateService = inject(ProductsStateService);

  public allProducts = this.productsStateService.products;
  public produtcList = signal<IProduct[]>([]);
  public loading = this.productsStateService.loading;
  public displayModal = signal<boolean>(false);
  public isEditMode = signal<boolean>(false);
  public selectedProduct = signal<IProduct | null>(null);

  public productForm: FormGroup = this.fb.group({
    id: [0],
    title: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    image: ['', Validators.required],
    description: ['', Validators.required],
  });

  public user = toSignal(
    this.userService.userInfo.pipe(
      filter((result) => !!result?.id),
      takeUntilDestroyed(this.destroyRef)
    )
  );

  // Variáveis computadas para os cards de estatísticas
  public totalProducts = computed(() => this.allProducts().length);

  public averageRating = computed(() => {
    const products = this.allProducts();
    if (products.length === 0) return 0;
    const sum = products.reduce((acc, product) => acc + product.rating.rate, 0);
    return Number((sum / products.length).toFixed(2));
  });

  public topSellingProduct = computed(() => {
    const products = this.allProducts();
    if (products.length === 0) return null;
    // Retorna o produto com maior count (mais vendido)
    return products.reduce((prev, current) =>
      current.rating.count > prev.rating.count ? current : prev
    );
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productsStateService.loadProducts().subscribe({
      next: () => {
        this.produtcList.set(this.allProducts());
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.message || 'Erro ao carregar produtos',
        });
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

      const matchesCategory =
        !filter.category ||
        product.category.toLowerCase().includes(filter.category.toLowerCase());

      const matchesRating =
        !filter.rating || product.rating.rate >= filter.rating;

      return matchesText && matchesRating && matchesCategory;
    });
    this.produtcList.set(filtered);
  }

  openProductModal(product?: IProduct): void {
    this.isEditMode.set(true);
    this.selectedProduct.set(product ?? null);
    this.productForm.patchValue({
      id: product?.id ?? null,
      title: product?.title ?? null,
      category: product?.category ?? null,
      price: product?.price ?? null,
      image: product?.image ?? null,
      description: product?.description ?? null,
    });
    this.displayModal.set(true);
  }

  closeModal(): void {
    this.displayModal.set(false);
    this.productForm.reset();
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      return;
    }

    const formValue = this.productForm.value;
    const productData = {
      title: formValue.title,
      category: formValue.category,
      price: formValue.price,
      image: formValue.image,
      description: formValue.description,
      rating: {
        rate: formValue.rate,
        count: formValue.count,
      },
    };

    if (this.isEditMode()) {
      // Editar produto existente
      const product: IProduct = {
        id: formValue.id,
        ...productData,
      };

      this.productsStateService.updateProduct(formValue.id, product).subscribe({
        next: (updatedProduct) => {
          if (updatedProduct) {
            this.produtcList.set(this.allProducts());
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto atualizado com sucesso!',
            });
            this.closeModal();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao atualizar produto',
          });
        },
      });
    } else {
      // Adicionar novo produto
      this.productsStateService.addProduct(productData).subscribe({
        next: (newProduct) => {
          if (newProduct) {
            this.produtcList.set(this.allProducts());
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto adicionado com sucesso!',
            });
            this.closeModal();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.message || 'Erro ao adicionar produto',
          });
        },
      });
    }
  }

  confirmDelete(product: IProduct): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o produto "${product.title}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deleteProduct(product);
      },
    });
  }

  private deleteProduct(product: IProduct): void {
    this.productsStateService.deleteProduct(product.id).subscribe({
      next: (success) => {
        if (success) {
          this.produtcList.set(this.allProducts());
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto excluído com sucesso!',
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.message || 'Erro ao excluir produto',
        });
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
