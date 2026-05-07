import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouncilService } from '../../core/services/council.service';
import { MapStateService } from '../../core/services/map-state';
import { ELECTION_CONSTANTS } from '../../core/constants/election.constants';
import { CouncilMiniChart } from '../../shared/components/council-mini-chart/council-mini-chart';

@Component({
  selector: 'app-council-result',
  standalone: true,
  imports: [CommonModule, CouncilMiniChart],
  templateUrl: './council-result.html',
  styleUrl: './council-result.css',
})
export class CouncilResult {
  council = inject(CouncilService);
  mapState = inject(MapStateService);
  readonly ELECTION_CONSTANTS = ELECTION_CONSTANTS;

  selectedDistrictId = this.mapState.selectedDistrictId;

  districtCandidates = computed(() => {
    const id = this.selectedDistrictId();
    if (!id) return [];
    
    const candidates = this.council.candidatesByDistrict(id);
    const summary = this.council.getDistrictSummary(id);
    
    if (!summary) return candidates;
    
    return [...candidates].sort((a, b) => {
      const rankA = summary.leaders.find(l => l.number === a.number)?.rank ?? 999;
      const rankB = summary.leaders.find(l => l.number === b.number)?.rank ?? 999;
      return rankA - rankB;
    });
  });

  currentDistrictSummary = computed(() => {
    const id = this.selectedDistrictId();
    return id ? this.council.getDistrictSummary(id) : undefined;
  });

  districtName = computed(() => {
    const id = this.selectedDistrictId();
    if (!id) return '';
    return ELECTION_CONSTANTS.DISTRICT_NAMES[id - 1] ?? '';
  });

  getLeaderInfo(candidateNumber: number) {
    const summary = this.currentDistrictSummary();
    return summary?.leaders.find(l => l.number === candidateNumber);
  }

  searchQuery = signal('');

  filteredWinners = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const winners = this.council.districtWinners();
    if (!q) return winners;
    return winners.filter(w =>
      ELECTION_CONSTANTS.DISTRICT_NAMES[w.districtId - 1].toLowerCase().includes(q)
    );
  });

  getParty(partyId: number) {
    return this.council.partyMap().get(partyId);
  }

  clearDistrict() {
    this.mapState.selectedDistrictId.set(null);
  }

}
