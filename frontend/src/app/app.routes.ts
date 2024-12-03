import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./page/home/home.component').then(m => m.HomeComponent)},
  { path: 'plot-detail', loadComponent: () => import('./page/plot-detail/plot-detail.component').then(m => m.PlotDetailComponent)},
  { path: 'mint-plot', loadComponent: () => import('./page/mint-plot/mint-plot.component').then(m => m.MintPlotComponent)},
  { path: 'create-proposal', loadComponent: () => import('./page/create-proposal/create-proposal.component').then(m => m.CreateProposalComponent)},
  { path: 'approve-proposal', loadComponent: () => import('./page/approve-proposal/approve-proposal.component').then(m => m.ApproveProposalComponent)},
  { path: '**', redirectTo: '/home', pathMatch: 'full' },
];
