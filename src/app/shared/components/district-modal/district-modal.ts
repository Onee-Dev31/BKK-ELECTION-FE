import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapStateService } from '../../../core/services/map-state';
import { ElectionService } from '../../../core/services/election.service';
import { DISTRICT_MAP_NAMES } from '../../../core/constants/map-names.constants';

@Component({
  selector: 'app-district-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './district-modal.html',
  styleUrl: './district-modal.css'
})
export class DistrictModal {
  mapState = inject(MapStateService);
  electionService = inject(ElectionService);

  selectedDistrict = this.mapState.selectedDistrict;
  candidates = this.electionService.candidates;

  districtCandidates = computed(() => {
    const districtId = this.selectedDistrict()?.id;
    if (!districtId) return [];

    const result = this.electionService.getDistrictResults(districtId);
    if (!result || !result.candidateResults) return [];

    const totalVotes = result.candidateResults.reduce((sum, curr) => sum + curr.votes, 0);

    return result.candidateResults
      .map(cr => {
        const candidateInfo = this.electionService.candidates().find(c => c.id === cr.candidateId);
        return {
          info: candidateInfo!,
          votes: cr.votes,
          percentage: totalVotes > 0 ? ((cr.votes / totalVotes) * 100).toFixed(2) : '0.00'
        };
      })
      .filter(item => item.info !== undefined && item.votes > 0)
      .sort((a, b) => b.votes - a.votes);
  });

  closeModal() {
    this.mapState.selectedDistrictId.set(null);
    this.mapState.selectedCandidateId.set(null);
  }

  getDistrictName(id: number | undefined): string {
    if (!id || id < 1 || id > 50) return 'ไม่ทราบ';
    return DISTRICT_MAP_NAMES[id] || 'ไม่ทราบ';
  }
}
