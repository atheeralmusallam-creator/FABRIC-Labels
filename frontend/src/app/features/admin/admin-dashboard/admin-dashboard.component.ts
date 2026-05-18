import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AIModel, User } from '../../../core/models/models';

// ── Admin Dashboard ───────────────────────────────────────────────────────────

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <h1 class="title">Admin</h1>

      <section class="section">
        <div class="section-header">
          <h2>AI Models</h2>
          <button class="btn-add" (click)="showAddModel = !showAddModel">+ Add model</button>
        </div>

        @if (showAddModel) {
          <div class="add-form glass">
            <input [(ngModel)]="newModel.name" placeholder="Name (e.g. GPT-4o)" />
            <input [(ngModel)]="newModel.provider" placeholder="Provider (openai / anthropic)" />
            <input [(ngModel)]="newModel.modelIdentifier" placeholder="Model ID (e.g. gpt-4o)" />
            <button class="btn-save" (click)="addModel()">Save</button>
          </div>
        }

        <div class="model-list">
          @for (model of models(); track model.id) {
            <div class="model-card glass">
              <div class="model-info">
                <div class="model-name">{{ model.name }}</div>
                <div class="model-meta">{{ model.provider }} · {{ model.modelIdentifier }}</div>
              </div>
              <button class="btn-delete" (click)="deleteModel(model.id)">✕</button>
            </div>
          }
        </div>
      </section>

      <section class="section">
        <h2>Customers ({{ customers().length }})</h2>
        <div class="customer-list">
          @for (c of customers(); track c.id) {
            <div class="customer-row glass">
              <div>
                <div class="customer-name">{{ c.name }}</div>
                <div class="customer-email">{{ c.email }}</div>
              </div>
              <span class="status-pill" [class.active]="c.isActive">
                {{ c.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page { height: 100%; overflow-y: auto; padding: 8px; }
    .title { font-size: 24px; font-weight: 600; color: var(--humain-text-title); margin: 0 0 24px; }
    .section { margin-bottom: 40px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    h2 { font-size: 18px; font-weight: 600; color: var(--humain-text-title); margin: 0; }
    .btn-add { padding: 8px 16px; border-radius: 10px; border: 1px solid var(--humain-border); background: transparent; cursor: pointer; font-size: 13px; color: var(--humain-brand); font-family: var(--font-sans); }
    .add-form { padding: 16px; border-radius: 16px; margin-bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .add-form input { flex: 1; min-width: 140px; height: 38px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--humain-border); background: var(--humain-surface-1); font-size: 13px; color: var(--humain-text-primary); font-family: var(--font-sans); outline: none; }
    .btn-save { padding: 8px 20px; border-radius: 8px; border: none; background: var(--humain-brand); color: white; cursor: pointer; font-size: 13px; font-family: var(--font-sans); }
    .model-list, .customer-list { display: flex; flex-direction: column; gap: 8px; }
    .model-card, .customer-row { padding: 14px 16px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; }
    .model-name, .customer-name { font-size: 14px; font-weight: 500; color: var(--humain-text-strong); }
    .model-meta, .customer-email { font-size: 12px; color: var(--humain-text-secondary); margin-top: 2px; }
    .btn-delete { width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(255,59,48,0.08); color: var(--humain-status-error); cursor: pointer; font-size: 12px; }
    .status-pill { padding: 3px 10px; border-radius: 20px; font-size: 12px; background: rgba(255,149,0,0.1); color: var(--humain-status-warning); }
    .status-pill.active { background: rgba(0,150,136,0.1); color: var(--humain-brand); }
  `]
})
export class AdminDashboardComponent implements OnInit {
  models = signal<AIModel[]>([]);
  customers = signal<User[]>([]);
  showAddModel = false;
  newModel = { name: '', provider: '', modelIdentifier: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getAIModels().subscribe(m => this.models.set(m));
    this.api.getCustomers().subscribe(c => this.customers.set(c));
  }

  addModel() {
    this.api.createAIModel(this.newModel).subscribe(m => {
      this.models.update(list => [...list, m]);
      this.newModel = { name: '', provider: '', modelIdentifier: '' };
      this.showAddModel = false;
    });
  }

  deleteModel(id: string) {
    this.api.deleteAIModel(id).subscribe(() =>
      this.models.update(list => list.filter(m => m.id !== id))
    );
  }
}
