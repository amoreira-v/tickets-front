import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { Profile, Module, Option, AdminDataResponse, ProfileOption } from '../models/admin.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private mockProfiles: Profile[] = [
    { id: 'P-1', name: 'ADMIN', description: 'Control total del sistema.' },
    { id: 'P-2', name: 'SOPORTE', description: 'Gestion y atencion de tickets.' },
    { id: 'P-3', name: 'CLIENTE', description: 'Registro y seguimiento de tickets.' }
  ];
  private mockModules: Module[] = [
    { id: 'M-1', name: 'Tickets', icon: 'confirmation_number', is_active: true },
    { id: 'M-2', name: 'Administracion', icon: 'admin_panel_settings', is_active: true }
  ];
  private mockOptions: Option[] = [
    { id: 'O-1', module_id: 'M-1', name: 'Listado de Tickets', path: '/tickets' },
    { id: 'O-2', module_id: 'M-2', name: 'Administracion', path: '/admin' }
  ];
  private mockProfileOptions: ProfileOption[] = [
    { id: 1, profile_id: 'P-1', option_id: 'O-1' },
    { id: 2, profile_id: 'P-1', option_id: 'O-2' }
  ];

  constructor() {}

  getProfiles(): Observable<AdminDataResponse<Profile>> {
    return this.http.get<AdminDataResponse<Profile>>(`${this.apiUrl}/admin/profiles`).pipe(
      catchError(() => of({ status: 'mock', data: this.mockProfiles }).pipe(delay(300)))
    );
  }

  getModules(): Observable<AdminDataResponse<Module>> {
    return this.http.get<AdminDataResponse<Module>>(`${this.apiUrl}/admin/modules`).pipe(
      catchError(() => of({ status: 'mock', data: this.mockModules }).pipe(delay(300)))
    );
  }

  getOptions(): Observable<AdminDataResponse<Option>> {
    return this.http.get<AdminDataResponse<Option>>(`${this.apiUrl}/admin/options`).pipe(
      catchError(() => of({ status: 'mock', data: this.mockOptions }).pipe(delay(300)))
    );
  }

  createProfile(payload: Omit<Profile, 'id'>): Observable<Profile> {
    return this.http.post<Profile>(`${this.apiUrl}/admin/profiles`, payload).pipe(
      catchError(() => {
        const profile: Profile = {
          id: `P-${Date.now()}`,
          ...payload
        };
        this.mockProfiles = [profile, ...this.mockProfiles];
        return of(profile).pipe(delay(250));
      })
    );
  }

  updateProfile(id: string | number, payload: Omit<Profile, 'id'>): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/admin/profiles/${id}`, payload).pipe(
      catchError(() => {
        let updated: Profile = { id, ...payload };
        this.mockProfiles = this.mockProfiles.map((item) => {
          if (String(item.id) !== String(id)) {
            return item;
          }
          updated = { ...item, ...payload };
          return updated;
        });
        return of(updated).pipe(delay(250));
      })
    );
  }

  deleteProfile(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/profiles/${id}`).pipe(
      catchError(() => {
        this.mockProfiles = this.mockProfiles.filter((item) => String(item.id) !== String(id));
        return of(void 0).pipe(delay(200));
      })
    );
  }

  createModule(payload: Omit<Module, 'id'>): Observable<Module> {
    return this.http.post<Module>(`${this.apiUrl}/admin/modules`, payload).pipe(
      catchError(() => {
        const module: Module = {
          id: `M-${Date.now()}`,
          ...payload
        };
        this.mockModules = [module, ...this.mockModules];
        return of(module).pipe(delay(250));
      })
    );
  }

  updateModule(id: string | number, payload: Omit<Module, 'id'>): Observable<Module> {
    return this.http.put<Module>(`${this.apiUrl}/admin/modules/${id}`, payload).pipe(
      catchError(() => {
        let updated: Module = { id, ...payload };
        this.mockModules = this.mockModules.map((item) => {
          if (String(item.id) !== String(id)) {
            return item;
          }
          updated = { ...item, ...payload };
          return updated;
        });
        return of(updated).pipe(delay(250));
      })
    );
  }

  deleteModule(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/modules/${id}`).pipe(
      catchError(() => {
        this.mockModules = this.mockModules.filter((item) => String(item.id) !== String(id));
        return of(void 0).pipe(delay(200));
      })
    );
  }

  createOption(payload: Omit<Option, 'id'>): Observable<Option> {
    return this.http.post<Option>(`${this.apiUrl}/admin/options`, payload).pipe(
      catchError(() => {
        const option: Option = {
          id: `O-${Date.now()}`,
          ...payload
        };
        this.mockOptions = [option, ...this.mockOptions];
        return of(option).pipe(delay(250));
      })
    );
  }

  updateOption(id: string | number, payload: Omit<Option, 'id'>): Observable<Option> {
    return this.http.put<Option>(`${this.apiUrl}/admin/options/${id}`, payload).pipe(
      catchError(() => {
        let updated: Option = { id, ...payload };
        this.mockOptions = this.mockOptions.map((item) => {
          if (String(item.id) !== String(id)) {
            return item;
          }
          updated = { ...item, ...payload };
          return updated;
        });
        return of(updated).pipe(delay(250));
      })
    );
  }

  deleteOption(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/options/${id}`).pipe(
      catchError(() => {
        this.mockOptions = this.mockOptions.filter((item) => String(item.id) !== String(id));
        return of(void 0).pipe(delay(200));
      })
    );
  }

  getProfileOptions(): Observable<AdminDataResponse<ProfileOption>> {
    return this.http.get<AdminDataResponse<ProfileOption>>(`${this.apiUrl}/admin/profile-options`).pipe(
      catchError(() => of({ status: 'mock', data: this.mockProfileOptions }).pipe(delay(300)))
    );
  }

  createProfileOption(payload: Omit<ProfileOption, 'id'>): Observable<ProfileOption> {
    return this.http.post<ProfileOption>(`${this.apiUrl}/admin/profile-options`, payload).pipe(
      catchError(() => {
        const po: ProfileOption = {
          id: Date.now(),
          ...payload
        };
        this.mockProfileOptions = [po, ...this.mockProfileOptions];
        return of(po).pipe(delay(250));
      })
    );
  }

  deleteProfileOption(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/profile-options/${id}`).pipe(
      catchError(() => {
        this.mockProfileOptions = this.mockProfileOptions.filter((item) => String(item.id) !== String(id));
        return of(void 0).pipe(delay(200));
      })
    );
  }
}

