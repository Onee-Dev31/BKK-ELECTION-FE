import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../../../core/models/election.models';
import { DistrictEntry, DistrictView } from '../../compare-candidates.types';

@Component({
  selector: 'app-district-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './district-chart.html',
  styleUrl: './district-chart.css'
})
export class DistrictChart {
  @Input() shownDistricts: DistrictEntry[] = [];
  @Input() districtView: DistrictView = 'closest';
  @Input() candidateA: Candidate | undefined;
  @Input() candidateB: Candidate | undefined;
  @Output() districtViewChange = new EventEmitter<DistrictView>();

  get maxVotes(): number {
    return Math.max(...this.shownDistricts.flatMap(d => [d.aVotes, d.bVotes]), 1);
  }

  barHeightA(d: DistrictEntry): string {
    return ((d.aVotes / this.maxVotes) * 100).toFixed(1) + '%';
  }

  barHeightB(d: DistrictEntry): string {
    return ((d.bVotes / this.maxVotes) * 100).toFixed(1) + '%';
  }

  firstName(name: string | undefined): string {
    return (name ?? '').split(' ')[0];
  }

  formatVotes(v: number): string {
    return v.toLocaleString('th-TH');
  }
}
