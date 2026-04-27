import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ProfileList } from '../../components/profile-list/profile-list';
import { ModuleList } from '../../components/module-list/module-list';
import { OptionList } from '../../components/option-list/option-list';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatTabsModule, 
    MatIconModule, 
    MatButtonModule, 
    RouterModule,
    ProfileList, 
    ModuleList, 
    OptionList
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard {
  public readonly authService = inject(AuthService);

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
