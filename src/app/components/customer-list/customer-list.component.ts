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
        <h3>Customers <span class="count-badge">{{ customers().length }}</span></h3>
        <div class="filters">
          <div class="search-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search customers..."
              (input)="onSearch($event)"
              class="search-input"
            />
          </div>
        </div>
      </div>
      <div class="list-container">
        @for (customer of filteredCustomers; track customer.id) {
          <div
            class="customer-card"
            [class.active]="selectedCustomer()?.id === customer.id"
            [class.failed]="customer.geocodeStatus === 'failed'"
            (click)="select.emit(customer)"
          >
            <div class="card-header">
              <span class="customer-name">{{ customer.name }}</span>
              <span class="customer-category">{{ customer.category }}</span>
            </div>
            <div class="card-body">
              <p class="address" [class.failed-address]="customer.geocodeStatus === 'failed'">
                {{ customer.address || 'No address provided' }}
              </p>
              <div class="location-row">
                <span class="country">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {{ customer.country }}
                </span>
                @if (customer.distance) {
                  <span class="distance">{{ customer.distance.toFixed(1) }} km</span>
                }
              </div>
            </div>
            <div class="card-footer">
              @if (customer.geocodeStatus === 'success') {
                <span class="status-badge success">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Mapped
                </span>
              } @else if (customer.geocodeStatus === 'failed') {
                <span class="status-badge failed">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Not Located
                </span>
              } @else {
                <span class="status-badge pending">
                  <span class="spinner"></span>
                  Locating...
                </span>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <p>No customers found</p>
            <span class="empty-hint">Try adjusting your search</span>
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
      background: var(--bg-color);
    }
    .list-header {
      padding: 16px;
      background: var(--surface-color);
      border-bottom: 1px solid var(--border-color);
    }
    .list-header h3 {
      margin: 0 0 12px 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .count-badge {
      background: var(--primary-light);
      color: var(--primary-color);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .search-wrapper {
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
    .search-input {
      width: 100%;
      padding: 10px 12px 10px 36px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 14px;
      background: var(--surface-color);
      color: var(--text-primary);
      box-sizing: border-box;
      transition: all 0.2s;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .search-input::placeholder {
      color: var(--text-muted);
    }
    .list-container {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }
    .customer-card {
      background: var(--surface-color);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--border-color);
      border-left: 3px solid transparent;
    }
    .customer-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    .customer-card.active {
      border-color: var(--primary-color);
      border-left-color: var(--primary-color);
      box-shadow: var(--shadow-md);
    }
    .customer-card.failed {
      border-left-color: var(--error-color);
      background: linear-gradient(to right, rgba(239, 68, 68, 0.03), var(--surface-color));
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .customer-name {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text-primary);
    }
    .customer-category {
      font-size: 0.75rem;
      padding: 3px 8px;
      background: var(--primary-light);
      color: var(--primary-color);
      border-radius: 6px;
      font-weight: 500;
    }
    .card-body {
      margin-bottom: 10px;
    }
    .card-body p {
      margin: 0 0 6px 0;
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .address {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .failed-address {
      color: var(--error-color) !important;
      font-weight: 500;
    }
    .location-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .country {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .country svg {
      flex-shrink: 0;
    }
    .distance {
      display: inline-flex;
      align-items: center;
      font-size: 0.75rem;
      padding: 3px 8px;
      background: var(--success-bg);
      color: var(--success-color);
      border-radius: 6px;
      font-weight: 500;
      flex-shrink: 0;
    }
    .card-footer {
      display: flex;
      justify-content: flex-end;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 500;
    }
    .status-badge.success {
      background: var(--success-bg);
      color: var(--success-color);
    }
    .status-badge.failed {
      background: var(--error-bg);
      color: var(--error-color);
    }
    .status-badge.pending {
      background: #fef3c7;
      color: #d97706;
    }
    .spinner {
      width: 10px;
      height: 10px;
      border: 2px solid #d97706;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: var(--text-muted);
    }
    .empty-state svg {
      margin-bottom: 12px;
      opacity: 0.5;
    }
    .empty-state p {
      margin: 0 0 4px 0;
      font-size: 0.9375rem;
      color: var(--text-secondary);
    }
    .empty-hint {
      font-size: 0.8125rem;
      opacity: 0.8;
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
