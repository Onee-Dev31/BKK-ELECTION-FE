import { Routes } from '@angular/router';
import { DashboardLayout } from './core/layout/dashboard-layout/dashboard-layout';
import { CompareCandidates } from './features/compare-candidates/compare-candidates';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { ComingSoon } from './features/coming-soon/coming-soon';
import { electionGuard } from './core/guards/election.guard';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        canActivate: [electionGuard],
        children: [
            { path: '', component: DashboardLayout },
            { path: 'compare', component: CompareCandidates }
        ]
    },
    { path: 'coming-soon', component: ComingSoon },
    { path: '**', redirectTo: 'coming-soon' }
];
