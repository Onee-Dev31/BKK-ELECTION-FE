import { Component, inject } from '@angular/core';
import { PolicyService } from '../../../core/services/policy';

@Component({
  selector: 'app-hero-card',
  standalone: true,
  imports: [],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css'
})
export class HeroCard {
  policyService = inject(PolicyService);
}
