import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../services/admin.service';
import { Option } from '../../models/admin.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-option-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
      <div class="p-4 flex justify-between items-center border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">Opciones de Menú</h2>
        <button mat-flat-button color="primary" (click)="createOption()">
          <mat-icon>add</mat-icon> Nueva Opción
        </button>
      </div>

      @if (isLoading()) {
        <div class="p-6 grid gap-3">
          @for (line of [1, 2, 3, 4]; track line) {
            <div class="h-11 rounded-xl bg-slate-100 shimmer"></div>
          }
        </div>
      } @else {
        <table mat-table [dataSource]="dataSource" class="w-full">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef class="uppercase text-xs font-semibold text-gray-500"> ID </th>
            <td mat-cell *matCellDef="let element" class="font-mono text-gray-500"> {{element.id}} </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef class="uppercase text-xs font-semibold text-gray-500"> Nombre </th>
            <td mat-cell *matCellDef="let element" class="font-medium text-gray-900"> {{element.name}} </td>
          </ng-container>

          <ng-container matColumnDef="path">
            <th mat-header-cell *matHeaderCellDef class="uppercase text-xs font-semibold text-gray-500"> Ruta </th>
            <td mat-cell *matCellDef="let element" class="text-blue-600 font-mono text-sm"> {{element.path}} </td>
          </ng-container>
          
          <ng-container matColumnDef="module_id">
            <th mat-header-cell *matHeaderCellDef class="uppercase text-xs font-semibold text-gray-500"> ID Módulo </th>
            <td mat-cell *matCellDef="let element" class="text-gray-500"> {{element.module_id}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right uppercase text-xs font-semibold text-gray-500"> Acciones </th>
            <td mat-cell *matCellDef="let element" class="text-right">
              <button mat-icon-button color="accent" (click)="editOption(element)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteOption(element)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-gray-50/50"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50"></tr>
        </table>
      }
    </div>
  `
})
export class OptionList implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);
  
  public readonly isLoading = signal<boolean>(true);
  dataSource = new MatTableDataSource<Option>([]);
  displayedColumns: string[] = ['id', 'name', 'path', 'module_id', 'actions'];

  ngOnInit() {
    this.loadOptions();
  }

  loadOptions(): void {
    this.isLoading.set(true);
    this.adminService.getOptions().subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('No fue posible cargar opciones');
        this.isLoading.set(false);
      }
    });
  }

  createOption(): void {
    const name = window.prompt('Nombre de la opcion de menu:')?.trim();
    if (!name) {
      return;
    }

    const path = window.prompt('Ruta de navegacion (ej: /tickets):', '/tickets')?.trim();
    if (!path) {
      return;
    }

    const moduleId = window.prompt('ID de modulo relacionado:', 'M-1')?.trim() || 'M-1';

    this.adminService.createOption({ name, path, module_id: moduleId }).subscribe({
      next: () => {
        this.toast.success('Opcion creada');
        this.loadOptions();
      },
      error: () => this.toast.error('No fue posible crear la opcion')
    });
  }

  editOption(option: Option): void {
    const name = window.prompt('Editar nombre de la opcion:', option.name)?.trim();
    if (!name) {
      return;
    }

    const path = window.prompt('Editar ruta:', option.path)?.trim();
    if (!path) {
      return;
    }

    const moduleId = window.prompt('Editar ID de modulo:', String(option.module_id))?.trim() || String(option.module_id);

    this.adminService.updateOption(option.id, { name, path, module_id: moduleId }).subscribe({
      next: () => {
        this.toast.success('Opcion actualizada');
        this.loadOptions();
      },
      error: () => this.toast.error('No fue posible actualizar la opcion')
    });
  }

  deleteOption(option: Option): void {
    const confirmed = window.confirm(`Eliminar la opcion ${option.name}?`);
    if (!confirmed) {
      return;
    }

    this.adminService.deleteOption(option.id).subscribe({
      next: () => {
        this.toast.success('Opcion eliminada');
        this.loadOptions();
      },
      error: () => this.toast.error('No fue posible eliminar la opcion')
    });
  }
}
