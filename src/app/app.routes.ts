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
        loadComponent: () => import('./features/admin/pages/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
        children: [
          { path: '', redirectTo: 'perfiles', pathMatch: 'full' },
          { path: 'perfiles', loadComponent: () => import('./features/admin/components/profile-list/profile-list').then(m => m.ProfileList) },
          { path: 'modulos', loadComponent: () => import('./features/admin/components/module-list/module-list').then(m => m.ModuleList) },
          { path: 'opciones', loadComponent: () => import('./features/admin/components/option-list/option-list').then(m => m.OptionList) },
          { path: 'asignaciones', loadComponent: () => import('./features/admin/components/assignment-list/assignment-list').then(m => m.AssignmentList) }
        ]
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
