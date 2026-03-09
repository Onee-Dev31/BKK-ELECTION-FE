import { Injectable, computed, inject, signal } from '@angular/core';
import { MapStateService } from './map-state';
import { PolicyService } from './policy';

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
  private policyService = inject(PolicyService);

  searchQuery = signal('');

  // Combine and filter data based on the query
  searchResults = computed<SearchResult[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return [];

    const results: SearchResult[] = [];

    // Search Candidates
    this.policyService.candidates().forEach(c => {
      let score = 0;
      if (c.name.toLowerCase().includes(q)) score += 10;
      if (c.party.toLowerCase().includes(q)) score += 5;
      if (c.number.toString() === q) score += 20; // Exact match on number

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

    // Search Districts
    this.mapState.districts().forEach(d => {
      const mockName = this.getMockDistrictName(d.number);
      let score = 0;
      if (mockName.toLowerCase().includes(q)) score += 10;
      if (d.number.toString() === q) score += 20; // Exact match on number

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

    // Sort by descending score
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8); // Top 8 results
  });

  private getMockDistrictName(id: number | undefined): string {
    const names = [
      'พระนคร', 'ดุสิต', 'หนองจอก', 'บางรัก', 'บางเขน', 'บางกะปิ', 'ปทุมวัน',
      'ป้อมปราบศัตรูพ่าย', 'พระโขนง', 'มีนบุรี', 'ลาดกระบัง', 'ยานนาวา', 'สัมพันธวงศ์',
      'พญาไท', 'ธนบุรี', 'บางกอกใหญ่', 'ห้วยขวาง', 'คลองสาน', 'ตลิ่งชัน', 'บางกอกน้อย',
      'บางขุนเทียน', 'ภาษีเจริญ', 'หนองแขม', 'ราษฎร์บูรณะ', 'บางพลัด', 'ดินแดง',
      'บึงกุ่ม', 'สาทร', 'บางซื่อ', 'จตุจักร', 'บางคอแหลม', 'ประเวศ', 'คลองเตย',
      'สวนหลวง', 'จอมทอง', 'ดอนเมือง', 'ราชเทวี', 'ลาดพร้าว', 'วัฒนา', 'บางแค',
      'หลักสี่', 'สายไหม', 'คันนายาว', 'สะพานสูง', 'วังทองหลาง', 'คลองสามวา', 'บางนา',
      'ทวีวัฒนา', 'ทุ่งครุ', 'บางบอน'
    ];
    if (!id || id < 1 || id > 50) return 'ไม่ทราบ';
    return names[id - 1];
  }
}    
