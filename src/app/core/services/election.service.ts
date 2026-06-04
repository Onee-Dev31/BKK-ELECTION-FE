import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Candidate, CandidatePolicy, DistrictResult, ElectionData, GovernorCandidateResult, GovernorStats, PartyRankingsResponse } from '../models/election.models';
import { CANDIDATE_POLICIES, DEFAULT_POLICIES } from '../constants/policies.constants';
import { CANDIDATE_IMG_FALLBACK, DEFAULT_CANDIDATE_IMAGE } from '../constants/election.constants';
import { environment } from '../../../environments/environment';

const RANK_COLORS = [
  '#f59e0b', '#94a3b8', '#b45309', '#3b82f6', '#8b5cf6',
  '#ec4899', '#10b981', '#f97316', '#06b6d4', '#84cc16',
];

@Injectable({ providedIn: 'root' })
export class ElectionService {
  electionState = signal<ElectionData | null>(null);
  private preloadedImageUrls = new Set<string>();

  candidates = computed(() => this.electionState()?.candidates ?? []);

  candidateMap = computed(() => {
    const map = new Map<number, Candidate>();
    this.candidates().forEach(c => map.set(c.id, c));
    return map;
  });

  private districtResultsMap = computed(() => {
    const map = new Map<number, DistrictResult>();
    this.electionState()?.districtResults?.forEach(r => map.set(r.districtId, r));
    return map;
  });

  totalVotes = computed(() => this.electionState()?.totalVotes || 0);
  goodVotes = computed(() => this.electionState()?.goodVotes || 0);
  badVotes = computed(() => this.electionState()?.badVotes || 0);
  noVotes = computed(() => this.electionState()?.noVotes || 0);
  eligibleVoters = computed(() => this.electionState()?.eligibleVoters || 0);
  actualVoters = computed(() => this.electionState()?.actualVoters || 0);
  turnoutPercent = computed(() => this.electionState()?.turnoutPercent || 0);
  countedDistricts = computed(() => this.electionState()?.countedDistricts || 0);
  totalDistricts = computed(() => this.electionState()?.totalDistricts || 0);
  lastUpdated = computed(() => this.electionState()?.lastUpdated || '');
  electionYear = computed(() => this.electionState()?.electionYear || 2026);
  progressPercent = computed(() => this.electionState()?.progressPercent || 0);

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private http = inject(HttpClient);
  private readonly authApiUrl = `${environment.apiUrl}/auth`;
  private readonly govApiUrl = environment.apiUrl;

  constructor() {
    this.refreshData();
    setInterval(() => this.refreshData(), 60000);
  }

  async refreshData() {
    await this.fetchOverallSummary();
  }

  async fetchOverallSummary() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const [rankingsResult, statsResult, publicCandidatesResult] = await Promise.allSettled([
        Promise.reject<PartyRankingsResponse>('public page — auth endpoint not called'),
        lastValueFrom(
          this.http.get<{ success: boolean; data: GovernorStats }>(
            `${this.govApiUrl}/elections/bkk-governor-2026/auto/statistics`,
          ),
        ),
        lastValueFrom(
          this.http.get<{ success: boolean; data: { candidates: GovernorCandidateResult[] } }>(
            `${this.govApiUrl}/elections/bkk-governor-2026/auto/candidates`,
            { params: { page: '1', limit: '10' } },
          ),
        ),
      ]);

      if (rankingsResult.status === 'rejected' && statsResult.status === 'rejected') {
        this.error.set('ไม่สามารถเชื่อมต่อ API ได้');
        return;
      }

      let candidates: Candidate[] = this.electionState()?.candidates ?? [];

