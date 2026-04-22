import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CloudGate } from '../../../shared/components/cloud-gate/cloud-gate';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CloudGate, Sidebar],
  templateUrl: './main-layout.html'
})
export class MainLayout {
  router = inject(Router);

  navItems = [
    { path: '/', id: 'map', label: 'หน้าแรก' },
    { path: '/compare', id: 'compare', label: 'เปรียบเทียบ' },
    { path: '/top10', id: 'top10', label: 'Top 10' },
  ];

  isActive(path: string) {
    if (path === '/') return this.router.url === '/';
    return this.router.url.startsWith(path);
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
