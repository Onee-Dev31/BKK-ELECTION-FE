import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapStateService } from '../../core/services/map-state';
import { ElectionService } from '../../core/services/election.service';
import { CouncilService } from '../../core/services/council.service';
import { ThaiPBSService } from '../../core/services/thai-pbs.service';
import { DISTRICT_LAYOUTS, District } from '../../core/constants/map-layout.constants';
import { DISTRICT_MAP_NAMES } from '../../core/constants/map-names.constants';
import { sumVotes, calcPercent } from '../../core/utils/election.utils';

// Piece in a 100x100 SVG viewBox; tabs protrude outside via overflow: visible.
// Male and female sizes must match so adjacent tabs interlock seamlessly.
// COL_STEP ≈ 1.1 × cell_width (9.6 ≈ 1.1 × 8.72) so SVG boundaries of
// adjacent cells align, letting the symmetric ±17.5-unit tabs fit perfectly.
const MALE_TAB_SIZE = 35;
const FEMALE_TAB_SIZE = 35;
const CORNER_RADIUS = 10;
const COL_STEP = 9.6;
const ROW_STEP = 10.3;
const MALE_TAB_NECK = 28;
const FEMALE_TAB_NECK = 28;
const FEMALE_TAB_LIP_ROUNDING = 0;

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

  pathFor(id: number): string { return this.pathCache.get(id) ?? ''; }

  // Pure rectangular grid — no hex offset, so all 4 sides align perfectly
  cellLeft(d: District): number {
    return (d.col - 1) * COL_STEP;
  }
  cellTop(d: District): number {
    return (d.row - 1) * ROW_STEP;
  }

  private buildPiecePath(col: number, row: number): string {
    const f = (n: number) => n.toFixed(1);
    const corner = CORNER_RADIUS;
    const horizontalTab = row % 2 === 0 ? 1 : -1;
    const verticalTab = col % 2 === 0 ? 1 : -1;
    const topSign = -verticalTab;
    const rightSign = horizontalTab;
    const bottomSign = verticalTab;
    const leftSign = -horizontalTab;
    const radius = (sign: number) => (sign < 0 ? FEMALE_TAB_SIZE : MALE_TAB_SIZE) / 2;
    const bulbA = (sign: number) => 50 - radius(sign);
    const bulbB = (sign: number) => 50 + radius(sign);
    const shoulder = (sign: number) => radius(sign) * 0.24;
    const neckA = (sign: number) => 50 - (sign < 0 ? FEMALE_TAB_NECK : MALE_TAB_NECK) / 2;
    const neckB = (sign: number) => 50 + (sign < 0 ? FEMALE_TAB_NECK : MALE_TAB_NECK) / 2;
    const lip = (sign: number) => sign < 0 ? FEMALE_TAB_LIP_ROUNDING : 0;

    const topTab = (sign: number) =>
      `L${f(neckA(sign))},0 C${f(neckA(sign) + lip(sign))},0 ${f(bulbA(sign))},${f(-sign * shoulder(sign))} ${f(bulbA(sign))},${f(-sign * radius(sign) * 0.66)} C${f(bulbA(sign))},${f(-sign * radius(sign))} ${f(bulbB(sign))},${f(-sign * radius(sign))} ${f(bulbB(sign))},${f(-sign * radius(sign) * 0.66)} C${f(bulbB(sign))},${f(-sign * shoulder(sign))} ${f(neckB(sign) - lip(sign))},0 ${f(neckB(sign))},0`;
    const rightTab = (sign: number) =>
      `L100,${f(neckA(sign))} C100,${f(neckA(sign) + lip(sign))} ${f(100 + sign * shoulder(sign))},${f(bulbA(sign))} ${f(100 + sign * radius(sign) * 0.66)},${f(bulbA(sign))} C${f(100 + sign * radius(sign))},${f(bulbA(sign))} ${f(100 + sign * radius(sign))},${f(bulbB(sign))} ${f(100 + sign * radius(sign) * 0.66)},${f(bulbB(sign))} C${f(100 + sign * shoulder(sign))},${f(bulbB(sign))} 100,${f(neckB(sign) - lip(sign))} 100,${f(neckB(sign))}`;
    const bottomTab = (sign: number) =>
      `L${f(neckB(sign))},100 C${f(neckB(sign) - lip(sign))},100 ${f(bulbB(sign))},${f(100 + sign * shoulder(sign))} ${f(bulbB(sign))},${f(100 + sign * radius(sign) * 0.66)} C${f(bulbB(sign))},${f(100 + sign * radius(sign))} ${f(bulbA(sign))},${f(100 + sign * radius(sign))} ${f(bulbA(sign))},${f(100 + sign * radius(sign) * 0.66)} C${f(bulbA(sign))},${f(100 + sign * shoulder(sign))} ${f(neckA(sign) + lip(sign))},100 ${f(neckA(sign))},100`;
    const leftTab = (sign: number) =>
      `L0,${f(neckB(sign))} C0,${f(neckB(sign) - lip(sign))} ${f(-sign * shoulder(sign))},${f(bulbB(sign))} ${f(-sign * radius(sign) * 0.66)},${f(bulbB(sign))} C${f(-sign * radius(sign))},${f(bulbB(sign))} ${f(-sign * radius(sign))},${f(bulbA(sign))} ${f(-sign * radius(sign) * 0.66)},${f(bulbA(sign))} C${f(-sign * shoulder(sign))},${f(bulbA(sign))} 0,${f(neckA(sign) + lip(sign))} 0,${f(neckA(sign))}`;

    return [
      `M${f(corner)},0`,
      `${topTab(topSign)} L${f(100 - corner)},0 Q100,0 100,${f(corner)}`,
      `${rightTab(rightSign)} L100,${f(100 - corner)} Q100,100 ${f(100 - corner)},100`,
      `${bottomTab(bottomSign)} L${f(corner)},100 Q0,100 0,${f(100 - corner)}`,
      `${leftTab(leftSign)} L0,${f(corner)} Q0,0 ${f(corner)},0 Z`,
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

  getShortName(id: number): string { return DISTRICT_MAP_NAMES[id] || ''; }

  isLongName(id: number): boolean {
    return this.getShortName(id).length >= 7;
  }

  selectDistrict(id: number) {
    this.mapState.selectedDistrictId.set(id);
    this.mapState.selectedCandidateId.set(null);
  }

  getDistrictTooltipData(id: number) {
    return this.mapState.activeTab() === 'sk' ? this.getCouncilTooltip(id) : this.getGovernorTooltip(id);
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
      candidateName: info.name, partyName: info.party, color: info.color,
      imageUrl: info.imageUrl, partyLogoUrl: info.partyLogoUrl,
      votes: top.votes, percentage: calcPercent(top.votes, total),
    };
  }

  private getCouncilTooltip(id: number) {
    const partyId = this.councilService.leadingPartyByDistrict().get(id);
    const party = partyId ? this.thaipbs.partyMap().get(partyId) : null;
    const count = this.councilService.candidatesByDistrict(id).length;
    if (!count) return null;
    return {
      type: 'council' as const,
      partyName: party?.partyName ?? '', partyLogoUrl: party?.partyLogoUrl ?? '',
      color: party?.color ?? '#64748b', count,
    };
  }
}
