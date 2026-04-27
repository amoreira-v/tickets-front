import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <aside class="sidebar-inner">
      <!-- Glow Effect -->
      <div class="absolute top-0 left-0 w-full h-32 bg-indigo-500/10 blur-[80px] -z-10"></div>
      
      <!-- Navigation -->
      <nav class="nav-container">
        <p class="nav-label">Menú Principal</p>
        @for (item of authService.userFunctions(); track item.path) {
          <a [routerLink]="item.path"
             routerLinkActive="active-item"
             class="nav-link-item">
            <mat-icon>{{item.icon}}</mat-icon>
            <span class="font-bold">{{item.name}}</span>
          </a>
        }
      </nav>
    </aside>
  `,
  styles: [`
    .sidebar-inner {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      color: #94a3b8;
    }
    .nav-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .nav-label {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #475569;
      margin-bottom: 1rem;
      padding-left: 0.75rem;
    }
    .nav-link-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.3s;
      
      &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: white;
      }
      
      &.active-item {
        background: #6366f1;
        color: white;
        box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
      }
    }
  `]
})
export class Sidebar {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
