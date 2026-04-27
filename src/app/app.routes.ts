import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  // Rutas Públicas
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },

  // Rutas Protegidas (Bajo el Layout/Shell)
  { 
    path: '', 
    canActivate: [authGuard],
    loadComponent: () => import('./shared/ui/layout/layout').then(m => m.Layout),
    children: [
      { path: '', redirectTo: 'tickets', pathMatch: 'full' },
      { 
        path: 'tickets', 
        loadComponent: () => import('./features/tickets/components/ticket-list/ticket-list').then(m => m.TicketList)
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'access-denied',
        loadComponent: () => import('./shared/ui/access-denied/access-denied').then(m => m.AccessDenied)
      }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '/tickets' }
];
