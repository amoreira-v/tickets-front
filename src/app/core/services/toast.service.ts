import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  /**
   * Muestra un mensaje de éxito
   */
  success(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      panelClass: ['toast-success']
    });
  }

  /**
   * Muestra un mensaje de error
   */
  error(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      panelClass: ['toast-error']
    });
  }

  /**
   * Muestra una advertencia
   */
  info(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      panelClass: ['toast-info']
    });
  }
}
