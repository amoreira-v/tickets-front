import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { Profile } from '../../models/admin.model';
import { ProfileForm } from '../profile-form/profile-form';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-profile-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
      <div class="p-4 flex justify-between items-center border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">Perfiles Registrados</h2>
        <button mat-flat-button color="primary" (click)="createProfile()">
          <mat-icon>add</mat-icon> Nuevo Perfil
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

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef class="uppercase text-xs font-semibold text-gray-500"> Descripción </th>
            <td mat-cell *matCellDef="let element" class="text-gray-600"> {{element.description}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right uppercase text-xs font-semibold text-gray-500"> Acciones </th>
            <td mat-cell *matCellDef="let element" class="text-right">
              <button mat-icon-button color="accent" (click)="editProfile(element)"><mat-icon>edit</mat-icon></button>
              <button mat-icon-button color="warn" (click)="deleteProfile(element)"><mat-icon>delete</mat-icon></button>
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
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  
  public readonly isLoading = signal<boolean>(true);
  dataSource = new MatTableDataSource<Profile>([]);
  displayedColumns: string[] = ['id', 'name', 'description', 'actions'];

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.isLoading.set(true);
    this.adminService.getProfiles().subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('No fue posible cargar perfiles');
        this.isLoading.set(false);
      }
    });
  }

  createProfile(): void {
    const dialogRef = this.dialog.open(ProfileForm, {
      width: '450px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadProfiles();
    });
  }

  editProfile(profile: Profile): void {
    const dialogRef = this.dialog.open(ProfileForm, {
      width: '450px',
      data: { profile }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadProfiles();
    });
  }

  deleteProfile(profile: Profile): void {
    const confirmed = window.confirm(`Eliminar el perfil ${profile.name}?`);
    if (!confirmed) {
      return;
    }

    this.adminService.deleteProfile(profile.id).subscribe({
      next: () => {
        this.toast.success('Perfil eliminado');
        this.loadProfiles();
      },
      error: () => this.toast.error('No fue posible eliminar el perfil')
    });
  }
}
