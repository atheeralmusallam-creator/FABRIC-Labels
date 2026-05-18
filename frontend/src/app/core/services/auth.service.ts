import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  role: string;
  mustChangePassword: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'fabric_token';
  private readonly USER_KEY  = 'fabric_user';

  private _user = signal<AuthUser | null>(this.loadStoredUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string } & AuthUser>(
      `${environment.apiUrl}/auth/login`, { email, password }
    ).pipe(
      tap(res => this.storeSession(res))
    );
  }

  customerLogin(email: string, password: string) {
    return this.http.post<{ token: string } & AuthUser>(
      `${environment.apiUrl}/auth/customer/login`, { email, password }
    ).pipe(
      tap(res => this.storeSession(res))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private storeSession(res: { token: string } & AuthUser) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    const user: AuthUser = {
      userId: res.userId, email: res.email,
      name: res.name, role: res.role,
      mustChangePassword: res.mustChangePassword
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private loadStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
