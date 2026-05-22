import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Theme } from '../../services/theme/theme';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  templateUrl: './main-layout.html'
})
export class MainLayout {
  router = inject(Router);
  theme = inject(Theme);

  navItems = [
    { path: '/dashboard', id: 'map', label: 'หน้าแรก' },
    { path: '/candidates', id: 'candidates', label: 'ผู้สมัคร' },
    { path: '/districts', id: 'districts', label: 'รายเขต' },
    { path: '/compare', id: 'compare', label: 'เปรียบเทียบ' },
  ];

  isActive(path: string) {
    if (path === '/') return this.router.url === '/';
    return this.router.url.startsWith(path);
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
