import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Ticket } from '../../models/ticket.model';
import { TicketCreate } from '../ticket-create/ticket-create';
import { TicketDetail } from '../ticket-detail/ticket-detail';

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
    RouterModule
  ],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss',
})
export class TicketList implements OnInit {
  private readonly ticketService = inject(TicketService);
  public readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  loading = true;
  dataSource = new MatTableDataSource<Ticket>([]);
  displayedColumns: string[] = ['id', 'title', 'status', 'priority', 'created_at', 'actions'];

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketService.getTickets().subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching tickets', err);
        this.loading = false;
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
