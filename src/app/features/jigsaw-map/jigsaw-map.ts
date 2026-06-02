import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapStateService } from '../../core/services/map-state';
import { ElectionService } from '../../core/services/election.service';
import { CouncilService } from '../../core/services/council.service';
import { ThaiPBSService } from '../../core/services/thai-pbs.service';
import { DISTRICT_LAYOUTS, District } from '../../core/constants/map-layout.constants';
import { DISTRICT_MAP_NAMES } from '../../core/constants/map-names.constants';
import { sumVotes, calcPercent } from '../../core/utils/election.utils';

// =========================================================================
// ขนาดพิกัดและการก้าวแผ่นบนตาราง (Perfect Layout Constants)
// =========================================================================
const COL_STEP = 9.6;
const ROW_STEP = 10.3;

@Component({
  selector: 'app-jigsaw-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jigsaw-map.html',
  styleUrl: './jigsaw-map.css',
})
export class JigsawMap {
  mapState = inject(MapStateService);
  private electionService = inject(ElectionService);
  councilService = inject(CouncilService);
  private thaipbs = inject(ThaiPBSService);

  readonly districts = this.mapState.districts;
  private readonly pathCache = new Map<number, string>();

  constructor() {
    for (const d of DISTRICT_LAYOUTS) {
      this.pathCache.set(d.id, this.buildPiecePath(d.col, d.row));
    }
  }

  pathFor(id: number): string {
    return this.pathCache.get(id) ?? '';
  }

  cellLeft(d: District): number {
    return (d.col - 1) * COL_STEP;
  }
  cellTop(d: District): number {
    return (d.row - 1) * ROW_STEP;
  }

  private buildPiecePath(col: number, row: number): string {
    // ระบบสลับฟันปลาแบบกระดานหมากรุก (Checkerboard Pattern Logic)
    const isEvenCol = col % 2 === 0;
    const isEvenRow = row % 2 === 0;

    const topOut = isEvenCol;
    const bottomOut = !isEvenCol;
    const leftOut = isEvenRow;
    const rightOut = !isEvenRow;

    // =========================================================================
    // 🛠️ คลี่คลายสูตรเด็ด: ลายเส้นครึ่งวงกลมแท้ (Geometric SVG Arc Formula)
    // ใช้คำสั่ง 'A' บังคับสร้างเส้นโค้งมนชิ้นเดียวรัศมี 12.5 หน่วย (ครึ่งวงกลมสวยๆ)
    // วิ่งตัดจากตำแหน่ง 37.5 ไปจบที่ 62.5 ของแต่ละด้านพอดีเป๊ะ ไร้เขางอกแน่นอน!
    // =========================================================================

    // 1. ขอบด้านบน (Top Side): วิ่งจากซ้ายไปขวา (X: 0 -> 100)
    // จุดเริ่ม 37.5, จุดจบ 62.5 | ยื่นสลักขึ้นบน (โค้งทวนเข็ม) / เว้าลงข้างล่าง (โค้งตามเข็ม)
    const topPath = topOut
      ? `L 37.5,0 A 12.5,12.5 0 0,1 62.5,0`
      : `L 37.5,0 A 12.5,12.5 0 0,0 62.5,0`;

    // 2. ขอบด้านขวา (Right Side): วิ่งจากบนลงล่าง (Y: 0 -> 100)
    // จุดเริ่ม 37.5, จุดจบ 62.5 | ยื่นออกไปขวา (โค้งตามเข็ม) / เว้าเข้าเนื้อแผ่น (โค้งทวนเข็ม)
    const rightPath = rightOut
      ? `L 100,37.5 A 12.5,12.5 0 0,1 100,62.5`
      : `L 100,37.5 A 12.5,12.5 0 0,0 100,62.5`;

    // 3. ขอบด้านล่าง (Bottom Side): วิ่งย้อนจากขวาไปซ้าย (X: 100 -> 0)
    // จุดเริ่ม 62.5, จุดจบ 37.5 | ยื่นลงไปข้างล่าง (โค้งตามเข็ม) / เว้ากลับขึ้นบน (โค้งทวนเข็ม)
    const bottomPath = bottomOut
      ? `L 62.5,100 A 12.5,12.5 0 0,1 37.5,100`
      : `L 62.5,100 A 12.5,12.5 0 0,0 37.5,100`;

    // 4. ขอบด้านซ้าย (Left Side): วิ่งย้อนจากล่างขึ้นบน (Y: 100 -> 0)
    // จุดเริ่ม 62.5, จุดจบ 37.5 | ยื่นออกไปซ้าย (โค้งทวนเข็ม) / เว้าเข้าเนื้อแผ่น (โค้งตามเข็ม)
    const leftPath = leftOut
      ? `L 0,62.5 A 12.5,12.5 0 0,1 0,37.5`
      : `L 0,62.5 A 12.5,12.5 0 0,0 0,37.5`;

    // ลากเส้นตรงปิดกรอบสี่เหลี่ยมสมบูรณ์แบบ
    return [
      `M 0,0`,
      `${topPath} L 100,0`,
      `${rightPath} L 100,100`,
      `${bottomPath} L 0,100`,
      `${leftPath} Z`,
    ].join(' ');
  }

