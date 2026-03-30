import { Component, inject, computed } from '@angular/core';
import { ElectionService } from '../../core/services/election.service';
import { MapStateService } from '../../core/services/map-state';
import { PolicyCard } from '../../shared/components/policy-card/policy-card';

@Component({
  selector: 'app-policy-list',
  imports: [PolicyCard],
  templateUrl: './policy-list.html'
})
export class PolicyList {
  private electionService = inject(ElectionService);
  private mapState = inject(MapStateService);

  candidates = computed(() => {
    const selectedId = this.mapState.selectedCandidateId();
    let all = [...this.electionService.candidates()];
    
    // Sort logic
    const totalVotes = all.reduce((sum, c) => sum + c.votes, 0);
    if (totalVotes === 0) {
        all.sort((a, b) => a.number - b.number);
    } else {
        all.sort((a, b) => b.votes - a.votes);
    }

    if (selectedId !== null) {
      return all.filter(c => c.id === selectedId);
    }
    return all;
  });

  selectCandidate(candidateId: number) {
    this.mapState.selectedCandidateId.set(candidateId);
    this.mapState.selectedDistrictId.set(null); // Clear district selection when picking candidate
  }
}

