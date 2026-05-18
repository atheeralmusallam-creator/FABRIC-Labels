import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, AppSidebarComponent],
  template: `
    <div class="shell">
      <!-- Bottom glow -->
      <div class="glow-overlay"></div>

      <!-- Sidebar -->
      <app-sidebar />

      <!-- Main content -->
      <div class="content-area">
        <div class="content-glass">
          <main class="content-inner">
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
      background: linear-gradient(180deg,
        var(--humain-surface-2) 0%,
        var(--humain-surface-3) 50%,
        var(--humain-surface-4) 100%);
    }

    .glow-overlay {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 40%;
      pointer-events: none;
      z-index: 0;
      background: linear-gradient(to top,
        var(--humain-glass-glow) 0%,
        var(--humain-glass-glow-soft) 30%,
        var(--humain-glass-glow-faint) 60%,
        transparent 100%);
    }

    .content-area {
      padding: 16px 16px 16px 112px;
      flex: 1;
      position: relative;
      z-index: 1;
      min-width: 0;
    }

    .content-glass {
      height: 100%;
      border-radius: 32px;
      overflow: hidden;
      background: var(--humain-glass-bg);
      backdrop-filter: blur(40px) saturate(180%);
      -webkit-backdrop-filter: blur(40px) saturate(180%);
      border: 1px solid var(--humain-glass-border);
    }

    .content-inner {
      height: 100%;
      padding: 16px;
      overflow: hidden;
    }
  `]
})
export class AppLayoutComponent {}
