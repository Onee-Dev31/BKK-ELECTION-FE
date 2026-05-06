import { Component, inject } from '@angular/core';
import { MapViewer } from '../../../features/map-viewer/map-viewer';
import { PolicyList } from '../../../features/policy-list/policy-list';
import { HeroCard } from '../../../shared/components/hero-card/hero-card';
import { DistrictModal } from '../../../shared/components/district-modal/district-modal';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { CouncilResult } from '../../../features/council-result/council-result';
import { ParliamentChart } from '../../../features/parliament-chart/parliament-chart';
import { MapStateService } from '../../../core/services/map-state';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    MapViewer, PolicyList,
    HeroCard, DistrictModal,
    Navbar, CouncilResult,
    ParliamentChart
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {
  mapState = inject(MapStateService);
}
