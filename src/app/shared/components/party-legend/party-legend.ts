import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouncilParty } from '../../../core/models/election.models';

export interface PartyLegendItem {
  party: CouncilParty;
  seats: number;
}

@Component({
  selector: 'app-party-legend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './party-legend.html',
  styleUrl: './party-legend.css',
})
export class PartyLegend {
  @Input() parties: PartyLegendItem[] = [];
}
