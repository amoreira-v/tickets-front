import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Profile } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="modal-header">
      <div class="icon-wrapper">
        <mat-icon>{{ isEdit ? 'edit_note' : 'person_add' }}</mat-icon>
      </div>
      <div class="header-text">
        <p>{{ isEdit ? 'Actualizar Información' : 'Nuevo Registro' }}</p>
        <h2>{{ isEdit ? 'Editar Perfil' : 'Crear Perfil de Usuario' }}</h2>
      </div>
    </div>

    <mat-dialog-content>
      <form [formGroup]="profileForm" class="form-container py-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre del Perfil</mat-label>
          <input matInput formControlName="name" placeholder="Ej. ADMIN, SOPORTE, CLIENTE">
          <mat-icon matSuffix>badge</mat-icon>
          <mat-error *ngIf="profileForm.get('name')?.hasError('required')">El nombre es obligatorio</mat-error>
          <mat-error *ngIf="profileForm.get('name')?.hasError('minlength')">Debe tener al menos 3 caracteres</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full mt-2">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Describa las responsabilidades de este rol"></textarea>
          <mat-error *ngIf="profileForm.get('description')?.hasError('required')">La descripción es obligatoria</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="pb-4 px-6">
      <button mat-button (click)="close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="profileForm.invalid || isSubmitting" (click)="onSubmit()">
        {{ isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Perfil') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .modal-header {
      padding: 24px 24px 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      background: linear-gradient(to bottom, #f8fafc, #ffffff);
      border-bottom: 1px solid #f1f5f9;
    }
    .icon-wrapper {
      width: 48px;
      height: 48px;
      background: #e0f2fe;
      color: #0284c7;
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
      color: #1e293b;
    }
    .form-container {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class ProfileForm {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<ProfileForm>);
  
  public readonly isEdit: boolean;
  public isSubmitting = false;

  profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { profile?: Profile }) {
    this.isEdit = !!data?.profile;
    if (this.isEdit && data.profile) {
      this.profileForm.patchValue({
        name: data.profile.name,
        description: data.profile.description
      });
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.isSubmitting = true;
    const payload = this.profileForm.getRawValue();

    const request = this.isEdit && this.data.profile 
      ? this.adminService.updateProfile(this.data.profile.id, payload)
      : this.adminService.createProfile(payload);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toast.success(`Perfil ${this.isEdit ? 'actualizado' : 'creado'} correctamente`);
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting = false;
        this.toast.error('Ocurrió un error al procesar la solicitud');
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
