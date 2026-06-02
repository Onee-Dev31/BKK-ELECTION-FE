import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
export class DashboardLayout implements OnInit {
  mapState = inject(MapStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  copyToast = signal(false);

  constructor() {
    effect(() => {
      const id = this.mapState.selectedDistrictId();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: id ? { district: id } : {},
        replaceUrl: true
      });
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const d = params['district'];
      if (d) this.mapState.selectedDistrictId.set(+d);
    });
  }

  shareUrl() {
    const id = this.mapState.selectedDistrictId();
    const base = window.location.origin + window.location.pathname;
    const url = id ? `${base}#/?district=${id}` : `${base}#/`;
    navigator.clipboard.writeText(url).then(() => {
      this.copyToast.set(true);
      setTimeout(() => this.copyToast.set(false), 2200);
    }).catch(() => {});
  }
}
