import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectionService } from '../../core/services/election.service';
import { MapStateService } from '../../core/services/map-state';
import { DistrictModal } from '../../shared/components/district-modal/district-modal';
import { DISTRICT_MAP_NAMES } from '../../core/constants/map-names.constants';
import { sumVotes, formatVotes } from '../../core/utils/election.utils';

type SortKey = 'number' | 'votes' | 'leader';

@Component({
  selector: 'app-district-list',
  standalone: true,
  imports: [CommonModule, DistrictModal],
  templateUrl: './district-list.html',
  styleUrl: './district-list.css',
})
export class DistrictList {
  private svc = inject(ElectionService);
  mapState = inject(MapStateService);

  readonly formatVotes = formatVotes;
  sortKey = signal<SortKey>('number');

  private allDistricts = computed(() => {
    const candidateMap = this.svc.candidateMap();
    return Array.from({ length: 50 }, (_, i) => {
      const id = i + 1;
      const result = this.svc.getDistrictResults(id);
      if (!result || !result.candidateResults.length) {
        return { id, name: DISTRICT_MAP_NAMES[id], leader: null, leaderVotes: 0, totalVotes: 0, pct: '0.0', top3: [] as { color: string }[] };
      }
      const sorted = [...result.candidateResults].sort((a, b) => b.votes - a.votes);
      const totalVotes = sumVotes(result.candidateResults);
      const leader = candidateMap.get(sorted[0].candidateId) ?? null;
      const top3 = sorted.slice(0, 3)
        .map(r => candidateMap.get(r.candidateId))
        .filter((c): c is NonNullable<typeof c> => c != null)
        .map(c => ({ color: c.color }));

      return {
        id,
        name: DISTRICT_MAP_NAMES[id],
        leader,
        leaderVotes: sorted[0].votes,
        totalVotes,
        pct: totalVotes > 0 ? ((sorted[0].votes / totalVotes) * 100).toFixed(1) : '0.0',
        top3,
      };
    });
  });

  districts = computed(() => {
    const list = this.allDistricts();
    const key = this.sortKey();
    if (key === 'votes') return [...list].sort((a, b) => b.leaderVotes - a.leaderVotes);
    if (key === 'leader') return [...list].sort((a, b) => (a.leader?.number ?? 99) - (b.leader?.number ?? 99));
    return list;
  });

  openDistrict(id: number) {
    this.mapState.activeTab.set('summary');
    this.mapState.selectedDistrictId.set(id);
    this.mapState.selectedCandidateId.set(null);
  }
}
