import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell" [style]="shellStyle">
      <!-- Glow overlay -->
      <div class="glow-overlay"></div>

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <span class="logo-text">F</span>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" title="Dashboard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.67">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </a>
          <a routerLink="/projects" routerLinkActive="active" class="nav-item" title="Projects">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.67">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </a>
          <a routerLink="/admin" routerLinkActive="active" class="nav-item" title="Admin">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.67">
              <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
            </svg>
          </a>
          <a routerLink="/customer/dashboard" routerLinkActive="active" class="nav-item" title="Customers">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.67">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </a>
        </nav>

        <div class="sidebar-bottom">
          <!-- Theme toggle -->
          <div class="theme-toggle">
            <button class="theme-btn active" title="Light">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              </svg>
            </button>
            <button class="theme-btn" title="Dark">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
          </div>

          <!-- Avatar -->
          <button class="avatar-btn" (click)="logout()" title="Logout {{ auth.user()?.name }}">
            <span>{{ initials() }}</span>
          </button>
        </div>
      </aside>

      <!-- Main content area -->
      <div class="main-wrapper">
        <div class="main-glass glass">
          <main class="main-content">
            <router-outlet />
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      width: 100%;
      overflow: hidden;
      position: relative;
    }
    .glow-overlay {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 40%;
      background: linear-gradient(to top,
        var(--humain-glass-glow) 0%,
        var(--humain-glass-glow-soft) 30%,
        var(--humain-glass-glow-faint) 60%,
        transparent 100%);
      pointer-events: none;
      z-index: 0;
    }
    .sidebar {
      position: fixed;
      left: 0; top: 0;
      width: 6rem;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0.75rem 0;
      z-index: 100;
    }
    .sidebar-logo {
      margin-bottom: 2.5rem;
      margin-top: 0.75rem;
    }
    .logo-text {
      width: 2rem; height: 2rem;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--humain-brand), var(--humain-brand-soft));
      color: white;
      border-radius: 0.5rem;
      font-weight: 700;
      font-size: 1rem;
    }
    .sidebar-nav {
      display: flex; flex-direction: column;
      align-items: center; gap: 0.75rem;
      flex: 1;
    }
    .nav-item {
      width: 2.5rem; height: 2.5rem;
      display: flex; align-items: center; justify-content: center;
      border-radius: 0.5rem;
      color: var(--humain-text-muted);
      transition: background 200ms, color 200ms;
      text-decoration: none;
    }
    .nav-item:hover, .nav-item.active {
      background: var(--humain-brand);
      color: white;
    }
    .sidebar-bottom {
      display: flex; flex-direction: column;
      align-items: center; gap: 1rem;
      padding-bottom: 0.75rem;
    }
    .theme-toggle {
      display: flex;
      background: var(--humain-surface-3);
      border-radius: 0.75rem;
      padding: 0.375rem;
      gap: 0.25rem;
    }
    .theme-btn {
      width: 1.5rem; height: 1.5rem;
      display: flex; align-items: center; justify-content: center;
      border-radius: 0.5rem;
      color: var(--humain-text-muted);
      transition: background 200ms, color 200ms;
    }
    .theme-btn.active {
      background: var(--humain-brand);
      color: white;
    }
    .avatar-btn {
      width: 2.25rem; height: 2.25rem;
      border-radius: 9999px;
      background: linear-gradient(135deg, var(--humain-brand), var(--humain-brand-soft));
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 200ms;
    }
    .avatar-btn:hover { opacity: 0.85; }
    .main-wrapper {
      padding: 1rem 1rem 1rem 6.5rem;
      flex: 1;
      position: relative;
      z-index: 1;
      min-width: 0;
    }
    .main-glass {
      height: 100%;
      border-radius: 2rem;
      overflow: hidden;
    }
    .main-content {
      height: 100%;
      padding: 1rem;
      overflow: auto;
    }
  `]
})
export class AppLayoutComponent {
  constructor(public auth: AuthService) {}

  initials() {
    const name = this.auth.user()?.name || this.auth.user()?.email || '?';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  logout() { this.auth.logout(); }

  shellStyle = `background: linear-gradient(180deg,
    var(--humain-surface-2) 0%,
    var(--humain-surface-3) 50%,
    var(--humain-surface-4) 100%)`;
}
