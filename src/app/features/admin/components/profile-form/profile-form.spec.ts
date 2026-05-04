import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileForm } from './profile-form';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ProfileForm', () => {
  let component: ProfileForm;
  let fixture: ComponentFixture<ProfileForm>;
  let adminServiceMock: any;
  let toastServiceMock: any;
  let dialogRefMock: any;

  beforeEach(async () => {
    adminServiceMock = {
      createProfile: vi.fn(),
      updateProfile: vi.fn()
    };
    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };
    dialogRefMock = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProfileForm, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isEdit).toBe(false);
  });

  it('should initialize form for creation', () => {
    expect(component.profileForm.value).toEqual({
      name: '',
      description: ''
    });
  });

  it('should be invalid when name is too short', () => {
    component.profileForm.patchValue({ name: 'ab' });
    expect(component.profileForm.get('name')?.invalid).toBe(true);
  });

  it('should call createProfile on submit for new profile', () => {
    const payload = { name: 'Admin', description: 'Administrator' };
    component.profileForm.patchValue(payload);
    adminServiceMock.createProfile.mockReturnValue(of({}));

    component.onSubmit();

    expect(adminServiceMock.createProfile).toHaveBeenCalledWith(payload);
    expect(toastServiceMock.success).toHaveBeenCalledWith('Perfil creado correctamente');
  });

  describe('Edit Mode', () => {
    const existingProfile = { id: '1', name: 'User', description: 'Common user', status: 'ACTIVE', created_at: '', updated_at: '' };

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ProfileForm, ReactiveFormsModule, NoopAnimationsModule],
        providers: [
          { provide: AdminService, useValue: adminServiceMock },
          { provide: ToastService, useValue: toastServiceMock },
          { provide: MatDialogRef, useValue: dialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: { profile: existingProfile } }
        ]
      });
      fixture = TestBed.createComponent(ProfileForm);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize form with existing data', () => {
      expect(component.isEdit).toBe(true);
      expect(component.profileForm.value).toEqual({
        name: existingProfile.name,
        description: existingProfile.description
      });
    });

    it('should call updateProfile on submit', () => {
      const payload = { name: 'NewName', description: 'NewDesc' };
      component.profileForm.patchValue(payload);
      adminServiceMock.updateProfile.mockReturnValue(of({}));

      component.onSubmit();

      expect(adminServiceMock.updateProfile).toHaveBeenCalledWith(existingProfile.id, payload);
    });
  });

  it('should handle error on submit', () => {
    component.profileForm.patchValue({ name: 'Valid', description: 'Desc' });
    adminServiceMock.createProfile.mockReturnValue(throwError(() => new Error()));

    component.onSubmit();

    expect(toastServiceMock.error).toHaveBeenCalledWith('Ocurrió un error al procesar la solicitud');
  });

  it('should close dialog on close()', () => {
    component.close();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
