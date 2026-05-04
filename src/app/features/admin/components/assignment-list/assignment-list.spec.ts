import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignmentList } from './assignment-list';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AssignmentList', () => {
  let component: AssignmentList;
  let fixture: ComponentFixture<AssignmentList>;
  let adminServiceMock: any;
  let toastServiceMock: any;
  let dialogMock: any;

  beforeEach(async () => {
    adminServiceMock = {
      getProfiles: vi.fn().mockReturnValue(of({ data: [{ id: '1', name: 'Admin' }] })),
      getOptions: vi.fn().mockReturnValue(of({ data: [{ id: '1', name: 'Dashboard' }] })),
      getProfileOptions: vi.fn().mockReturnValue(of({ data: [{ id: '1', profile_id: '1', option_id: '1' }] })),
      deleteProfileOption: vi.fn()
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
      imports: [AssignmentList, NoopAnimationsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    })
    .overrideComponent(AssignmentList, {
      add: { providers: [{ provide: MatDialog, useValue: dialogMock }] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    expect(adminServiceMock.getProfiles).toHaveBeenCalled();
    expect(adminServiceMock.getOptions).toHaveBeenCalled();
    expect(adminServiceMock.getProfileOptions).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('should return correct profile name', () => {
    expect(component.getProfileName('1')).toBe('Admin');
    expect(component.getProfileName('99')).toBe('Perfil 99');
  });

  it('should return correct option name', () => {
    expect(component.getOptionName('1')).toBe('Dashboard');
    expect(component.getOptionName('99')).toBe('Opción 99');
  });

  it('should open dialog and reload on success', () => {
    component.createAssignment();
    expect(dialogMock.open).toHaveBeenCalled();
    // After closed returns true, so loadData should be called again
    expect(adminServiceMock.getProfileOptions).toHaveBeenCalledTimes(2);
  });

  it('should delete assignment after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    adminServiceMock.deleteProfileOption.mockReturnValue(of({}));

    component.deleteAssignment({ id: '1', profile_id: '1', option_id: '1' });

    expect(adminServiceMock.deleteProfileOption).toHaveBeenCalledWith('1');
    expect(toastServiceMock.success).toHaveBeenCalledWith('Asignación eliminada');
  });

  it('should not delete assignment if not confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deleteAssignment({ id: '1', profile_id: '1', option_id: '1' });
    expect(adminServiceMock.deleteProfileOption).not.toHaveBeenCalled();
  });

  it('should handle error when loading data', () => {
    adminServiceMock.getProfiles.mockReturnValue(throwError(() => new Error()));
    component.loadData();
    expect(toastServiceMock.error).toHaveBeenCalledWith('Error al cargar datos de asignaciones');
    expect(component.isLoading()).toBe(false);
  });
});
