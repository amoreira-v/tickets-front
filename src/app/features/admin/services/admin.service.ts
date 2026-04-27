import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile, Module, Option, AdminDataResponse } from '../models/admin.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  constructor() {}

  getProfiles(): Observable<AdminDataResponse<Profile>> {
    return this.http.get<AdminDataResponse<Profile>>(`${this.apiUrl}/admin/profiles`);
  }

  getModules(): Observable<AdminDataResponse<Module>> {
    return this.http.get<AdminDataResponse<Module>>(`${this.apiUrl}/admin/modules`);
  }

  getOptions(): Observable<AdminDataResponse<Option>> {
    return this.http.get<AdminDataResponse<Option>>(`${this.apiUrl}/admin/options`);
  }
}

