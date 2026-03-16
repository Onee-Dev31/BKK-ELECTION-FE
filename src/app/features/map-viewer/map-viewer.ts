import { Component, inject } from '@angular/core';
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

  selectDistrict(id: number) {
    this.mapState.selectedDistrictId.set(id);
    this.mapState.selectedCandidateId.set(null);
  }

  getShortName(id: number): string {
    return DISTRICT_MAP_NAMES[id] || 'N/A';
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
      imageUrl: candidateInfo.imageUrl,
      partyLogoUrl: candidateInfo.partyLogoUrl,
      votes: topResult.votes,
      percentage: percentage
    };
  }
}

