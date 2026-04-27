import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/tickets', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  { 
    path: 'tickets', 
    canActivate: [authGuard],
    loadComponent: () => import('./features/tickets/components/ticket-list/ticket-list').then(m => m.TicketList)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./shared/ui/access-denied/access-denied').then(m => m.AccessDenied)
  },
  { path: '**', redirectTo: '/tickets' }
];
