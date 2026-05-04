import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TicketService } from './ticket.service';
import { environment } from '../../../../environments/environment';
import { TicketResponse, Ticket } from '../models/ticket.model';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('TicketService', () => {
  let service: TicketService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/tickets`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TicketService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TicketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTickets', () => {
    it('should return tickets from API on success', () => {
      const mockResponse: TicketResponse = {
        status: 'success',
        data: [
          { 
            id: '1', 
            title: 'Test Ticket', 
            description: 'Desc', 
            status: 'OPEN', 
            priority: 'LOW', 
            user_id: '1', 
            assigned_to: null, 
            created_at: '', 
            updated_at: '' 
          }
        ]
      };

      service.getTickets('all').subscribe(response => {
        expect(response.data.length).toBe(1);
        expect(response.data[0].title).toBe('Test Ticket');
      });

      const req = httpMock.expectOne(`${apiUrl}?scope=all`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return mock tickets on API error', () => {
      service.getTickets('all').subscribe(response => {
        expect(response.status).toBe('mock');
        expect(response.data.length).toBeGreaterThan(0);
      });

      const req = httpMock.expectOne(`${apiUrl}?scope=all`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('createTicket', () => {
    it('should create a ticket and return it on success', () => {
      const newTicket: Partial<Ticket> = { title: 'New Ticket', description: 'Desc' };
      const apiResponse = {
        status: 'success',
        data: { 
          id: 'TK-999', 
          title: 'New Ticket', 
          description: 'Desc', 
          status: 'OPEN' as const, 
          priority: 'LOW', 
          user_id: 'U-1', 
          assigned_to: null, 
          created_at: '', 
          updated_at: '' 
        }
      };

      service.createTicket(newTicket).subscribe(ticket => {
        expect(ticket.id).toBe('TK-999');
        expect(ticket.title).toBe('New Ticket');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(apiResponse);
    });

    it('should return a mock ticket on API error during creation', () => {
      const newTicket: Partial<Ticket> = { title: 'New Ticket' };

      service.createTicket(newTicket).subscribe(ticket => {
        expect(ticket.id).toContain('TK-');
        expect(ticket.title).toBe('New Ticket');
      });

      const req = httpMock.expectOne(apiUrl);
      req.error(new ErrorEvent('Server error'));
    });
  });

  describe('updateTicketStatus', () => {
    it('should update ticket status on success', () => {
      const ticketId = 'TK-1001';
      const newStatus = 'IN_PROGRESS';
      const apiResponse = {
        status: 'success',
        data: { 
          id: ticketId, 
          status: newStatus, 
          title: 'Title', 
          description: 'Desc', 
          priority: 'LOW', 
          user_id: 'U-1', 
          assigned_to: null, 
          created_at: '', 
          updated_at: '' 
        }
      };

      service.updateTicketStatus(ticketId, newStatus).subscribe(ticket => {
        expect(ticket.status).toBe(newStatus);
        expect(ticket.id).toBe(ticketId);
      });

      const req = httpMock.expectOne(`${apiUrl}/${ticketId}/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: newStatus });
      req.flush(apiResponse);
    });

    it('should fallback to mock tickets on API error during status update', () => {
      const ticketId = 'TK-1001';
      const newStatus = 'RESOLVED';

      service.updateTicketStatus(ticketId, newStatus).subscribe(ticket => {
        expect(ticket.status).toBe(newStatus);
        expect(ticket.id).toBe(ticketId);
      });

      const req = httpMock.expectOne(`${apiUrl}/${ticketId}/status`);
      req.error(new ErrorEvent('Update failed'));
    });

    it('should handle update for non-existent ticket by returning first mock', () => {
      const ticketId = 'NON-EXISTENT';
      const newStatus = 'RESOLVED';

      service.updateTicketStatus(ticketId, newStatus).subscribe(ticket => {
        expect(ticket).toBeTruthy();
        expect(ticket.id).toBeDefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/${ticketId}/status`);
      req.error(new ErrorEvent('Not Found'));
    });
  });
});
