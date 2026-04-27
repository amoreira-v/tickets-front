import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor() { }

  /**
   * Obtiene la lista completa de tickets consumiendo la API
   */
  getTickets(): Observable<TicketResponse> {
    return this.http.get<TicketResponse>(this.apiUrl);
  }

  /**
   * Crea un nuevo ticket consumiendo la API
   */
  createTicket(ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.post<ApiResponse<Ticket>>(this.apiUrl, ticket).pipe(
      map(res => res.data)
    );
  }

  /**
   * Actualiza el estado de un ticket consumiendo la API
   */
  updateTicketStatus(id: string | number, status: TicketStatus): Observable<Ticket> {
    return this.http.patch<ApiResponse<Ticket>>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      map(res => res.data)
    );
  }
}

