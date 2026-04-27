import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthStore, UserRole, UserFunction } from '../store/auth.store';

// Estructura esperada de la API
interface ApiResponse<T> {
  status: string;
  data: T;
}

interface AuthData {
  token: string;
  user?: { 
    name: string; 
    email: string; 
    role: UserRole 
  };
  role?: UserRole; // Fallback
  functions?: UserFunction[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly apiUrl = environment.apiUrl;

  // Delegar señales al Store
  public readonly isAuthenticated = this.authStore.isAuthenticated;
  public readonly currentUser = this.authStore.currentUser;
  public readonly userFunctions = this.authStore.userFunctions;
  public readonly role = this.authStore.userRole;

  public get token(): string | null {
    return this.authStore.token();
  }

  constructor() {}

  /**
   * Método para iniciar sesión en la API real
   */
  login(credentials: any): Observable<any> {
    return this.http.post<ApiResponse<AuthData>>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map(res => {
        const token = res.data.token;
        const user = res.data.user || { 
          name: 'Usuario', 
          email: credentials.email || '', 
          role: res.data.role || 'CLIENT' 
        };
        const functions = res.data.functions || [];
        
        return { token, user, functions };
      }),
      tap(result => this.authStore.setUser(result.token, result.user, result.functions))
    );
  }

  /**
   * Método para registrar en la API real
   */
  register(data: any): Observable<any> {
    return this.http.post<ApiResponse<AuthData>>(`${this.apiUrl}/auth/register`, data).pipe(
      map(res => {
        const token = res.data.token;
        const user = res.data.user || { 
          name: data.name || 'Nuevo Usuario', 
          email: data.email || '', 
          role: res.data.role || 'CLIENT' 
        };
        const functions = res.data.functions || [];
        
        return { token, user, functions };
      }),
      tap(result => this.authStore.setUser(result.token, result.user, result.functions))
    );
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    this.authStore.clearUser();
    this.router.navigate(['/login']);
  }
}

