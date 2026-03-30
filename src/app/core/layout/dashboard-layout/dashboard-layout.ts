import { Component } from '@angular/core';
import { MapViewer } from '../../../features/map-viewer/map-viewer';
import { PolicyList } from '../../../features/policy-list/policy-list';
import { HeroCard } from '../../../shared/components/hero-card/hero-card';
import { DistrictModal } from '../../../shared/components/district-modal/district-modal';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    MapViewer, PolicyList,
    HeroCard, DistrictModal,
    Navbar
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {
}
