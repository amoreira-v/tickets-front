import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionForm } from './option-form';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('OptionForm', () => {
  let component: OptionForm;
  let fixture: ComponentFixture<OptionForm>;
  let adminServiceMock: any;
  let toastServiceMock: any;
  let dialogRefMock: any;

  const mockModules = [{ id: '1', name: 'Module 1' }];

  beforeEach(async () => {
    adminServiceMock = {
      getModules: vi.fn().mockReturnValue(of({ data: mockModules })),
      createOption: vi.fn(),
      updateOption: vi.fn()
    };
    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };
    dialogRefMock = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [OptionForm, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OptionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isEdit).toBe(false);
  });

  it('should load modules on init', () => {
    expect(adminServiceMock.getModules).toHaveBeenCalled();
    expect(component.modules()).toEqual(mockModules as any);
  });

  it('should initialize form for creation', () => {
    expect(component.optionForm.value).toEqual({
      name: '',
      path: '',
      module_id: ''
    });
  });

  it('should be invalid with incorrect path pattern', () => {
    component.optionForm.patchValue({ path: 'not-a-path' });
    expect(component.optionForm.get('path')?.invalid).toBe(true);
    
    component.optionForm.patchValue({ path: '/valid-path' });
    expect(component.optionForm.get('path')?.valid).toBe(true);
  });

  it('should call createOption on submit', () => {
    const payload = { name: 'New Option', path: '/new', module_id: '1' };
    component.optionForm.patchValue(payload);
    adminServiceMock.createOption.mockReturnValue(of({}));

    component.onSubmit();

    expect(adminServiceMock.createOption).toHaveBeenCalledWith(payload);
    expect(toastServiceMock.success).toHaveBeenCalledWith('Opción creada correctamente');
  });

  describe('Edit Mode', () => {
    const existingOption = { id: '10', name: 'Existing', path: '/old', module_id: '1' };

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [OptionForm, ReactiveFormsModule, NoopAnimationsModule],
        providers: [
          { provide: AdminService, useValue: adminServiceMock },
          { provide: ToastService, useValue: toastServiceMock },
          { provide: MatDialogRef, useValue: dialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: { option: existingOption } }
        ]
      });
      fixture = TestBed.createComponent(OptionForm);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize form with existing data', () => {
      expect(component.isEdit).toBe(true);
      expect(component.optionForm.value).toEqual({
        name: existingOption.name,
        path: existingOption.path,
        module_id: '1'
      });
    });

    it('should call updateOption on submit', () => {
      const payload = { name: 'Updated', path: '/old', module_id: '1' };
      component.optionForm.patchValue(payload);
      adminServiceMock.updateOption.mockReturnValue(of({}));

      component.onSubmit();

      expect(adminServiceMock.updateOption).toHaveBeenCalledWith(existingOption.id, payload);
    });
  });

  it('should handle error when loading modules', () => {
    adminServiceMock.getModules.mockReturnValue(throwError(() => new Error()));
    component.loadModules();
    expect(toastServiceMock.error).toHaveBeenCalledWith('Error al cargar módulos para la lista');
  });

  it('should handle error on submit', () => {
    component.optionForm.patchValue({ name: 'Valid', path: '/valid', module_id: '1' });
    adminServiceMock.createOption.mockReturnValue(throwError(() => new Error()));

    component.onSubmit();

    expect(toastServiceMock.error).toHaveBeenCalledWith('Ocurrió un error al procesar la solicitud');
  });
});
