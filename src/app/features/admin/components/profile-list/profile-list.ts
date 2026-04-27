import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../services/admin.service';
import { Profile } from '../../models/admin.model';

@Component({
  selector: 'app-profile-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
      <div class="p-4 flex justify-between items-center border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">Perfiles Registrados</h2>
        <button mat-flat-button color="primary">
          <mat-icon>add</mat-icon> Nuevo Perfil
        </button>
      </div>

      @if (loading) {
        <div class="p-8 text-center text-gray-500">Cargando perfiles...</div>
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

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef class="uppercase text-xs font-semibold text-gray-500"> Descripción </th>
            <td mat-cell *matCellDef="let element" class="text-gray-600"> {{element.description}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right uppercase text-xs font-semibold text-gray-500"> Acciones </th>
            <td mat-cell *matCellDef="let element" class="text-right">
              <button mat-icon-button color="accent"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn"><mat-icon>delete</mat-icon></button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-gray-50/50"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50"></tr>
        </table>
      }
    </div>
  `
})
export class ProfileList implements OnInit {
  private readonly adminService = inject(AdminService);
  
  loading = true;
  dataSource = new MatTableDataSource<Profile>([]);
  displayedColumns: string[] = ['id', 'name', 'description', 'actions'];

  ngOnInit() {
    this.adminService.getProfiles().subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
