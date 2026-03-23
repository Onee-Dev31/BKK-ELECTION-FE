import { Injectable, computed, inject, signal } from '@angular/core';
import { MapStateService } from './map-state';
import { ElectionService } from './election.service';
import { DISTRICT_MAP_NAMES } from '../constants/map-names.constants';

export interface SearchResult {
  type: 'district' | 'candidate';
  id: number;
  title: string;
  subtitle: string;
  matchScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private mapState = inject(MapStateService);
  private electionService = inject(ElectionService);

  searchQuery = signal('');

  searchResults = computed<SearchResult[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];

    this.electionService.candidates().forEach(c => {
      let score = 0;
      if (c.name.toLowerCase().includes(q)) score += 10;
      if (c.party.toLowerCase().includes(q)) score += 5;
      if (c.number.toString() === q) score += 20;

      if (score > 0) {
        results.push({
          type: 'candidate',
          id: c.id,
          title: c.name,
          subtitle: `พรรค${c.party} · เบอร์ ${c.number}`,
          matchScore: score
        });
      }
    });

    this.mapState.districts().forEach(d => {
      const mockName = this.getDistrictName(d.number);
      let score = 0;
      if (mockName.toLowerCase().includes(q)) score += 10;
      if (d.number.toString() === q) score += 20;

      if (score > 0) {
        results.push({
          type: 'district',
          id: d.id,
          title: `เขต ${mockName}`,
          subtitle: `เขตเลือกตั้งที่ ${d.number}`,
          matchScore: score
        });
      }
    });

    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
  });

  private getDistrictName(id: number | undefined): string {
    if (!id || id < 1 || id > 50) return 'ไม่ทราบ';
    return DISTRICT_MAP_NAMES[id] || 'ไม่ทราบ';
  }
}

