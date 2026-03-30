import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ELECTION_CONSTANTS } from '../constants/election.constants';
import { Candidate, CandidatePolicy, DistrictResult, ElectionData } from '../models/election.models';
import { CANDIDATE_POLICIES, DEFAULT_POLICIES } from '../constants/policies.constants';

// Mock: คะแนนรวมต่อผู้สมัคร (รวม = 3,561,583 = บัตรดี)
const MOCK_CANDIDATE_VOTES: Record<number, number> = {
  8: 1353401,  // 38.01% — ชนะ
  11: 534237,  // 15.00% — อันดับ 2
  1: 284927,  // 8.00%
  4: 249311,  // 7.00%
  6: 213695,  // 6.00%
  3: 178079,  // 5.00%
  7: 142463,  // 4.00%
  2: 89040,  // 2.50%
  5: 85478,  // 2.40%
  9: 78355,  // 2.20%
  10: 74793,  // 2.10%
  12: 71232,  // 2.00%
  14: 71232,  // 2.00%
  13: 67670,  // 1.90%
  15: 67670,  // 1.90%
};

const MOCK_GOOD_VOTES = 3561583;
const MOCK_BAD_VOTES = 1244;
const MOCK_ELIGIBLE = 4402941;
const MOCK_NO_VOTES = MOCK_ELIGIBLE - (MOCK_GOOD_VOTES + MOCK_BAD_VOTES); // 840,114

// ผู้สมัครที่นำในแต่ละเขต
// #8: 23 เขต | #11: 7 เขต | #1: 3 | #4: 3 | #6: 2 | #3: 2 | #7: 2
// #2,#5,#9,#10,#12,#13,#14,#15: คนละ 1 เขต = 8 เขต → รวม 50
const MOCK_DISTRICT_LEADERS: number[] = [
  8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,  // 23 เขต
  11, 11, 11, 11, 11, 11, 11,                                  // 7 เขต
  1, 1, 1,                                                  // 3 เขต
  4, 4, 4,                                                  // 3 เขต
  6, 6,                                                    // 2 เขต
  3, 3,                                                    // 2 เขต
  7, 7,                                                    // 2 เขต
  2, 5, 9, 10, 12, 13, 14, 15                             // 1 เขตต่อคน
];

@Injectable({
  providedIn: 'root'
})
export class ElectionService {
  electionState = signal<ElectionData | null>(null);

  candidates = computed(() => this.electionState()?.candidates || []);

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
  lastUpdated = computed(() => this.electionState()?.lastUpdated || '');
  electionYear = computed(() => this.electionState()?.electionYear || 2026);
  progressPercent = computed(() => this.electionState()?.progressPercent || 0);

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private http = inject(HttpClient);
  private apiUrl = ELECTION_CONSTANTS.API.SUMMARY;

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
      const data: any = await lastValueFrom(this.http.get(this.apiUrl));
      if (!data || !data.candidates) return;

      const candidates: Candidate[] = data.candidates
        .filter((c: any) => c.idno <= 15)
        .map((c: any) => {
          let name = c._raw.fullName;
          ELECTION_CONSTANTS.NAME_PREFIXES.forEach(prefix => {
            name = name.replace(prefix, '');
          });

          const mockVotes = MOCK_CANDIDATE_VOTES[c.idno] || 0;

          return {
            id: c.idno,
            name: name.trim(),
            party: c._raw.party.name,
            number: c.idno,
            votes: mockVotes,
            percentage: Number(((mockVotes / MOCK_GOOD_VOTES) * 100).toFixed(2)),
            imageUrl: c._raw.avatarURL,
            partyLogoUrl: ELECTION_CONSTANTS.ASSETS.PARTY_LOGO.replace('{id}', c._raw.party.id.toString()),
            color: this.getCandidateColor(c.idno)
          };
        });

      this.electionState.update(current => ({
        ...current,
        candidates,
        totalVotes: MOCK_ELIGIBLE,
        goodVotes: MOCK_GOOD_VOTES,
        badVotes: MOCK_BAD_VOTES,
        noVotes: MOCK_NO_VOTES,
        eligibleVoters: MOCK_ELIGIBLE,
        actualVoters: MOCK_ELIGIBLE,
        turnoutPercent: 100,
        countedDistricts: 50,
        totalDistricts: 50,
        lastUpdated: 'นับคะแนนเสร็จสิ้น',
        electionYear: 2026,
        progressPercent: 100,
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
      const candidateIds = Array.from({ length: 15 }, (_, i) => i + 1);

      // Seeded pseudo-random for deterministic results
      let seed = 42;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };

      const districtResults: DistrictResult[] = Array.from({ length: 50 }).map((_, i) => {
        const districtId = i + 1;
        const leader = MOCK_DISTRICT_LEADERS[i];
        const districtTotalVotes = 60000 + Math.floor(rand() * 25000);

        // สร้าง weight สำหรับแต่ละผู้สมัครในเขตนี้
        const weights = new Map<number, number>();
        candidateIds.forEach(cid => {
          if (cid === leader) {
            weights.set(cid, 35 + rand() * 15);       // ผู้นำเขต: 35-50%
          } else if (cid === 8 && leader !== 8) {
            weights.set(cid, 15 + rand() * 10);        // #8 แข็งทุกเขต: 15-25%
          } else if (cid === 11 && leader !== 11) {
            weights.set(cid, 8 + rand() * 7);          // #11 อันดับ 2: 8-15%
          } else {
            weights.set(cid, 1 + rand() * 4);          // อื่นๆ: 1-5%
          }
        });

        const totalWeight = Array.from(weights.values()).reduce((a, b) => a + b, 0);

        const candidateResults = candidateIds.map(cid => ({
          candidateId: cid,
          votes: Math.max(1, Math.floor((weights.get(cid)! / totalWeight) * districtTotalVotes))
        }));

        return { districtId, candidateResults };
      });

      this.electionState.update(current => {
        if (!current) {
          return {
            candidates: [],
            totalVotes: MOCK_ELIGIBLE,
            goodVotes: MOCK_GOOD_VOTES,
            badVotes: MOCK_BAD_VOTES,
            noVotes: MOCK_NO_VOTES,
            eligibleVoters: MOCK_ELIGIBLE,
            actualVoters: MOCK_ELIGIBLE,
            turnoutPercent: 100,
            countedDistricts: 50,
            totalDistricts: 50,
            lastUpdated: 'นับคะแนนเสร็จสิ้น',
            electionYear: 2026,
            progressPercent: 100,
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

  private getCandidateColor(no: number): string {
    return ELECTION_CONSTANTS.CANDIDATE_COLORS[no] || ELECTION_CONSTANTS.CANDIDATE_COLORS['def'];
  }

  getDistrictResults(districtId: number): DistrictResult | undefined {
    return this.districtResultsMap().get(districtId);
  }

  getLeadingCandidateId(districtId: number): number | undefined {
    const result = this.getDistrictResults(districtId);
    if (!result) return undefined;
    const sorted = [...result.candidateResults].sort((a, b) => b.votes - a.votes);
    if (!sorted.length || sorted[0].votes === 0) return undefined;
    return sorted[0]?.candidateId;
  }

  getCandidatePolicies(candidateId: number): CandidatePolicy[] {
    return CANDIDATE_POLICIES[candidateId] || DEFAULT_POLICIES;
  }
}
