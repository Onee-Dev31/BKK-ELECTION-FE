import { Component, inject, computed, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouncilService } from '../../core/services/council.service';
import { CouncilCandidate } from '../../core/models/election.models';
import { PartyLegend } from '../../shared/components/party-legend/party-legend';
import { SeatPopupCard, SeatCardData } from '../../shared/components/seat-popup-card/seat-popup-card';

const VB_W = 800;
const VB_H = 400;

interface Dot {
  x: number;
  y: number;
  color: string;
  districtId: number;
  candidate: CouncilCandidate | null;
  partyName: string;
  partyLogoUrl: string;
}

interface SelectedSeat {
  dot: Dot;
  leftPct: number;
  topPct: number;
}

@Component({
  selector: 'app-parliament-chart',
  standalone: true,
  imports: [CommonModule, PartyLegend, SeatPopupCard],
  templateUrl: './parliament-chart.html',
  styleUrl: './parliament-chart.css',
})
export class ParliamentChart {
  council = inject(CouncilService);

  @ViewChild('svgWrap') private svgWrapRef!: ElementRef<HTMLElement>;
  @ViewChild('svgEl')   private svgElRef!:   ElementRef<SVGSVGElement>;

  partyResults = computed(() => this.council.partySummary());
  selectedSeat = signal<SelectedSeat | null>(null);

  hexPoints(cx: number, cy: number, r: number): string {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
  }

  seatCardData = computed((): SeatCardData | null => {
    const sel = this.selectedSeat();
    if (!sel || !sel.dot.candidate) return null;
    return {
      districtId: sel.dot.districtId,
      candidate: sel.dot.candidate,
      partyName: sel.dot.partyName,
      partyLogoUrl: sel.dot.partyLogoUrl,
      color: sel.dot.color,
      leftPct: sel.leftPct,
      topPct: sel.topPct,
    };
  });

  selectSeat(dot: Dot) {
    if (!dot.candidate) return;
    if (this.selectedSeat()?.dot.districtId === dot.districtId) {
      this.selectedSeat.set(null);
      return;
    }
    this.selectedSeat.set({ dot, ...this.dotPosition(dot) });
  }

  private dotPosition(dot: Dot): { leftPct: number; topPct: number } {
    const svg  = this.svgElRef?.nativeElement;
    const wrap = this.svgWrapRef?.nativeElement;
    if (!svg || !wrap) {
      return {
        leftPct: Math.min(Math.max(dot.x / VB_W * 100, 20), 80),
        topPct:  Math.max(dot.y / VB_H * 100, 25),
      };
    }

    const svgR  = svg.getBoundingClientRect();
    const wrapR = wrap.getBoundingClientRect();

    // Actual scale used by preserveAspectRatio="xMidYMid meet"
    const scale   = Math.min(svgR.width / VB_W, svgR.height / VB_H);
    const offsetX = (svgR.width  - VB_W * scale) / 2;
    const offsetY = (svgR.height - VB_H * scale) / 2;

    const dotX = (svgR.left - wrapR.left) + offsetX + dot.x * scale;
    const dotY = (svgR.top  - wrapR.top)  + offsetY + dot.y * scale;

    return {
      leftPct: Math.min(Math.max(dotX / wrapR.width  * 100, 20), 80),
      topPct:  Math.max(dotY / wrapR.height * 100, 25),
    };
  }

  dots = computed(() => {
    const results = this.partyResults();
    const winners = this.council.districtWinners();

    const partyQueues = new Map<number, typeof winners>();
    winners.forEach(w => {
      if (!partyQueues.has(w.winner.partyId)) partyQueues.set(w.winner.partyId, []);
      partyQueues.get(w.winner.partyId)!.push(w);
    });

    const seats: Omit<Dot, 'x' | 'y'>[] = [];
    results.forEach(p => {
      (partyQueues.get(p.party.partyId) ?? []).forEach(w => {
        seats.push({
          color: p.party.color,
          districtId: w.districtId,
          candidate: w.winner,
          partyName: p.party.partyName,
          partyLogoUrl: p.party.partyLogoUrl,
        });
      });
    });
    while (seats.length < 50) {
      seats.push({ color: '#1e3a2a', districtId: 0, candidate: null, partyName: '', partyLogoUrl: '' });
    }
    seats.length = 50;

    const INNER_R  = 155;
    const ROW_GAP  = 55;
    const NUM_ROWS = 4;

    const CX = 400, CY = 360;
    const radii = Array.from({ length: NUM_ROWS }, (_, i) => INNER_R + ROW_GAP * i);
    const totalR = radii.reduce((s, r) => s + r, 0);
    const counts = radii.map(r => Math.round(50 * r / totalR));
    counts[NUM_ROWS - 1] += 50 - counts.reduce((s, c) => s + c, 0);

    const dots: Dot[] = [];
    let idx = 0;
    radii.forEach((radius, ri) => {
      const count = counts[ri];
      for (let i = 0; i < count; i++) {
        const angle = Math.PI * i / (count - 1);
        dots.push({
          x: CX - radius * Math.cos(angle),
          y: CY - radius * Math.sin(angle),
          ...seats[idx++],
        });
      }
    });
    return dots;
  });
}
