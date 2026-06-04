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

export interface PartyRankingEntry {
  candidate_name: string;
  candidate_img: string;
  party_name: string;
  party_logo: string;
  score: number;
  counted: string;
}

export type PartyRankingsResponse = Record<string, PartyRankingEntry>;

export interface GovernorStats {
  electionId: string;
  level: string;
  lastUpdate: string;
  statistics: {
    goodVotes: number;
    totalVotes: number;
    invalidVotes: number;
    noVotes: number;
    eligibleVoters: number;
    voterTurnoutPercentage: number;
  };
  coverage: {
    stationsReported: number;
    totalStations: number;
    percentage: number;
  };
}

export interface GovernorCandidateResult {
  id: string;
  totalVotes: number;
  rank: number;
  percentage: number;
}

export interface ExportSettings {
  enabled: boolean;
  intervalSeconds: number;
  exportPath?: string;
}

export interface CouncilCandidate2026 {
  id: string;
  number: number;
  name: string;
  areaNumber: number;
  party: {
    id: string;
    code: string;
    name: string;
    color: string;
  };
  totalVotes: number;
  rank: number;
  percentage: number;
}
