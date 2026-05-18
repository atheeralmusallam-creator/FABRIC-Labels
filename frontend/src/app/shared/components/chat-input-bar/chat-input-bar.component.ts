import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bar" [class.bar--shadow]="showShadow" [style]="containerStyle">
      <input #fileInput type="file" class="hidden" (change)="fileChange.emit($event)"
             accept=".pdf,.doc,.docx,.txt,.csv,.json" multiple />

      <button class="logo-btn" (click)="toggleActions.emit()">
        <span class="logo-icon">F</span>
      </button>

      @if (showActions) {
        <div class="actions">
          <button class="action-btn" (click)="fileInput.click()" title="Attach file">＋</button>
          <button class="action-btn" title="Web search">🌐</button>
        </div>
      }

      <input
        type="text"
        [(ngModel)]="inputValue"
        (ngModelChange)="inputChange.emit($event)"
        (keydown)="keyDown.emit($event)"
        [placeholder]="placeholder"
        class="text-input"
      />

      <button class="send-btn" (click)="submit.emit()">↑</button>
    </div>
  `,
  styles: [`
    .bar {
      width: 100%;
      max-width: 850px;
      height: 52px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 16px;
      padding: 0 12px;
      background: var(--humain-glass-bg);
      backdrop-filter: blur(40px) saturate(180%);
      -webkit-backdrop-filter: blur(40px) saturate(180%);
      border: 1px solid var(--humain-glass-border);
      margin: 0 auto;
    }

    .bar--shadow { box-shadow: var(--humain-shadow-soft); }

    .hidden { display: none; }

    .logo-btn {
      flex-shrink: 0;
      width: 36px; height: 36px;
      border-radius: 10px;
      border: 1px solid var(--humain-glass-border);
      background: rgba(0,0,0,0.04);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 200ms;
    }

    .logo-icon {
      font-size: 12px;
      font-weight: 700;
      color: var(--humain-brand);
    }

    .actions { display: flex; align-items: center; gap: 4px; }

    .action-btn {
      padding: 8px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 16px;
      color: var(--humain-text-strong);
      transition: background 200ms;
    }

    .action-btn:hover { background: rgba(0,0,0,0.05); }

    .text-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-size: 14px;
      color: var(--humain-text-primary);
      caret-color: var(--humain-brand);
      font-family: var(--font-sans);
    }

    .text-input::placeholder {
      color: var(--humain-text-tertiary);
      opacity: 0.6;
    }

    .send-btn {
      flex-shrink: 0;
      width: 32px; height: 32px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
      color: white;
      background: linear-gradient(135deg, var(--humain-brand), var(--humain-brand-soft));
      box-shadow: var(--humain-shadow-brand);
      transition: opacity 200ms;
    }

    .send-btn:hover { opacity: 0.85; }
  `]
})
export class ChatInputBarComponent {
  @Input() inputValue = '';
  @Input() placeholder = 'Type a message...';
  @Input() showActions = false;
  @Input() showShadow = true;
  @Input() containerStyle = '';

  @Output() inputChange = new EventEmitter<string>();
  @Output() submit = new EventEmitter<void>();
  @Output() keyDown = new EventEmitter<KeyboardEvent>();
  @Output() toggleActions = new EventEmitter<void>();
  @Output() fileChange = new EventEmitter<Event>();

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
}
