import { Component, input, output, signal, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="customer-list">
      <div class="list-header">
        <div class="header-content">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Customers
            <span class="count-badge">{{ filteredCustomers.length }}</span>
          </h3>
        </div>
        <div class="search-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search..."
            (input)="onSearch($event)"
            class="search-input"
          />
        </div>
      </div>

      <!-- Scroll indicator -->
      @if (filteredCustomers.length > 5) {
        <div class="scroll-indicator">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
          <span>Scroll for more</span>
        </div>
      }

      <div class="list-container">
        @for (customer of filteredCustomers; track customer.id) {
          <div
            class="customer-card"
            [class.active]="selectedCustomer()?.id === customer.id"
            [class.failed]="customer.geocodeStatus === 'failed'"
            (click)="select.emit(customer)"
          >
            <div class="card-left">
              <div class="status-dot" [class]="customer.geocodeStatus"></div>
            </div>
            <div class="card-content">
              <div class="card-header">
                <span class="customer-name">{{ customer.name }}</span>
                @if (customer.category) {
                  <span class="category-tag" [style]="getCategoryColor(customer.category)">
                    {{ customer.category }}
                  </span>
                }
              </div>
              <div class="card-body">
                <p class="address">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {{ customer.address || 'No address' }}
                </p>
                <div class="card-meta">
                  <span class="country">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                    </svg>
                    {{ customer.country }}
                  </span>
                  @if (customer.distance) {
                    <span class="distance-tag">{{ customer.distance.toFixed(1) }} km</span>
                  }
                </div>
              </div>
            </div>
            <div class="card-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <p>No customers found</p>
            <span class="empty-hint">Try adjusting your filters</span>
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
      background: var(--surface-color);
    }

    .list-header {
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
      max-height: 120px;
    }

    .list-header {
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
    }

    .header-content h3 {
      color: white !important;
    }

    .header-content svg {
      color: rgba(255, 255, 255, 0.9) !important;
    }

    .count-badge {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    .search-input {
      background: rgba(255, 255, 255, 0.95);
      color: var(--text-primary);
    }

    .search-input::placeholder {
      color: var(--text-muted);
    }

    .search-icon {
      color: var(--text-muted);
    }

    /* Scroll Indicator */
    .scroll-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px;
      background: linear-gradient(to bottom, var(--surface-color), transparent);
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 500;
      animation: bounce 1.5s ease-in-out infinite;
    }

    .scroll-indicator svg {
      color: var(--primary-color);
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(3px); }
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-content h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 600;
    }

    .header-content svg {
      flex-shrink: 0;
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
      border-radius: 10px;
      font-size: 0.875rem;
      background: var(--bg-color);
      color: var(--text-primary);
      box-sizing: border-box;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-light);
    }

    .list-container {
      flex: 1;
      overflow-y: scroll;
      padding: 12px;
    }

    /* Custom scrollbar styling */
    .list-container::-webkit-scrollbar {
      width: 8px;
    }

    .list-container::-webkit-scrollbar-track {
      background: var(--bg-color);
      border-radius: 4px;
    }

    .list-container::-webkit-scrollbar-thumb {
      background: var(--primary-color);
      border-radius: 4px;
    }

    .list-container::-webkit-scrollbar-thumb:hover {
      background: #5560d4;
    }

    .customer-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: var(--surface-color);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid var(--border-color);
      position: relative;
      overflow: hidden;
    }

    .customer-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--primary-gradient);
      transform: scaleX(0);
      transition: transform 0.25s ease;
    }

    .customer-card:hover::before {
      transform: scaleX(1);
    }

    .customer-card:hover {
      transform: translateX(4px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary-light);
    }

    .customer-card.active {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-lg);
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), var(--surface-color));
    }

    .customer-card.active::before {
      transform: scaleX(1);
    }

    .customer-card.failed {
      border-left: 3px solid var(--error-color);
      background: linear-gradient(to right, rgba(255, 82, 82, 0.05), var(--surface-color));
    }

    .card-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 2px;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-dot.success {
      background: var(--success-gradient);
      box-shadow: 0 0 8px rgba(0, 200, 83, 0.4);
    }

    .status-dot.pending {
      background: var(--warning-gradient);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .status-dot.failed {
      background: var(--error-gradient);
      box-shadow: 0 0 8px rgba(255, 82, 82, 0.4);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.1); }
    }

    .card-content {
      flex: 1;
      min-width: 0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      gap: 8px;
    }

    .customer-name {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .category-tag {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .address {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      margin: 0;
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .address svg {
      flex-shrink: 0;
      margin-top: 2px;
      color: var(--text-muted);
    }

    .card-meta {
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

    .distance-tag {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 3px 8px;
      background: var(--success-bg);
      color: var(--success-color);
      border-radius: 6px;
    }

    .card-arrow {
      display: flex;
      align-items: center;
      color: var(--text-muted);
      opacity: 0;
      transform: translateX(-4px);
      transition: all 0.2s;
    }

    .customer-card:hover .card-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    .customer-card.active .card-arrow {
      opacity: 1;
      transform: translateX(0);
      color: var(--primary-color);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: var(--text-muted);
      text-align: center;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      margin-bottom: 16px;
      background: var(--primary-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0 0 4px 0;
      font-size: 0.9375rem;
      color: var(--text-secondary);
      font-weight: 500;
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

  // Category colors map
  private categoryColors: Map<string, string> = new Map([
    ['Automotive', 'background: #fee2e2; color: #dc2626;'],
    ['Retail', 'background: #dbeafe; color: #2563eb;'],
    ['Manufacturing', 'background: #e0e7ff; color: #4f46e5;'],
    ['Healthcare', 'background: #d1fae5; color: #059669;'],
    ['Technology', 'background: #f3e8ff; color: #7c3aed;'],
    ['Food', 'background: #fef3c7; color: #d97706;'],
    ['Services', 'background: #fce7f3; color: #db2777;'],
  ]);

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
      c.country.toLowerCase().includes(this.searchTerm) ||
      c.category.toLowerCase().includes(this.searchTerm)
    );
  }

  getCategoryColor(category: string): string {
    return this.categoryColors.get(category) || 'background: #f1f5f9; color: #64748b;';
  }
}
