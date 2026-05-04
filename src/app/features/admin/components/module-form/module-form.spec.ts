import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModuleForm } from './module-form';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ModuleForm', () => {
  let component: ModuleForm;
  let fixture: ComponentFixture<ModuleForm>;
  let adminServiceMock: any;
  let toastServiceMock: any;
  let dialogRefMock: any;

  beforeEach(async () => {
    adminServiceMock = {
      createModule: vi.fn(),
      updateModule: vi.fn()
    };
    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };
    dialogRefMock = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ModuleForm, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModuleForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isEdit).toBe(false);
  });

  it('should initialize form for creation', () => {
    expect(component.moduleForm.value).toEqual({
      name: '',
      icon: 'view_module',
      is_active: true
    });
  });

  it('should be invalid when name is too short', () => {
    component.moduleForm.patchValue({ name: 'abc' });
    expect(component.moduleForm.get('name')?.invalid).toBe(true);
  });

  it('should call createModule on submit for new module', () => {
    const payload = { name: 'Test Module', icon: 'settings', is_active: true };
    component.moduleForm.patchValue(payload);
    adminServiceMock.createModule.mockReturnValue(of({}));

    component.onSubmit();

    expect(adminServiceMock.createModule).toHaveBeenCalledWith(payload);
    expect(toastServiceMock.success).toHaveBeenCalledWith('Módulo creado correctamente');
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  describe('Edit Mode', () => {
    const existingModule = { id: '1', name: 'Existing', icon: 'home', is_active: true, created_at: '', updated_at: '' };

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ModuleForm, ReactiveFormsModule, NoopAnimationsModule],
        providers: [
          { provide: AdminService, useValue: adminServiceMock },
          { provide: ToastService, useValue: toastServiceMock },
          { provide: MatDialogRef, useValue: dialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: { module: existingModule } }
        ]
      });
      fixture = TestBed.createComponent(ModuleForm);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize form with existing data', () => {
      expect(component.isEdit).toBe(true);
      expect(component.moduleForm.value).toEqual({
        name: existingModule.name,
        icon: existingModule.icon,
        is_active: existingModule.is_active
      });
    });

    it('should call updateModule on submit', () => {
      const payload = { name: 'Updated', icon: 'home', is_active: true };
      component.moduleForm.patchValue(payload);
      adminServiceMock.updateModule.mockReturnValue(of({}));

      component.onSubmit();

      expect(adminServiceMock.updateModule).toHaveBeenCalledWith(existingModule.id, payload);
      expect(toastServiceMock.success).toHaveBeenCalledWith('Módulo actualizado correctamente');
    });
  });

  it('should handle error on submit', () => {
    component.moduleForm.patchValue({ name: 'Valid Name', icon: 'settings', is_active: true });
    adminServiceMock.createModule.mockReturnValue(throwError(() => new Error()));

    component.onSubmit();

    expect(toastServiceMock.error).toHaveBeenCalledWith('Ocurrió un error al procesar la solicitud');
  });

  it('should close dialog on close()', () => {
    component.close();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
