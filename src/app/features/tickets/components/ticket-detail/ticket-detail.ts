import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Ticket, TicketStatus } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title class="font-bold text-xl text-gray-800 flex justify-between items-center">
      Detalle del Ticket
      <mat-chip-set>
        <mat-chip [color]="getStatusColor(ticket.status)" highlighted class="text-xs uppercase font-bold">{{ticket.status}}</mat-chip>
      </mat-chip-set>
    </h2>
    <mat-dialog-content class="mat-typography min-w-[300px] md:min-w-[500px]">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-700">{{ ticket.title }}</h3>
        <p class="text-gray-500 text-sm mb-4">{{ ticket.created_at | date:'medium' }}</p>
        <mat-divider></mat-divider>
      </div>
      
      <div class="mb-4">
        <p class="font-medium text-gray-800">Descripción:</p>
        <p class="text-gray-600 bg-gray-50 p-4 rounded-lg mt-2">{{ ticket.description }}</p>
      </div>

      <div class="grid grid-cols-2 gap-4 mt-6">
        <div>
          <p class="font-medium text-gray-500 text-xs uppercase">Prioridad</p>
          <p class="font-semibold">{{ ticket.priority }}</p>
        </div>
        <div>
          <p class="font-medium text-gray-500 text-xs uppercase">Usuario Solicitante</p>
          <p class="font-semibold">{{ ticket.user_id }}</p>
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end" class="mb-2 mr-2">
      <button mat-button mat-dialog-close>Cerrar</button>
      
      <!-- Controles de Gestión (Solo Soporte) usando el nuevo @if -->
      @if (authService.role() === 'SUPPORT') {
        @if (ticket.status === 'OPEN') {
          <button mat-flat-button color="accent" (click)="updateStatus('IN_PROGRESS')" [disabled]="isSubmitting">Atender</button>
          <button mat-flat-button color="warn" (click)="updateStatus('REJECTED')" [disabled]="isSubmitting">Rechazar</button>
        }
        @if (ticket.status === 'IN_PROGRESS') {
          <button mat-flat-button color="primary" (click)="updateStatus('RESOLVED')" [disabled]="isSubmitting">Finalizar</button>
        }
      }
    </mat-dialog-actions>
  `
})
export class TicketDetail {
  private readonly ticketService = inject(TicketService);
  public readonly authService = inject(AuthService);
  private readonly dialogRef = inject(MatDialogRef<TicketDetail>);
  public readonly data = inject<{ ticket: Ticket }>(MAT_DIALOG_DATA);
  
  public ticket: Ticket = this.data.ticket;
  isSubmitting = false;

  constructor() {}

  getStatusColor(status: string): string {
    switch(status) {
      case 'OPEN': return 'primary';
      case 'IN_PROGRESS': return 'accent';
      case 'RESOLVED': return 'primary'; // Angular Material doesn't have 'success' color easily out of the box without custom themes, fallback below
      case 'REJECTED': return 'warn';
      default: return '';
    }
  }

  updateStatus(newStatus: TicketStatus) {
    this.isSubmitting = true;
    this.ticketService.updateTicketStatus(this.ticket.id, newStatus).subscribe({
      next: (updatedTicket) => {
        this.isSubmitting = false;
        this.dialogRef.close(updatedTicket); // Devolvemos el ticket actualizado a la tabla
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
