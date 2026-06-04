import { Component, inject, signal, computed, effect, untracked, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ElectionService } from '../../core/services/election.service';
import { MapStateService } from '../../core/services/map-state';
import { DISTRICT_MAP_NAMES } from '../../core/constants/map-names.constants';
import { Candidate } from '../../core/models/election.models';
import { formatVotes, hexToRgba } from '../../core/utils/election.utils';
import { DISTRICT_LAYOUTS } from '../../core/constants/map-layout.constants';

const HEX_R_MODAL = 15;
const HEX_GAP = 2;
const SCALE = (HEX_R_MODAL - HEX_GAP) / HEX_R_MODAL;
const COL_STEP_M = HEX_R_MODAL * Math.sqrt(3);
const ROW_STEP_M = HEX_R_MODAL * 1.5;
const ROW_OFFSET_M = COL_STEP_M / 2;
const PAD_M = HEX_R_MODAL + 8;
const h = HEX_R_MODAL * SCALE * 0.866;
const h2 = HEX_R_MODAL * SCALE * 0.5;
const r = HEX_R_MODAL * SCALE;

export const MODAL_HEXES = DISTRICT_LAYOUTS.map(d => {
  const cx = PAD_M + (d.col - 1) * COL_STEP_M + (d.row % 2 === 0 ? ROW_OFFSET_M : 0);
  const cy = PAD_M + (d.row - 1) * ROW_STEP_M;
  const pts = [
    `${cx.toFixed(1)},${(cy - r).toFixed(1)}`,
    `${(cx + h).toFixed(1)},${(cy - h2).toFixed(1)}`,
    `${(cx + h).toFixed(1)},${(cy + h2).toFixed(1)}`,
    `${cx.toFixed(1)},${(cy + r).toFixed(1)}`,
    `${(cx - h).toFixed(1)},${(cy + h2).toFixed(1)}`,
    `${(cx - h).toFixed(1)},${(cy - h2).toFixed(1)}`,
  ].join(' ');
  return { id: d.id, points: pts, cx, cy };
});
export const MODAL_SVG_W = Math.ceil(PAD_M + (10 - 1) * COL_STEP_M + ROW_OFFSET_M + HEX_R_MODAL + 4);
export const MODAL_SVG_H = Math.ceil(PAD_M + (9 - 1) * ROW_STEP_M + HEX_R_MODAL + 4);

const RANK_OPACITY: Record<number, number> = { 1: 1, 2: 0.55, 3: 0.3 };

@Component({
  selector: 'app-candidates-stack',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
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

  countedVotes = computed(() =>
    this.svc.goodVotes() + this.svc.badVotes() + this.svc.noVotes()
  );
  progressPercent = computed(() => this.svc.progressPercent());
  eligibleVoters = computed(() => this.svc.eligibleVoters());
  turnoutPercent = computed(() => this.svc.turnoutPercent());
  goodVotes = computed(() => this.svc.goodVotes());
  badVotes = computed(() => this.svc.badVotes());
  noVotes = computed(() => this.svc.noVotes());
  goodVotesPct = computed(() => {
    const t = this.countedVotes(); return t > 0 ? (this.svc.goodVotes() / t * 100) : 0;
  });
  badVotesPct = computed(() => {
    const t = this.countedVotes(); return t > 0 ? (this.svc.badVotes() / t * 100) : 0;
  });
  noVotesPct = computed(() => {
    const t = this.countedVotes(); return t > 0 ? (this.svc.noVotes() / t * 100) : 0;
  });

  showFlagTooltip = signal(false);
  showScrollTop = signal(false);

  private countUpMap = signal<Map<number, number>>(new Map());
  private countUpStarted = false;
  private rafId = 0;
  private countUpStartTimer = 0;
  private preloadedImageUrls = new Set<string>();

  constructor() {
    effect(() => {
      const candidates = this.top10();
      if (candidates.length === 0) return;
      untracked(() => {
        this.preloadCardImages(candidates);
        if (!this.countUpStarted) {
          this.countUpStarted = true;
          this.countUpStartTimer = window.setTimeout(() => this.startCountUp(candidates), 120);
        }
      });
    });
  }

  private startCountUp(candidates: Candidate[]): void {
    const duration = 1800;
    const start = performance.now();
    let lastPaint = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);

      if (now - lastPaint > 48 || t === 1) {
        lastPaint = now;
        const eased = 1 - (1 - t) ** 3;
        const m = new Map<number, number>();
        candidates.forEach(c => m.set(c.id, Math.round(c.votes * eased)));
        this.countUpMap.set(m);
      }

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

  readonly miniHexes = MODAL_HEXES;
  readonly miniSvgW = MODAL_SVG_W;
  readonly miniSvgH = MODAL_SVG_H;

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
    if (!d || d.votes === 0) return 0.35;
    return RANK_OPACITY[d.rank] ?? 0.2;
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
    window.clearTimeout(this.countUpStartTimer);
    cancelAnimationFrame(this.rafId);
    this.scrollContainer?.removeEventListener('scroll', this.scrollHandler);
    document.body.style.overflow = '';
  }

  scrollToTop() {
    this.scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  imgUrl(n: number): string {
    return this.top10().find(c => c.number === n)?.imageUrl ?? '';
  }

  private preloadCardImages(candidates: Candidate[]) {
    if (typeof document === 'undefined') return;

    for (const candidate of candidates) {
      this.preloadImage(this.imgUrl(candidate.number));
    }
    this.preloadImage('/LOGO_ELECTION_BKK_V2/LOGO_ELECTION_BKK_V2.png');
  }

  private preloadImage(url: string) {
    if (!url || this.preloadedImageUrls.has(url)) return;
    this.preloadedImageUrls.add(url);

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }

  imgUrl3D(n: number): string {
    return this.top10().find(c => c.number === n)?.imageUrl ?? '';
  }

  r1Shadow = computed(() => {
    const c = this.top10()[0];
    if (!c) return '';
    const a = hexToRgba(c.color, 0.55);
    const b = hexToRgba(c.color, 0.25);
    return `0 0 24px ${a}, 0 0 48px ${b}`;
  });

  readonly formatVotes = formatVotes;

  muteColor(hex: string, amount = 0.55): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const nr = Math.round(r + (gray - r) * amount);
    const ng = Math.round(g + (gray - g) * amount);
    const nb = Math.round(b + (gray - b) * amount);
    return `rgb(${nr},${ng},${nb})`;
  }
}
