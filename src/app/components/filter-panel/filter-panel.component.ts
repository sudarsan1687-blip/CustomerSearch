import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-panel">
      <div class="filter-header">
        <h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filters
        </h3>
        @if (hasActiveFilters()) {
          <button class="clear-btn" (click)="clearFilters()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Clear all
          </button>
        }
      </div>

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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 16px;
      border-radius: 12px;
      margin: 12px;
      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
    }
    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .filter-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9375rem;
      font-weight: 600;
      color: white;
      margin: 0;
    }
    .filter-header svg {
      color: rgba(255, 255, 255, 0.9);
    }
    .clear-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 6px;
      color: white;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .clear-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    .filter-body {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .filter-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .filter-label svg {
      color: rgba(255, 255, 255, 0.7);
    }
    .filter-select {
      padding: 10px 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.15);
      color: white;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      backdrop-filter: blur(10px);
    }
    .filter-select option {
      background: #667eea;
      color: white;
    }
    .filter-select:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .filter-select:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
    }
    .distance-buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    .distance-btn {
      padding: 8px 4px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.6875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .distance-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .distance-btn.active {
      background: white;
      color: #667eea;
      border-color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    .active-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 20px;
      font-size: 0.75rem;
      color: white;
      font-weight: 500;
    }
    .filter-chip button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      padding: 0;
      color: white;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    .filter-chip button:hover {
      opacity: 1;
    }
    .results-count {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
      text-align: center;
    }
    .results-count strong {
      color: white;
      font-weight: 600;
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
