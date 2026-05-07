import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouncilService } from '../../../core/services/council.service';

interface MiniDot {
  x: number;
  y: number;
  color: string;
  partyName: string;
}

const ROWS = [
  { radius: 60, count: 9 },
  { radius: 80, count: 13 },
  { radius: 100, count: 14 },
  { radius: 120, count: 14 },
];
const TOTAL = ROWS.reduce((s, r) => s + r.count, 0);

@Component({
  selector: 'app-council-mini-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './council-mini-chart.html',
  styleUrl: './council-mini-chart.css',
})
export class CouncilMiniChart {
  private council = inject(CouncilService);

  dots = computed((): MiniDot[] => {
    const summary = this.council.partySummary();
    if (!summary.length) return [];

    const colors: { color: string; name: string }[] = [];
    summary.forEach(item => {
      for (let i = 0; i < item.seats; i++) {
        colors.push({ color: item.party.color, name: item.party.partyName });
      }
    });
    while (colors.length < TOTAL) colors.push({ color: '#334155', name: '' });
    colors.length = TOTAL;

    const cx = 150, cy = 138;
    const result: MiniDot[] = [];
    let idx = 0;

    ROWS.forEach(row => {
      for (let i = 0; i < row.count; i++) {
        const angle = Math.PI * i / (row.count - 1);
        result.push({
          x: cx - row.radius * Math.cos(angle),
          y: cy - row.radius * Math.sin(angle),
          color: colors[idx].color,
          partyName: colors[idx].name,
        });
        idx++;
      }
    });

    return result;
  });

  hexPoints(cx: number, cy: number, r: number): string {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
  }
}
