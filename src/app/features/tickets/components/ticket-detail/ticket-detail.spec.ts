import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketDetail } from './ticket-detail';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

describe('TicketDetail', () => {
  let component: TicketDetail;
  let fixture: ComponentFixture<TicketDetail>;
  let ticketServiceMock: any;
  let authServiceMock: any;
  let toastServiceMock: any;
  let dialogRefMock: any;

  const mockTicket = {
    id: 'TK-123456789',
    title: 'Test Ticket',
    description: 'A very long description for testing purposes.',
    status: 'OPEN',
    priority: 'HIGH',
    user_id: 'U1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assigned_to: null
  };

  beforeEach(async () => {
    ticketServiceMock = {
      updateTicketStatus: vi.fn()
    };
    authServiceMock = {
      role: signal('SUPPORT')
    };
    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };
    dialogRefMock = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TicketDetail, NoopAnimationsModule],
      providers: [
        { provide: TicketService, useValue: ticketServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { ticket: mockTicket } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format ticket ID correctly', () => {
    expect(component.formatTicketId(mockTicket.id)).toBe('TK-12345');
  });

  it('should return correct status label and class', () => {
    expect(component.getStatusLabel('OPEN')).toBe('Abierto');
    expect(component.getStatusClass('OPEN')).toBe('status-open');
    expect(component.getStatusClass('IN_PROGRESS')).toBe('status-progress');
  });

  it('should call updateStatus and close dialog on success', () => {
    const updated = { ...mockTicket, status: 'IN_PROGRESS' };
    ticketServiceMock.updateTicketStatus.mockReturnValue(of(updated));

    component.updateStatus('IN_PROGRESS');

    expect(ticketServiceMock.updateTicketStatus).toHaveBeenCalledWith(mockTicket.id, 'IN_PROGRESS');
    expect(toastServiceMock.success).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalledWith(updated);
  });

  it('should handle error on status update', () => {
    ticketServiceMock.updateTicketStatus.mockReturnValue(throwError(() => new Error()));

    component.updateStatus('RESOLVED');

    expect(toastServiceMock.error).toHaveBeenCalledWith('Error al actualizar el estado del ticket');
    expect(component.isSubmitting).toBe(false);
  });

  it('should show action buttons only for SUPPORT/ADMIN', () => {
    authServiceMock.role.set('CLIENT');
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    // Check if buttons are present (they shouldn't be for CLIENT)
    expect(compiled.querySelector('.btn-atender')).toBeNull();
    
    authServiceMock.role.set('SUPPORT');
    fixture.detectChanges();
    expect(compiled.querySelector('.btn-atender')).toBeTruthy();
  });
});
