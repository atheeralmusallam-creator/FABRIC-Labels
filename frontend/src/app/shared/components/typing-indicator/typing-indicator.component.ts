import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  template: `
    <div class="indicator">
      <span class="dot" style="animation-delay: 0s; background: var(--humain-accent-soft)"></span>
      <span class="dot" style="animation-delay: 0.15s; background: var(--humain-brand-soft)"></span>
      <span class="dot" style="animation-delay: 0.3s; background: var(--humain-brand)"></span>
    </div>
  `,
  styles: [`
    .indicator { display: flex; justify-content: center; gap: 8px; }
    .dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      animation: hero-dot-pulse 1.4s ease-in-out infinite;
    }
  `]
})
export class TypingIndicatorComponent {}
