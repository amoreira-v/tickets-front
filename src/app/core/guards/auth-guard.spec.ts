import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

describe('authGuard', () => {
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated: vi.fn(),
      userFunctions: signal([]),
      role: signal('CLIENT')
    };
    routerMock = {
      createUrlTree: vi.fn().mockImplementation((path) => path)
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  const runGuard = (url: string = '/dashboard') => {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => authGuard(route, state));
  };

  it('should redirect to login if not authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    
    const result = runGuard();
    
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual(['/login']);
  });

  it('should allow access to dashboard if authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.userFunctions.set([]);

    const result = runGuard('/dashboard');

    expect(result).toBe(true);
  });

  it('should allow access if path is in user functions', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.userFunctions.set([{ path: '/reports', name: 'Reports', icon: '' }]);

    const result = runGuard('/reports');

    expect(result).toBe(true);
  });

  it('should redirect to access-denied if no permission', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.userFunctions.set([{ path: '/reports', name: 'Reports', icon: '' }]);

    const result = runGuard('/admin-only');

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/access-denied']);
    expect(result).toEqual(['/access-denied']);
  });

  it('should allow access to /access-denied itself', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    const result = runGuard('/access-denied');
    expect(result).toBe(true);
  });
});
