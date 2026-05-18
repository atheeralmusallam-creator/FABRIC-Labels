import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
@Component({ selector: 'app-customer-dashboard', standalone: true, imports: [RouterLink],
  template: `<div class="page"><div class="ph"><h1>My Projects</h1><a routerLink="/customer/dashboard/new" class="btn-brand">+ New Project</a></div>
  <div class="grid">@for(p of projects();track p.id){<div class="card proj"><div class="ph2"><span class="name">{{p.name}}</span>
  <span [class]="sc(p.status)">{{p.status}}</span></div><div class="meta"><span>{{p.type}}</span><span>{{p.createdAt.slice(0,10)}}</span></div></div>}
  @empty{<p class="empty">No projects yet.</p>}</div></div>`,
  styles: [`.page{padding:1rem} .ph,.ph2{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem}
  h1{font-size:1.25rem;font-weight:600} .btn-brand{padding:.5rem 1rem;border-radius:.625rem;font-size:.875rem;text-decoration:none}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
  .proj{display:flex;flex-direction:column;gap:.5rem} .name{font-weight:600;font-size:.9375rem}
  .meta{display:flex;gap:1rem;font-size:.75rem;color:var(--humain-text-muted)} .empty{color:var(--humain-text-secondary)}`]
})
export class CustomerDashboardComponent implements OnInit {
  projects = signal<any[]>([]);
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.get<any[]>('/customer/projects').subscribe({ next: d => this.projects.set(d) }); }
  sc(s: string) { return {COMPLETED:'pill-success',REJECTED:'pill-error'}[s as string] || 'pill-warning'; }
}
