export interface Candidate {
  id: number;
  name: string;
  party: string;
  number: number;
  votes: number;
  percentage: number;
  imageUrl: string;
  partyLogoUrl: string;
  color: string;
}

export interface CandidatePolicy {
  category: string;
  description: string;
}

export interface DistrictResult {
  districtId: number;
  candidateResults: {
    candidateId: number;
    votes: number;
  }[];
}

export interface ElectionData {
  candidates: Candidate[];
  districtResults: DistrictResult[];
  totalVotes: number;
  goodVotes: number;
  badVotes: number;
  noVotes: number;
  eligibleVoters: number;
  actualVoters: number;
  turnoutPercent: number;
  countedDistricts: number;
  totalDistricts: number;
  lastUpdated: string;
  electionYear: number;
  progressPercent: number;
}
