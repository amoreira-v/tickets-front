import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthStore, UserRole, UserFunction } from '../store/auth.store';

// Estructura esperada de la API
interface ApiResponse<T> {
  status: string;
  data: T;
}

interface AuthData {
  token: string;
  user: { 
    id: string;
    name: string; 
    email: string; 
    profile: UserRole;
    funciones: UserFunction[];
  };
}

interface ProfileOptionApiItem {
  option_name?: string;
  module_name?: string;
  path: string;
  icon?: string;
  name?: string;
}

interface ProfileOptionsResponse {
  status: string;
  data: ProfileOptionApiItem[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthSession {
  token: string;
  user: {
    name: string;
    email: string;
    role: UserRole;
  };
  functions: UserFunction[];
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
  login(credentials: LoginCredentials): Observable<AuthSession> {
    return this.http.post<ApiResponse<AuthData>>(`${this.apiUrl}/auth/login`, credentials).pipe(
      map((res): AuthSession => {
        const token = res.data.token;
        const userData = res.data.user;
        const role = this.normalizeRole(userData.profile);
        
        const user = { 
          name: userData.name, 
          email: userData.email, 
          role
        };
        const functions = userData.funciones || [];
        
        return { token, user, functions };
      }),
      switchMap((session) => this.resolveUserFunctions(session.user.role, session.functions).pipe(
        map((resolvedFunctions) => ({ ...session, functions: resolvedFunctions }))
      )),
      tap((result) => this.authStore.setUser(result.token, result.user, result.functions))
    );
  }

  /**
   * Método para registrar en la API real
   */
  register(data: RegisterPayload): Observable<AuthSession> {
    return this.http.post<ApiResponse<AuthData>>(`${this.apiUrl}/auth/register`, data).pipe(
      map((res): AuthSession => {
        const token = res.data.token;
        const userData = res.data.user;
        const role = this.normalizeRole(userData?.profile);
        
        const user = { 
          name: userData?.name || data.name, 
          email: userData?.email || data.email, 
          role
        };
        const functions = userData?.funciones || [];
        
        return { token, user, functions };
      }),
      switchMap((session) => this.resolveUserFunctions(session.user.role, session.functions).pipe(
        map((resolvedFunctions) => ({ ...session, functions: resolvedFunctions }))
      )),
      tap((result) => this.authStore.setUser(result.token, result.user, result.functions))
    );
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    this.authStore.clearUser();
    this.router.navigate(['/login']);
  }

  ensureMenuOptionsLoaded(): Observable<UserFunction[]> {
    const role = this.role();
    const current = this.userFunctions();
    const user = this.currentUser();
    const token = this.token;

    if (!role || !user || !token) {
      return of(current ?? []);
    }

    if (current && current.length > 0) {
      return of(current);
    }

    return this.resolveUserFunctions(role, []).pipe(
      tap((functions) => this.authStore.setUser(token, user, functions))
    );
  }

  private normalizeRole(role?: string): UserRole {
    const normalized = (role || 'CLIENT').toUpperCase();

    if (normalized === 'SOPORTE' || normalized === 'SUPPORT') {
      return 'SUPPORT';
    }
    if (normalized === 'CLIENTE' || normalized === 'CLIENT') {
      return 'CLIENT';
    }
    return 'ADMIN';
  }

  private resolveUserFunctions(role: UserRole, functions: UserFunction[]): Observable<UserFunction[]> {
    if (functions.length > 0) {
      return of(functions);
    }

    return this.fetchProfileOptions(role).pipe(
      map((response) => this.mapProfileOptions(response.data)),
      map((items) => items.length > 0 ? items : this.getFallbackFunctionsByRole(role)),
      catchError(() => of(this.getFallbackFunctionsByRole(role)))
    );
  }

  private fetchProfileOptions(role: UserRole): Observable<ProfileOptionsResponse> {
    const roleParam = role === 'SUPPORT' ? 'SOPORTE' : role === 'CLIENT' ? 'CLIENTE' : 'ADMIN';
    return this.http.get<ProfileOptionsResponse>(`${this.apiUrl}/admin/profile-options`, {
      params: { profile: roleParam }
    });
  }

  private mapProfileOptions(items: ProfileOptionApiItem[]): UserFunction[] {
    return items
      .filter((item) => !!item.path)
      .map((item) => {
        let path = item.path;
        if (!path.startsWith('/')) {
          path = '/' + path;
        }
        return {
          path: path,
          name: item.option_name || item.name || item.module_name || 'Opcion',
          icon: item.icon || 'chevron_right'
        };
      });
  }

  private getFallbackFunctionsByRole(role: UserRole): UserFunction[] {
    if (role === 'ADMIN') {
      return [
        { path: '/tickets', name: 'Tickets', icon: 'confirmation_number' },
        { path: '/admin/perfiles', name: 'Perfiles', icon: 'admin_panel_settings' },
        { path: '/admin/modulos', name: 'Módulos', icon: 'view_module' },
        { path: '/admin/opciones', name: 'Opciones', icon: 'settings_input_component' }
      ];
    }

    if (role === 'SUPPORT') {
      return [
        { path: '/tickets', name: 'Bandeja de Soporte', icon: 'support_agent' }
      ];
    }

    return [
      { path: '/tickets', name: 'Mis Tickets', icon: 'confirmation_number' }
    ];
  }
}

