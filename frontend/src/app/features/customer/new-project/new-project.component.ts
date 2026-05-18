import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-new-project', standalone: true, imports: [RouterLink],
  template: `<div class="p"><a routerLink="/customer/dashboard">← Back</a><h1>New Project</h1><p>Form coming soon.</p></div>`,
  styles: [`.p{padding:1rem} h1{font-size:1.25rem;font-weight:600;margin:1rem 0} a{color:var(--humain-brand);font-size:.875rem} p{color:var(--humain-text-secondary)}`]
})
export class NewProjectComponent {}
