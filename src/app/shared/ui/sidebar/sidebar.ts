import { Component, OnInit, inject, signal } from '@angular/core';
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
        @if (isHydratingMenu()) {
          <div class="empty-nav-state">Cargando opciones del perfil...</div>
        } @else if (authService.userFunctions().length === 0) {
          <div class="empty-nav-state">Sin opciones asignadas para este perfil.</div>
        } @else {
          @for (item of authService.userFunctions(); track item.path) {
            <a [routerLink]="item.path"
               routerLinkActive="active-item"
               class="nav-link-item">
              <mat-icon>{{item.icon}}</mat-icon>
              <span class="font-bold">{{item.name}}</span>
            </a>
          }
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
    .empty-nav-state {
      padding: 0.85rem 1rem;
      border-radius: 0.85rem;
      background: rgba(148, 163, 184, 0.12);
      color: #cbd5e1;
      font-size: 0.82rem;
      font-weight: 600;
    }
  `]
})
export class Sidebar implements OnInit {
  authService = inject(AuthService);
  readonly isHydratingMenu = signal(false);

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.isHydratingMenu.set(true);
    this.authService.ensureMenuOptionsLoaded().subscribe({
      next: () => this.isHydratingMenu.set(false),
      error: () => this.isHydratingMenu.set(false)
    });
  }

  logout() {
    this.authService.logout();
  }
}
