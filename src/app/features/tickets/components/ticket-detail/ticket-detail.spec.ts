import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';

import { TicketDetail } from './ticket-detail';

describe('TicketDetail', () => {
  let component: TicketDetail;
  let fixture: ComponentFixture<TicketDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketDetail],
      providers: [
        provideHttpClient(),
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            ticket: {
              id: 'TK-1',
              title: 'Titulo',
              description: 'Descripcion larga de prueba para el ticket.',
              status: 'OPEN',
              priority: 'HIGH',
              user_id: 'U-1',
              assigned_to: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
