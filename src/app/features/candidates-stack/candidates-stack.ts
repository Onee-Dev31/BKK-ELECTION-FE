import { Component, inject, signal, computed, effect, untracked, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ElectionService } from '../../core/services/election.service';
import { MapStateService } from '../../core/services/map-state';
import { ELECTION_CONSTANTS } from '../../core/constants/election.constants';
import { DISTRICT_MAP_NAMES } from '../../core/constants/map-names.constants';
import { Candidate } from '../../core/models/election.models';
import { formatVotes, hexToRgba } from '../../core/utils/election.utils';
import { MINI_HEXES, MINI_SVG_W, MINI_SVG_H } from '../compare-candidates/compare-hex.utils';

const RANK_OPACITY: Record<number, number> = { 1: 1, 2: 0.55, 3: 0.3 };
const AVAILABLE_3D = new Set([1, 3, 4, 6, 8]);

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
  private router = inject(Router);
  private mapState = inject(MapStateService);

  top10 = computed(() =>
    [...this.svc.candidates()].sort((a, b) => b.votes - a.votes).slice(0, 5)
  );

  showScrollTop = signal(false);

  private countUpMap = signal<Map<number, number>>(new Map());
  private countUpStarted = false;
  private rafId = 0;

  constructor() {
    effect(() => {
      const candidates = this.top10();
      if (candidates.length === 0) return;
      untracked(() => {
        if (!this.countUpStarted) {
          this.countUpStarted = true;
          this.startCountUp(candidates);
        }
      });
    });
  }

  private startCountUp(candidates: Candidate[]): void {
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      const m = new Map<number, number>();
      candidates.forEach(c => m.set(c.id, Math.round(c.votes * eased)));
      this.countUpMap.set(m);
      if (t < 1) this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  getDisplayVotes(id: number): string {
    const v = this.countUpMap().get(id) ?? 0;
    return this.formatVotes(v);
  }

  lbBarWidth(votes: number): number {
    const top = this.top10()[0]?.votes ?? 1;
    return Math.round((votes / top) * 100);
  }

  readonly hexToRgba = hexToRgba;

  selectedModal = signal<{ c: Candidate; rank: number } | null>(null);

  readonly miniHexes = MINI_HEXES;
  readonly miniSvgW = MINI_SVG_W;
  readonly miniSvgH = MINI_SVG_H;

  private modalDistrictMap = computed(() => {
    const m = this.selectedModal();
    if (!m) return new Map<number, { rank: number; votes: number }>();
    const map = new Map<number, { rank: number; votes: number }>();
    for (let id = 1; id <= 50; id++) {
      const dr = this.svc.getDistrictResults(id);
      if (!dr) { map.set(id, { rank: 99, votes: 0 }); continue; }
      const sorted = [...dr.candidateResults].sort((a, b) => b.votes - a.votes);
      const idx = sorted.findIndex(r => r.candidateId === m.c.id);
      map.set(id, { rank: idx >= 0 ? idx + 1 : 99, votes: idx >= 0 ? sorted[idx].votes : 0 });
    }
    return map;
  });

  modalRankCounts = computed(() => {
    let r1 = 0, r2 = 0, r3 = 0;
    this.modalDistrictMap().forEach(d => {
      if (d.rank === 1) r1++;
      else if (d.rank === 2) r2++;
      else if (d.rank === 3) r3++;
    });
    return { rank1: r1, rank2: r2, rank3: r3 };
  });

  modalTopDistricts = computed(() => {
    if (!this.selectedModal()) return [];
    return [...this.modalDistrictMap().entries()]
      .filter(([_, d]) => d.votes > 0)
      .sort((a, b) => b[1].votes - a[1].votes)
      .slice(0, 5)
      .map(([id, d]) => {
        const dr = this.svc.getDistrictResults(id);
        const total = dr ? dr.candidateResults.reduce((s, r) => s + r.votes, 0) : 0;
        return {
          id, name: DISTRICT_MAP_NAMES[id] || '',
          votes: d.votes, rank: d.rank,
          pct: total > 0 ? (d.votes / total * 100).toFixed(2) : '0.00',
        };
      });
  });

  hexFill(id: number): string {
    const m = this.selectedModal();
    if (!m) return '#1e293b';
    const d = this.modalDistrictMap().get(id);
    if (!d || d.votes === 0) return '#1e293b';
    return m.c.color;
  }

  hexOpacity(id: number): number {
    const d = this.modalDistrictMap().get(id);
    if (!d || d.votes === 0) return 0.18;
    return RANK_OPACITY[d.rank] ?? 0.12;
  }

  openModal(c: Candidate, rank: number) {
    this.selectedModal.set({ c, rank });
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.selectedModal.set(null);
    document.body.style.overflow = '';
  }

  goToDashboard() {
    const m = this.selectedModal();
    if (m) this.mapState.selectedCandidateId.set(m.c.id);
    this.closeModal();
    this.router.navigate(['/dashboard']);
  }

  goToCompare() {
    const m = this.selectedModal();
    this.closeModal();
    this.router.navigate(['/compare'], { queryParams: m ? { a: m.c.id } : {} });
  }

  private scrollContainer: HTMLElement | null = null;
  private scrollHandler = () => {
    this.showScrollTop.set((this.scrollContainer?.scrollTop ?? 0) > 300);
  };

  ngOnInit() {
    this.scrollContainer = this.el.nativeElement.parentElement as HTMLElement;
    this.scrollContainer?.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.rafId);
    this.scrollContainer?.removeEventListener('scroll', this.scrollHandler);
    document.body.style.overflow = '';
  }

  scrollToTop() {
    this.scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private readonly imgOverrides: Record<number, string> = {
    8: '/messageImage_1779875875371.jpg',
  };

  imgUrl(n: number) {
    return this.imgOverrides[n] ?? ELECTION_CONSTANTS.ASSETS.CANDIDATE_IMAGE.replace('{no}', n.toString());
  }

  imgUrl3D(n: number): string {
    const num = AVAILABLE_3D.has(n) ? n : 'other';
    return `/3D/${num}.png`;
  }

  r1Shadow = computed(() => {
    const c = this.top10()[0];
    if (!c) return '';
    const a = hexToRgba(c.color, 0.55);
    const b = hexToRgba(c.color, 0.25);
    return `0 0 24px ${a}, 0 0 48px ${b}`;
  });

  readonly formatVotes = formatVotes;
}
