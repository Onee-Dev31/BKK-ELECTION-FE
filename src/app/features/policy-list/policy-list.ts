import { Component, inject } from '@angular/core';
import { ElectionService } from '../../core/services/election.service';
import { PolicyCard } from '../../shared/components/policy-card/policy-card';

@Component({
  selector: 'app-policy-list',
  imports: [PolicyCard],
  templateUrl: './policy-list.html',
  styleUrl: './policy-list.css',
})
export class PolicyList {
  private electionService = inject(ElectionService);
  candidates = this.electionService.candidates;
}

