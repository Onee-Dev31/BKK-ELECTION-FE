import { Component, inject, signal, computed, ElementRef, OnInit, OnDestroy } from '@angular/core';
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
export class CandidatesStack implements OnInit, OnDestroy {
  private svc = inject(ElectionService);
  private el = inject(ElementRef);

  top10 = computed(() =>
    [...this.svc.candidates()]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5)
  );

  hoveredIdx = signal<number | null>(null);
  showScrollTop = signal(false);

  private scrollContainer: HTMLElement | null = null;
  private scrollHandler = () => {
    this.showScrollTop.set((this.scrollContainer?.scrollTop ?? 0) > 300);
  };

  ngOnInit() {
    this.scrollContainer = this.el.nativeElement.parentElement as HTMLElement;
    this.scrollContainer?.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy() {
    this.scrollContainer?.removeEventListener('scroll', this.scrollHandler);
  }

  scrollToTop() {
    this.scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
