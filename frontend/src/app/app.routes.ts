import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Auth
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'customer/login',
    loadComponent: () => import('./features/auth/customer-login/customer-login.component').then(m => m.CustomerLoginComponent)
  },

  // App shell (sidebar layout)
  {
    path: '',
    loadComponent: () => import('./layout/app-layout/app-layout.component').then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'review',
        loadComponent: () => import('./features/review/review.component').then(m => m.ReviewComponent),
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Manager', 'Reviewer', 'Annotator'] }
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/admin/projects/projects.component').then(m => m.ProjectsComponent),
        canActivate: [authGuard],
        data: { roles: ['Admin', 'Manager'] }
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [authGuard],
        data: { roles: ['Admin'] }
      },
      {
        path: 'customer/projects',
        loadComponent: () => import('./features/customer/customer-projects/customer-projects.component').then(m => m.CustomerProjectsComponent),
        canActivate: [authGuard],
        data: { roles: ['Customer'] }
      },
      {
        path: 'chat',
        loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent)
      }
    ]
  },

  { path: 'unauthorized', loadComponent: () => import('./features/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },
  { path: '**', redirectTo: '/dashboard' }
];
