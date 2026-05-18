import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { CustomerProject } from '../../../core/models/models';

@Component({
  selector: 'app-customer-projects',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="header">
        <h1 class="title">My projects</h1>
        <button class="btn-new" (click)="showCreate = !showCreate">+ New project</button>
      </div>

      @if (showCreate) {
        <div class="create-form glass">
          <input [(ngModel)]="form.name" placeholder="Project name" />
          <select [(ngModel)]="form.modality">
            <option>Text</option><option>Audio</option><option>Image</option><option>Video</option>
          </select>
          <select [(ngModel)]="form.processingMode">
            <option value="AIAndHuman">AI + Human</option>
            <option value="HumanOnly">Human only</option>
          </select>
          <button class="btn-save" (click)="create()">Create</button>
        </div>
      }

      <div class="project-grid">
        @for (p of projects(); track p.id) {
          <div class="project-card glass">
            <div class="card-header">
              <span class="modality">{{ p.modality }}</span>
              <span class="status" [class]="'status-' + p.status.toLowerCase()">{{ p.status }}</span>
            </div>
            <div class="project-name">{{ p.name }}</div>
            <div class="project-meta">
              <span>{{ p.filesCount ?? 0 }} files</span>
              <span>{{ p.resultsCount ?? 0 }} results</span>
              <span>{{ p.processingMode }}</span>
            </div>
            <div class="card-actions">
              <button class="btn-view" (click)="viewProject(p.id)">View details</button>
              @if (p.status === 'Draft') {
                <button class="btn-submit" (click)="submit(p)">Submit →</button>
              }
            </div>
          </div>
        }
        @if (projects().length === 0) {
          <div class="empty glass">
            <div class="empty-icon">◫</div>
            <p>No projects yet</p>
            <p style="font-size:13px">Create a project to start evaluating your data.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { height: 100%; overflow-y: auto; padding: 8px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: 600; color: var(--humain-text-title); margin: 0; }
    .btn-new { padding: 10px 20px; border-radius: 10px; border: none; background: var(--humain-brand); color: white; cursor: pointer; font-size: 14px; font-weight: 500; font-family: var(--font-sans); }
    .create-form { padding: 16px; border-radius: 16px; margin-bottom: 20px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .create-form input, .create-form select { flex: 1; min-width: 140px; height: 40px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--humain-border); background: var(--humain-surface-1); font-size: 14px; color: var(--humain-text-primary); font-family: var(--font-sans); outline: none; }
    .btn-save { padding: 10px 20px; border-radius: 10px; border: none; background: var(--humain-brand); color: white; cursor: pointer; font-size: 14px; font-family: var(--font-sans); }
    .project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
    .project-card { padding: 20px; border-radius: 20px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .modality { font-size: 11px; padding: 3px 10px; border-radius: 6px; background: var(--humain-brand-glow); color: var(--humain-brand-strong); font-weight: 500; }
    .status { font-size: 11px; padding: 3px 10px; border-radius: 20px; }
    .status-draft { background: var(--humain-surface-4); color: var(--humain-text-secondary); }
    .status-active { background: rgba(0,150,136,0.1); color: var(--humain-brand); }
    .status-completed { background: rgba(52,199,89,0.1); color: #34c759; }
    .project-name { font-size: 16px; font-weight: 600; color: var(--humain-text-title); margin-bottom: 8px; }
    .project-meta { display: flex; gap: 12px; font-size: 12px; color: var(--humain-text-secondary); margin-bottom: 16px; }
    .card-actions { display: flex; gap: 8px; }
    .btn-view { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--humain-border); background: transparent; cursor: pointer; font-size: 13px; color: var(--humain-text-strong); font-family: var(--font-sans); }
    .btn-submit { padding: 8px 16px; border-radius: 8px; border: none; background: var(--humain-brand); color: white; cursor: pointer; font-size: 13px; font-family: var(--font-sans); }
    .empty { grid-column: 1/-1; padding: 48px; border-radius: 20px; text-align: center; }
    .empty-icon { font-size: 40px; margin-bottom: 12px; }
    .empty p { color: var(--humain-text-secondary); margin: 4px 0; }
  `]
})
export class CustomerProjectsComponent implements OnInit {
  projects = signal<CustomerProject[]>([]);
  showCreate = false;
  form = { name: '', modality: 'Text', processingMode: 'AIAndHuman' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getMyProjects().subscribe(p => this.projects.set(p));
  }

  create() {
    if (!this.form.name.trim()) return;
    this.api.createProject(this.form as any).subscribe(p => {
      this.projects.update(list => [p, ...list]);
      this.form = { name: '', modality: 'Text', processingMode: 'AIAndHuman' };
      this.showCreate = false;
    });
  }

  viewProject(id: string) {
    // Navigate to project detail — extend as needed
    console.log('View project', id);
  }

  submit(p: CustomerProject) {
    this.api.submitProject(p.id, '').subscribe(() =>
      this.projects.update(list => list.map(proj =>
        proj.id === p.id ? { ...proj, status: 'Active' } : proj
      ))
    );
  }
}
