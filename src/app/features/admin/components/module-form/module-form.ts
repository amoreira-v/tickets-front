import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Module } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-module-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="modal-header">
      <div class="icon-wrapper">
        <mat-icon>{{ isEdit ? 'settings_suggest' : 'view_module' }}</mat-icon>
      </div>
      <div class="header-text">
        <p>{{ isEdit ? 'Configuración de Módulo' : 'Nuevo Componente' }}</p>
        <h2>{{ isEdit ? 'Editar Módulo' : 'Registrar Módulo' }}</h2>
      </div>
    </div>

    <mat-dialog-content>
      <form [formGroup]="moduleForm" class="form-container py-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre del Módulo</mat-label>
          <input matInput formControlName="name" placeholder="Ej. Tickets, Seguridad, Reportes">
          <mat-icon matSuffix>label</mat-icon>
          <mat-error *ngIf="moduleForm.get('name')?.hasError('required')">El nombre es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full mt-2">
          <mat-label>Icono (Material Icon)</mat-label>
          <input matInput formControlName="icon" placeholder="Ej. confirmation_number, settings">
          <mat-icon matSuffix>{{ moduleForm.get('icon')?.value || 'help_outline' }}</mat-icon>
          <mat-error *ngIf="moduleForm.get('icon')?.hasError('required')">El icono es obligatorio</mat-error>
        </mat-form-field>

        <div class="mt-4 p-4 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-slate-700">Estado de Activación</span>
            <span class="text-xs text-slate-500">Define si el módulo será visible en el menú</span>
          </div>
          <mat-slide-toggle formControlName="is_active" color="primary"></mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="pb-4 px-6">
      <button mat-button (click)="close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="moduleForm.invalid || isSubmitting" (click)="onSubmit()">
        {{ isSubmitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Guardar') }}
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
      background: #f0fdf4;
      color: #16a34a;
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
export class ModuleForm {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<ModuleForm>);
  
  public readonly isEdit: boolean;
  public isSubmitting = false;

  moduleForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    icon: ['view_module', [Validators.required, Validators.pattern(/^[a-z_]+$/)]],
    is_active: [true, [Validators.required]]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { module?: Module }) {
    this.isEdit = !!data?.module;
    if (this.isEdit && data.module) {
      this.moduleForm.patchValue({
        name: data.module.name,
        icon: data.module.icon,
        is_active: data.module.is_active
      });
    }
  }

  onSubmit() {
    if (this.moduleForm.invalid) return;

    this.isSubmitting = true;
    const payload = this.moduleForm.getRawValue();

    const request = this.isEdit && this.data.module 
      ? this.adminService.updateModule(this.data.module.id, payload)
      : this.adminService.createModule(payload);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toast.success(`Módulo ${this.isEdit ? 'actualizado' : 'creado'} correctamente`);
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
