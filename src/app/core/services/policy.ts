import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

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
  countedDistricts: number;
  totalDistricts: number;
  lastUpdated: string;
  electionYear: number;
}

@Injectable({
  providedIn: 'root'
})
export class PolicyService {
  private mockCandidates: Candidate[] = [
    {
      id: 1,
      name: 'ชัชชาติ สิทธิพันธุ์',
      party: 'อิสระ',
      number: 8,
      votes: 1386769,
      percentage: 52.65,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Chadchart_Sittipunt_%28May_2022%29_at_Sala_Daeng_-_img_03.jpg/440px-Chadchart_Sittipunt_%28May_2022%29_at_Sala_Daeng_-_img_03.jpg',
      color: '#22c55e'
    },
    {
      id: 2,
      name: 'สุชัชวีร์ สุวรรณสวัสดิ์',
      party: 'ประชาธิปัตย์',
      number: 4,
      votes: 254723,
      percentage: 9.67,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Suchatvee_Suwansawat_October_14_2022.jpg/440px-Suchatvee_Suwansawat_October_14_2022.jpg',
      color: '#3b82f6'
    },
    {
      id: 3,
      name: 'วิโรจน์ ลักขณาอดิศร',
      party: 'ก้าวไกล (เดิม)',
      number: 1,
      votes: 253938,
      percentage: 9.64,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Wiroj_Lakkhanaadisorn_2022.jpg/440px-Wiroj_Lakkhanaadisorn_2022.jpg',
      color: '#f97316'
    },
    {
      id: 4,
      name: 'สกลธี ภัททิยกุล',
      party: 'อิสระ',
      number: 3,
      votes: 230534,
      percentage: 8.75,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Sakoltee_Phattiyakul_%282018%29.png/440px-Sakoltee_Phattiyakul_%282018%29.png',
      color: '#3b82f6'
    },
    {
      id: 5,
      name: 'พล.ต.อ.อัศวิน ขวัญเมือง',
      party: 'อิสระ',
      number: 6,
      votes: 214805,
      percentage: 8.15,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Asawin_Khwanmueang_%28crop%29.jpg/440px-Asawin_Khwanmueang_%28crop%29.jpg',
      color: '#a855f7'
    },
    {
      id: 6,
      name: 'รสนา โตสิตระกูล',
      party: 'อิสระ',
      number: 7,
      votes: 79009,
      percentage: 3.00,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Rosana_Tositrakul.jpg/440px-Rosana_Tositrakul.jpg',
      color: '#ec4899'
    },
  ];

  state = signal<ElectionData | null>(null);

  candidates = computed(() => this.state()?.candidates || []);

  private districtResultsMap = computed(() => {
    const map = new Map<number, DistrictResult>();
    const results = this.state()?.districtResults;
    if (results) {
      results.forEach(r => map.set(r.districtId, r));
    }
    return map;
  });

  totalVotes = computed(() => this.state()?.totalVotes || 0);
  countedDistricts = computed(() => this.state()?.countedDistricts || 0);
  totalDistricts = computed(() => this.state()?.totalDistricts || 50);
  lastUpdated = computed(() => this.state()?.lastUpdated || 'Official Final Result');
  electionYear = computed(() => this.state()?.electionYear || 2022);

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private mockPolicies: Record<number, { category: string; description: string }[]> = {
    1: [
      { category: 'การจราจร', description: 'พัฒนาระบบขนส่งมวลชนสาธารณะให้เชื่อมต่อกันอย่างเป็นระบบ ลดค่าโดยสาร' },
      { category: 'สิ่งแวดล้อม', description: 'เพิ่มพื้นที่สีเขียว 1,000 ไร่ทั่วกรุงเทพฯ และจัดการขยะอย่างยั่งยืน' },
      { category: 'เศรษฐกิจ', description: 'กระตุ้นเศรษฐกิจชุมชนผ่านตลาดนัดชุมชนและสนับสนุน SME ค้าขายออนไลน์' },
      { category: 'การศึกษา', description: 'ยกระดับโรงเรียนในสังกัด กทม. ให้มีมาตรฐานเทียบเท่าโรงเรียนนานาชาติ' },
      { category: 'สาธารณสุข', description: 'ขยายศูนย์บริการสาธารณสุข ยกระดับบริการ Telemedicine ลดความแออัด' }
    ],
    2: [
      { category: 'การจราจร', description: 'สร้างอุโมงค์ทางลอดแก้ปัญหาจุดตัดจราจรหลัก ลดปัญหาคอขวด' },
      { category: 'สิ่งแวดล้อม', description: 'ติดตั้งเครื่องฟอกอากาศขนาดยักษ์ตามจุดเสี่ยง PM 2.5 จัดการฝุ่นที่ต้นทาง' },
      { category: 'เศรษฐกิจ', description: 'สร้างโซนเศรษฐกิจพิเศษในระดับเขต ดึงดูดการลงทุนจากต่างประเทศ' },
      { category: 'การศึกษา', description: 'สอนโค้ดดิ้งและทักษะแห่งอนาคตในทุกระดับชั้นของโรงเรียน กทม.' },
      { category: 'สาธารณสุข', description: 'สร้างโรงพยาบาลระดับเขตเพิ่ม 4 แห่ง เพิ่มรถพยาบาลฉุกเฉิน 100 คัน' }
    ],
  };

