import { Component, input } from '@angular/core';
import { Candidate } from '../../../core/models/election.models';

@Component({
  selector: 'app-policy-card',
  imports: [],
  templateUrl: './policy-card.html',
  styleUrl: './policy-card.css',
})
export class PolicyCard {
  candidate = input.required<Candidate>();
  rank = input<number>(0);
}

