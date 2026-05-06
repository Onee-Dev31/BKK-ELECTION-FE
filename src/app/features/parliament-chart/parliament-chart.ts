import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouncilService } from '../../core/services/council.service';

interface Dot { x: number; y: number; color: string }

@Component({
  selector: 'app-parliament-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parliament-chart.html',
  styleUrl: './parliament-chart.css',
})
export class ParliamentChart {
  council = inject(CouncilService);
  
  partyResults = computed(() => this.council.partySummary());

  dots = computed(() => {
    const results = this.partyResults();
    const colors: string[] = [];
    results.forEach(p => {
      for (let i = 0; i < p.seats; i++) {
        colors.push(p.party.color);
      }
    });
    while (colors.length < 50) colors.push('#1e3a2a');

    const ROWS = [
      { radius: 140, count: 9  },
      { radius: 200, count: 13 },
      { radius: 260, count: 14 },
      { radius: 320, count: 14 },
    ];
    const CX = 400, CY = 360;

    const dots: Dot[] = [];
    let idx = 0;
    ROWS.forEach(row => {
      for (let i = 0; i < row.count; i++) {
        const angle = Math.PI * i / (row.count - 1);
        dots.push({
          x: CX - row.radius * Math.cos(angle),
          y: CY - row.radius * Math.sin(angle),
          color: colors[idx++]
        });
      }
    });
    return dots;
  });
}
