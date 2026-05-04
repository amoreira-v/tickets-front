import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Option, Module } from '../../models/admin.model';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-option-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="modal-header">
      <div class="icon-wrapper">
        <mat-icon>{{ isEdit ? 'edit_road' : 'add_link' }}</mat-icon>
      </div>
      <div class="header-text">
        <p>{{ isEdit ? 'Configuración de Ruta' : 'Nuevo Enlace' }}</p>
        <h2>{{ isEdit ? 'Editar Opción de Menú' : 'Registrar Opción' }}</h2>
      </div>
    </div>

    <mat-dialog-content>
      <form [formGroup]="optionForm" class="form-container py-4">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nombre de la Opción</mat-label>
          <input matInput formControlName="name" placeholder="Ej. Bandeja de Entrada, Configuración">
          <mat-icon matSuffix>nav_arrow_right</mat-icon>
          <mat-error *ngIf="optionForm.get('name')?.hasError('required')">El nombre es obligatorio</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full mt-2">
          <mat-label>Ruta (URL Path)</mat-label>
          <input matInput formControlName="path" placeholder="Ej. /tickets, /admin/profiles">
          <mat-icon matSuffix>link</mat-icon>
          <mat-error *ngIf="optionForm.get('path')?.hasError('required')">La ruta es obligatoria</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full mt-2">
          <mat-label>Módulo Relacionado</mat-label>
          <mat-select formControlName="module_id">
            <mat-option *ngFor="let mod of modules()" [value]="mod.id">
              {{ mod.name }} ({{ mod.id }})
            </mat-option>
          </mat-select>
          <mat-error *ngIf="optionForm.get('module_id')?.hasError('required')">Debe seleccionar un módulo</mat-error>
          <mat-hint *ngIf="isLoadingModules()">Cargando módulos...</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="pb-4 px-6">
      <button mat-button (click)="close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="optionForm.invalid || isSubmitting" (click)="onSubmit()">
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
      background: #fff7ed;
      color: #ea580c;
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
export class OptionForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<OptionForm>);
  
  public readonly isEdit: boolean;
  public isSubmitting = false;
  public readonly modules = signal<Module[]>([]);
  public readonly isLoadingModules = signal<boolean>(false);

  optionForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(60)]],
    path: ['', [Validators.required, Validators.pattern(/^\/[a-zA-Z0-9\-\/]+$/)]],
    module_id: ['', [Validators.required]]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { option?: Option }) {
    this.isEdit = !!data?.option;
    if (this.isEdit && data.option) {
      this.optionForm.patchValue({
        name: data.option.name,
        path: data.option.path,
        module_id: String(data.option.module_id)
      });
    }
  }

  ngOnInit() {
    this.loadModules();
  }

  loadModules() {
    this.isLoadingModules.set(true);
    this.adminService.getModules().subscribe({
      next: (res) => {
        this.modules.set(res.data);
        this.isLoadingModules.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar módulos para la lista');
        this.isLoadingModules.set(false);
      }
    });
  }

  onSubmit() {
    if (this.optionForm.invalid) return;

    this.isSubmitting = true;
    const payload = this.optionForm.getRawValue();

    const request = this.isEdit && this.data.option 
      ? this.adminService.updateOption(this.data.option.id, payload)
      : this.adminService.createOption(payload);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toast.success(`Opción ${this.isEdit ? 'actualizada' : 'creada'} correctamente`);
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
