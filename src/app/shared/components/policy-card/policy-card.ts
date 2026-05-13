import { Component, input } from '@angular/core';
import { Candidate } from '../../../core/models/election.models';
import { CountUp } from '../count-up/count-up';

@Component({
  selector: 'app-policy-card',
  imports: [CountUp],
  templateUrl: './policy-card.html',
  styleUrl: './policy-card.css',
})
export class PolicyCard {
  candidate = input.required<Candidate>();
  rank = input<number>(0);
}

