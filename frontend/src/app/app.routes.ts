import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./page/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'plot-detail',
    loadComponent: () => import('./page/plot-detail/plot-detail.component').then(m => m.PlotDetailComponent)
  },
  {
    path: 'mint-plot',
    loadComponent: () => import('./page/mint-plot/mint-plot.component').then(m => m.MintPlotComponent)
  },
  {
    path: 'proposals',
    loadComponent: () => import('./page/proposal/proposal.component').then(m => m.ProposalComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./page/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full'
  },
];
