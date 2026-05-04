import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule, 
    RouterModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard {
  public readonly authService = inject(AuthService);
  public readonly router = inject(Router);

  public readonly navLinks = [
    { path: 'perfiles', label: 'Perfiles', icon: 'people' },
    { path: 'modulos', label: 'Módulos', icon: 'view_module' },
    { path: 'opciones', label: 'Opciones', icon: 'list' },
    { path: 'asignaciones', label: 'Asignaciones', icon: 'vpn_key' }
  ];

  roleLabel(): string {
    const role = this.authService.role();
    if (role === 'SUPPORT') {
      return 'SOPORTE';
    }
    if (role === 'CLIENT') {
      return 'CLIENTE';
    }
    return 'ADMIN';
  }

  logout(): void {
    this.authService.logout();
  }
}
