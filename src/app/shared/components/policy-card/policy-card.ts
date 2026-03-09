import { Component, input } from '@angular/core';
import { Candidate } from '../../../core/services/policy';
import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
  selector: 'app-policy-card',
  imports: [NzProgressModule],
  templateUrl: './policy-card.html',
  styleUrl: './policy-card.css',
})
export class PolicyCard {
  candidate = input.required<Candidate>();
}

