import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.dev';
import { ExportSettings } from '../models/election.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(username: string, password: string): Observable<any> {
    const payload = {
      username,
      password,
    };

    return this.http.post(`${this.apiUrl}/login`, payload);
  }

  getElectionJson(enabled: boolean, intervalSeconds: number) {
    return this.http.get(`${this.apiUrl}/elections/bkk-governor-2026/party-rankings/export`, {
      params: {
        enabled: enabled.toString(),
        intervalSeconds: intervalSeconds.toString(),
      },
    });
  }

  generateManual(payload: any) {
    return this.http.post(
      `${this.apiUrl}/elections/bkk-governor-2026/party-rankings/override`,
      payload,
    );
  }

  getExportSettings(slug: string): Observable<{ success: boolean; data: ExportSettings }> {
    return this.http.get<{ success: boolean; data: ExportSettings }>(
      `${this.apiUrl}/elections/${slug}/party-rankings/export-settings`,
    );
  }

  updateExportSettings(slug: string, settings: ExportSettings): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/elections/${slug}/party-rankings/export-settings`,
      settings,
    );
  }

  getAllowedUsers(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.apiUrl}/allowed-users`);
  }

  addAllowedUser(empId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/allowed-users/${empId}`, {});
  }

  removeAllowedUser(empId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/allowed-users/${empId}`);
  }
}
