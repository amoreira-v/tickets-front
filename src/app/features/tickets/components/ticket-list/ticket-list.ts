import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Ticket } from '../../models/ticket.model';
import { TicketCreate } from '../ticket-create/ticket-create';
import { TicketDetail } from '../ticket-detail/ticket-detail';
import { ToastService } from '../../../../core/services/toast.service';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    RouterModule
  ],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss',
})
export class TicketList implements OnInit {
  private readonly ticketService = inject(TicketService);
  public readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);

  public readonly isLoading = signal<boolean>(true);
  public readonly dataSource = new MatTableDataSource<Ticket>([]);
  displayedColumns: string[] = ['id', 'title', 'status', 'priority', 'created_at', 'actions'];

  ngOnInit(): void {
    this.loadTickets();
    
    // Configurar filtro personalizado para buscar por múltiples campos
    this.dataSource.filterPredicate = (data: Ticket, filter: string) => {
      const searchStr = (data.title + data.id + data.status).toLowerCase();
      return searchStr.indexOf(filter.toLowerCase()) !== -1;
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  filterByStatus(status: string) {
    this.dataSource.filter = status.trim().toLowerCase();
  }

  loadTickets(): void {
    this.isLoading.set(true);
    const scope = this.authService.role() === 'SUPPORT' || this.authService.role() === 'ADMIN' ? 'all' : 'mine';

    this.ticketService.getTickets(scope).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('No fue posible cargar la lista de tickets');
        this.isLoading.set(false);
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(TicketCreate, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Se actualiza el listado
        this.loadTickets();
      }
    });
  }

  openDetailDialog(ticket: Ticket): void {
    const dialogRef = this.dialog.open(TicketDetail, {
      width: '600px',
      data: { ticket }
    });

    dialogRef.afterClosed().subscribe(updatedTicket => {
      if (updatedTicket) {
        // Recargar o mutar la data
        this.loadTickets();
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-progress';
      case 'RESOLVED': return 'status-resolved';
      case 'REJECTED': return 'status-rejected';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'OPEN': return 'Abierto';
      case 'IN_PROGRESS': return 'Atendiendo';
      case 'RESOLVED': return 'Atendido';
      case 'REJECTED': return 'Rechazado';
      default: return status;
    }
  }

  getRoleLabel(): string {
    const role = this.authService.role();
    if (role === 'SUPPORT') {
      return 'SOPORTE';
    }
    if (role === 'CLIENT') {
      return 'CLIENTE';
    }
    return 'ADMIN';
  }

  formatTicketId(id: string | number): string {
    return String(id).substring(0, 8);
  }

  getPriorityClass(priority: string): string {
    switch(priority) {
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
