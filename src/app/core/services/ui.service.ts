import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  // Estado del Sidebar (abierto/cerrado)
  private readonly sidebarOpenSignal = signal<boolean>(true);
  
  public readonly isSidebarOpen = this.sidebarOpenSignal.asReadonly();

  public toggleSidebar(): void {
    this.sidebarOpenSignal.update(open => !open);
  }

  public closeSidebar(): void {
    this.sidebarOpenSignal.set(false);
  }

  public openSidebar(): void {
    this.sidebarOpenSignal.set(true);
  }
}
