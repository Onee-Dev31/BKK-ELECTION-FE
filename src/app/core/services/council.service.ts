import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import {
  CouncilCandidate,
  CouncilParty,
  CouncilSummaryData,
  CouncilDistrictSummary,
  CouncilCandidate2026,
} from '../models/election.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CouncilService {
  private http = inject(HttpClient);
  private readonly govApiUrl = environment.apiUrl;

  // 2026 live data
  council2026All = signal<CouncilCandidate2026[]>([]);
  council2026Winners = signal<CouncilCandidate2026[]>([]);
  isLoading = signal(false);

  // Legacy signal kept for backward compat (populated from 2026 API)
  candidates = computed(() => this.council2026All().map(c => this.toLegacyCandidate(c)));
  summaryData = signal<CouncilSummaryData | null>(null);

  // Party map keyed by parseInt(party.code) for component compatibility
  partyMap = computed(() => {
    const map = new Map<number, CouncilParty>();
    const seen = new Set<string>();
    for (const c of this.council2026All()) {
      if (seen.has(c.party.id)) continue;
      seen.add(c.party.id);
      const numericId = parseInt(c.party.code) || 0;
      map.set(numericId, {
        partyId: numericId,
        code: c.party.code,
        partyName: c.party.name,
        partyLogoUrl: '',
        color: c.party.color,
        active: true,
      });
    }
    return map;
  });

  districtWinners = computed(() =>
    this.council2026Winners().map(w => ({
      districtId: w.areaNumber,
      winner: this.toLegacyCandidate(w),
      summary: this.makeSummary(w),
    })),
  );

  leadingPartyByDistrict = computed(() => {
    const map = new Map<number, number>();
    this.districtWinners().forEach(w => map.set(w.districtId, w.winner.partyId));
    return map;
  });

  partySummary = computed(() => {
    const seatCount = new Map<number, { party: CouncilParty; seats: number }>();
    for (const w of this.districtWinners()) {
      const party = this.partyMap().get(w.winner.partyId);
      if (!party) continue;
      const entry = seatCount.get(w.winner.partyId);
      if (entry) {
        entry.seats++;
      } else {
        seatCount.set(w.winner.partyId, { party, seats: 1 });
      }
    }
    return Array.from(seatCount.values()).sort((a, b) => b.seats - a.seats);
  });

  constructor() {
    this.fetchCouncil2026();
  }

  async fetchCouncil2026(): Promise<void> {
    this.isLoading.set(true);
    try {
      const all: CouncilCandidate2026[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await lastValueFrom(
          this.http.get<{
            success: boolean;
            data: { candidates: CouncilCandidate2026[]; pagination: { hasMore: boolean } };
          }>(`${this.govApiUrl}/elections/bkk-council-2026/auto/candidates`, {
            params: { page: page.toString(), limit: '100' },
          }),
        );
        if (res.success && res.data.candidates.length > 0) {
          all.push(...res.data.candidates);
          hasMore = res.data.pagination.hasMore;
          page++;
        } else {
          hasMore = false;
        }
      }

      this.council2026All.set(all);

      // Find winner (highest totalVotes) per areaNumber
      const areaMap = new Map<number, CouncilCandidate2026>();
      for (const c of all) {
        const existing = areaMap.get(c.areaNumber);
        if (!existing || c.totalVotes > existing.totalVotes) {
          areaMap.set(c.areaNumber, c);
        }
      }
      this.council2026Winners.set(
        Array.from(areaMap.values()).sort((a, b) => a.areaNumber - b.areaNumber),
      );
    } catch (err) {
      console.error('Council 2026 API error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  getDistrictSummary(districtId: number): CouncilDistrictSummary | undefined {
    const winner = this.council2026Winners().find(w => w.areaNumber === districtId);
    return winner ? this.makeSummary(winner) : undefined;
  }

  candidatesByDistrict = (districtId: number) =>
    this.candidates().filter(c => c.areaNumber === districtId);

  private toLegacyCandidate(c: CouncilCandidate2026): CouncilCandidate {
    const stripped = c.name.replace(/^(นาย|นาง|นางสาว)\s*/, '');
    const parts = stripped.split(' ');
    return {
      number: c.number,
      firstName: parts[0] ?? c.name,
      lastName: parts.slice(1).join(' '),
      fullName: c.name,
      partyId: parseInt(c.party.code) || 0,
      imgUrl: '',
      areaNumber: c.areaNumber,
    };
  }

  private makeSummary(w: CouncilCandidate2026): CouncilDistrictSummary {
    return {
      number: w.areaNumber,
      interestingFactor: 0,
      leaders: [{ number: w.number, rank: 1, totalVotes: w.totalVotes, percentVotes: w.percentage }],
      overallStatistics: {
        totalVotes: w.totalVotes,
        goodVotes: w.totalVotes,
        badVotes: 0,
        noVotes: 0,
        percentGoodVotes: 100,
        percentBadVotes: 0,
        percentNoVotes: 0,
        totalEligible: 0,
      },
    };
  }
}
