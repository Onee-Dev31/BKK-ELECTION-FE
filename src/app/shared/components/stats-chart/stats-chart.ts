import { Component, computed, inject } from '@angular/core';
import { ElectionService } from '../../../core/services/election.service';

@Component({
  selector: 'app-stats-chart',
  imports: [],
  templateUrl: './stats-chart.html',
  styleUrl: './stats-chart.css',
})
export class StatsChart {
  private electionService = inject(ElectionService);
  candidates = this.electionService.candidates;

  // Convert votes to conic-gradient segments using computed signal
  conicGradient = computed(() => {
    const total = this.candidates().reduce((sum, c) => sum + c.votes, 0);
    let angle = 0;
    const parts = this.candidates().map(c => {
      const deg = (c.votes / total) * 360;
      const part = `${c.color} ${angle.toFixed(1)}deg ${(angle + deg).toFixed(1)}deg`;
      angle += deg;
      return part;
    });
    return `conic-gradient(${parts.join(', ')})`;
  });
}
