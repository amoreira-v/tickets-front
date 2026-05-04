import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Profile, Option } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-assignment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="modal-header">
      <div class="icon-wrapper">
        <mat-icon>link</mat-icon>
      </div>
      <div class="header-text">
        <p>Seguridad y Accesos</p>
        <h2>Asignar Opción a Perfil</h2>
      </div>
    </div>

    <mat-dialog-content>
      <form [formGroup]="assignmentForm" class="form-container py-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Seleccionar Perfil</mat-label>
          <mat-select formControlName="profile_id">
            <mat-option *ngFor="let profile of data.profiles" [value]="profile.id">
              {{ profile.name }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="assignmentForm.get('profile_id')?.hasError('required')">El perfil es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full mt-2">
          <mat-label>Seleccionar Opción de Menú</mat-label>
          <mat-select formControlName="option_id">
            <mat-option *ngFor="let option of data.options" [value]="option.id">
              {{ option.name }} ({{ option.path }})
            </mat-option>
          </mat-select>
          <mat-error *ngIf="assignmentForm.get('option_id')?.hasError('required')">La opción es obligatoria</mat-error>
        </mat-form-field>
      </form>
      
      <div class="p-3 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100 flex gap-2">
        <mat-icon style="font-size: 16px; width: 16px; height: 16px;">info</mat-icon>
        <span>Esta acción habilitará la funcionalidad seleccionada para todos los usuarios con este perfil.</span>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="pb-4 px-6">
      <button mat-button (click)="close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="assignmentForm.invalid || isSubmitting" (click)="onSubmit()">
        {{ isSubmitting ? 'Asignando...' : 'Confirmar Asignación' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .modal-header {
      padding: 24px 24px 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      background: linear-gradient(to bottom, #f0f9ff, #ffffff);
      border-bottom: 1px solid #e0f2fe;
    }
    .icon-wrapper {
      width: 48px;
      height: 48px;
      background: #0ea5e9;
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header-text p {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }
    .header-text h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0c4a6e;
    }
    .form-container {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class AssignmentForm {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<AssignmentForm>);
  
  public isSubmitting = false;

  assignmentForm = this.fb.nonNullable.group({
    profile_id: ['', [Validators.required]],
    option_id: ['', [Validators.required]]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { profiles: Profile[], options: Option[] }) {}

  onSubmit() {
    if (this.assignmentForm.invalid) return;

    this.isSubmitting = true;
    const payload = this.assignmentForm.getRawValue();

    this.adminService.createProfileOption(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toast.success('Asignación creada correctamente');
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting = false;
        this.toast.error('Ocurrió un error al procesar la asignación');
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
