import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-admin-overview', standalone: true, imports: [RouterLink],
  template: `<div class="page"><h1>Admin</h1><div class="links">
    <a routerLink="/admin/users" class="card link"><strong>Users</strong><span>Manage internal users and roles</span></a>
    <a routerLink="/admin/customers" class="card link"><strong>Customers</strong><span>Manage customer accounts</span></a>
  </div></div>`,
  styles: [`.page{padding:1rem} h1{font-size:1.25rem;font-weight:600;margin-bottom:1.5rem} .links{display:flex;gap:1rem;flex-wrap:wrap}
  .link{display:flex;flex-direction:column;gap:.25rem;width:200px;text-decoration:none;transition:border-color 200ms}
  .link:hover{border-color:var(--humain-brand)} .link strong{color:var(--humain-text-primary)} .link span{font-size:.8125rem;color:var(--humain-text-secondary)}`]
})
export class AdminOverviewComponent {}
