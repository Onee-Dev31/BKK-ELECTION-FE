import { Candidate } from '../../core/models/election.models';

export type DistrictView = 'closest' | 'a' | 'b';

export interface MiniHex {
  id: number;
  points: string;
}

export interface DistrictEntry {
  id: number;
  name: string;
  aVotes: number;
  bVotes: number;
  diff: number;
}

export interface DistrictH2H {
  aLeads: number;
  bLeads: number;
  map: Map<number, { aVotes: number; bVotes: number; diff: number }>;
}

export interface CandidateInfo extends Candidate {
  rank: number;
}

export interface VoteDiff {
  diff: number;
  aWidth: number;
  bWidth: number;
  aAhead: boolean;
}
