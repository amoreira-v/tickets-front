import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, Navbar, Sidebar, MatSidenavModule],
  template: `
    <div class="app-shell">
      <!-- Barra Superior -->
      <app-navbar class="shell-navbar"></app-navbar>

      <mat-sidenav-container class="shell-container">
        <!-- Barra Lateral Dinámica -->
        <mat-sidenav [opened]="uiService.isSidebarOpen()" mode="side" class="shell-sidebar">
          <app-sidebar></app-sidebar>
        </mat-sidenav>

        <!-- Contenido Principal -->
        <mat-sidenav-content class="shell-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>

          <!-- Footer Minimalista -->
          <footer class="minimal-footer">
            <span>AlphaTickets © 2026</span>
          </footer>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }
    .shell-navbar {
      flex-shrink: 0;
      z-index: 1000;
    }
    .shell-container {
      flex: 1;
    }
    .shell-sidebar {
      width: 280px;
      border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
      background-color: #0f172a !important;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .shell-content {
      background-color: #f8fafc;
      display: flex;
      flex-direction: column;
    }
    .content-wrapper {
      flex: 1;
      padding: 0;
    }
    .minimal-footer {
      padding: 1.5rem;
      text-align: center;
      font-size: 11px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background: white;
      border-top: 1px solid #f1f5f9;
    }
  `]
})
export class Layout {
  authService = inject(AuthService);
  uiService = inject(UiService);
}
