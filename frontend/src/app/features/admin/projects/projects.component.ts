import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Project } from '../../../core/models/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="header">
        <h1 class="title">Projects</h1>
        <button class="btn-new" (click)="showCreate = !showCreate">+ New project</button>
      </div>

      @if (showCreate) {
        <div class="create-form glass">
          <input [(ngModel)]="newName" placeholder="Project name" />
          <select [(ngModel)]="newModality">
            <option value="Text">Text</option>
            <option value="Audio">Audio</option>
            <option value="Image">Image</option>
            <option value="Video">Video</option>
          </select>
          <button class="btn-save" (click)="create()">Create</button>
        </div>
      }

      <div class="project-list">
        @for (p of projects(); track p.id) {
          <div class="project-card glass">
            <div class="project-info">
              <div class="project-name">{{ p.name }}</div>
              <div class="project-meta">
                <span class="modality-badge">{{ p.modality }}</span>
                <span class="task-count">{{ p.taskCount ?? 0 }} tasks</span>
              </div>
            </div>
            <span class="status-badge" [class]="'status-' + p.status.toLowerCase()">
              {{ p.status }}
            </span>
          </div>
        }
        @if (projects().length === 0) {
          <div class="empty glass">
            <p>No projects yet. Create one to get started.</p>
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
    .project-list { display: flex; flex-direction: column; gap: 8px; }
    .project-card { padding: 16px 20px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; }
    .project-name { font-size: 15px; font-weight: 500; color: var(--humain-text-strong); margin-bottom: 6px; }
    .project-meta { display: flex; align-items: center; gap: 8px; }
    .modality-badge { padding: 2px 8px; border-radius: 6px; font-size: 11px; background: var(--humain-brand-glow); color: var(--humain-brand-strong); }
    .task-count { font-size: 12px; color: var(--humain-text-secondary); }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; }
    .status-draft { background: var(--humain-surface-4); color: var(--humain-text-secondary); }
    .status-active { background: rgba(0,150,136,0.1); color: var(--humain-brand); }
    .status-completed { background: rgba(52,199,89,0.1); color: #34c759; }
    .empty { padding: 32px; border-radius: 16px; text-align: center; }
    .empty p { color: var(--humain-text-secondary); margin: 0; }
  `]
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  showCreate = false;
  newName = '';
  newModality = 'Text';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getProjects().subscribe(p => this.projects.set(p));
  }

  create() {
    if (!this.newName.trim()) return;
    this.api.createInternalProject({ name: this.newName, modality: this.newModality as any })
      .subscribe(p => {
        this.projects.update(list => [p, ...list]);
        this.newName = '';
        this.showCreate = false;
      });
  }
}
