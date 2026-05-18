import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dashboard">
      <h1 class="greeting">Good morning, {{ auth.user()?.name || 'User' }}</h1>
      <p class="subtitle">Here's what's happening on the platform.</p>

      <div class="stats-grid">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card card">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
        }
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-row">
          <a routerLink="/projects" class="action-card card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <span>View Projects</span>
          </a>
          <a routerLink="/admin/users" class="action-card card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
            </svg>
            <span>Manage Users</span>
          </a>
          <a routerLink="/admin/customers" class="action-card card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Customers</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 1rem; max-width: 900px; }
    .greeting { font-size: 1.875rem; font-weight: 600; color: var(--humain-text-primary); }
    .subtitle { font-size: 0.875rem; color: var(--humain-text-secondary); margin-top: 0.25rem; margin-bottom: 2rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { display: flex; flex-direction: column; gap: 0.5rem; }
    .stat-label { font-size: 0.75rem; font-weight: 500; color: var(--humain-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 2rem; font-weight: 700; color: var(--humain-text-primary); font-family: var(--font-numeric); }
    .quick-actions h2 { font-size: 1rem; font-weight: 600; color: var(--humain-text-strong); margin-bottom: 1rem; }
    .actions-row { display: flex; gap: 1rem; flex-wrap: wrap; }
    .action-card {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1rem 1.25rem;
      text-decoration: none;
      color: var(--humain-text-strong);
      font-size: 0.875rem; font-weight: 500;
      transition: border-color 200ms, box-shadow 200ms;
    }
    .action-card:hover { border-color: var(--humain-brand); box-shadow: var(--humain-shadow-brand); color: var(--humain-brand); }
    .action-card svg { color: var(--humain-brand); flex-shrink: 0; }
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<{ label: string; value: number }[]>([]);

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.api.get<{ users: number; projects: number; customers: number }>('/admin/overview').subscribe({
      next: data => this.stats.set([
        { label: 'Users', value: data.users },
        { label: 'Projects', value: data.projects },
        { label: 'Customers', value: data.customers },
      ]),
      error: () => this.stats.set([
        { label: 'Users', value: 0 },
        { label: 'Projects', value: 0 },
        { label: 'Customers', value: 0 },
      ])
    });
  }
}
