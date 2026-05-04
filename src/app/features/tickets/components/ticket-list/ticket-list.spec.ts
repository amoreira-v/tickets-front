import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketList } from './ticket-list';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { RouterModule } from '@angular/router';

describe('TicketList', () => {
  let component: TicketList;
  let fixture: ComponentFixture<TicketList>;
  let ticketServiceMock: any;
  let authServiceMock: any;
  let dialogMock: any;
  let toastServiceMock: any;

  const mockTickets = [
    { id: 'TK-1', title: 'Test 1', status: 'OPEN', priority: 'HIGH', user_id: '1', created_at: '', updated_at: '', description: '', assigned_to: null }
  ];

  beforeEach(async () => {
    ticketServiceMock = {
      getTickets: vi.fn().mockReturnValue(of({ data: mockTickets }))
    };
    authServiceMock = {
      role: signal('CLIENT'),
      logout: vi.fn()
    };
    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of(true))
      })
    };
    toastServiceMock = {
      error: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TicketList, NoopAnimationsModule, RouterModule.forRoot([])],
      providers: [
        { provide: TicketService, useValue: ticketServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    })
    .overrideComponent(TicketList, {
      add: { providers: [{ provide: MatDialog, useValue: dialogMock }] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tickets on init', () => {
    expect(ticketServiceMock.getTickets).toHaveBeenCalled();
    expect(component.dataSource.data.length).toBe(1);
    expect(component.isLoading()).toBe(false);
  });

  it('should load all tickets if user is SUPPORT', () => {
    authServiceMock.role.set('SUPPORT');
    component.loadTickets();
    expect(ticketServiceMock.getTickets).toHaveBeenCalledWith('all');
  });

  it('should apply filter to dataSource', () => {
    const event = { target: { value: 'test' } } as any;
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('test');
  });

  it('should filter by status', () => {
    component.filterByStatus('OPEN');
    expect(component.dataSource.filter).toBe('open');
  });

  it('should open create dialog and reload on success', () => {
    component.openCreateDialog();
    expect(dialogMock.open).toHaveBeenCalled();
    expect(ticketServiceMock.getTickets).toHaveBeenCalledTimes(2);
  });

  it('should open detail dialog and reload on success', () => {
    component.openDetailDialog(mockTickets[0] as any);
    expect(dialogMock.open).toHaveBeenCalled();
    expect(ticketServiceMock.getTickets).toHaveBeenCalledTimes(2);
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel('OPEN')).toBe('Abierto');
    expect(component.getStatusLabel('IN_PROGRESS')).toBe('Atendiendo');
    expect(component.getStatusLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('should return correct role label', () => {
    authServiceMock.role.set('CLIENT');
    expect(component.getRoleLabel()).toBe('CLIENTE');
    authServiceMock.role.set('SUPPORT');
    expect(component.getRoleLabel()).toBe('SOPORTE');
    authServiceMock.role.set('ADMIN');
    expect(component.getRoleLabel()).toBe('ADMIN');
  });

  it('should handle error when loading tickets', () => {
    ticketServiceMock.getTickets.mockReturnValue(throwError(() => new Error()));
    component.loadTickets();
    expect(toastServiceMock.error).toHaveBeenCalledWith('No fue posible cargar la lista de tickets');
  });

  it('should logout', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });
});
