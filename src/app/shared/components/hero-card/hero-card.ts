import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElectionService } from '../../../core/services/election.service';
import { MapStateService } from '../../../core/services/map-state';

@Component({
  selector: 'app-hero-card',
  imports: [CommonModule],
  templateUrl: './hero-card.html'
})
export class HeroCard {
  electionService = inject(ElectionService);
  mapState = inject(MapStateService);

  candidates = this.electionService.candidates;

  displayCandidate = computed(() => {
    const selectedId = this.mapState.selectedCandidateId();
    if (selectedId !== null) {
      return this.candidates().find(c => c.id === selectedId) || this.candidates()[0];
    }
    return this.candidates()[0];
  });
}
