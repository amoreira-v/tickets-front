import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Ticket, TicketStatus } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule
  ],
  template: `
    <div class="detail-header">
      <div class="header-left">
        <div class="icon-box">
          <mat-icon>confirmation_number</mat-icon>
        </div>
        <h2>Expediente #{{ formatTicketId(ticket.id) }}</h2>
      </div>
      <span class="status-pill" [ngClass]="getStatusClass(ticket.status)">
        {{ getStatusLabel(ticket.status) }}
      </span>
    </div>

    <mat-dialog-content class="detail-content">
      <div class="info-section">
        <span class="label">Requerimiento</span>
        <h3 class="title-text">{{ ticket.title }}</h3>
        
        <span class="label">Descripción del Problema</span>
        <div class="description-box">
          {{ ticket.description }}
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="label">Prioridad</span>
          <p class="val flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" 
                  [style.background-color]="ticket.priority === 'HIGH' ? '#f43f5e' : (ticket.priority === 'MEDIUM' ? '#f59e0b' : '#3b82f6')"></span>
            {{ ticket.priority }}
          </p>
        </div>
        <div class="meta-item">
          <span class="label">Fecha Registro</span>
          <p class="val">{{ ticket.created_at | date:'MMM d, y HH:mm' }}</p>
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close class="font-bold text-slate-500">Cerrar</button>
      
      <!-- Acciones de Soporte -->
      @if (authService.role() === 'SUPPORT' || authService.role() === 'ADMIN') {
        @if (ticket.status === 'OPEN') {
          <button mat-flat-button class="btn-action btn-atender" (click)="updateStatus('IN_PROGRESS')" [disabled]="isSubmitting">
            <mat-icon>play_arrow</mat-icon> Atendiendo
          </button>
          <button mat-stroked-button class="btn-action btn-rechazar" (click)="updateStatus('REJECTED')" [disabled]="isSubmitting">
            <mat-icon>block</mat-icon> Rechazar
          </button>
        }
        @if (ticket.status === 'IN_PROGRESS') {
          <button mat-flat-button class="btn-action btn-finalizar" (click)="updateStatus('RESOLVED')" [disabled]="isSubmitting">
            <mat-icon>check_circle</mat-icon> Atendido
          </button>
        }
      }
    </mat-dialog-actions>
  `,
  styleUrl: './ticket-detail.scss'
})
export class TicketDetail {
  private readonly ticketService = inject(TicketService);
  public readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<TicketDetail>);
  public readonly data = inject<{ ticket: Ticket }>(MAT_DIALOG_DATA);
  
  public ticket: Ticket = this.data.ticket;
  isSubmitting = false;

  getStatusClass(status: string): string {
    switch(status) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-progress';
      case 'RESOLVED': return 'status-resolved';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'OPEN': return 'Abierto';
      case 'IN_PROGRESS': return 'Atendiendo';
      case 'RESOLVED': return 'Atendido';
      case 'REJECTED': return 'Rechazado';
      default: return status;
    }
  }

  formatTicketId(id: string | number): string {
    return String(id).substring(0, 8);
  }

  updateStatus(newStatus: TicketStatus) {
    this.isSubmitting = true;
    this.ticketService.updateTicketStatus(this.ticket.id, newStatus).subscribe({
      next: (updatedTicket) => {
        this.isSubmitting = false;
        this.toast.success(`Ticket ${newStatus === 'IN_PROGRESS' ? 'atendido' : (newStatus === 'RESOLVED' ? 'finalizado' : 'rechazado')} con éxito`);
        this.dialogRef.close(updatedTicket);
      },
      error: () => {
        this.isSubmitting = false;
        this.toast.error('Error al actualizar el estado del ticket');
      }
    });
  }
}
