import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapStateService } from '../../core/services/map-state';
import { ElectionService } from '../../core/services/election.service';

@Component({
  selector: 'app-map-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-viewer.html',
  styleUrl: './map-viewer.css',
})
export class MapViewer {
  mapState = inject(MapStateService);
  electionService = inject(ElectionService);
  districts = this.mapState.districts;

  selectDistrict(id: number) {
    this.mapState.selectedDistrictId.set(id);
  }

  getShortName(id: number): string {
    const names: Record<number, string> = {
      1: 'พระนคร', 2: 'ดุสิต', 3: 'หนองจอก', 4: 'บางรัก', 5: 'บางเขน',
      6: 'บางกะปิ', 7: 'ปทุมวัน', 8: 'ป้อมปราบฯ', 9: 'พระโขนง', 10: 'มีนบุรี',
      11: 'ลาดกระบัง', 12: 'ยานนาวา', 13: 'สัมพันธฯ', 14: 'พญาไท', 15: 'ธนบุรี',
      16: 'บางกอกใหญ่', 17: 'ห้วยขวาง', 18: 'คลองสาน', 19: 'ตลิ่งชัน', 20: 'บางกอกน้อย',
      21: 'บางขุนเทียน', 22: 'ภาษีเจริญ', 23: 'หนองแขม', 24: 'ราษฎร์บูรณะ', 25: 'บางพลัด',
      26: 'ดินแดง', 27: 'บึงกุ่ม', 28: 'สาทร', 29: 'บางซื่อ', 30: 'จตุจักร',
      31: 'คอแหลม', 32: 'ประเวศ', 33: 'คลองเตย', 34: 'สวนหลวง', 35: 'จอมทอง',
      36: 'ดอนเมือง', 37: 'ราชเทวี', 38: 'ลาดพร้าว', 39: 'วัฒนา', 40: 'บางแค',
      41: 'หลักสี่', 42: 'สายไหม', 43: 'คันนายาว', 44: 'สะพานสูง', 45: 'วังทองหลาง',
      46: 'สามวา', 47: 'บางนา', 48: 'ทวีวัฒนา', 49: 'ทุ่งครุ', 50: 'บางบอน'
    };
    return names[id] || 'N/A';
  }

  getBackground(candidateId?: number): string {
    const c = this.electionService.candidates().find(can => can.id === candidateId);
    return c ? c.color : '#1e293b';
  }

  getDistrictTooltipData(districtId: number) {
    const result = this.electionService.getDistrictResults(districtId);
    if (!result || !result.candidateResults.length) return null;

    const topResult = [...result.candidateResults].sort((a, b) => b.votes - a.votes)[0];
    const candidateInfo = this.electionService.candidates().find(c => c.id === topResult.candidateId);

    if (!candidateInfo) return null;

    const totalDistrictVotes = result.candidateResults.reduce((sum, curr) => sum + curr.votes, 0);
    const percentage = totalDistrictVotes > 0 ? ((topResult.votes / totalDistrictVotes) * 100).toFixed(2) : '0.00';

    return {
      candidateName: candidateInfo.name,
      partyName: candidateInfo.party,
      color: candidateInfo.color,
      votes: topResult.votes,
      percentage: percentage
    };
  }
}
