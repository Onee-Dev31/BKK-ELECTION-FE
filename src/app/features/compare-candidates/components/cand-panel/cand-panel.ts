import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Candidate } from '../../../../core/models/election.models';
import { CandidateInfo } from '../../compare-candidates.types';
import { ELECTION_CONSTANTS } from '../../../../core/constants/election.constants';

@Component({
  selector: 'app-cand-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cand-panel.html',
  styleUrl: './cand-panel.css'
})
export class CandPanel {
  @Input() info!: CandidateInfo | null;
  @Input() candidates: Candidate[] = [];
  @Input() selectedId = 0;
  @Output() selectedIdChange = new EventEmitter<number>();

  getImageUrl(number: number): string {
    return ELECTION_CONSTANTS.ASSETS.CANDIDATE_IMAGE.replace('{no}', number.toString());
  }

  formatVotes(v: number): string {
    return v.toLocaleString('th-TH');
  }
}
