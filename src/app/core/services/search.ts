import { Injectable, computed, inject, signal } from '@angular/core';
import { MapStateService } from './map-state';
import { ElectionService } from './election.service';
import { ELECTION_CONSTANTS } from '../constants/election.constants';

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
    const rawSearch = this.searchQuery().trim();
    if (!rawSearch) return [];

    const lowerRaw = rawSearch.toLowerCase();
    
    // Normalize: remove prefix only if there's something after it
    // This prevents searching for just "เขต" and getting nothing
    let q = lowerRaw;
    if (lowerRaw.startsWith('เขต') && lowerRaw.length > 3) {
      q = lowerRaw.substring(3).trim();
    } else if (lowerRaw.startsWith('แขวง') && lowerRaw.length > 4) {
      q = lowerRaw.substring(4).trim();
    }

    if (!q) return [];

    const results: SearchResult[] = [];

    this.electionService.candidates().forEach(c => {
      let score = 0;
      const lowerName = c.name.toLowerCase();
      const lowerParty = c.party.toLowerCase();

      if (lowerName === q) score += 30;
      else if (lowerName.includes(q)) score += 10;
      
      if (lowerParty.includes(q)) score += 5;
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
      const lowerMockName = mockName.toLowerCase();

      // Priority match for exact district name
      if (lowerMockName === q) score += 30;
      else if (lowerMockName.includes(q)) score += 10;
      
      if (d.number.toString() === q) score += 20;

      if (score > 0) {
        results.push({
          type: 'district',
          id: d.id,
          title: `เขต${mockName}`,
          subtitle: `เขตเลือกตั้งที่ ${d.number}`,
          matchScore: score
        });
      }
    });

    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
  });

  private getDistrictName(id: number | undefined): string {
    if (!id || id < 1 || id > 50) return 'ไม่ทราบ';
    return ELECTION_CONSTANTS.DISTRICT_NAMES[id - 1];
  }
}

