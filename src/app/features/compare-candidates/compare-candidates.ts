import { Component, inject, signal, computed, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, CandPanel, VoteBar, HexMap, DistrictChart],
  templateUrl: './compare-candidates.html',
  styleUrl: './compare-candidates.css'
})
export class CompareCandidates {
  private electionService = inject(ElectionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  candidates = this.electionService.candidates;

  selectedIdA = signal<number>(1);
  selectedIdB = signal<number>(2);
  districtView = signal<DistrictView>('closest');
  showScrollTop = signal(false);

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
    this.route.queryParamMap.subscribe(params => {
      const a = params.get('a');
      const b = params.get('b');
      const cands = this.candidates();
      if (cands.length === 0) return;
      if (a) {
        const idA = Number(a);
        if (cands.some(c => c.id === idA)) this.selectedIdA.set(idA);
      }
      if (b) {
        const idB = Number(b);
        if (cands.some(c => c.id === idB)) this.selectedIdB.set(idB);
      }
    });

    effect(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { a: this.selectedIdA(), b: this.selectedIdB() },
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
