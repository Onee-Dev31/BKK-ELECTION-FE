import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../../../core/models/election.models';
import { formatVotes } from '../../../../core/utils/election.utils';

export interface DistrictItem {
  id: number;
  name: string;
  leader: Candidate | null;
  leaderVotes: number;
  totalVotes: number;
  pct: string;
  top3: { color: string }[];
}

@Component({
  selector: 'app-district-row',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'district-row',
    '(click)': 'clicked.emit()',
  },
  templateUrl: './district-row.html',
  styleUrl: './district-row.css',
})
export class DistrictRow {
  district = input.required<DistrictItem>();
  rank = input.required<number>();
  clicked = output<void>();

  readonly formatVotes = formatVotes;
}
