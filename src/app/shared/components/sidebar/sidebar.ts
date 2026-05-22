import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Theme } from '../../../core/services/theme/theme';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  themeService = inject(Theme);
  router = inject(Router);

  navItems = [
    { path: '/dashboard', id: 'map', label: 'หน้าแรก' },
    { path: '/candidates', id: 'candidates', label: 'ผู้สมัคร' },
    { path: '/districts', id: 'districts', label: 'รายเขต' },
    { path: '/compare', id: 'compare', label: 'เปรียบเทียบ' },
  ];

  isActive(path: string) {
    if (path === '/') {
      return this.router.url === '/';
    }
    return this.router.url.startsWith(path);
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
