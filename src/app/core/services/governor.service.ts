import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.dev';
import { GovernorStats, GovernorCandidateResult } from '../models/election.models';

@Injectable({ providedIn: 'root' })
export class GovernorService {
  private http = inject(HttpClient);

  private readonly baseUrl = environment.apiUrl;
  private readonly slug = 'bkk-governor-2026';

  stats = signal<GovernorStats | null>(null);
  candidateResults = signal<GovernorCandidateResult[]>([]);
  isLoading = signal(false);

  constructor() {
    this.refresh();
    setInterval(() => this.refresh(), 60000);
  }

  async refresh(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [statsRes, candidatesRes] = await Promise.allSettled([
        lastValueFrom(
          this.http.get<{ success: boolean; data: GovernorStats }>(
            `${this.baseUrl}/elections/${this.slug}/auto/statistics`,
          ),
        ),
        lastValueFrom(
          this.http.get<{ success: boolean; data: { candidates: GovernorCandidateResult[] } }>(
            `${this.baseUrl}/elections/${this.slug}/auto/candidates`,
            { params: { page: '1', limit: '10' } },
          ),
        ),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        this.stats.set(statsRes.value.data);
      }
      if (candidatesRes.status === 'fulfilled' && candidatesRes.value.success) {
        this.candidateResults.set(candidatesRes.value.data.candidates);
      }
    } catch (err) {
      console.error('GovernorService error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
