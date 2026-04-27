import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="denied-container">
      <div class="content">
        <mat-icon class="lock-icon">lock_person</mat-icon>
        <h1>Acceso Denegado</h1>
        <p>No tienes los permisos necesarios para acceder a esta sección. Si crees que esto es un error, contacta con el administrador.</p>
        <button mat-flat-button color="primary" routerLink="/tickets">
          Volver a Mis Tickets
        </button>
      </div>
    </div>
  `,
  styles: [`
    .denied-container {
      height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }
    .content {
      max-width: 400px;
    }
    .lock-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #f43f5e;
      margin-bottom: 1.5rem;
    }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 2.5rem;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 1rem;
    }
    p {
      color: #64748b;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
  `]
})
export class AccessDenied {}
