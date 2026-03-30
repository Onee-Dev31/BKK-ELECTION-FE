import { Injectable, signal, computed, inject } from '@angular/core';
import { ElectionService } from './election.service';
import { District } from '../models/election.models';
import { DISTRICT_LAYOUTS } from '../constants/map-layout.constants';

@Injectable({
  providedIn: 'root'
})
export class MapStateService {
  private electionService = inject(ElectionService);

  private rawDistricts = signal<District[]>(DISTRICT_LAYOUTS);

  districts = computed(() => {
    return this.rawDistricts().map(d => ({
      ...d,
      leadingCandidateId: this.electionService.getLeadingCandidateId(d.id)
    }));
  });

  selectedDistrictId = signal<number | null>(null);
  selectedCandidateId = signal<number | null>(null);

  selectedDistrict = computed(() => {
    const id = this.selectedDistrictId();
    if (id === null) return null;
    return this.districts().find(d => d.id === id) || null;
  });
}
