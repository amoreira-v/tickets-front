import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionList } from './option-list';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('OptionList', () => {
  let component: OptionList;
  let fixture: ComponentFixture<OptionList>;
  let adminServiceMock: any;
  let toastServiceMock: any;
  let dialogMock: any;

  const mockOptions = [
    { id: '1', name: 'Option 1', path: '/opt1', module_id: 1 }
  ];

  beforeEach(async () => {
    adminServiceMock = {
      getOptions: vi.fn().mockReturnValue(of({ data: mockOptions })),
      deleteOption: vi.fn()
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
      imports: [OptionList, NoopAnimationsModule],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialog, useValue: dialogMock }
      ]
    })
    .overrideComponent(OptionList, {
      add: { providers: [{ provide: MatDialog, useValue: dialogMock }] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load options on init', () => {
    expect(adminServiceMock.getOptions).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('should open dialog to create option', () => {
    component.createOption();
    expect(dialogMock.open).toHaveBeenCalled();
    expect(adminServiceMock.getOptions).toHaveBeenCalledTimes(2);
  });

  it('should open dialog to edit option', () => {
    component.editOption(mockOptions[0] as any);
    expect(dialogMock.open).toHaveBeenCalled();
    expect(adminServiceMock.getOptions).toHaveBeenCalledTimes(2);
  });

  it('should delete option after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    adminServiceMock.deleteOption.mockReturnValue(of({}));

    component.deleteOption(mockOptions[0] as any);

    expect(adminServiceMock.deleteOption).toHaveBeenCalledWith('1');
    expect(toastServiceMock.success).toHaveBeenCalledWith('Opcion eliminada');
  });

  it('should handle error when loading options', () => {
    adminServiceMock.getOptions.mockReturnValue(throwError(() => new Error()));
    component.loadOptions();
    expect(toastServiceMock.error).toHaveBeenCalledWith('No fue posible cargar opciones');
  });
});
