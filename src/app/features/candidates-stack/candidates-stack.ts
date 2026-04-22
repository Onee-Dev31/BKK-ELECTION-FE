import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectionService } from '../../core/services/election.service';
import { ELECTION_CONSTANTS } from '../../core/constants/election.constants';

@Component({
  selector: 'app-candidates-stack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidates-stack.html',
  styleUrl: './candidates-stack.css',
})
export class CandidatesStack {
  private svc = inject(ElectionService);

  top10 = computed(() =>
    [...this.svc.candidates()]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10)
  );

  hoveredIdx = signal<number | null>(null);

  imgUrl(n: number) {
    return ELECTION_CONSTANTS.ASSETS.CANDIDATE_IMAGE.replace('{no}', n.toString());
  }

  formatVotes(v: number) {
    return v.toLocaleString('th-TH');
  }
}
