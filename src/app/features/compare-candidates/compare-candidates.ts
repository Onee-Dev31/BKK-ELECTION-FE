import { Component, inject, signal, computed, effect, untracked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectionService } from '../../core/services/election.service';
import { DISTRICT_MAP_NAMES } from '../../core/constants/map-names.constants';
import { MINI_HEXES, MINI_SVG_W, MINI_SVG_H } from './compare-hex.utils';
import { DistrictView, DistrictEntry, DistrictH2H, CandidateInfo, VoteDiff } from './compare-candidates.types';
import { CandPanel } from './components/cand-panel/cand-panel';
import { VoteBar } from './components/vote-bar/vote-bar';
import { HexMap } from './components/hex-map/hex-map';
import { DistrictChart } from './components/district-chart/district-chart';

@Component({
  selector: 'app-compare-candidates',
  standalone: true,
  imports: [CommonModule, DecimalPipe, CandPanel, VoteBar, HexMap, DistrictChart],
  templateUrl: './compare-candidates.html',
  styleUrl: './compare-candidates.css'
})
export class CompareCandidates {
  private electionService = inject(ElectionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  candidates = this.electionService.candidates;
  sortedCandidates = computed(() => [...this.candidates()].sort((a, b) => a.id - b.id));

  selectedIdA = signal<number>(0);
  selectedIdB = signal<number>(0);
  districtView = signal<DistrictView>('closest');
  showScrollTop = signal(false);
  showFlagTooltip = signal(false);
  pickerFor = signal<'a' | 'b' | null>(null);

  goHome() { this.router.navigate(['/']); }

  openPickerA() { this.pickerFor.set('a'); }
  openPickerB() { this.pickerFor.set('b'); }
  closePicker() {
    const side = this.pickerFor();
    if (side === 'a' && !this.selectedIdA()) return;
    if (side === 'b' && !this.selectedIdB()) return;
    this.pickerFor.set(null);
  }
  pickCandidate(id: number) {
    const side = this.pickerFor();
    if (side === 'a') {
      this.selectedIdA.set(id);
      this.closePicker();
      if (!this.selectedIdB()) this.pickerFor.set('b');
    } else if (side === 'b') {
      this.selectedIdB.set(id);
      this.closePicker();
    }
  }

  goodVotes = computed(() => this.electionService.goodVotes());
  badVotes  = computed(() => this.electionService.badVotes());
  noVotes   = computed(() => this.electionService.noVotes());
  countedVotes    = computed(() => this.goodVotes() + this.badVotes() + this.noVotes());
  progressPercent = computed(() => this.electionService.progressPercent());
  eligibleVoters  = computed(() => this.electionService.eligibleVoters());
  turnoutPercent  = computed(() => this.electionService.turnoutPercent());
  goodVotesPct = computed(() => { const t = this.countedVotes(); return t > 0 ? this.goodVotes() / t * 100 : 0; });
  badVotesPct  = computed(() => { const t = this.countedVotes(); return t > 0 ? this.badVotes()  / t * 100 : 0; });
  noVotesPct   = computed(() => { const t = this.countedVotes(); return t > 0 ? this.noVotes()   / t * 100 : 0; });

  readonly miniHexes = MINI_HEXES;
  readonly miniSvgW = MINI_SVG_W;
  readonly miniSvgH = MINI_SVG_H;

  @ViewChild('scrollEl') scrollElRef!: ElementRef<HTMLElement>;

  candidateA = computed(() => this.candidates().find(c => c.id === this.selectedIdA()));
  candidateB = computed(() => this.candidates().find(c => c.id === this.selectedIdB()));

  candidateAInfo = computed<CandidateInfo | null>(() => {
    const a = this.candidateA();
    if (!a) return null;
    const rank = [...this.candidates()].sort((x, y) => y.votes - x.votes).findIndex(c => c.id === a.id) + 1;
    return { ...a, rank };
  });

  candidateBInfo = computed<CandidateInfo | null>(() => {
    const b = this.candidateB();
    if (!b) return null;
    const rank = [...this.candidates()].sort((x, y) => y.votes - x.votes).findIndex(c => c.id === b.id) + 1;
    return { ...b, rank };
  });

  voteDiff = computed<VoteDiff | null>(() => {
    const a = this.candidateA();
    const b = this.candidateB();
    if (!a || !b) return null;
    const total = a.votes + b.votes;
    return {
      diff: Math.abs(a.votes - b.votes),
      aWidth: total > 0 ? (a.votes / total) * 100 : 50,
      bWidth: total > 0 ? (b.votes / total) * 100 : 50,
      aAhead: a.votes >= b.votes,
    };
  });

  districtH2H = computed<DistrictH2H>(() => {
    const a = this.candidateA();
    const b = this.candidateB();
    const map = new Map<number, { aVotes: number; bVotes: number; diff: number }>();
    let aLeads = 0, bLeads = 0;
    for (let id = 1; id <= 50; id++) {
      const dr = this.electionService.getDistrictResults(id);
      const aVotes = dr?.candidateResults.find(r => r.candidateId === a?.id)?.votes ?? 0;
      const bVotes = dr?.candidateResults.find(r => r.candidateId === b?.id)?.votes ?? 0;
      map.set(id, { aVotes, bVotes, diff: Math.abs(aVotes - bVotes) });
      if (aVotes > bVotes) aLeads++;
      else if (bVotes > aVotes) bLeads++;
    }
    return { aLeads, bLeads, map };
  });

  closestDistricts = computed<DistrictEntry[]>(() =>
    [...this.districtH2H().map.entries()]
      .filter(([, d]) => d.aVotes > 0 || d.bVotes > 0)
      .sort((a, b) => a[1].diff - b[1].diff)
      .slice(0, 5)
      .map(([id, d]) => ({ id, name: DISTRICT_MAP_NAMES[id] ?? `เขต ${id}`, ...d }))
  );

  topDistrictsA = computed<DistrictEntry[]>(() =>
    [...this.districtH2H().map.entries()]
      .filter(([, d]) => d.aVotes > 0)
      .sort((a, b) => b[1].aVotes - a[1].aVotes)
      .slice(0, 5)
      .map(([id, d]) => ({ id, name: DISTRICT_MAP_NAMES[id] ?? `เขต ${id}`, ...d }))
  );

  topDistrictsB = computed<DistrictEntry[]>(() =>
    [...this.districtH2H().map.entries()]
      .filter(([, d]) => d.bVotes > 0)
      .sort((a, b) => b[1].bVotes - a[1].bVotes)
      .slice(0, 5)
      .map(([id, d]) => ({ id, name: DISTRICT_MAP_NAMES[id] ?? `เขต ${id}`, ...d }))
  );

  shownDistricts = computed<DistrictEntry[]>(() => {
    const v = this.districtView();
    if (v === 'a') return this.topDistrictsA();
    if (v === 'b') return this.topDistrictsB();
    return this.closestDistricts();
  });

  constructor() {
    let initialized = false;

    effect(() => {
      const cands = this.candidates();
      if (cands.length === 0 || initialized) return;
      initialized = true;

      untracked(() => {
        const params = this.route.snapshot.queryParamMap;
        const a = params.get('a');
        const b = params.get('b');

        if (a) {
          const idA = Number(a);
          if (cands.some(c => c.id === idA)) this.selectedIdA.set(idA);
          if (!b) this.pickerFor.set('b');
        } else {
          this.pickerFor.set('a');
        }

        if (b) {
          const idB = Number(b);
          if (cands.some(c => c.id === idB)) this.selectedIdB.set(idB);
        }
      });
    });

    effect(() => {
      const a = this.selectedIdA();
      const b = this.selectedIdB();
      if (!a || !b) return;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { a, b },
        replaceUrl: true,
      });
    });
  }

  swap() {
    const a = this.selectedIdA();
    const b = this.selectedIdB();
    this.selectedIdA.set(b);
    this.selectedIdB.set(a);
  }

  onScroll(el: HTMLElement) {
    this.showScrollTop.set(el.scrollTop > 300);
  }

  scrollToTop() {
    this.scrollElRef?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
