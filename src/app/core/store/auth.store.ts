import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'CLIENT' | 'SUPPORT' | 'ADMIN';

export interface UserFunction {
  path: string;
  name: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  functions: UserFunction[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  // Estado privado con Signals
  private state = signal<AuthState>(this.loadInitialState());

  // Selectores Reactivos (Signals Computadas)
  public readonly isAuthenticated = computed(() => !!this.state().token);
  public readonly currentUser = computed(() => this.state().user);
  public readonly userFunctions = computed(() => this.state().functions ?? []);
  public readonly userRole = computed(() => this.state().user?.role);
  public readonly token = computed(() => this.state().token);

  constructor() {}

  /**
   * Guarda la información del usuario y persiste en localStorage
   */
  public setUser(token: string, user: UserProfile, functions: UserFunction[]): void {
    const newState: AuthState = { token, user, functions };
    
    // Actualizar estado reactivo
    this.state.set(newState);

    // Persistencia
    localStorage.setItem('auth_state', JSON.stringify(newState));
  }

  /**
   * Limpia el estado y el almacenamiento local
   */
  public clearUser(): void {
    this.state.set({ token: null, user: null, functions: [] });
    localStorage.removeItem('auth_state');
  }

  /**
   * Carga el estado inicial desde el almacenamiento local
   */
  private loadInitialState(): AuthState {
    const stored = localStorage.getItem('auth_state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<AuthState> & { funciones?: UserFunction[] };
        return {
          token: parsed.token ?? null,
          user: parsed.user ?? null,
          functions: parsed.functions ?? parsed.funciones ?? []
        };
      } catch (e) {
        console.error('Error parsing auth state from localStorage', e);
      }
    }
    return { token: null, user: null, functions: [] };
  }
}
