import { Component, OnInit, signal, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <a routerLink="/projects" class="back">← Projects</a>
      @if (project()) {
        <h1>{{ project().name }}</h1>
        <p class="desc">{{ project().description }}</p>
        <div class="meta">
          <span class="pill-success">{{ project().type }}</span>
          @if (project().priority) { <span class="pill-warning">{{ project().priority }}</span> }
          <span class="m">{{ project().taskCount }} tasks</span>
        </div>
      } @else {
        <div class="loading">Loading…</div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 1rem; }
    .back { font-size: .875rem; color: var(--humain-brand); text-decoration: none; }
    h1 { font-size: 1.5rem; font-weight: 600; margin-top: 1rem; }
    .desc { color: var(--humain-text-secondary); margin-top: .5rem; font-size: .875rem; }
    .meta { display: flex; gap: .5rem; align-items: center; margin-top: 1rem; flex-wrap: wrap; }
    .m { font-size: .8125rem; color: var(--humain-text-muted); }
    .loading { color: var(--humain-text-secondary); padding: 2rem; text-align: center; }
  `]
})
export class ProjectDetailComponent implements OnInit {
  @Input() id!: string;
  project = signal<any>(null);
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.api.get<any>(`/projects/${this.id}`).subscribe({ next: d => this.project.set(d) });
  }
}
