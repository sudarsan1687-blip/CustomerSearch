import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="customer-list">
      <div class="list-header">
        <h3>Customers ({{ customers().length }})</h3>
        <div class="filters">
          <input
            type="text"
            placeholder="Search customers..."
            (input)="onSearch($event)"
            class="search-input"
          />
        </div>
      </div>
      <div class="list-container">
        @for (customer of filteredCustomers; track customer.id) {
          <div
            class="customer-card"
            [class.mapped]="customer.geocodeStatus === 'success'"
            [class.unmapped]="customer.geocodeStatus === 'failed'"
            [class.active]="selectedCustomer()?.id === customer.id"
            (click)="select.emit(customer)"
          >
            <div class="card-header">
              <span class="customer-name">{{ customer.name }}</span>
              <span class="customer-category">{{ customer.category }}</span>
            </div>
            <div class="card-body">
              <p class="address">{{ customer.address }}</p>
              <p class="country">{{ customer.country }}</p>
              @if (customer.distance) {
                <span class="distance">{{ customer.distance.toFixed(1) }} km</span>
              }
            </div>
            <div class="card-footer">
              @if (customer.geocodeStatus === 'success') {
                <span class="status-badge success">✓ Mapped</span>
              } @else {
                <span class="status-badge failed">✗ Not Mapped</span>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>No customers found</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .customer-list {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f5f5f5;
    }
    .list-header {
      padding: 15px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }
    .list-header h3 {
      margin: 0 0 10px 0;
      font-size: 1rem;
    }
    .search-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .list-container {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    }
    .customer-card {
      background: white;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
      border-left: 4px solid #ccc;
    }
    .customer-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .customer-card.active {
      border-color: #1976d2;
      box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
    }
    .customer-card.mapped {
      border-left-color: #4caf50;
    }
    .customer-card.unmapped {
      border-left-color: #f44336;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .customer-name {
      font-weight: 600;
      color: #333;
    }
    .customer-category {
      font-size: 0.75rem;
      padding: 2px 8px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 12px;
    }
    .card-body {
      margin-bottom: 8px;
    }
    .card-body p {
      margin: 4px 0;
      font-size: 0.875rem;
      color: #666;
    }
    .distance {
      display: inline-block;
      font-size: 0.75rem;
      padding: 2px 8px;
      background: #e8f5e9;
      color: #2e7d32;
      border-radius: 12px;
      margin-top: 4px;
    }
    .card-footer {
      display: flex;
      justify-content: flex-end;
    }
    .status-badge {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 12px;
    }
    .status-badge.success {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .status-badge.failed {
      background: #ffebee;
      color: #c62828;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  `]
})
export class CustomerListComponent {
  customers = input.required<Customer[]>();
  selectedCustomer = input<Customer | null>(null);

  select = output<Customer>();

  filteredCustomers: Customer[] = [];
  private searchTerm = '';

  ngOnInit() {
    this.filterCustomers();
  }

  ngOnChanges() {
    this.filterCustomers();
  }

  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterCustomers();
  }

  private filterCustomers() {
    const customers = this.customers();
    if (!this.searchTerm) {
      this.filteredCustomers = customers;
      return;
    }
    this.filteredCustomers = customers.filter(c =>
      c.name.toLowerCase().includes(this.searchTerm) ||
      c.address.toLowerCase().includes(this.searchTerm) ||
      c.country.toLowerCase().includes(this.searchTerm)
    );
  }
}
