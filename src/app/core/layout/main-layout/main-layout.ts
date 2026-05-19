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
    { path: '/', id: 'map', label: 'หน้าแรก' },
    { path: '/compare', id: 'compare', label: 'เปรียบเทียบ' },
    { path: '/top5', id: 'top5', label: 'Top 5' },
  ];

  isActive(path: string) {
    if (path === '/') return this.router.url === '/';
    return this.router.url.startsWith(path);
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
