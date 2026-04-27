import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TicketService } from '../../services/ticket.service';

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
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title class="font-bold text-xl text-gray-800">Crear Nuevo Ticket</h2>
    <mat-dialog-content class="mat-typography">
      <form [formGroup]="ticketForm" class="flex flex-col gap-4 mt-4 min-w-[300px] md:min-w-[400px]">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Título</mat-label>
          <input matInput formControlName="title" placeholder="Ej. Falla en el sistema">
          <mat-error *ngIf="ticketForm.get('title')?.hasError('required')">El título es requerido.</mat-error>
          <mat-error *ngIf="ticketForm.get('title')?.hasError('minlength')">Mínimo 5 caracteres.</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Prioridad</mat-label>
          <mat-select formControlName="priority">
            <mat-option value="LOW">Baja</mat-option>
            <mat-option value="MEDIUM">Media</mat-option>
            <mat-option value="HIGH">Alta</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="4" placeholder="Detalle su problema..."></textarea>
          <mat-error *ngIf="ticketForm.get('description')?.hasError('required')">La descripción es obligatoria.</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="mb-2 mr-2">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="ticketForm.invalid || isSubmitting" (click)="onSubmit()">
        {{ isSubmitting ? 'Guardando...' : 'Crear Ticket' }}
      </button>
    </mat-dialog-actions>
  `
})
export class TicketCreate {
  private readonly fb = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);
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
}
