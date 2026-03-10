import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ELECTION_CONSTANTS } from '../constants/election.constants';

export interface Candidate {
  id: number;
  name: string;
  party: string;
  number: number;
  votes: number;
  percentage: number;
  imageUrl: string;
  color: string;
}

export interface CandidatePolicy {
  category: string;
  description: string;
}

export interface DistrictResult {
  districtId: number;
  candidateResults: {
    candidateId: number;
    votes: number;
  }[];
}

export interface ElectionData {
  candidates: Candidate[];
  districtResults: DistrictResult[];
  totalVotes: number;
  goodVotes: number;
  badVotes: number;
  noVotes: number;
  eligibleVoters: number;
  actualVoters: number;
  turnoutPercent: number;
  countedDistricts: number;
  totalDistricts: number;
  lastUpdated: string;
  electionYear: number;
  progressPercent: number;
}

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
  lastUpdated = computed(() => this.electionState()?.lastUpdated || 'Official Final Result');
  electionYear = computed(() => this.electionState()?.electionYear || 2022);
  progressPercent = computed(() => this.electionState()?.progressPercent || 0);

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private http = inject(HttpClient);
  private apiUrl = ELECTION_CONSTANTS.API.SUMMARY;
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
    if (!this.http) return;
    this.isLoading.set(true);
    try {
      const data: any = await lastValueFrom(this.http.get(this.apiUrl));
      if (!data || !data.candidates) return;

      const candidates: Candidate[] = data.candidates.map((c: any) => {
        let name = c._raw.fullName;
        ELECTION_CONSTANTS.NAME_PREFIXES.forEach(prefix => {
          name = name.replace(prefix, '');
        });

        return {
          id: c.idno,
          name: name.trim(),
          party: c._raw.party.name,
          number: c.idno,
          votes: c.score,
          percentage: Number(c.scorePercent.toFixed(2)),
          imageUrl: c._raw.avatarURL,
          color: this.getCandidateColor(c.idno)
        };
      });

      const rawSummary = data._rawSummary?.data;

      this.electionState.update(current => ({
        ...current,
        candidates,
        totalVotes: data.summary,
        goodVotes: rawSummary?.goodVotes || 0,
        badVotes: rawSummary?.badVotes || 0,
        noVotes: rawSummary?.noVotes || 0,
        eligibleVoters: rawSummary?.eligible || 0,
        actualVoters: rawSummary?.voter || 0,
        turnoutPercent: rawSummary?.percentVoter || 0,
        countedDistricts: Math.floor(data.summaryPercent / 2),
        totalDistricts: 50,
        lastUpdated: `อัปเดตล่าสุด ${data.updateAt} น. (${data.summaryPercent}%)`,
        electionYear: 2022,
        progressPercent: data.summaryPercent || 0,
        districtResults: current?.districtResults || []
      }));
    } catch (err) {
      console.error('API Error:', err);
      this.error.set('ไม่สามารถเชื่อมต่อ API ได้');
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchDistrictResults() {
    if (!this.http) return;
    try {
      const data: any = await lastValueFrom(this.http.get(this.districtApiUrl));
      if (!data || !data.districts) return;

      const districtResults: DistrictResult[] = data.districts.map((d: any, index: number) => ({
        districtId: index + 1,
        candidateResults: d.candidates.map((c: any) => ({
          candidateId: c.idno,
          votes: c.score
        }))
      }));

      this.electionState.update(current => {
        if (!current) return null;
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
    return sorted[0]?.candidateId;
  }

  getCandidatePolicies(candidateId: number): CandidatePolicy[] {
    const policies: Record<number, CandidatePolicy[]> = {
      8: [
        { category: 'การเดินทาง', description: 'รถเมล์ไฟฟ้าครอบคลุมทุกเส้นทาง เชื่อมต่อล้อ-ราง-เรือ' },
        { category: 'โปร่งใส', description: 'เปิดเผยข้อมูล Open Data และ Open Contract ทุกขั้นตอน' },
        { category: 'สิ่งแวดล้อม', description: 'เพิ่มสวนสาธารณะขนาดเล็ก (Pocket Park) ทั่วกรุงเทพฯ' }
      ],
      4: [
        { category: 'การศึกษา', description: 'โรงเรียนสังกัด กทม. คุณภาพเท่าเทียม กองทุนเพื่อการศึกษา' },
        { category: 'น้ำท่วม', description: 'แก้มลิงใต้ดินอัตโนมัติ แก้ไขปัญหาน้ำท่วมซ้ำซาก' }
      ],
      1: [
        { category: 'สวัสดิการ', description: 'บำนาญผู้สูงอายุ 3,000 บาท และสวัสดิการเด็กแรกเกิด' },
        { category: 'ความปลอดภัย', description: 'เปลี่ยนเมืองพังๆ ให้เป็นเมืองที่ทุกคนเดินได้ปลอดภัย' }
      ]
    };
    return policies[candidateId] || [
      { category: 'ทั่วไป', description: 'พัฒนาระบบสาธารณูปโภคและโครงสร้างพื้นฐานเพื่อคุณภาพชีวิตที่ดีขึ้น' },
      { category: 'บริการสาธารณะ', description: 'ยกระดับการให้บริการประชาชนด้วยระบบดิจิทัล' }
    ];
  }
}
