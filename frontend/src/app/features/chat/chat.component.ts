import { Component, signal } from '@angular/core';
import { ChatInputBarComponent } from '../../shared/components/chat-input-bar/chat-input-bar.component';
import { TypingIndicatorComponent } from '../../shared/components/typing-indicator/typing-indicator.component';

interface Message {
  id: string;
  type: 'user' | 'agent';
  agentName?: string;
  content: string;
  timestamp: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ChatInputBarComponent, TypingIndicatorComponent],
  template: `
    <div class="chat-page">
      <!-- Messages -->
      <div class="messages">
        @for (msg of messages(); track msg.id) {
          <div class="message" [class.message--user]="msg.type === 'user'">
            <div class="msg-label">{{ msg.type === 'user' ? 'You' : (msg.agentName ?? 'Agent') }}</div>
            <div class="bubble" [class.bubble--user]="msg.type === 'user'">
              {{ msg.content }}
            </div>
          </div>
        }

        @if (isTyping()) {
          <div class="message">
            <div class="msg-label">Agent</div>
            <div class="bubble typing-bubble">
              <app-typing-indicator />
            </div>
          </div>
        }
      </div>

      <!-- Input -->
      <div class="input-area">
        <app-chat-input-bar
          [inputValue]="inputValue()"
          [showActions]="showActions()"
          (inputChange)="inputValue.set($event)"
          (submit)="send()"
          (keyDown)="onKeyDown($event)"
          (toggleActions)="showActions.update(v => !v)"
          (fileChange)="onFileChange($event)"
        />
      </div>
    </div>
  `,
  styles: [`
    .chat-page {
      height: 100%;
      display: flex;
      flex-direction: column;
      max-width: 850px;
      margin: 0 auto;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 4px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .message { display: flex; flex-direction: column; }
    .message--user { align-items: flex-end; }

    .msg-label {
      font-size: 12px;
      color: var(--humain-text-secondary);
      margin-bottom: 6px;
    }

    .bubble {
      max-width: 75%;
      padding: 12px 16px;
      border-radius: 16px;
      background: var(--humain-surface-1);
      border: 1px solid var(--humain-border);
      font-size: 14px;
      line-height: 1.6;
      color: var(--humain-text-primary);
    }

    .bubble--user {
      background: var(--humain-brand);
      border-color: var(--humain-brand);
      color: white;
    }

    .typing-bubble {
      padding: 16px 20px;
    }

    .input-area {
      padding: 8px 0 4px;
      flex-shrink: 0;
    }
  `]
})
export class ChatComponent {
  messages = signal<Message[]>([
    { id: '1', type: 'agent', agentName: 'FABRIC Assistant', content: 'How can I help you today?', timestamp: 'now' }
  ]);

  inputValue = signal('');
  showActions = signal(false);
  isTyping = signal(false);

  send() {
    const text = this.inputValue().trim();
    if (!text) return;

    this.messages.update(msgs => [...msgs, {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: 'now'
    }]);

    this.inputValue.set('');
    this.isTyping.set(true);

    setTimeout(() => {
      this.isTyping.set(false);
      this.messages.update(msgs => [...msgs, {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        agentName: 'FABRIC Assistant',
        content: `I received your message: "${text}". How else can I help?`,
        timestamp: 'now'
      }]);
    }, 1200);
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files?.length) {
      console.log('Files selected:', input.files);
    }
  }
}
