import { Routes } from '@angular/router';
import { DashboardLayout } from './core/layout/dashboard-layout/dashboard-layout';
import { CompareCandidates } from './features/compare-candidates/compare-candidates';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { ComingSoon } from './features/coming-soon/coming-soon';
import { CandidatesStack } from './features/candidates-stack/candidates-stack';
import { AdminLogin } from './features/admin-login/admin-login';
import { ManageElection } from './features/manage-election/manage-election';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: CandidatesStack },
      { path: 'dashboard', component: DashboardLayout },
      { path: 'compare', component: CompareCandidates },
    ],
  },
  { path: 'coming-soon', component: ComingSoon },
  { path: 'admin-login', component: AdminLogin },
  { path: 'manage', component: ManageElection },
  { path: '**', redirectTo: 'coming-soon' },
];