  getColor(id: number): string {
    if (this.mapState.activeTab() === 'sk') {
      const partyId = this.councilService.leadingPartyByDistrict().get(id);
      const party = partyId ? this.thaipbs.partyMap().get(partyId) : null;
      return party ? party.color : '#1a3a2a';
    }
    const leadingId = this.electionService.getLeadingCandidateId(id);
    const c = leadingId != null ? this.electionService.candidateMap().get(leadingId) : undefined;
    return c ? c.color : '#1e293b';
  }

  isHighlighted(id: number): boolean {
    const sel = this.mapState.selectedCandidateId();
    return sel !== null && this.electionService.getLeadingCandidateId(id) === sel;
  }

  isFaded(id: number): boolean {
    const sel = this.mapState.selectedCandidateId();
    return sel !== null && this.electionService.getLeadingCandidateId(id) !== sel;
  }

  getShortName(id: number): string {
    return DISTRICT_MAP_NAMES[id] || '';
  }
  isLongName(id: number): boolean {
    return this.getShortName(id).length >= 7;
  }

  selectDistrict(id: number) {
    this.mapState.selectedDistrictId.set(id);
    this.mapState.selectedCandidateId.set(null);
  }

  getDistrictTooltipData(id: number) {
    return this.mapState.activeTab() === 'sk'
      ? this.getCouncilTooltip(id)
      : this.getGovernorTooltip(id);
  }

  private getGovernorTooltip(id: number) {
    const result = this.electionService.getDistrictResults(id);
    if (!result?.candidateResults.length) return null;
    const top = [...result.candidateResults].sort((a, b) => b.votes - a.votes)[0];
    const info = this.electionService.candidateMap().get(top.candidateId);
    if (!info) return null;
    const total = sumVotes(result.candidateResults);
    return {
      type: 'governor' as const,
      candidateName: info.name,
      partyName: info.party,
      color: info.color,
      imageUrl: info.imageUrl,
      partyLogoUrl: info.partyLogoUrl,
      votes: top.votes,
      percentage: calcPercent(top.votes, total),
    };
  }

  private getCouncilTooltip(id: number) {
    const partyId = this.councilService.leadingPartyByDistrict().get(id);
    const party = partyId ? this.thaipbs.partyMap().get(partyId) : null;
    const count = this.councilService.candidatesByDistrict(id).length;
    if (!count) return null;
    return {
      type: 'council' as const,
      partyName: party?.partyName ?? '',
      partyLogoUrl: party?.partyLogoUrl ?? '',
      color: party?.color ?? '#64748b',
      count,
    };
  }
}
