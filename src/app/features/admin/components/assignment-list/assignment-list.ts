import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { ProfileOption, Profile, Option } from '../../models/admin.model';
import { AssignmentForm } from '../assignment-form/assignment-form';
import { ToastService } from '../../../../core/services/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-assignment-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
      <div class="p-4 flex justify-between items-center border-b border-gray-100">
        <h2 class="text-lg font-semibold text-gray-800">Asignaciones de Opciones</h2>
        <button mat-flat-button color="primary" (click)="createAssignment()">
          <mat-icon>link</mat-icon> Nueva Asignación
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
          <ng-container matColumnDef="profile">
            <th mat-header-cell *matHeaderCellDef class="uppercase text-xs font-semibold text-gray-500"> Perfil </th>
            <td mat-cell *matCellDef="let element" class="font-medium"> {{ getProfileName(element.profile_id) }} </td>
          </ng-container>

          <ng-container matColumnDef="option">
            <th mat-header-cell *matHeaderCellDef class="uppercase text-xs font-semibold text-gray-500"> Opción de Menú </th>
            <td mat-cell *matCellDef="let element" class="text-gray-700"> {{ getOptionName(element.option_id) }} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="text-right uppercase text-xs font-semibold text-gray-500"> Acciones </th>
            <td mat-cell *matCellDef="let element" class="text-right">
              <button mat-icon-button color="warn" (click)="deleteAssignment(element)"><mat-icon>link_off</mat-icon></button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns" class="bg-gray-50/50"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50"></tr>
        </table>
      }
    </div>
  `
})
export class AssignmentList implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  
  public readonly isLoading = signal<boolean>(true);
  dataSource = new MatTableDataSource<ProfileOption>([]);
  displayedColumns: string[] = ['profile', 'option', 'actions'];

  private profiles: Profile[] = [];
  private options: Option[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    forkJoin({
      profiles: this.adminService.getProfiles(),
      options: this.adminService.getOptions(),
      assignments: this.adminService.getProfileOptions()
    }).subscribe({
      next: (res) => {
        this.profiles = res.profiles.data;
        this.options = res.options.data;
        this.dataSource.data = res.assignments.data;
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar datos de asignaciones');
        this.isLoading.set(false);
      }
    });
  }

  getProfileName(id: string | number): string {
    return this.profiles.find(p => String(p.id) === String(id))?.name || `Perfil ${id}`;
  }

  getOptionName(id: string | number): string {
    return this.options.find(o => String(o.id) === String(id))?.name || `Opción ${id}`;
  }

  createAssignment(): void {
    const dialogRef = this.dialog.open(AssignmentForm, {
      width: '450px',
      data: { profiles: this.profiles, options: this.options }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadData();
    });
  }

  deleteAssignment(item: ProfileOption): void {
    const confirmed = window.confirm('¿Desea eliminar esta asignación?');
    if (!confirmed) return;

    this.adminService.deleteProfileOption(item.id).subscribe({
      next: () => {
        this.toast.success('Asignación eliminada');
        this.loadData();
      },
      error: () => this.toast.error('No fue posible eliminar la asignación')
    });
  }
}
