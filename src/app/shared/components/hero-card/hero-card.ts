import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectionService } from '../../../core/services/election.service';
import { CountUp } from '../count-up/count-up';

@Component({
  selector: 'app-hero-card',
  standalone: true,
  imports: [CommonModule, CountUp],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css'
})
export class HeroCard {
  electionService = inject(ElectionService);

  candidates = this.electionService.candidates;
}
