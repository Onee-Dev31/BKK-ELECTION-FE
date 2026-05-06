import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CouncilCandidate, CouncilSummaryData, CouncilDistrictSummary } from '../models/election.models';
import { ThaiPBSService } from './thai-pbs.service';

// Final results: 2022 Bangkok Council Election (50 seats total)
const COUNCIL_SEATS: Record<number, number> = {
  9: 20,  // เพื่อไทย
  2: 14,  // ก้าวไกล
  4: 9,   // ประชาธิปัตย์
  13: 3,  // อิสระ(กลุ่มรักษ์กรุงเทพ)
  5: 2,   // พลังประชารัฐ
  11: 2,  // ไทยสร้างไทย
};

@Injectable({ providedIn: 'root' })
export class CouncilService {
  private http = inject(HttpClient);
  private thaipbs = inject(ThaiPBSService);

  candidates = signal<CouncilCandidate[]>([]);
  summaryData = signal<CouncilSummaryData | null>(null);
  isLoading = signal(false);

  partyMap = this.thaipbs.partyMap;

  constructor() {
    this.loadData();
  }

  async loadData() {
    this.isLoading.set(true);
    try {
      // Load candidates with fallback
      const candidates = await lastValueFrom(
        this.http.get<CouncilCandidate[]>('https://bkkelection65-data.thaipbs.or.th/website/council.json')
      ).catch(async () => {
        console.warn('External council candidates load failed, trying local');
        return await lastValueFrom(this.http.get<CouncilCandidate[]>('data/council.json'));
      });
      this.candidates.set(candidates);

      // Load summary data
      const summary = await lastValueFrom(
        this.http.get<CouncilSummaryData>('data/district-council-results.json')
      ).catch(err => {
        console.error('Local summary data load failed:', err);
        return null;
      });
      this.summaryData.set(summary);

    } catch (e) {
      console.error('Council data unexpected error:', e);
    } finally {
      this.isLoading.set(false);
    }
  }

  getDistrictSummary(districtId: number): CouncilDistrictSummary | undefined {
    return this.summaryData()?.data.find(d => d.number === districtId);
  }

  candidatesByDistrict = (districtId: number) =>
    this.candidates().filter(c => c.areaNumber === districtId);

  leadingPartyByDistrict = computed(() => {
    const map = new Map<number, number>();
    const summary = this.summaryData();
    const candidates = this.candidates();
    
    if (!summary || !candidates.length) return map;

    summary.data.forEach(d => {
      const winner = d.leaders.find(l => l.rank === 1);
      if (winner) {
        // Find the candidate in this district with this number
        const c = candidates.find(c => c.areaNumber === d.number && c.number === winner.number);
        if (c) map.set(d.number, c.partyId);
      }
    });

    return map;
  });

  districtWinners = computed(() => {
    const winners: { districtId: number, winner: CouncilCandidate, summary: CouncilDistrictSummary }[] = [];
    const summary = this.summaryData();
    const candidates = this.candidates();
    
    if (!summary || !candidates.length) return winners;

    summary.data.forEach(d => {
      const winnerLeader = d.leaders.find(l => l.rank === 1);
      if (winnerLeader) {
        const candidate = candidates.find(c => c.areaNumber === d.number && c.number === winnerLeader.number);
        if (candidate) {
          winners.push({ districtId: d.number, winner: candidate, summary: d });
        }
      }
    });
    
    // Sort by district number
    return winners.sort((a, b) => a.districtId - b.districtId);
  });

  partySummary = computed(() => {
    const counts = new Map<number, number>();
    this.leadingPartyByDistrict().forEach(partyId => {
      counts.set(partyId, (counts.get(partyId) || 0) + 1);
    });

    return this.thaipbs.parties()
      .map(party => ({
        party,
        seats: counts.get(party.partyId) ?? 0,
      }))
      .sort((a, b) => b.seats - a.seats || a.party.partyId - b.party.partyId);
  });
}
