import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ElectionService } from '../../core/services/election.service';
import { MapStateService } from '../../core/services/map-state';
import { ELECTION_CONSTANTS } from '../../core/constants/election.constants';
import { formatVotes } from '../../core/utils/election.utils';

type SortKey = 'rank' | 'number';

@Component({
  selector: 'app-all-candidates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-candidates.html',
  styleUrl: './all-candidates.css',
})
export class AllCandidates {
  private svc = inject(ElectionService);
  private router = inject(Router);
  private mapState = inject(MapStateService);

  readonly formatVotes = formatVotes;
  sortKey = signal<SortKey>('rank');

  ranked = computed(() =>
    [...this.svc.candidates()]
      .sort((a, b) => b.votes - a.votes)
      .map((c, i) => ({ ...c, rank: i + 1 }))
  );

  candidates = computed(() => {
    const list = this.ranked();
    return this.sortKey() === 'number'
      ? [...list].sort((a, b) => a.number - b.number)
      : list;
  });

  maxVotes = computed(() => this.ranked()[0]?.votes ?? 1);

  imgUrl(n: number): string {
    return ELECTION_CONSTANTS.ASSETS.CANDIDATE_IMAGE.replace('{no}', n.toString());
  }

  goToMap(id: number) {
    this.mapState.selectedCandidateId.set(id);
    this.mapState.selectedDistrictId.set(null);
    this.router.navigate(['/dashboard']);
  }
}
