import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapStateService } from '../../core/services/map-state';
import { ElectionService } from '../../core/services/election.service';
import { DISTRICT_MAP_NAMES } from '../../core/constants/map-names.constants';

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

  computedDistricts = computed(() => {
    const list = this.districts();
    const counts = new Map<string, number>();
    list.forEach(d => {
      const k = `${d.row}-${d.col}`;
      counts.set(k, (counts.get(k) || 0) + 1);
    });

    const seen = new Map<string, number>();
    return list.map(d => {
      const k = `${d.row}-${d.col}`;
      const c = counts.get(k)!;
      let splitClass = '';
      if (c === 2) {
        const s = seen.get(k) || 0;
        seen.set(k, s + 1);
        splitClass = s === 0 ? 'is-split-top' : 'is-split-bottom';
      }
      return { ...d, splitClass };
    });
  });
  selectDistrict(id: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.mapState.selectedDistrictId.set(id);
  }

  resetSelection() {
    this.mapState.selectedDistrictId.set(null);
    this.mapState.selectedCandidateId.set(null);
  }

  getShortName(id: number): string {
    return DISTRICT_MAP_NAMES[id] || 'N/A';
  }

  getBackground(candidateId?: number): string {
    const c = this.electionService.candidates().find(can => can.id === candidateId);
    return c ? c.color : 'var(--empty-district-bg)';
  }

  getTextColor(candidateId?: number): string {
    const c = this.electionService.candidates().find(can => can.id === candidateId);
    return c ? '#ffffff' : 'var(--empty-district-text)';
  }

  getDistrictTooltipData(districtId: number) {
    const result = this.electionService.getDistrictResults(districtId);
    if (!result || !result.candidateResults.length) return null;

    const topResult = [...result.candidateResults].sort((a, b) => b.votes - a.votes)[0];
    if (topResult.votes === 0) return null;

    const candidateInfo = this.electionService.candidates().find(c => c.id === topResult.candidateId);

    if (!candidateInfo) return null;

    const totalDistrictVotes = result.candidateResults.reduce((sum, curr) => sum + curr.votes, 0);
    const percentage = totalDistrictVotes > 0 ? ((topResult.votes / totalDistrictVotes) * 100).toFixed(2) : '0.00';

    return {
      candidateName: candidateInfo.name,
      partyName: candidateInfo.party,
      color: candidateInfo.color,
      imageUrl: candidateInfo.imageUrl,
      partyLogoUrl: candidateInfo.partyLogoUrl,
      votes: topResult.votes,
      percentage: percentage
    };
  }
}

