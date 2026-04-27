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
    <aside class="w-20 md:w-64 h-screen bg-slate-900 border-r border-white/5 flex flex-col transition-all duration-500 overflow-hidden relative group">
      <!-- Glow Effect -->
      <div class="absolute top-0 left-0 w-full h-32 bg-brand-primary/10 blur-[80px] -z-10"></div>
      
      <!-- Brand Logo -->
      <div class="p-6 mb-8 flex items-center gap-4">
        <div class="w-10 h-10 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          <mat-icon class="text-white">confirmation_number</mat-icon>
        </div>
        <span class="text-xl font-display font-black text-white tracking-tight hidden md:block">
          Alpha<span class="text-brand-primary">Tickets</span>
        </span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 space-y-2">
        @for (item of authService.userFunctions(); track item.path) {
          <a [routerLink]="item.path"
             routerLinkActive="bg-brand-primary/10 text-brand-primary shadow-[inset_4px_0_0_0_#6366f1]"
             class="flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group/item">
            <mat-icon class="group-hover/item:scale-110 transition-transform">{{item.icon}}</mat-icon>
            <span class="font-bold text-sm tracking-tight hidden md:block">{{item.name}}</span>
          </a>
        }
      </nav>

      <!-- User Profile -->
      <div class="p-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div class="flex items-center gap-3 p-2">
          <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-brand-secondary font-black">
            {{ (authService.currentUser()?.name || 'U').substring(0,1) }}
          </div>
          <div class="hidden md:block overflow-hidden">
            <p class="text-xs font-black text-white truncate">{{ authService.currentUser()?.name || 'Usuario' }}</p>
            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ authService.role() }}</p>
          </div>
        </div>
        
        <button mat-button 
                (click)="logout()" 
                class="w-full !mt-4 !text-slate-500 hover:!text-rose-400 !justify-start !px-3">
          <mat-icon class="mr-3">logout</mat-icon>
          <span class="hidden md:block font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `
})
export class Sidebar {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
