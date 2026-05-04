import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignmentForm } from './assignment-form';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AssignmentForm', () => {
  let component: AssignmentForm;
  let fixture: ComponentFixture<AssignmentForm>;
  let adminServiceMock: any;
  let toastServiceMock: any;
  let dialogRefMock: any;

  const mockData = {
    profiles: [{ id: '1', name: 'Admin', status: 'ACTIVE' }],
    options: [{ id: '1', name: 'Dashboard', path: '/dashboard', status: 'ACTIVE' }]
  };

  beforeEach(async () => {
    adminServiceMock = {
      createProfileOption: vi.fn()
    };
    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };
    dialogRefMock = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AssignmentForm, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.assignmentForm.value).toEqual({
      profile_id: '',
      option_id: ''
    });
  });

  it('should be invalid when empty', () => {
    expect(component.assignmentForm.invalid).toBe(true);
  });

  it('should be valid when fields are filled', () => {
    component.assignmentForm.patchValue({
      profile_id: '1',
      option_id: '1'
    });
    expect(component.assignmentForm.valid).toBe(true);
  });

  it('should call adminService.createProfileOption on submit', () => {
    const payload = { profile_id: '1', option_id: '1' };
    component.assignmentForm.patchValue(payload);
    adminServiceMock.createProfileOption.mockReturnValue(of({}));

    component.onSubmit();

    expect(adminServiceMock.createProfileOption).toHaveBeenCalledWith(payload);
    expect(toastServiceMock.success).toHaveBeenCalledWith('Asignación creada correctamente');
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    expect(component.isSubmitting).toBe(false);
  });

  it('should handle error on submit', () => {
    component.assignmentForm.patchValue({ profile_id: '1', option_id: '1' });
    adminServiceMock.createProfileOption.mockReturnValue(throwError(() => new Error('Error')));

    component.onSubmit();

    expect(toastServiceMock.error).toHaveBeenCalledWith('Ocurrió un error al procesar la asignación');
    expect(component.isSubmitting).toBe(false);
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(adminServiceMock.createProfileOption).not.toHaveBeenCalled();
  });

  it('should close dialog when cancel is clicked', () => {
    component.close();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
