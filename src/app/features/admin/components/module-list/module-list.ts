import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { Module } from '../../models/admin.model';
import { ModuleForm } from '../module-form/module-form';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-module-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatDialogModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
      <div class="p-4 flex justify-between items-center border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">Módulos del Sistema</h2>
        <button mat-flat-button color="primary" (click)="createModule()">
          <mat-icon>add</mat-icon> Nuevo Módulo
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

          <ng-container matColumnDef="icon">
            <th mat-header-cell *matHeaderCellDef class="uppercase text-xs font-semibold text-gray-500"> Icono </th>
            <td mat-cell *matCellDef="let element" class="text-gray-400"> 
              <mat-icon>{{element.icon}}</mat-icon>
            </td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef class="uppercase text-xs font-semibold text-gray-500"> Nombre </th>
            <td mat-cell *matCellDef="let element" class="font-medium text-gray-900"> {{element.name}} </td>
          </ng-container>

          <ng-container matColumnDef="is_active">
            <th mat-header-cell *matHeaderCellDef class="uppercase text-xs font-semibold text-gray-500"> Estado </th>
            <td mat-cell *matCellDef="let element"> 
              @if(element.is_active) {
                <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">ACTIVO</span>
              } @else {
                <span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">INACTIVO</span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right uppercase text-xs font-semibold text-gray-500"> Acciones </th>
            <td mat-cell *matCellDef="let element" class="text-right">
              <button mat-icon-button color="accent" (click)="editModule(element)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteModule(element)"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-gray-50/50"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50"></tr>
        </table>
      }
    </div>
  `
})
export class ModuleList implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  
  public readonly isLoading = signal<boolean>(true);
  dataSource = new MatTableDataSource<Module>([]);
  displayedColumns: string[] = ['id', 'icon', 'name', 'is_active', 'actions'];

  ngOnInit() {
    this.loadModules();
  }

  loadModules(): void {
    this.isLoading.set(true);
    this.adminService.getModules().subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('No fue posible cargar modulos');
        this.isLoading.set(false);
      }
    });
  }

  createModule(): void {
    const dialogRef = this.dialog.open(ModuleForm, {
      width: '450px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadModules();
    });
  }

  editModule(module: Module): void {
    const dialogRef = this.dialog.open(ModuleForm, {
      width: '450px',
      data: { module }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadModules();
    });
  }

  deleteModule(module: Module): void {
    const confirmed = window.confirm(`Eliminar el modulo ${module.name}?`);
    if (!confirmed) {
      return;
    }

    this.adminService.deleteModule(module.id).subscribe({
      next: () => {
        this.toast.success('Modulo eliminado');
        this.loadModules();
      },
      error: () => this.toast.error('No fue posible eliminar el modulo')
    });
  }
}
