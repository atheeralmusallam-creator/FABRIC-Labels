import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
@Component({ selector: 'app-customers', standalone: true, imports: [],
  template: `<div class="page"><div class="ph"><h1>Customers</h1></div>
  <div class="table-wrap card"><table><thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Status</th><th>Joined</th></tr></thead>
  <tbody>@for(c of customers();track c.id){<tr><td>{{c.name||'—'}}</td><td>{{c.email}}</td><td>{{c.company||'—'}}</td>
  <td><span [class]="c.isActive?'pill-success':'pill-error'">{{c.isActive?'Active':'Inactive'}}</span></td>
  <td class="muted">{{c.createdAt.slice(0,10)}}</td></tr>}
  @empty{<tr><td colspan="5" class="empty">No customers.</td></tr>}</tbody></table></div></div>`,
  styles: [`.page{padding:1rem} .ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem}
  h1{font-size:1.25rem;font-weight:600} .table-wrap{padding:0;overflow:hidden} table{width:100%;border-collapse:collapse}
  th{font-size:.75rem;font-weight:600;color:var(--humain-text-secondary);text-transform:uppercase;letter-spacing:.05em;padding:.75rem 1rem;border-bottom:1px solid var(--humain-border);text-align:left}
  td{padding:.75rem 1rem;font-size:.875rem;color:var(--humain-text-primary);border-bottom:1px solid var(--humain-border)}
  .muted{color:var(--humain-text-muted)} .empty{text-align:center;color:var(--humain-text-secondary)} tr:last-child td{border-bottom:none}`]
})
export class CustomersComponent implements OnInit {
  customers = signal<any[]>([]);
  constructor(private api: ApiService) {}
  ngOnInit() { this.api.get<any[]>('/admin/customers').subscribe({ next: d => this.customers.set(d) }); }
}
