import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ELECTION_CONSTANTS } from '../constants/election.constants';
import { Candidate, CandidatePolicy, DistrictResult, ElectionData } from '../models/election.models';
import { CANDIDATE_POLICIES, DEFAULT_POLICIES } from '../constants/policies.constants';

@Injectable({
  providedIn: 'root'
})
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
    const results = this.electionState()?.districtResults;
    if (results) {
      results.forEach(r => map.set(r.districtId, r));
    }
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
  totalDistricts = computed(() => this.electionState()?.totalDistricts || 50);
  lastUpdated = computed(() => this.electionState()?.lastUpdated || 'Official Final Result');
  electionYear = computed(() => this.electionState()?.electionYear || 2022);
  progressPercent = computed(() => this.electionState()?.progressPercent || 0);

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private http = inject(HttpClient);
  private apiUrl = ELECTION_CONSTANTS.API.GOVERNOR_AUTO_CANDIDATES;
  private districtApiUrl = ELECTION_CONSTANTS.API.DISTRICTS;

  constructor() {
    this.refreshData();
    setInterval(() => this.refreshData(), 60000);
  }

  async refreshData() {
    await Promise.all([
      this.fetchOverallSummary(),
      this.fetchDistrictResults()
    ]);
  }

  async fetchOverallSummary() {
    this.isLoading.set(true);
    try {
      const listRes: any = await lastValueFrom(this.http.get(this.apiUrl));
      if (!listRes?.data?.candidates?.length) return;

      const { candidates: candidateList, statistics, coverage, lastUpdate } = listRes.data;

      const detailResponses: any[] = await Promise.all(
        candidateList.map((c: any) =>
          lastValueFrom(this.http.get(`${this.apiUrl}/${c.id}`))
        )
      );

      const candidates: Candidate[] = detailResponses.map((res: any) => {
        const detail = res.data.candidate;
        const summary = candidateList.find((c: any) => c.id === detail.id);

        let name: string = detail.name ?? '';
        ELECTION_CONSTANTS.NAME_PREFIXES.forEach(prefix => {
          name = name.replace(prefix, '');
        });

        return {
          id: detail.number,
          name: name.trim(),
          party: detail.party?.name ?? '',
          number: detail.number,
          votes: summary?.totalVotes ?? 0,
          percentage: Number((summary?.percentage ?? 0).toFixed(2)),
          imageUrl: ELECTION_CONSTANTS.ASSETS.CANDIDATE_IMAGE.replace('{no}', detail.number.toString()),
          partyLogoUrl: '',
          color: detail.party?.color ?? ELECTION_CONSTANTS.CANDIDATE_COLORS['def']
        };
      }).sort((a: Candidate, b: Candidate) => b.votes - a.votes);

      this.preloadCandidateAssets(candidates.slice(0, 5));

      const coveragePct = coverage?.percentage ?? 0;
      const lastUpdateDate = new Date(lastUpdate);
      const timeStr = lastUpdateDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

      this.electionState.update(current => ({
        ...current,
        candidates,
        totalVotes: statistics?.totalVotes ?? 0,
        goodVotes: statistics?.goodVotes ?? 0,
        badVotes: statistics?.invalidVotes ?? 0,
        noVotes: statistics?.noVotes ?? 0,
        eligibleVoters: statistics?.eligibleVoters ?? 0,
        actualVoters: statistics?.totalVotes ?? 0,
        turnoutPercent: statistics?.voterTurnoutPercentage ?? 0,
        countedDistricts: Math.round(coveragePct / 100 * 50),
        totalDistricts: 50,
        lastUpdated: `อัปเดตล่าสุด ${timeStr} น. (${coveragePct.toFixed(1)}%)`,
        electionYear: 2026,
        progressPercent: coveragePct,
        districtResults: current?.districtResults || []
      }) as ElectionData);
    } catch (err) {
      console.error('API Error:', err);
      this.error.set('ไม่สามารถเชื่อมต่อ API ได้');
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchDistrictResults() {
    try {
      const data: any = await lastValueFrom(this.http.get(this.districtApiUrl));
      if (!data || !data.districts) return;

      const districtResults: DistrictResult[] = data.districts.map((d: any) => ({
        districtId: Number(d.id),
        candidateResults: d.candidates.map((c: any) => ({
          candidateId: c.idno,
          votes: c.score
        }))
      }));

      this.electionState.update(current => {
        if (!current) {
          return {
            candidates: [],
            totalVotes: 0,
            goodVotes: 0,
            badVotes: 0,
            noVotes: 0,
            eligibleVoters: 0,
            actualVoters: 0,
            turnoutPercent: 0,
            countedDistricts: 0,
            totalDistricts: 50,
            lastUpdated: '',
            electionYear: 2022,
            progressPercent: 0,
            districtResults
          } as ElectionData;
        }
        return {
          ...current,
          districtResults
        };
      });
    } catch (err) {
      console.error('District API Error:', err);
    }
  }

  private preloadCandidateAssets(candidates: Candidate[]) {
    if (typeof document === 'undefined') return;

    for (const candidate of candidates) {
      this.preloadImage(candidate.imageUrl);
      this.preloadImage(candidate.partyLogoUrl);
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
    const sorted = [...result.candidateResults].sort((a, b) => b.votes - a.votes);
    return sorted[0]?.candidateId;
  }

  getCandidatePolicies(candidateId: number): CandidatePolicy[] {
    return CANDIDATE_POLICIES[candidateId] || DEFAULT_POLICIES;
  }
}
