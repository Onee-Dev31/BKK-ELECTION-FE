import { Component, inject } from '@angular/core';
import { PolicyService } from '../../core/services/policy';
import { PolicyCard } from '../../shared/components/policy-card/policy-card';

@Component({
  selector: 'app-policy-list',
  imports: [PolicyCard],
  templateUrl: './policy-list.html',
  styleUrl: './policy-list.css',
})
export class PolicyList {
  private policyService = inject(PolicyService);
  candidates = this.policyService.candidates;
}

