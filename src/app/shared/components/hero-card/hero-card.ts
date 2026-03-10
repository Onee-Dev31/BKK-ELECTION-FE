import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectionService } from '../../../core/services/election.service';

@Component({
  selector: 'app-hero-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css'
})
export class HeroCard {
  electionService = inject(ElectionService);

  candidates = this.electionService.candidates;
}
