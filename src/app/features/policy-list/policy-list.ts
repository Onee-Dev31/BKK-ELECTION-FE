import { Component, inject, computed } from '@angular/core';
import { ElectionService } from '../../core/services/election.service';
import { MapStateService } from '../../core/services/map-state';
import { PolicyCard } from '../../shared/components/policy-card/policy-card';

@Component({
  selector: 'app-policy-list',
  imports: [PolicyCard],
  templateUrl: './policy-list.html',
  styleUrl: './policy-list.css',
})
export class PolicyList {
  private electionService = inject(ElectionService);
  private mapState = inject(MapStateService);

  candidates = computed(() => {
    const selectedId = this.mapState.selectedCandidateId();
    const all = this.electionService.candidates();
    
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

