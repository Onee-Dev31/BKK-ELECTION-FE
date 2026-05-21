import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../../../core/models/election.models';
import { VoteDiff } from '../../compare-candidates.types';
import { ELECTION_CONSTANTS } from '../../../../core/constants/election.constants';

@Component({
  selector: 'app-vote-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vote-bar.html',
  styleUrl: './vote-bar.css'
})
export class VoteBar {
  @Input() voteDiff!: VoteDiff | null;
  @Input() candidateA: Candidate | undefined;
  @Input() candidateB: Candidate | undefined;

  getImageUrl(number: number): string {
    return ELECTION_CONSTANTS.ASSETS.CANDIDATE_IMAGE.replace('{no}', number.toString());
  }

  formatVotes(v: number): string {
    return v.toLocaleString('th-TH');
  }
}
