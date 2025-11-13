import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { RatingModule } from 'primeng/rating';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { debounceTime, map, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-filters',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MultiSelectModule,
    RatingModule,
    TranslatePipe,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './filters.html',
  styleUrl: './filters.scss',
})
export class Filters implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    textSearch: [''],
    rating: [''],
    category: [''],
  });

  @Output() filterChange = this.form?.valueChanges.pipe(
    debounceTime(400),
    map(() => this.form.getRawValue()),
    tap((filter) => this.updateQueryParams(filter)),
    takeUntilDestroyed(this.destroyRef)
  );

  ngOnInit(): void {
    this.loadFiltersFromUrl();
  }

  private loadFiltersFromUrl(): void {
    const params = this.activatedRoute.snapshot.queryParams;

    if (params['search'] || params['rating'] || params['category']) {
      this.form.patchValue({
        textSearch: params['search'] || '',
        rating: params['rating'] ? Number(params['rating']) : '',
        category: params['category'] || '',
      });
    }
  }

  private updateQueryParams(filter: Partial<IProdutcFilter>): void {
    const queryParams: any = {};

    if (filter.textSearch) queryParams.search = filter.textSearch;
    if (filter.rating) queryParams.rating = filter.rating;
    if (filter.category) queryParams.category = filter.category;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : {},
      replaceUrl: true,
    });
  }

  clearFilters() {
    this.form.reset({
      textSearch: '',
      rating: '',
      category: '',
    });
  }
}
