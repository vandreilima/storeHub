import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'shop',
    pathMatch: 'full',
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/shop/shop').then((x) => x.Shop),
  },
  {
    path: 'product-managemnt',
    loadComponent: () =>
      import('./features/products/products').then((x) => x.Products),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./privacy-policy/privacy-policy').then((x) => x.PrivacyPolicy),
  },
  {
    path: 'sigin-up',
    loadComponent: () =>
      import('./auth/sigin-up/sigin-up').then((x) => x.SignUp),
    canActivate: [guestGuard],
  },
  {
    path: 'sigin-in',
    loadComponent: () =>
      import('./auth/sigin-in/sigin-in').then((x) => x.SiginIn),
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password').then(
        (x) => x.ForgotPassword
      ),
    canActivate: [guestGuard],
  },
];
