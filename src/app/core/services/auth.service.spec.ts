import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthStore } from '../store/auth.store';
import { environment } from '../../../environments/environment';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let authStore: AuthStore;
  let router: Router;
  const apiUrl = environment.apiUrl;

  const mockRouter = {
    navigate: vi.fn()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        AuthStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter }
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    authStore = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);

    // Limpiar estado para asegurar aislamiento
    authStore.clearUser();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and update store', () => {
      const credentials = { email: 'test@test.com', password: 'password' };
      const mockApiResponse = {
        status: 'success',
        data: {
          token: 'fake-jwt-token',
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@test.com',
            profile: 'ADMIN',
            funciones: []
          }
        }
      };

      // Mock the menu options call that happens in switchMap (resolveUserFunctions -> fetchProfileOptions)
      const mockMenuResponse = {
        status: 'success',
        data: [{ path: '/dashboard', option_name: 'Dashboard' }]
      };

      service.login(credentials).subscribe(session => {
        expect(session.token).toBe('fake-jwt-token');
        expect(session.user.name).toBe('Test User');
        expect(authStore.token()).toBe('fake-jwt-token');
        expect(authStore.isAuthenticated()).toBe(true);
      });

      const loginReq = httpMock.expectOne(`${apiUrl}/auth/login`);
      expect(loginReq.request.method).toBe('POST');
      loginReq.flush(mockApiResponse);

      // Second call for profile options
      const menuReq = httpMock.expectOne(req => req.url.includes('/admin/profile-options'));
      expect(menuReq.request.params.get('profile')).toBe('ADMIN');
      menuReq.flush(mockMenuResponse);
    });

    it('should handle login error', () => {
      const credentials = { email: 'wrong@test.com', password: 'wrong' };

      service.login(credentials).subscribe({
        error: (err) => {
          expect(err).toBeTruthy();
          expect(authStore.isAuthenticated()).toBe(false);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/login`);
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear store and navigate to login', () => {
      // Setup initial state
      authStore.setUser('token', { name: 'User', email: 'a@a.com', role: 'ADMIN' }, []);
      
      service.logout();

      expect(authStore.token()).toBeNull();
      expect(authStore.isAuthenticated()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('register', () => {
    it('should register successfully and update store', () => {
      const registerData = { name: 'New User', email: 'new@test.com', password: 'password' };
      const mockApiResponse = {
        status: 'success',
        data: {
          token: 'new-token',
          user: {
            id: '2',
            name: 'New User',
            email: 'new@test.com',
            profile: 'CLIENT',
            funciones: []
          }
        }
      };

      service.register(registerData).subscribe(session => {
        expect(session.token).toBe('new-token');
        expect(authStore.token()).toBe('new-token');
      });

      const req = httpMock.expectOne(`${apiUrl}/auth/register`);
      req.flush(mockApiResponse);

      // Fallback functions because funciones is empty and profile-options call will be made
      const menuReq = httpMock.expectOne(req => req.url.includes('/admin/profile-options'));
      menuReq.flush({ status: 'success', data: [] });
    });
  });

  describe('ensureMenuOptionsLoaded', () => {
    it('should not fetch if already loaded', () => {
      // Set state as if user is logged in and has functions
      authStore.setUser('token', { name: 'User', email: 'a@a.com', role: 'CLIENT' }, [{ path: '/test', name: 'Test', icon: 'test' }]);
      
      service.ensureMenuOptionsLoaded().subscribe(functions => {
        expect(functions.length).toBe(1);
        expect(functions[0].path).toBe('/test');
      });

      httpMock.expectNone(req => req.url.includes('/admin/profile-options'));
    });

    it('should fetch if not loaded', () => {
      authStore.setUser('token', { name: 'User', email: 'a@a.com', role: 'CLIENT' }, []);
      
      service.ensureMenuOptionsLoaded().subscribe(functions => {
        expect(functions.length).toBe(1);
        expect(functions[0].path).toBe('/tickets'); // Fallback for CLIENT
      });

      const req = httpMock.expectOne(req => req.url.includes('/admin/profile-options'));
      req.flush({ status: 'success', data: [] }); // Empty data triggers fallback
    });

    it('should fallback to default functions if API fails', () => {
      authStore.setUser('token', { name: 'Admin', email: 'admin@test.com', role: 'ADMIN' }, []);
      
      let functionsResult: any[] | undefined;
      service.ensureMenuOptionsLoaded().subscribe(functions => {
        functionsResult = functions;
      });

      const req = httpMock.expectOne(req => req.url.includes('/admin/profile-options'));
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(functionsResult).toBeDefined();
      expect(functionsResult!.length).toBeGreaterThan(0);
      // We check that at least one of the fallback paths is present
      const paths = functionsResult!.map(f => f.path);
      expect(paths).toContain('/admin/perfiles');
    });

    it('should return SUPPORT functions for support role', () => {
      authStore.setUser('token', { name: 'Support', email: 's@s.com', role: 'SUPPORT' }, []);
      
      let functionsResult: any[] = [];
      service.ensureMenuOptionsLoaded().subscribe(functions => {
        functionsResult = functions;
      });

      const req = httpMock.expectOne(req => req.url.includes('/admin/profile-options'));
      req.flush({ status: 'success', data: [] });

      expect(functionsResult.some(f => f.path === '/tickets')).toBe(true);
      expect(functionsResult[0].icon).toBe('support_agent');
    });

    it('should return empty if no user/token', () => {
      authStore.clearUser();
      service.ensureMenuOptionsLoaded().subscribe(functions => {
        expect(functions).toEqual([]);
      });
    });
  });
});
