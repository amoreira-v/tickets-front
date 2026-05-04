import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileList } from './profile-list';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ProfileList', () => {
  let component: ProfileList;
  let fixture: ComponentFixture<ProfileList>;
  let adminServiceMock: any;
  let toastServiceMock: any;
  let dialogMock: any;

  const mockProfiles = [
    { id: '1', name: 'Admin', description: 'Administrator', status: 'ACTIVE' }
  ];

  beforeEach(async () => {
    adminServiceMock = {
      getProfiles: vi.fn().mockReturnValue(of({ data: mockProfiles })),
      deleteProfile: vi.fn()
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
      imports: [ProfileList, NoopAnimationsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    })
    .overrideComponent(ProfileList, {
      add: { providers: [{ provide: MatDialog, useValue: dialogMock }] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profiles on init', () => {
    expect(adminServiceMock.getProfiles).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('should open dialog to create profile', () => {
    component.createProfile();
    expect(dialogMock.open).toHaveBeenCalled();
    expect(adminServiceMock.getProfiles).toHaveBeenCalledTimes(2);
  });

  it('should open dialog to edit profile', () => {
    component.editProfile(mockProfiles[0] as any);
    expect(dialogMock.open).toHaveBeenCalled();
    expect(adminServiceMock.getProfiles).toHaveBeenCalledTimes(2);
  });

  it('should delete profile after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    adminServiceMock.deleteProfile.mockReturnValue(of({}));

    component.deleteProfile(mockProfiles[0] as any);

    expect(adminServiceMock.deleteProfile).toHaveBeenCalledWith('1');
    expect(toastServiceMock.success).toHaveBeenCalledWith('Perfil eliminado');
  });

  it('should handle error when loading profiles', () => {
    adminServiceMock.getProfiles.mockReturnValue(throwError(() => new Error()));
    component.loadProfiles();
    expect(toastServiceMock.error).toHaveBeenCalledWith('No fue posible cargar perfiles');
  });
});
