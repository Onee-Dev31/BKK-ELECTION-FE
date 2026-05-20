import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapStateService } from '../../core/services/map-state';
import { ElectionService } from '../../core/services/election.service';
import { CouncilService } from '../../core/services/council.service';
import { ThaiPBSService } from '../../core/services/thai-pbs.service';
import { DISTRICT_MAP_NAMES } from '../../core/constants/map-names.constants';
import { sumVotes, calcPercent } from '../../core/utils/election.utils';
import { GeoMap } from '../geo-map/geo-map';
import { JigsawMap } from '../jigsaw-map/jigsaw-map';

@Component({
  selector: 'app-map-viewer',
  standalone: true,
  imports: [CommonModule, GeoMap, JigsawMap],
  templateUrl: './map-viewer.html',
  styleUrl: './map-viewer.css',
})
export class MapViewer {
  mapState = inject(MapStateService);
  electionService = inject(ElectionService);
  councilService = inject(CouncilService);
  thaipbs = inject(ThaiPBSService);
  districts = this.mapState.districts;

  filterCandidate = computed(() => {
    const id = this.mapState.selectedCandidateId();
    if (id === null) return null;
    return this.electionService.candidateMap().get(id) ?? null;
  });

  clearFilter() {
    this.mapState.selectedCandidateId.set(null);
  }

  selectDistrict(id: number) {
    this.mapState.selectedDistrictId.set(id);
    this.mapState.selectedCandidateId.set(null);
  }

  getShortName(id: number): string {
    return DISTRICT_MAP_NAMES[id] || 'N/A';
  }

  getGovernorColor(candidateId?: number): string {
    const c = candidateId != null ? this.electionService.candidateMap().get(candidateId) : undefined;
    return c ? c.color : '#1e293b';
  }

  getCouncilColor(districtId: number): string {
    const partyId = this.councilService.leadingPartyByDistrict().get(districtId);
    const party = partyId ? this.thaipbs.partyMap().get(partyId) : null;
    return party ? party.color : '#1a3a2a';
  }

  getDistrictTooltipData(districtId: number) {
    if (this.mapState.activeTab() === 'sk') {
      return this.getCouncilTooltipData(districtId);
    }
    return this.getGovernorTooltipData(districtId);
  }

  private getGovernorTooltipData(districtId: number) {
    const result = this.electionService.getDistrictResults(districtId);
    if (!result || !result.candidateResults.length) return null;

    const topResult = [...result.candidateResults].sort((a, b) => b.votes - a.votes)[0];
    const candidateInfo = this.electionService.candidateMap().get(topResult.candidateId);
    if (!candidateInfo) return null;

    const totalDistrictVotes = sumVotes(result.candidateResults);
    const percentage = calcPercent(topResult.votes, totalDistrictVotes);

    return {
      type: 'governor' as const,
      candidateName: candidateInfo.name,
      partyName: candidateInfo.party,
      color: candidateInfo.color,
      imageUrl: candidateInfo.imageUrl,
      partyLogoUrl: candidateInfo.partyLogoUrl,
      votes: topResult.votes,
      percentage,
    };
  }

  private getCouncilTooltipData(districtId: number) {
    const partyId = this.councilService.leadingPartyByDistrict().get(districtId);
    const party = partyId ? this.thaipbs.partyMap().get(partyId) : null;
    const count = this.councilService.candidatesByDistrict(districtId).length;
    if (!count) return null;

    return {
      type: 'council' as const,
      partyName: party?.partyName ?? '',
      partyLogoUrl: party?.partyLogoUrl ?? '',
      color: party?.color ?? '#64748b',
      count,
    };
  }
}
