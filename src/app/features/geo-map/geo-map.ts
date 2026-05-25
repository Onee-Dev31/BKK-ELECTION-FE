import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { MapStateService } from '../../core/services/map-state';
import { ElectionService } from '../../core/services/election.service';
import { CouncilService } from '../../core/services/council.service';
import { ThaiPBSService } from '../../core/services/thai-pbs.service';
import { DISTRICT_MAP_NAMES } from '../../core/constants/map-names.constants';
import { sumVotes, calcPercent } from '../../core/utils/election.utils';

interface GeoFeature {
  type: 'Feature';
  properties: { id: number; name: string; name_en: string };
  geometry: { type: 'MultiPolygon'; coordinates: number[][][][] };
}

@Component({
  selector: 'app-geo-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './geo-map.html',
  styleUrl: './geo-map.css',
})
export class GeoMap implements OnInit {
  private http = inject(HttpClient);
  mapState = inject(MapStateService);
  electionService = inject(ElectionService);
  councilService = inject(CouncilService);
  thaipbs = inject(ThaiPBSService);

  features = signal<GeoFeature[]>([]);
  hoveredId = signal<number | null>(null);
  tooltipX = signal(0);
  tooltipY = signal(0);
  tooltipAbove = signal(false);

  private readonly MIN_LON = 100.3200;
  private readonly MAX_LON = 100.9391;
  private readonly MIN_LAT = 13.4925;
  private readonly MAX_LAT = 13.9543;
  private readonly SVG_W = 800;
  private readonly SVG_H = 600;
  private readonly PAD = 18;

  private pathCache = new Map<number, string>();
  private centroidCache = new Map<number, [number, number]>();

  async ngOnInit() {
    const data: any = await lastValueFrom(this.http.get('/data/bangkok-districts.json'));
    const feats: GeoFeature[] = data.features;
    feats.forEach(f => {
      this.pathCache.set(f.properties.id, this.buildPath(f));
      this.centroidCache.set(f.properties.id, this.buildCentroid(f));
    });
    this.features.set(feats);
  }

  private project(lon: number, lat: number): [number, number] {
    const x = this.PAD + (lon - this.MIN_LON) / (this.MAX_LON - this.MIN_LON) * (this.SVG_W - 2 * this.PAD);
    const y = this.PAD + (this.MAX_LAT - lat) / (this.MAX_LAT - this.MIN_LAT) * (this.SVG_H - 2 * this.PAD);
    return [x, y];
  }

  private buildPath(feat: GeoFeature): string {
    let d = '';
    for (const polygon of feat.geometry.coordinates) {
      for (const ring of polygon) {
        d += ring.map((pt, i) => {
          const [x, y] = this.project(pt[0], pt[1]);
          return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
        }).join(' ') + ' Z ';
      }
    }
    return d.trim();
  }

  private buildCentroid(feat: GeoFeature): [number, number] {
    let maxPts: number[][] = [];
    for (const poly of feat.geometry.coordinates) {
      if (poly[0].length > maxPts.length) maxPts = poly[0];
    }
    const lon = maxPts.reduce((s, p) => s + p[0], 0) / maxPts.length;
    const lat = maxPts.reduce((s, p) => s + p[1], 0) / maxPts.length;
    return this.project(lon, lat);
  }

  pathFor(id: number): string { return this.pathCache.get(id) ?? ''; }
  centroid(id: number): [number, number] { return this.centroidCache.get(id) ?? [0, 0]; }

  getColor(districtId: number): string {
    if (this.mapState.activeTab() === 'sk') {
      const partyId = this.councilService.leadingPartyByDistrict().get(districtId);
      const party = partyId ? this.thaipbs.partyMap().get(partyId) : null;
      return party ? party.color : '#0a1e3d';
    }
    const leadingId = this.electionService.getLeadingCandidateId(districtId);
    const c = leadingId != null ? this.electionService.candidateMap().get(leadingId) : undefined;
    return c ? c.color : '#0a1e3d';
  }

  isHighlighted(districtId: number): boolean {
    const sel = this.mapState.selectedCandidateId();
    if (sel === null) return false;
    const leadingId = this.electionService.getLeadingCandidateId(districtId);
    return leadingId === sel;
  }

  isFaded(districtId: number): boolean {
    const sel = this.mapState.selectedCandidateId();
    if (sel === null) return false;
    return this.electionService.getLeadingCandidateId(districtId) !== sel;
  }

  getShortName(id: number): string {
    return DISTRICT_MAP_NAMES[id] || '';
  }

  onMouseEnter(id: number) {
    this.hoveredId.set(id);
  }

  onMouseMove(event: MouseEvent) {
    if ((event.target as Element).tagName !== 'path') {
      this.hoveredId.set(null);
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.tooltipX.set(x);
    this.tooltipY.set(y);
    this.tooltipAbove.set(y > rect.height * 0.6);
  }

  onMouseLeave() {
    this.hoveredId.set(null);
  }

  selectDistrict(id: number) {
    this.mapState.selectedDistrictId.set(id);
    this.mapState.selectedCandidateId.set(null);
  }

  getTooltipData(districtId: number | null) {
    if (districtId === null) return null;
    if (this.mapState.activeTab() === 'sk') return this.getCouncilTooltip(districtId);
    return this.getGovernorTooltip(districtId);
  }

  private getGovernorTooltip(districtId: number) {
    const result = this.electionService.getDistrictResults(districtId);
    if (!result?.candidateResults.length) return null;
    const top = [...result.candidateResults].sort((a, b) => b.votes - a.votes)[0];
    const info = this.electionService.candidateMap().get(top.candidateId);
    if (!info) return null;
    const total = sumVotes(result.candidateResults);
    return {
      type: 'governor' as const,
      candidateName: info.name,
      partyName: info.party,
      color: info.color,
      imageUrl: info.imageUrl,
      partyLogoUrl: info.partyLogoUrl,
      votes: top.votes,
      percentage: calcPercent(top.votes, total),
    };
  }

  private getCouncilTooltip(districtId: number) {
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