  private http = inject(HttpClient, { optional: true });

  constructor() {
    this.initializeDistrictResults();
    this.startLiveSimulation();
  }

  private initializeDistrictResults() {
    const districtResults: DistrictResult[] = [];
    for (let i = 1; i <= 50; i++) {
      districtResults.push({
        districtId: i,
        candidateResults: this.mockCandidates.map(c => ({
          candidateId: c.id,
          votes: Math.floor((c.votes / 50) * (0.85 + Math.random() * 0.3))
        }))
      });
    }

    this.state.set({
      candidates: [...this.mockCandidates],
      districtResults,
      totalVotes: 2673696,
      countedDistricts: 50,
      totalDistricts: 50,
      lastUpdated: 'Official Final Result',
      electionYear: 2022
    });
  }

  getDistrictResults(districtId: number): DistrictResult | undefined {
    return this.districtResultsMap().get(districtId);
  }

  getLeadingCandidateId(districtId: number): number | undefined {
    const result = this.getDistrictResults(districtId);
    if (!result) return undefined;
    return [...result.candidateResults].sort((a, b) => b.votes - a.votes)[0].candidateId;
  }

  getCandidatePolicies(candidateId: number) {
    return this.mockPolicies[candidateId] || this.mockPolicies[1];
  }

  private startLiveSimulation() {
    this.refreshData();
    setInterval(() => this.refreshData(), 10000);
  }

  async fetchLiveApiData() {
    if (!this.http) return;
    this.isLoading.set(true);
    try {
      // API call placeholder
    } catch (err) {
      this.error.set('ไม่สามารถเชื่อมต่อ API ได้');
    } finally {
      this.isLoading.set(false);
    }
  }

  async refreshData() {
    this.simulateDataUpdate();
  }

  private simulateDataUpdate() {
    const currentState = this.state();
    if (!currentState) return;

    const currentCandidates = currentState.candidates.map(c => ({ ...c }));
    const currentDistrictResults = currentState.districtResults.map(d => ({
      ...d,
      candidateResults: d.candidateResults.map(cr => ({ ...cr }))
    }));

    for (let i = 0; i < 3; i++) {
      const randomDistrictId = Math.floor(Math.random() * 50) + 1;
      const district = currentDistrictResults.find(d => d.districtId === randomDistrictId);

      if (district) {
        district.candidateResults.forEach(cr => {
          const delta = Math.floor(Math.random() * 30);
          cr.votes += delta;
          const cand = currentCandidates.find(c => c.id === cr.candidateId);
          if (cand) cand.votes += delta;
        });
      }
    }

    const totalVotes = currentCandidates.reduce((sum, c) => sum + c.votes, 0);
    currentCandidates.forEach(c => {
      c.percentage = Number(((c.votes / totalVotes) * 100).toFixed(2));
    });

    const now = new Date();
    const lastUpdated = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} น.`;

    this.state.set({
      ...currentState,
      candidates: currentCandidates,
      districtResults: currentDistrictResults,
      totalVotes,
      lastUpdated
    });
  }
}
