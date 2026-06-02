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

export interface CouncilCandidate {
  number: number;
  firstName: string;
  lastName: string;
  fullName: string;
  partyId: number;
  imgUrl: string;
  areaNumber: number;
}

export interface CouncilParty {
  partyId: number;
  code: string;
  partyName: string;
  partyLogoUrl: string;
  color: string;
  active: boolean;
}

export interface ThaipbsCandidate {
  number: number;
  title: string;
  firstName: string;
  lastName: string;
  fullName: string;
  partyId: number;
  updatedAt: string;
  imgUrl: string;
  theme?: { colorLight: string; colorDark: string };
}

export interface ThaipbsDistrict {
  number: number;
  name: string;
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

export interface CouncilDistrictSummary {
  number: number;
  interestingFactor: number;
  leaders: {
    number: number;
    rank: number;
    totalVotes: number;
    percentVotes: number;
  }[];
  overallStatistics: {
    totalVotes: number;
    goodVotes: number;
    badVotes: number;
    noVotes: number;
    percentGoodVotes: number;
    percentBadVotes: number;
    percentNoVotes: number;
    totalEligible: number;
  };
}

export interface CouncilSummaryData {
  latestFetchedAt: string;
  data: CouncilDistrictSummary[];
}
