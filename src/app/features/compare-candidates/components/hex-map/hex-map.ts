import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../../../core/models/election.models';
import { MiniHex, DistrictH2H } from '../../compare-candidates.types';

@Component({
  selector: 'app-hex-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hex-map.html',
  styleUrl: './hex-map.css'
})
export class HexMap {
  @Input() miniHexes: MiniHex[] = [];
  @Input() miniSvgW = 0;
  @Input() miniSvgH = 0;
  @Input() candidateA: Candidate | undefined;
  @Input() candidateB: Candidate | undefined;
  @Input() districtH2H!: DistrictH2H;

  hexFill(id: number): string {
    const a = this.candidateA;
    const b = this.candidateB;
    const d = this.districtH2H?.map.get(id);
    if (!d || !a || !b) return '#1e293b';
    if (d.aVotes > d.bVotes) return a.color;
    if (d.bVotes > d.aVotes) return b.color;
    return '#334155';
  }

  hexOpacity(id: number): number {
    const d = this.districtH2H?.map.get(id);
    if (!d || (d.aVotes === 0 && d.bVotes === 0)) return 0.18;
    return 0.82;
  }
}
