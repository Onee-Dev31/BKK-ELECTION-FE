import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouncilCandidate } from '../../../core/models/election.models';

export interface SeatCardData {
  districtId: number;
  candidate: CouncilCandidate;
  partyName: string;
  partyLogoUrl: string;
  color: string;
  leftPct: number;
  topPct: number;
}

@Component({
  selector: 'app-seat-popup-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-popup-card.html',
  styleUrl: './seat-popup-card.css',
})
export class SeatPopupCard {
  @Input() data!: SeatCardData;
  @Output() close = new EventEmitter<void>();
}
