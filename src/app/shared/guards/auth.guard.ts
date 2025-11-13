import { inject } from '@angular/core';
import { Router, CanActivateFn, CanActivateChildFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/sigin-in']);
};

export const authChildGuard: CanActivateChildFn = (route, state) => {
  return authGuard(route, state);
};

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/sigin-in']);
  }

  // if (authService.isAdmin()) {
  //   return true;
  // }

  console.warn('Acesso negado: requer permissão de administrador');
  return router.createUrlTree(['/']);
};

/**
 * Guard para proteger rotas que requerem role de Admin ou Manager
 */
export const managerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/sigin-in']);
  }

  // if (authService.hasAdminOrManagerRole()) {
  //   return true;
  // }

  // Usuário não tem permissão de gerenciamento
  console.warn('Acesso negado: requer permissão de gerenciamento');
  return router.createUrlTree(['/']);
};

/**
 * Guard para redirecionar usuários autenticados da área de auth
 * Útil para páginas de login/registro
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Usuário já está autenticado, redireciona para o painel
  return router.createUrlTree(['/']);
};
