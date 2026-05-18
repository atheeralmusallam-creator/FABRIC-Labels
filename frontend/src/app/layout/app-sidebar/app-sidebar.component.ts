import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <!-- Logo -->
      <div class="logo-area">
        <a routerLink="/" class="logo-link">
          <div class="logo-mark">F</div>
        </a>
      </div>

      <!-- Nav items -->
      <nav class="nav-area">
        @for (item of visibleItems(); track item.id) {
          <a
            [routerLink]="item.route"
            routerLinkActive="nav-item--active"
            class="nav-item"
            [title]="item.label"
          >
            <span class="nav-icon" [innerHTML]="item.icon"></span>
          </a>
        }
      </nav>

      <!-- Bottom controls -->
      <div class="bottom-area">
        <!-- Theme toggle -->
        <div class="theme-toggle">
          <button class="theme-btn theme-btn--active" title="Light">☀</button>
          <button class="theme-btn" title="Dark">☽</button>
        </div>

        <!-- Avatar -->
        <button class="avatar" (click)="auth.logout()" title="Sign out">
          {{ initial() }}
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0; top: 0;
      height: 100vh;
      width: 96px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 0;
      z-index: 100;
    }

    .logo-area {
      padding: 12px;
      margin-bottom: 40px;
    }

    .logo-link { display: flex; align-items: center; justify-content: center; }

    .logo-mark {
      width: 32px; height: 32px;
      border-radius: 8px;
      background: var(--humain-brand);
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700;
    }

    .nav-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .nav-item {
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      text-decoration: none;
      color: var(--humain-text-strong);
      transition: background 200ms, color 200ms;
      font-size: 18px;
    }

    .nav-item:hover, .nav-item--active {
      background: var(--humain-brand);
      color: white;
    }

    .nav-icon { display: flex; line-height: 1; }

    .bottom-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding-bottom: 12px;
    }

    .theme-toggle {
      display: flex;
      background: var(--humain-surface-4);
      border-radius: 12px;
      padding: 4px;
      gap: 2px;
    }

    .theme-btn {
      width: 26px; height: 24px;
      border-radius: 8px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 11px;
      color: var(--humain-text-strong);
      transition: background 200ms, color 200ms;
    }

    .theme-btn--active {
      background: var(--humain-brand);
      color: white;
    }

    .avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: var(--humain-brand-glow);
      border: 2px solid var(--humain-brand-soft);
      color: var(--humain-brand-strong);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 200ms;
    }

    .avatar:hover { opacity: 0.8; }
  `]
})
export class AppSidebarComponent {
  private readonly allItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: '⊞' },
    { id: 'review', label: 'Review Queue', route: '/review', icon: '✓', roles: ['Admin', 'Manager', 'Reviewer', 'Annotator'] },
    { id: 'projects', label: 'Projects', route: '/projects', icon: '◫', roles: ['Admin', 'Manager'] },
    { id: 'customer', label: 'My Projects', route: '/customer/projects', icon: '▤', roles: ['Customer'] },
    { id: 'admin', label: 'Admin', route: '/admin', icon: '⚙', roles: ['Admin'] },
    { id: 'chat', label: 'Chat', route: '/chat', icon: '◉' },
  ];

  visibleItems = signal<NavItem[]>([]);

  constructor(public auth: AuthService) {
    const user = auth.currentUser();
    const role = user?.role;

    this.visibleItems.set(
      this.allItems.filter(item =>
        !item.roles || (role && item.roles.includes(role))
      )
    );
  }

  initial = () => {
    const name = this.auth.currentUser()?.name ?? '?';
    return name[0].toUpperCase();
  };
}
