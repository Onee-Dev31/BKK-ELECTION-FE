import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CouncilParty, ThaipbsCandidate, ThaipbsDistrict } from '../models/election.models';

const BASE = 'https://bkkelection65-data.thaipbs.or.th/website';

@Injectable({ providedIn: 'root' })
export class ThaiPBSService {
  private http = inject(HttpClient);

  candidates = signal<ThaipbsCandidate[]>([]);
  parties = signal<CouncilParty[]>([]);
  districts = signal<ThaipbsDistrict[]>([]);
  isLoading = signal(false);

  candidateMap = computed(() => {
    const map = new Map<number, ThaipbsCandidate>();
    this.candidates().forEach(c => map.set(c.number, c));
    return map;
  });

  partyMap = computed(() => {
    const map = new Map<number, CouncilParty>();
    this.parties().forEach(p => map.set(p.partyId, p));
    return map;
  });

  constructor() {
    this.loadAll();
  }

  async loadAll() {
    this.isLoading.set(true);
    try {
      const fetchWithFallback = async <T>(url: string, localPath: string): Promise<T> => {
        try {
          return await lastValueFrom(this.http.get<T>(url));
        } catch (e) {
          console.warn(`External load failed for ${url}, trying local ${localPath}`);
          return await lastValueFrom(this.http.get<T>(localPath));
        }
      };

      const [candidates, parties, districts] = await Promise.all([
        fetchWithFallback<ThaipbsCandidate[]>(`${BASE}/candidatesTH.json`, 'data/council.json'),
        fetchWithFallback<CouncilParty[]>(`${BASE}/partiesTH.json`, 'data/parties.json'),
        lastValueFrom(this.http.get<ThaipbsDistrict[]>(`${BASE}/districtsTH.json`)).catch(() => [])
      ]);

      this.candidates.set(candidates);
      this.parties.set(parties);
      this.districts.set(districts);
    } catch (e) {
      console.error('ThaiPBS data error:', e);
    } finally {
      this.isLoading.set(false);
    }
  }

}
