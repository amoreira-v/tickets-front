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
    // Los administradores siempre pueden entrar a /admin
    const normalizedTarget = targetUrl.endsWith('/') && targetUrl.length > 1 ? targetUrl.slice(0, -1) : targetUrl;
    const userRole = authService.role()?.toUpperCase();
    
    const hasPermission = userFunctions.some(f => {
      const fPath = f.path.endsWith('/') && f.path.length > 1 ? f.path.slice(0, -1) : f.path;
      return fPath === normalizedTarget || normalizedTarget.startsWith(fPath + '/');
    }) || normalizedTarget === '/dashboard' || normalizedTarget === '/tickets' || normalizedTarget === '/access-denied' || (userRole === 'ADMIN' && normalizedTarget.startsWith('/admin'));

    if (hasPermission) {
      return true;
    }

    // Si no tiene permiso, redirigir a acceso denegado
    return router.createUrlTree(['/access-denied']);
  }

  // Redirigir al login si no está autenticado
  return router.createUrlTree(['/login']);
};
