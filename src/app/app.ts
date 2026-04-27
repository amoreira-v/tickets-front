import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);
  public readonly authService = inject(AuthService);
  protected readonly title = signal('tickets-front');
  protected readonly backendStatus = signal<'checking' | 'online' | 'offline'>('checking');

  ngOnInit() {
    this.checkHealth();
  }

  private checkHealth() {
    // Intentamos una petición simple al backend para verificar conectividad y CORS
    this.http.get(`${environment.apiUrl}/tickets`, { observe: 'response' }).subscribe({
      next: () => {
        console.log('✅ Backend sincronizado correctamente.');
        this.backendStatus.set('online');
      },
      error: (err: any) => {
        // 401 es aceptable si no hay token, significa que el servidor respondió
        if (err.status === 401 || err.status === 403) {
          console.log('✅ Backend alcanzado (Auth requerida).');
          this.backendStatus.set('online');
        } else {
          console.error('❌ Error de conexión con el Backend:', err);
          this.backendStatus.set('offline');
        }
      }
    });
  }
}
