import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouncilService } from '../../core/services/council.service';
import { MapStateService } from '../../core/services/map-state';
import { ELECTION_CONSTANTS } from '../../core/constants/election.constants';

interface ParliamentDot {
  x: number;
  y: number;
  color: string;
  partyName: string;
}

const ROWS = [
  { radius: 60, count: 9 },
  { radius: 80, count: 13 },
  { radius: 100, count: 14 },
  { radius: 120, count: 14 },
];
const TOTAL_DOTS = ROWS.reduce((s, r) => s + r.count, 0); // 50

@Component({
  selector: 'app-council-result',
  standalone: true,
  imports: [CommonModule],
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
    
    // Sort by rank in summary, or by number if not in leaders
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

  parliamentDots = computed((): ParliamentDot[] => {
    const summary = this.council.partySummary();
    if (!summary.length) return [];

    // Use actual seat counts (50 total)
    const colors: { color: string; name: string }[] = [];
    summary.forEach(item => {
      for (let i = 0; i < item.seats; i++) {
        colors.push({ color: item.party.color, name: item.party.partyName });
      }
    });
    while (colors.length < TOTAL_DOTS) colors.push({ color: '#334155', name: '' });
    colors.length = TOTAL_DOTS;

    const cx = 150, cy = 138;
    const dots: ParliamentDot[] = [];
    let idx = 0;

    ROWS.forEach(row => {
      for (let i = 0; i < row.count; i++) {
        const angle = Math.PI * i / (row.count - 1);
        dots.push({
          x: cx - row.radius * Math.cos(angle),
          y: cy - row.radius * Math.sin(angle),
          color: colors[idx].color,
          partyName: colors[idx].name,
        });
        idx++;
      }
    });

    return dots;
  });

  getParty(partyId: number) {
    return this.council.partyMap().get(partyId);
  }

  clearDistrict() {
    this.mapState.selectedDistrictId.set(null);
  }
}
