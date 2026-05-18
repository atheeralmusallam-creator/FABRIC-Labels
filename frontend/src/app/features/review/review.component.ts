import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { HumanReview } from '../../core/models/models';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="header">
        <h1 class="title">Review queue</h1>
        <span class="badge">{{ queue().length }} pending</span>
      </div>

      @if (activeReview()) {
        <div class="review-panel glass">
          <div class="review-header">
            <span class="review-id">Review #{{ activeReview()!.id.slice(-6) }}</span>
            @if (activeReview()!.aiConfidence) {
              <span class="confidence-badge" [class.low]="(activeReview()!.aiConfidence ?? 0) < 0.75">
                AI: {{ ((activeReview()!.aiConfidence ?? 0) * 100).toFixed(0) }}%
              </span>
            }
          </div>

          <div class="content-box">
            {{ activeReview()!.itemContent }}
          </div>

          @if (activeReview()!.aiResult) {
            <div class="ai-result">
              <span class="ai-label">AI suggested:</span>
              <span class="ai-value">{{ activeReview()!.aiResult }}</span>
            </div>
          }

          <div class="field">
            <label>Final label</label>
            <input [(ngModel)]="finalLabel" placeholder="Enter your label..." />
          </div>

          <div class="field">
            <label>Notes (optional)</label>
            <input [(ngModel)]="notes" placeholder="Any notes..." />
          </div>

          <div class="actions">
            <button class="btn-approve" (click)="complete('Approve')">✓ Approve</button>
            <button class="btn-reject" (click)="complete('Reject')">✗ Reject</button>
            <button class="btn-edit" (click)="complete('Edit')">✎ Edit & submit</button>
          </div>
        </div>
      } @else {
        <div class="empty glass">
          <div class="empty-icon">✓</div>
          <p>Queue is empty — great work!</p>
          <button class="btn-load" (click)="loadNext()">Check for more</button>
        </div>
      }

      @if (queue().length > 0) {
        <div class="queue-list">
          <h2 class="section-title">In queue</h2>
          @for (review of queue(); track review.id) {
            <div class="queue-item glass" (click)="selectReview(review)">
              <div class="queue-content">{{ review.itemContent | slice:0:80 }}...</div>
              <span class="queue-status" [class]="'status-' + review.status.toLowerCase()">
                {{ review.status }}
              </span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { height: 100%; overflow-y: auto; padding: 8px; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: 600; color: var(--humain-text-title); margin: 0; }
    .badge { padding: 4px 12px; border-radius: 20px; background: var(--humain-brand-glow); color: var(--humain-brand-strong); font-size: 13px; font-weight: 500; }
    .review-panel { padding: 24px; border-radius: 20px; margin-bottom: 24px; }
    .review-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .review-id { font-size: 12px; color: var(--humain-text-tertiary); font-family: monospace; }
    .confidence-badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; background: rgba(52,199,89,0.1); color: #34c759; }
    .confidence-badge.low { background: rgba(255,149,0,0.1); color: var(--humain-status-warning); }
    .content-box { background: var(--humain-surface-3); border-radius: 12px; padding: 16px; font-size: 14px; color: var(--humain-text-primary); margin-bottom: 16px; line-height: 1.6; }
    .ai-result { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 14px; }
    .ai-label { color: var(--humain-text-secondary); }
    .ai-value { font-weight: 500; color: var(--humain-brand); }
    .field { margin-bottom: 12px; }
    .field label { display: block; font-size: 13px; font-weight: 500; color: var(--humain-text-strong); margin-bottom: 6px; }
    .field input { width: 100%; height: 40px; padding: 0 12px; border-radius: 10px; border: 1px solid var(--humain-border); background: var(--humain-surface-1); font-size: 14px; color: var(--humain-text-primary); font-family: var(--font-sans); outline: none; box-sizing: border-box; }
    .field input:focus { border-color: var(--humain-brand); }
    .actions { display: flex; gap: 8px; margin-top: 20px; }
    .btn-approve, .btn-reject, .btn-edit { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; font-size: 14px; font-weight: 500; font-family: var(--font-sans); transition: opacity 200ms; }
    .btn-approve { background: var(--humain-brand); color: white; }
    .btn-reject { background: rgba(255,59,48,0.1); color: var(--humain-status-error); }
    .btn-edit { background: var(--humain-surface-4); color: var(--humain-text-strong); }
    .btn-approve:hover, .btn-reject:hover, .btn-edit:hover { opacity: 0.8; }
    .empty { padding: 48px; border-radius: 20px; text-align: center; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty p { color: var(--humain-text-secondary); margin: 0 0 16px; }
    .btn-load { padding: 10px 20px; border-radius: 10px; border: 1px solid var(--humain-border); background: transparent; cursor: pointer; font-size: 14px; color: var(--humain-text-strong); font-family: var(--font-sans); }
    .queue-list { margin-top: 8px; }
    .section-title { font-size: 16px; font-weight: 600; color: var(--humain-text-title); margin: 0 0 12px; }
    .queue-item { padding: 14px 16px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; cursor: pointer; margin-bottom: 8px; transition: box-shadow 200ms; }
    .queue-item:hover { box-shadow: var(--humain-shadow-soft); }
    .queue-content { font-size: 13px; color: var(--humain-text-secondary); flex: 1; }
    .queue-status { font-size: 11px; padding: 3px 10px; border-radius: 20px; flex-shrink: 0; }
    .status-pending { background: rgba(255,149,0,0.1); color: var(--humain-status-warning); }
    .status-inprogress { background: var(--humain-brand-glow); color: var(--humain-brand-strong); }
  `]
})
export class ReviewComponent implements OnInit {
  queue = signal<HumanReview[]>([]);
  activeReview = signal<HumanReview | null>(null);
  finalLabel = '';
  notes = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getReviewQueue().subscribe(q => {
      this.queue.set(q);
      if (q.length > 0) this.selectReview(q[0]);
    });
  }

  loadNext() {
    this.api.getNextReview().subscribe({
      next: r => { if (r) this.activeReview.set(r); },
      error: () => {}
    });
  }

  selectReview(review: HumanReview) {
    this.activeReview.set(review);
    this.finalLabel = review.aiResult ?? '';
    this.notes = '';
    this.api.assignReview(review.id).subscribe();
  }

  complete(decision: string) {
    const review = this.activeReview();
    if (!review) return;

    this.api.completeReview(review.id, {
      decision,
      finalLabel: this.finalLabel || decision,
      notes: this.notes
    }).subscribe(() => {
      this.queue.update(q => q.filter(r => r.id !== review.id));
      const next = this.queue()[0] ?? null;
      if (next) this.selectReview(next);
      else this.activeReview.set(null);
    });
  }
}
