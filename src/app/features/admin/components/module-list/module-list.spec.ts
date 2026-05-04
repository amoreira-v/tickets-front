import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModuleList } from './module-list';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ModuleList', () => {
  let component: ModuleList;
  let fixture: ComponentFixture<ModuleList>;
  let adminServiceMock: any;
  let toastServiceMock: any;
  let dialogMock: any;

  const mockModules = [
    { id: '1', name: 'Module 1', icon: 'home', is_active: true }
  ];

  beforeEach(async () => {
    adminServiceMock = {
      getModules: vi.fn().mockReturnValue(of({ data: mockModules })),
      deleteModule: vi.fn()
    };
    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };
    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of(true))
      })
    };

    await TestBed.configureTestingModule({
      imports: [ModuleList, NoopAnimationsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    })
    .overrideComponent(ModuleList, {
      add: { providers: [{ provide: MatDialog, useValue: dialogMock }] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load modules on init', () => {
    expect(adminServiceMock.getModules).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('should open dialog to create module', () => {
    component.createModule();
    expect(dialogMock.open).toHaveBeenCalled();
    expect(adminServiceMock.getModules).toHaveBeenCalledTimes(2);
  });

  it('should open dialog to edit module', () => {
    component.editModule(mockModules[0] as any);
    expect(dialogMock.open).toHaveBeenCalled();
    expect(adminServiceMock.getModules).toHaveBeenCalledTimes(2);
  });

  it('should delete module after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    adminServiceMock.deleteModule.mockReturnValue(of({}));

    component.deleteModule(mockModules[0] as any);

    expect(adminServiceMock.deleteModule).toHaveBeenCalledWith('1');
    expect(toastServiceMock.success).toHaveBeenCalledWith('Modulo eliminado');
  });

  it('should handle error when loading modules', () => {
    adminServiceMock.getModules.mockReturnValue(throwError(() => new Error()));
    component.loadModules();
    expect(toastServiceMock.error).toHaveBeenCalledWith('No fue posible cargar modulos');
  });
});
