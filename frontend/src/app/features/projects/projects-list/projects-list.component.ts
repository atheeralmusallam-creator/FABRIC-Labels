import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="ph">
        <h1>Projects</h1>
        <button class="btn-brand">+ New Project</button>
      </div>
      @if (loading()) {
        <div class="loading">Loading…</div>
      } @else {
        <div class="grid">
          @for (p of projects(); track p.id) {
            <a [routerLink]="['/projects', p.id]" class="card proj">
              <div class="ph2">
                <span class="name">{{ p.name }}</span>
                @if (p.priority) { <span class="pill-warning">{{ p.priority }}</span> }
              </div>
              <p class="desc">{{ p.description || 'No description' }}</p>
              <div class="meta">
                <span>{{ p.type }}</span>
                <span>{{ p.taskCount }} tasks</span>
              </div>
            </a>
          }
          @empty { <div class="empty">No projects yet.</div> }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 1rem; }
    .ph, .ph2 { display: flex; justify-content: space-between; align-items: center; }
    .ph { margin-bottom: 1.5rem; }
    h1 { font-size: 1.25rem; font-weight: 600; }
    .btn-brand { padding: .5rem 1rem; border-radius: .625rem; font-size: .875rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
    .proj { display: flex; flex-direction: column; gap: .5rem; text-decoration: none; transition: border-color 200ms; }
    .proj:hover { border-color: var(--humain-brand); }
    .name { font-weight: 600; color: var(--humain-text-primary); font-size: .9375rem; }
    .desc { font-size: .8125rem; color: var(--humain-text-secondary); }
    .meta { display: flex; gap: 1rem; font-size: .75rem; color: var(--humain-text-muted); margin-top: .25rem; }
    .loading, .empty { color: var(--humain-text-secondary); padding: 2rem; text-align: center; }
  `]
})
export class ProjectsListComponent implements OnInit {
  projects = signal<any[]>([]);
  loading = signal(true);
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.api.get<any[]>('/projects').subscribe({
      next: d => { this.projects.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
