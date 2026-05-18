import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
@Component({ selector: 'app-users', standalone: true, imports: [],
  template: `<div class="page"><div class="ph"><h1>Users</h1><button class="btn-brand">+ Invite User</button></div>
  <div class="table-wrap card"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
  <tbody>@for(u of users();track u.id){<tr><td>{{u.name||'—'}}</td><td>{{u.email}}</td>
  <td><span class="pill-success">{{u.role}}</span></td><td class="muted">{{u.createdAt.slice(0,10)}}</td></tr>}
  @empty{<tr><td colspan="4" class="empty">No users.</td></tr>}</tbody></table></div></div>`,
  styles: [`.page{padding:1rem} .ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem}
  h1{font-size:1.25rem;font-weight:600} .btn-brand{padding:.5rem 1rem;border-radius:.625rem;font-size:.875rem}
  .table-wrap{padding:0;overflow:hidden} table{width:100%;border-collapse:collapse}
  th{font-size:.75rem;font-weight:600;color:var(--humain-text-secondary);text-transform:uppercase;letter-spacing:.05em;padding:.75rem 1rem;border-bottom:1px solid var(--humain-border);text-align:left}
  td{padding:.75rem 1rem;font-size:.875rem;color:var(--humain-text-primary);border-bottom:1px solid var(--humain-border)}
  .muted{color:var(--humain-text-muted)} .empty{text-align:center;color:var(--humain-text-secondary)} tr:last-child td{border-bottom:none}`]
})
export class UsersComponent implements OnInit {
  users = signal<any[]>([]);
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.get<any[]>('/users').subscribe({ next: d => this.users.set(d) }); }
}
