import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const userFunctions = authService.userFunctions();
    const targetUrl = state.url.split('?')[0]; // Ignorar query params

    // Permitir acceso si la ruta está en las funciones permitidas
    // Siempre permitir /dashboard o /tickets como base si están logueados
    const hasPermission = userFunctions.some(f => f.path === targetUrl) || targetUrl === '/dashboard' || targetUrl === '/tickets';

    if (hasPermission) {
      return true;
    }

    // Si no tiene permiso, redirigir a acceso denegado
    return router.createUrlTree(['/access-denied']);
  }

  // Redirigir al login si no está autenticado
  return router.createUrlTree(['/login']);
};
