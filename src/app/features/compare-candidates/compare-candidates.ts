import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElectionService } from '../../core/services/election.service';
import { CandidatePolicy } from '../../core/models/election.models';

@Component({
  selector: 'app-compare-candidates',
  imports: [CommonModule, FormsModule],
  templateUrl: './compare-candidates.html',
  styleUrl: './compare-candidates.css'
})
export class CompareCandidates {
  electionService = inject(ElectionService);
  candidates = this.electionService.candidates;

  selectedIdA = signal<number>(1);
  selectedIdB = signal<number>(2);

  candidateA = computed(() => this.candidates().find(c => c.id === this.selectedIdA()));
  candidateB = computed(() => this.candidates().find(c => c.id === this.selectedIdB()));

  sortedCandidates = computed(() => {
    return [...this.candidates()].sort((a, b) => a.number - b.number);
  });

  onSelectA(id: number) {
    if (id === this.selectedIdB()) {
      this.selectedIdB.set(this.selectedIdA());
    }
    this.selectedIdA.set(id);
  }

  onSelectB(id: number) {
    if (id === this.selectedIdA()) {
      this.selectedIdA.set(this.selectedIdB());
    }
    this.selectedIdB.set(id);
  }

  getPolicies(candidateId: number | undefined): CandidatePolicy[] {
    if (!candidateId) return [];
    return this.electionService.getCandidatePolicies(candidateId);
  }
}

