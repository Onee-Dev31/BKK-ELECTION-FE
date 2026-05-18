import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapStateService } from '../../core/services/map-state';
import { ElectionService } from '../../core/services/election.service';
import { CouncilService } from '../../core/services/council.service';
import { ThaiPBSService } from '../../core/services/thai-pbs.service';
import { DISTRICT_LAYOUTS, District } from '../../core/constants/map-layout.constants';
import { DISTRICT_MAP_NAMES } from '../../core/constants/map-names.constants';
import { sumVotes, calcPercent } from '../../core/utils/election.utils';

// Piece in 100×100 SVG viewBox; tabs protrude outside via overflow:visible
const TW = 30;  // tab width (30% of edge)
// TH = TW/2 → perfect semicircle arc

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
    const occ = new Set(DISTRICT_LAYOUTS.map(d => `${d.col},${d.row}`));
    for (const d of DISTRICT_LAYOUTS) {
      const hasT = occ.has(`${d.col},${d.row - 1}`);
      const hasR = occ.has(`${d.col + 1},${d.row}`);
      const hasB = occ.has(`${d.col},${d.row + 1}`);
      const hasL = occ.has(`${d.col - 1},${d.row}`);
      this.pathCache.set(d.id, this.buildPiecePath(d.col, d.row, hasT, hasR, hasB, hasL));
    }
  }

  pathFor(id: number): string { return this.pathCache.get(id) ?? ''; }

  // Pure rectangular grid — no hex offset, so all 4 sides align perfectly
  cellLeft(d: District): number {
    return (d.col - 1) * 9.5;
  }
  cellTop(d: District): number {
    return (d.row - 1) * 10.2;
  }

  // Draw tab only on sides that have an actual neighbor; flat edge otherwise
  private buildPiecePath(col: number, row: number, hasT: boolean, hasR: boolean, hasB: boolean, hasL: boolean): string {
    const rS = row % 2 === 0 ? 1 : -1;
    const bS = col % 2 === 0 ? 1 : -1;
    const lS = -rS, tS = -bS;
    const hw = TW / 2;
    const f = (n: number) => n.toFixed(1);
    const r = f(hw);
    const top = hasT
      ? `L${f(50 - hw)},0 A${r},${r} 0 0 ${tS > 0 ? 0 : 1} ${f(50 + hw)},0 L100,0`
      : `L100,0`;
    const right = hasR
      ? `L100,${f(50 - hw)} A${r},${r} 0 0 ${rS > 0 ? 1 : 0} 100,${f(50 + hw)} L100,100`
      : `L100,100`;
    const bottom = hasB
      ? `L${f(50 + hw)},100 A${r},${r} 0 0 ${bS > 0 ? 0 : 1} ${f(50 - hw)},100 L0,100`
      : `L0,100`;
    const left = hasL
      ? `L0,${f(50 + hw)} A${r},${r} 0 0 ${lS > 0 ? 0 : 1} 0,${f(50 - hw)} Z`
      : `L0,0 Z`;
    return ['M0,0', top, right, bottom, left].join(' ');
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
