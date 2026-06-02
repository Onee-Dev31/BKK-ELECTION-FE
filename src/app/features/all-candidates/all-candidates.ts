import { Component, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ElectionService } from '../../core/services/election.service';
import { MapStateService } from '../../core/services/map-state';
import { SortPills, SortOption } from '../../shared/components/sort-pills/sort-pills';
import { CandidateRow } from './components/candidate-row/candidate-row';

type SortKey = 'rank' | 'number';

@Component({
  selector: 'app-all-candidates',
  standalone: true,
  imports: [SortPills, CandidateRow],
  templateUrl: './all-candidates.html',
  styleUrl: './all-candidates.css',
})
export class AllCandidates {
  private svc = inject(ElectionService);
  private router = inject(Router);
  private mapState = inject(MapStateService);

  sortKey = signal<SortKey>('rank');

  readonly sortOptions: SortOption[] = [
    { key: 'rank', label: 'คะแนน' },
    { key: 'number', label: 'เบอร์' },
  ];

  private ranked = computed(() =>
    [...this.svc.candidates()].sort((a, b) => b.votes - a.votes)
  );

  candidates = computed(() => {
    const list = this.ranked();
    return this.sortKey() === 'number'
      ? [...list].sort((a, b) => a.number - b.number)
      : list;
  });

  maxVotes = computed(() => this.ranked()[0]?.votes ?? 1);

  setSort(key: string) { this.sortKey.set(key as SortKey); }

  goToMap(id: number) {
    this.mapState.selectedCandidateId.set(id);
    this.mapState.selectedDistrictId.set(null);
    this.router.navigate(['/dashboard']);
  }
}
