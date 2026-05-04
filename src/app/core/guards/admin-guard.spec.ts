import { TestBed } from '@angular/core/testing';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { adminGuard } from './admin-guard';
import { AuthService } from '../services/auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

describe('adminGuard', () => {
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated: vi.fn(),
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

  const runGuard = () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/admin' } as RouterStateSnapshot;
    return TestBed.runInInjectionContext(() => adminGuard(route, state));
  };

  it('should allow access if user is authenticated and is ADMIN', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.role.set('ADMIN');

    const result = runGuard();

    expect(result).toBe(true);
  });

  it('should redirect to /tickets if user is authenticated but not ADMIN', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.role.set('SUPPORT');

    const result = runGuard();

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/tickets']);
    expect(result).toEqual(['/tickets']);
  });

  it('should redirect to /tickets if user is not authenticated', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);

    const result = runGuard();

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/tickets']);
    expect(result).toEqual(['/tickets']);
  });
});
