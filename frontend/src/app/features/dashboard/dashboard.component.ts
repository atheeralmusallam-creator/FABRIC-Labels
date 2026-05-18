import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminStats } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="page">
      <h1 class="greeting">Good morning, {{ userName() }}</h1>

      @if (auth.hasRole('Admin', 'Manager')) {
        <div class="stats-grid">
          @if (stats()) {
            <div class="stat-card glass">
              <div class="stat-label">Total projects</div>
              <div class="stat-value">{{ stats()!.totalProjects }}</div>
            </div>
            <div class="stat-card glass">
              <div class="stat-label">Customers</div>
              <div class="stat-value">{{ stats()!.totalCustomers }}</div>
            </div>
            <div class="stat-card glass">
              <div class="stat-label">Pending reviews</div>
              <div class="stat-value accent">{{ stats()!.pendingReviews }}</div>
            </div>
            <div class="stat-card glass">
              <div class="stat-label">Completed today</div>
              <div class="stat-value success">{{ stats()!.completedToday }}</div>
            </div>
            <div class="stat-card glass">
              <div class="stat-label">Annotators</div>
              <div class="stat-value">{{ stats()!.totalAnnotators }}</div>
            </div>
          } @else {
            <div class="loading">Loading stats...</div>
          }
        </div>
      }

      <div class="quick-actions">
        <h2 class="section-title">Quick access</h2>
        <div class="action-grid">
          @for (action of quickActions(); track action.label) {
            <a class="action-card glass" [href]="action.href">
              <span class="action-icon">{{ action.icon }}</span>
              <div class="action-info">
                <div class="action-label">{{ action.label }}</div>
                <div class="action-desc">{{ action.desc }}</div>
              </div>
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      height: 100%;
      overflow-y: auto;
      padding: 8px;
    }

    .greeting {
      font-size: 30px;
      font-weight: 600;
      line-height: 38px;
      color: var(--humain-text-primary);
      margin: 0 0 32px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
      margin-bottom: 40px;
    }

    .stat-card {
      padding: 20px;
      border-radius: 16px;
    }

    .stat-label {
      font-size: 12px;
      color: var(--humain-text-secondary);
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 30px;
      font-weight: 600;
      color: var(--humain-text-title);
      font-family: var(--font-numeric);
    }

    .stat-value.accent { color: var(--humain-status-warning); }
    .stat-value.success { color: var(--humain-brand); }

    .loading { color: var(--humain-text-secondary); font-size: 14px; }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--humain-text-title);
      margin: 0 0 16px;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
    }

    .action-card {
      padding: 20px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      text-decoration: none;
      transition: box-shadow 200ms;
    }

    .action-card:hover { box-shadow: var(--humain-shadow-soft); }

    .action-icon { font-size: 24px; flex-shrink: 0; }

    .action-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--humain-text-strong);
      margin-bottom: 4px;
    }

    .action-desc {
      font-size: 12px;
      color: var(--humain-text-secondary);
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<AdminStats | null>(null);
  userName = signal('');
  quickActions = signal([
    { icon: '✓', label: 'Review queue', desc: 'Pending human reviews', href: '/review' },
    { icon: '◫', label: 'Projects', desc: 'Internal annotation projects', href: '/projects' },
    { icon: '▤', label: 'Customer portal', desc: 'Customer projects', href: '/customer/projects' },
    { icon: '⚙', label: 'Admin', desc: 'Models, users, CMS', href: '/admin' },
  ]);

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.userName.set(this.auth.currentUser()?.name?.split(' ')[0] ?? 'there');

    if (this.auth.hasRole('Admin', 'Manager')) {
      this.api.getStats().subscribe(s => this.stats.set(s));
    }
  }
}
