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

  onPointerEnter(idx: number, event: PointerEvent) {
    if (event.pointerType === 'mouse') {
      this.hoveredIdx.set(idx);
    }
  }

  selectCard(idx: number, colEl: HTMLElement) {
    const isSame = this.hoveredIdx() === idx;
    this.hoveredIdx.set(isSame ? null : idx);

    if (!isSame) {
      setTimeout(() => {
        colEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 360);
    }
  }

  imgUrl(n: number) {
    return ELECTION_CONSTANTS.ASSETS.CANDIDATE_IMAGE.replace('{no}', n.toString());
  }

  private readonly AVAILABLE_3D = new Set([1, 8, 4, 3, 6]);

  imgUrl3D(n: number): string {
    const num = this.AVAILABLE_3D.has(n) ? n : 'orther';
    return `/3D/${num}.png`;
  }

  formatVotes(v: number) {
    return v.toLocaleString('th-TH');
  }
}
