import { Component, signal } from '@angular/core';
import { MapViewer } from '../../../features/map-viewer/map-viewer';
import { PolicyList } from '../../../features/policy-list/policy-list';
import { HeroCard } from '../../../shared/components/hero-card/hero-card';
import { DistrictBarchart } from '../../../shared/components/district-barchart/district-barchart';
import { DistrictModal } from '../../../shared/components/district-modal/district-modal';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    MapViewer, PolicyList,
    HeroCard, DistrictBarchart,
    DistrictModal
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css'
})
export class DashboardLayout {
  districtBars = signal([
    { id: 1, label: 'ปทุมวัน', pct: 91 },
    { id: 2, label: 'พระนคร', pct: 88 },
    { id: 3, label: 'บางรัก', pct: 82 },
    { id: 4, label: 'สาทร', pct: 79 },
    { id: 5, label: 'คลองเตย', pct: 77 },
    { id: 6, label: 'ลาดพร้าว', pct: 75 },
    { id: 7, label: 'ลาดกระบัง', pct: 70 },
    { id: 8, label: 'บึงกุ่ม', pct: 65 },
    { id: 9, label: 'มีนบุรี', pct: 62 },
    { id: 10, label: 'หนองจอก', pct: 58 },
  ]);
}
