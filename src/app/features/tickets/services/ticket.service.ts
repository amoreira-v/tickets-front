import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { TicketResponse, Ticket, TicketStatus } from '../models/ticket.model';
import { environment } from '../../../../environments/environment';

// Estructura esperada de la API según el requerimiento
interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tickets`;
  private mockTickets: Ticket[] = [
    {
      id: 'TK-1001',
      title: 'No puedo acceder al panel de pagos',
      description: 'El sistema devuelve error 403 al intentar abrir la seccion de pagos.',
      status: 'OPEN',
      priority: 'HIGH',
      user_id: 'U-101',
      assigned_to: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'TK-1002',
      title: 'Solicitud de habilitacion de usuario',
      description: 'Necesito habilitar una cuenta nueva para el equipo comercial.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      user_id: 'U-211',
      assigned_to: 'SUP-1',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'TK-1003',
      title: 'Error visual en formulario de registro',
      description: 'En mobile se sobrepone el boton de enviar con el footer.',
      status: 'RESOLVED',
      priority: 'LOW',
      user_id: 'U-101',
      assigned_to: 'SUP-2',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  constructor() { }

  /**
   * Obtiene la lista completa de tickets consumiendo la API
   */
  getTickets(scope: 'all' | 'mine' = 'mine'): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(this.apiUrl, {
      params: { scope }
    }).pipe(
      catchError(() => of(this.getMockTicketResponse(scope)).pipe(delay(500)))
    );
  }

  /**
   * Crea un nuevo ticket consumiendo la API
   */
  createTicket(ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<ApiResponse<Ticket>>(this.apiUrl, ticket).pipe(
      map(res => res.data),
      catchError(() => {
        const mockTicket: Ticket = {
          id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
          title: ticket.title || 'Sin titulo',
          description: ticket.description || '',
          status: 'OPEN',
          priority: ticket.priority || 'LOW',
          user_id: 'U-CLIENT',
          assigned_to: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        this.mockTickets = [mockTicket, ...this.mockTickets];
        return of(mockTicket).pipe(delay(450));
      })
    );
  }

  /**
   * Actualiza el estado de un ticket consumiendo la API
   */
  updateTicketStatus(id: string | number, status: TicketStatus): Observable<Ticket> {
    return this.http.patch<ApiResponse<Ticket>>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      map(res => res.data),
      catchError(() => {
        const targetId = String(id);
        let updatedTicket: Ticket | undefined;

        this.mockTickets = this.mockTickets.map((item) => {
          if (String(item.id) !== targetId) {
            return item;
          }

          updatedTicket = {
            ...item,
            status,
            updated_at: new Date().toISOString()
          };
          return updatedTicket;
        });

        if (!updatedTicket) {
          updatedTicket = this.mockTickets[0];
        }

        return of(updatedTicket).pipe(delay(350));
      })
    );
  }

  private getMockTicketResponse(scope: 'all' | 'mine'): TicketResponse {
    if (scope === 'all') {
      return { status: 'mock', data: this.mockTickets };
    }

    return {
      status: 'mock',
      data: this.mockTickets.filter((item) => item.user_id === 'U-CLIENT' || item.user_id === 'U-101')
    };
  }
}

