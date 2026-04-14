import { Component, input, output, signal, computed, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-panel">
      <div class="filter-body">
        <!-- Category Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Category
          </label>
          <select [(ngModel)]="selectedCategory" (ngModelChange)="emitFilters()" class="filter-select">
            <option value="">All Categories</option>
            @for (cat of categories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>

        <!-- Country Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            Country
          </label>
          <select [(ngModel)]="selectedCountry" (ngModelChange)="emitFilters()" class="filter-select">
            <option value="">All Countries</option>
            @for (country of countries(); track country) {
              <option [value]="country">{{ country }}</option>
            }
          </select>
        </div>

        <!-- Distance Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            Distance from center
          </label>
          <div class="distance-buttons">
            <button
              class="distance-btn"
              [class.active]="selectedDistance() === 50"
              (click)="setDistance(50)">
              50 km
            </button>
            <button
              class="distance-btn"
              [class.active]="selectedDistance() === 100"
              (click)="setDistance(100)">
              100 km
            </button>
            <button
              class="distance-btn"
              [class.active]="selectedDistance() === 200"
              (click)="setDistance(200)">
              200 km
            </button>
            <button
              class="distance-btn"
              [class.active]="selectedDistance() === null"
              (click)="setDistance(null)">
              All
            </button>
          </div>
        </div>
      </div>

      <!-- Active Filters Display -->
      @if (hasActiveFilters()) {
        <div class="active-filters">
          @if (selectedCategory()) {
            <span class="filter-chip">
              {{ selectedCategory() }}
              <button (click)="clearCategory()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </span>
          }
          @if (selectedCountry()) {
            <span class="filter-chip">
              {{ selectedCountry() }}
              <button (click)="clearCountry()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </span>
          }
          @if (selectedDistance()) {
            <span class="filter-chip">
              Within {{ selectedDistance() }} km
              <button (click)="clearDistance()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </span>
          }
        </div>
      }

      <!-- Results count -->
      <div class="results-count">
        Showing <strong>{{ filteredCount() }}</strong> of {{ totalCustomers() }} customers
      </div>
    </div>
  `,
  styles: [`
    .filter-panel {
      background: transparent;
      padding: 0;
      margin: 0;
      box-shadow: none;
    }
    .filter-body {
      display: flex;
      flex-direction: row;
      gap: 12px;
      align-items: center;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 100px;
    }
    .filter-label {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.625rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .filter-label svg {
      color: var(--primary-color);
    }
    .filter-select {
      padding: 6px 10px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--surface-color);
      color: var(--text-primary);
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-select:hover {
      border-color: var(--primary-color);
    }
    .filter-select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px var(--primary-light);
    }
    .distance-buttons {
      display: flex;
      gap: 4px;
      flex-wrap: nowrap;
      align-items: center;
    }
    .distance-btn {
      padding: 6px 8px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--surface-color);
      color: var(--text-secondary);
      font-size: 0.6875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .distance-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    .distance-btn.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
    .active-filters {
      display: none;
    }
    .results-count {
      display: none;
    }
    .clear-btn {
      display: none;
    }
  `]
})
export class FilterPanelComponent {
  customers = input<Customer[]>([]);
  filterChange = output<{ category: string; country: string; distance: number | null }>();

  selectedCategory = signal<string>('');
  selectedCountry = signal<string>('');
  selectedDistance = signal<number | null>(null);

  categories = signal<string[]>([]);
  countries = signal<string[]>([]);
  filteredCount = signal(0);

  totalCustomers = computed(() => this.customers().length);

  ngOnInit() {
    this.extractUniqueValues();
  }

  ngOnChanges() {
    this.extractUniqueValues();
    this.emitFilters();
  }

  private extractUniqueValues() {
    const customers = this.customers();
    const categories = new Set<string>();
    const countries = new Set<string>();

    customers.forEach(c => {
      if (c.category) categories.add(c.category);
      if (c.country) countries.add(c.country);
    });

    this.categories.set(Array.from(categories).sort());
    this.countries.set(Array.from(countries).sort());
    this.filteredCount.set(customers.length);
  }

  emitFilters() {
    const customers = this.customers();
    let filtered = customers;

    if (this.selectedCategory()) {
      filtered = filtered.filter(c => c.category === this.selectedCategory());
    }
    if (this.selectedCountry()) {
      filtered = filtered.filter(c => c.country === this.selectedCountry());
    }
    if (this.selectedDistance()) {
      // Distance filtering will be handled by the parent component
    }

    this.filteredCount.set(filtered.length);

    this.filterChange.emit({
      category: this.selectedCategory(),
      country: this.selectedCountry(),
      distance: this.selectedDistance()
    });
  }

  setDistance(distance: number | null) {
    this.selectedDistance.set(distance);
    this.emitFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedCategory() || this.selectedCountry() || this.selectedDistance());
  }

  clearFilters() {
    this.selectedCategory.set('');
    this.selectedCountry.set('');
    this.selectedDistance.set(null);
    this.emitFilters();
  }

  clearCategory() {
    this.selectedCategory.set('');
    this.emitFilters();
  }

  clearCountry() {
    this.selectedCountry.set('');
    this.emitFilters();
  }

  clearDistance() {
    this.selectedDistance.set(null);
    this.emitFilters();
  }
}
