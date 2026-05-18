import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'customer/login',
    loadComponent: () => import('./features/auth/customer-login/customer-login.component').then(m => m.CustomerLoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/projects-list/projects-list.component').then(m => m.ProjectsListComponent)
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./features/projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-overview/admin-overview.component').then(m => m.AdminOverviewComponent)
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'admin/customers',
        loadComponent: () => import('./features/admin/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'customer/dashboard',
        loadComponent: () => import('./features/customer/dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent)
      },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