      if (rankingsResult.status === 'fulfilled') {
        candidates = Object.entries(rankingsResult.value)
          .filter(([key]) => /^rank\d+$/.test(key))
          .sort(([a], [b]) => parseInt(a.slice(4)) - parseInt(b.slice(4)))
          .map(([key, entry], index) => {
            const rank = parseInt(key.slice(4));
            return {
              id: rank,
              name: entry.candidate_name,
              party: entry.party_name,
              number: rank,
              votes: entry.score,
              percentage: parseFloat(entry.counted) || 0,
              imageUrl: entry.candidate_img,
              partyLogoUrl: entry.party_logo,
              color: RANK_COLORS[index] ?? '#64748b',
            };
          });
        this.preloadCandidateAssets(candidates.slice(0, 3));
      } else if (
        publicCandidatesResult.status === 'fulfilled' &&
        publicCandidatesResult.value.success
      ) {
        // Fallback for unauthenticated visitors: show top 5, image only if known
        candidates = [...publicCandidatesResult.value.data.candidates]
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 5)
          .map((c, index) => ({
            id: c.rank,
            name: `ผู้สมัครอันดับที่ ${c.rank}`,
            party: '',
            number: c.rank,
            votes: c.totalVotes,
            percentage: parseFloat(c.percentage.toFixed(2)),
            imageUrl: CANDIDATE_IMG_FALLBACK[c.id] ?? DEFAULT_CANDIDATE_IMAGE,
            partyLogoUrl: '',
            color: RANK_COLORS[index] ?? '#64748b',
          }));
        this.preloadCandidateAssets(candidates.slice(0, 3));
      }

      const current = this.electionState();
      const next: ElectionData = {
        candidates,
        districtResults: current?.districtResults ?? [],
        totalVotes: current?.totalVotes ?? 0,
        goodVotes: current?.goodVotes ?? 0,
        badVotes: current?.badVotes ?? 0,
        noVotes: current?.noVotes ?? 0,
        eligibleVoters: current?.eligibleVoters ?? 0,
        actualVoters: 0,
        turnoutPercent: current?.turnoutPercent ?? 0,
        countedDistricts: current?.countedDistricts ?? 0,
        totalDistricts: current?.totalDistricts ?? 0,
        lastUpdated: current?.lastUpdated ?? '',
        electionYear: 2026,
        progressPercent: current?.progressPercent ?? 0,
      };

      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        const live = statsResult.value.data;
        next.totalVotes = live.statistics.totalVotes;
        next.goodVotes = live.statistics.goodVotes;
        next.badVotes = live.statistics.invalidVotes;
        next.noVotes = live.statistics.noVotes;
        next.eligibleVoters = live.statistics.eligibleVoters;
        next.turnoutPercent = live.statistics.voterTurnoutPercentage;
        next.countedDistricts = live.coverage.stationsReported;
        next.totalDistricts = live.coverage.totalStations;
        next.progressPercent = live.coverage.percentage;
        next.lastUpdated = `อัปเดตล่าสุด นับแล้ว ${live.coverage.percentage.toFixed(1)}% (${live.coverage.stationsReported}/${live.coverage.totalStations} หน่วย)`;
      }

      this.electionState.set(next);
    } catch (err) {
      console.error('ElectionService error:', err);
      this.error.set('ไม่สามารถเชื่อมต่อ API ได้');
    } finally {
      this.isLoading.set(false);
    }
  }

  private preloadCandidateAssets(candidates: Candidate[]) {
    if (typeof document === 'undefined') return;
    for (const c of candidates) {
      this.preloadImage(c.imageUrl);
    }
  }

  private preloadImage(url: string) {
    if (!url || this.preloadedImageUrls.has(url)) return;
    this.preloadedImageUrls.add(url);
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }

  getDistrictResults(districtId: number): DistrictResult | undefined {
    return this.districtResultsMap().get(districtId);
  }

  getLeadingCandidateId(districtId: number): number | undefined {
    const result = this.getDistrictResults(districtId);
    if (!result) return undefined;
    return [...result.candidateResults].sort((a, b) => b.votes - a.votes)[0]?.candidateId;
  }

  getCandidatePolicies(candidateId: number): CandidatePolicy[] {
    return CANDIDATE_POLICIES[candidateId] || DEFAULT_POLICIES;
  }
}
