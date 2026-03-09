import { Routes } from '@angular/router';
import { DashboardLayout } from './core/layout/dashboard-layout/dashboard-layout';
import { CompareCandidates } from './features/compare-candidates/compare-candidates';
import { MainLayout } from './core/layout/main-layout/main-layout';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', component: DashboardLayout },
            { path: 'compare', component: CompareCandidates }
        ]
    }
];
