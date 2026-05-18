import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="card glass">
        <div class="brand">
          <span class="brand-mark">F</span>
          <span class="brand-name">FABRIC</span>
        </div>
        <p class="subtitle">Customer Portal</p>

        @if (error()) {
          <div class="error-msg">{{ error() }}</div>
        }

        <div class="field">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="you@company.com" />
        </div>

        <div class="field">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" (keydown.enter)="login()" placeholder="••••••••" />
        </div>

        <button class="btn-primary" (click)="login()" [disabled]="loading()">
          {{ loading() ? 'Signing in...' : 'Sign in' }}
        </button>

        <p class="footer-link">
          Internal team? <a routerLink="/login">Staff login →</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(180deg, var(--humain-surface-2) 0%, var(--humain-surface-3) 50%, var(--humain-surface-4) 100%);
    }
    .card { width: 100%; max-width: 400px; padding: 40px; border-radius: 24px; }
    .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .brand-mark { width: 36px; height: 36px; border-radius: 10px; background: var(--humain-brand); color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; }
    .brand-name { font-size: 20px; font-weight: 700; color: var(--humain-text-title); letter-spacing: 0.08em; }
    .subtitle { color: var(--humain-text-secondary); font-size: 14px; margin: 0 0 32px; }
    .error-msg { background: rgba(255,59,48,0.08); border: 1px solid rgba(255,59,48,0.2); border-radius: 10px; padding: 12px; font-size: 14px; color: var(--humain-status-error); margin-bottom: 20px; }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 13px; font-weight: 500; color: var(--humain-text-strong); margin-bottom: 6px; }
    .field input { width: 100%; height: 44px; padding: 0 14px; border-radius: 10px; border: 1px solid var(--humain-border); background: var(--humain-surface-1); font-size: 14px; color: var(--humain-text-primary); font-family: var(--font-sans); outline: none; transition: border-color 200ms; box-sizing: border-box; }
    .field input:focus { border-color: var(--humain-brand); }
    .btn-primary { width: 100%; height: 44px; border-radius: 10px; border: none; background: linear-gradient(135deg, var(--humain-brand), var(--humain-brand-soft)); color: white; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px; box-shadow: var(--humain-shadow-brand); transition: opacity 200ms; font-family: var(--font-sans); }
    .btn-primary:hover { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .footer-link { text-align: center; margin: 20px 0 0; font-size: 13px; color: var(--humain-text-secondary); }
    .footer-link a { color: var(--humain-brand); text-decoration: none; }
  `]
})
export class CustomerLoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading.set(true);
    this.error.set('');
    this.auth.loginCustomer(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/customer/projects']),
      error: () => { this.error.set('Invalid credentials'); this.loading.set(false); }
    });
  }
}

// ── Unauthorized ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px">
      <div style="font-size:48px">🚫</div>
      <h1 style="color:var(--humain-text-primary);margin:0">Access denied</h1>
      <p style="color:var(--humain-text-secondary);margin:0">You don't have permission to view this page.</p>
      <a routerLink="/dashboard" style="color:var(--humain-brand);text-decoration:none">← Go to dashboard</a>
    </div>
  `
})
export class UnauthorizedComponent {}
