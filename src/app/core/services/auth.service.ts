import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.dev';

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

  getElectionJson() {
    return this.http.get(`${this.apiUrl}/elections/bkk-governor-2026/party-rankings/export`, {
      responseType: 'text',
    });
  }
}
