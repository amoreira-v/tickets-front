import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../services/ticket.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-ticket-create',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="modal-header">
      <div class="icon-wrapper">
        <mat-icon>add_task</mat-icon>
      </div>
      <div class="header-text">
        <p>Nueva Solicitud</p>
        <h2>Crear Ticket de Soporte</h2>
      </div>
    </div>

    <mat-dialog-content>
      <form [formGroup]="ticketForm" class="form-container">
        
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Título del Requerimiento</mat-label>
            <input matInput formControlName="title" placeholder="Ej. Acceso denegado a base de datos">
            <mat-icon matSuffix class="text-slate-400">title</mat-icon>
            <mat-error *ngIf="ticketForm.get('title')?.hasError('required')">El título es obligatorio</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Prioridad</mat-label>
            <mat-select formControlName="priority">
              <mat-select-trigger>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" 
                        [style.background-color]="ticketForm.get('priority')?.value === 'HIGH' ? '#f43f5e' : (ticketForm.get('priority')?.value === 'MEDIUM' ? '#f59e0b' : '#3b82f6')"></span>
                  {{ ticketForm.get('priority')?.value }}
                </div>
              </mat-select-trigger>
              <mat-option value="LOW">Baja</mat-option>
              <mat-option value="MEDIUM">Media</mat-option>
              <mat-option value="HIGH">Alta</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Descripción Detallada</mat-label>
          <textarea matInput formControlName="description" rows="5" placeholder="Describa el problema lo más detallado posible..."></textarea>
          <mat-error *ngIf="ticketForm.get('description')?.hasError('required')">La descripción es necesaria para procesar su ticket</mat-error>
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="close()" class="btn-cancel">Descartar</button>
      <button mat-flat-button 
              class="btn-submit" 
              [disabled]="ticketForm.invalid || isSubmitting" 
              (click)="onSubmit()">
        <mat-icon *ngIf="!isSubmitting" style="margin-right: 8px;">send</mat-icon>
        {{ isSubmitting ? 'Procesando...' : 'Enviar Ticket' }}
      </button>
    </mat-dialog-actions>
  `,
  styleUrl: './ticket-create.scss'
})
export class TicketCreate {
  private readonly fb = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<TicketCreate>);

  isSubmitting = false;

  ticketForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    priority: ['LOW', Validators.required],
    description: ['', Validators.required]
  });

  onSubmit() {
    if (this.ticketForm.valid) {
      this.isSubmitting = true;
      this.ticketService.createTicket(this.ticketForm.getRawValue()).subscribe({
        next: (newTicket) => {
          this.isSubmitting = false;
          this.dialogRef.close(newTicket);
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}
