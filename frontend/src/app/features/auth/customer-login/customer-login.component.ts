import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-shell">
      <div class="login-card glass">
        <div class="login-header">
          <div class="login-logo">C</div>
          <h1>Customer Portal</h1>
          <p>FABRIC Platform</p>
        </div>
        <form class="login-form" (ngSubmit)="submit()">
          <div class="field">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required />
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required />
          </div>
          @if (error()) { <div class="error-msg">{{ error() }}</div> }
          <button type="submit" class="btn-brand" [disabled]="loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
        <div class="login-footer">
          <a routerLink="/login">← Back to internal platform</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(180deg, var(--humain-surface-2) 0%, var(--humain-surface-3) 60%, var(--humain-surface-4) 100%); }
    .login-card { width: 100%; max-width: 400px; border-radius: 1.5rem; padding: 2.5rem 2rem; }
    .login-header { text-align: center; margin-bottom: 2rem; }
    .login-logo { width: 3rem; height: 3rem; margin: 0 auto 1rem;
      background: linear-gradient(135deg, var(--humain-brand), var(--humain-brand-soft));
      color: white; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem; font-weight: 700; }
    h1 { font-size: 1.25rem; font-weight: 600; color: var(--humain-text-primary); }
    p  { font-size: 0.875rem; color: var(--humain-text-secondary); margin-top: 0.25rem; }
    .login-form { display: flex; flex-direction: column; gap: 1rem; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; }
    label { font-size: 0.75rem; font-weight: 500; color: var(--humain-text-strong); }
    input { padding: 0.625rem 0.875rem; border: 1px solid var(--humain-border); border-radius: 0.625rem;
      font-size: 0.875rem; background: var(--humain-surface-1); color: var(--humain-text-primary); }
    input:focus { outline: none; border-color: var(--humain-brand); }
    .btn-brand { width: 100%; padding: 0.75rem; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 500; margin-top: 0.5rem; }
    .btn-brand:disabled { opacity: 0.6; cursor: not-allowed; }
    .error-msg { font-size: 0.8125rem; color: var(--humain-status-error); background: rgba(255,59,48,0.08); padding: 0.5rem 0.75rem; border-radius: 0.5rem; }
    .login-footer { text-align: center; margin-top: 1.5rem; font-size: 0.8125rem; }
  `]
})
export class CustomerLoginComponent {
  email = ''; password = '';
  loading = signal(false); error = signal('');
  constructor(private auth: AuthService, private router: Router) {}
  submit() {
    this.error.set(''); this.loading.set(true);
    this.auth.customerLogin(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/customer/dashboard']),
      error: () => { this.error.set('Invalid credentials'); this.loading.set(false); }
    });
  }
}
