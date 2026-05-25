import { Component, input, output } from '@angular/core';
import { Candidate } from '../../../../core/models/election.models';
import { ELECTION_CONSTANTS } from '../../../../core/constants/election.constants';
import { formatVotes } from '../../../../core/utils/election.utils';

@Component({
  selector: 'app-candidate-row',
  standalone: true,
  host: {
    class: 'cand-row',
    '[style.--c]': 'candidate().color',
    '(click)': 'clicked.emit()',
  },
  templateUrl: './candidate-row.html',
  styleUrl: './candidate-row.css',
})
export class CandidateRow {
  candidate = input.required<Candidate>();
  rank = input.required<number>();
  maxVotes = input.required<number>();
  clicked = output<void>();

  readonly formatVotes = formatVotes;

  imgUrl(): string {
    return ELECTION_CONSTANTS.ASSETS.CANDIDATE_IMAGE.replace('{no}', this.candidate().number.toString());
  }
}
