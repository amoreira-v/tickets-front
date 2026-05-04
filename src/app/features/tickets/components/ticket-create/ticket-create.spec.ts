import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketCreate } from './ticket-create';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TicketService } from '../../services/ticket.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TicketCreate', () => {
  let component: TicketCreate;
  let fixture: ComponentFixture<TicketCreate>;
  let ticketServiceMock: any;
  let toastServiceMock: any;
  let dialogRefMock: any;

  beforeEach(async () => {
    ticketServiceMock = {
      createTicket: vi.fn()
    };
    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };
    dialogRefMock = {
      close: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TicketCreate, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: TicketService, useValue: ticketServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.ticketForm.value).toEqual({
      title: '',
      priority: 'LOW',
      description: ''
    });
  });

  it('should be invalid when empty', () => {
    expect(component.ticketForm.invalid).toBe(true);
  });

  it('should validate title length', () => {
    const title = component.ticketForm.get('title');
    title?.setValue('short');
    expect(title?.hasError('minlength')).toBe(true);
    
    title?.setValue('A valid title length');
    expect(title?.valid).toBe(true);
  });

  it('should validate description length', () => {
    const desc = component.ticketForm.get('description');
    desc?.setValue('too short');
    expect(desc?.hasError('minlength')).toBe(true);
    
    desc?.setValue('This is a valid description that is long enough');
    expect(desc?.valid).toBe(true);
  });

  it('should call ticketService.createTicket on valid submit', () => {
    const payload = {
      title: 'Valid Ticket Title',
      priority: 'MEDIUM',
      description: 'This is a very detailed description for the test ticket.'
    };
    component.ticketForm.patchValue(payload as any);
    ticketServiceMock.createTicket.mockReturnValue(of({ id: 'TK-123' }));

    component.onSubmit();

    expect(ticketServiceMock.createTicket).toHaveBeenCalledWith(payload);
    expect(toastServiceMock.success).toHaveBeenCalledWith('Ticket creado correctamente');
    expect(dialogRefMock.close).toHaveBeenCalledWith({ id: 'TK-123' });
    expect(component.isSubmitting).toBe(false);
  });

  it('should handle error on submit', () => {
    component.ticketForm.patchValue({
      title: 'Valid Title',
      priority: 'LOW',
      description: 'Valid description text here.'
    });
    ticketServiceMock.createTicket.mockReturnValue(throwError(() => new Error()));

    component.onSubmit();

    expect(toastServiceMock.error).toHaveBeenCalledWith('No fue posible crear el ticket');
    expect(component.isSubmitting).toBe(false);
  });

  it('should close dialog on close()', () => {
    component.close();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
