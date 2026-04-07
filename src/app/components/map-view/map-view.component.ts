import { Component, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Customer, GoogleSheetConfig } from '../../models/customer.model';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { GeocodingService } from '../../services/geocoding.service';
import { CacheService } from '../../services/cache.service';
import { CustomerListComponent } from '../customer-list/customer-list.component';
import { CustomerDetailComponent } from '../customer-detail/customer-detail.component';
import { ConfigModalComponent } from '../config-modal/config-modal.component';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, CustomerListComponent, CustomerDetailComponent, ConfigModalComponent, FilterPanelComponent],
  template: `
    <div class="app-container">
      <!-- Premium Header -->
      <header class="app-header">
        <div class="header-left">
          <div class="logo">
            <div class="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div class="logo-text">
              <h1>Customer<span class="gradient-text">Map</span></h1>
              <span class="subtitle">Visual Customer Analytics</span>
            </div>
          </div>
          <!-- Filter Panel in Header -->
          @if (config()) {
            <div class="header-filters">
              <app-filter-panel
                [customers]="customers()"
                (filterChange)="onFilterChange($event)"
              />
            </div>
          }
        </div>
        <div class="header-right">
          @if (config()) {
            <div class="stats-bar">
              <div class="stat-item">
                <span class="stat-value">{{ customers().length }}</span>
                <span class="stat-label">Total</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value success">{{ mappedCount() }}</span>
                <span class="stat-label">Mapped</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value warning">{{ pendingCount() }}</span>
                <span class="stat-label">Pending</span>
              </div>
            </div>
          }
          @if (config()) {
            <button class="header-btn refresh-btn" (click)="refreshData()" [disabled]="loading()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.spinning]="loading()">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              <span>Refresh</span>
            </button>
          }
          <button class="header-btn settings-btn" (click)="showConfig.set(true)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </header>

      <!-- Main Content - Updated Layout: Left=List, Center=Map, Right=Customer Details -->
      <div class="main-layout">
        <!-- Left: Customer List Only -->
        <div class="list-section">
          <app-customer-list
            [customers]="filteredCustomers()"
            [selectedCustomer]="selectedCustomer()"
            (select)="onSelectCustomer($event)"
          />
        </div>

        <!-- Center: Map -->
        <div class="map-section">
          <div class="map-wrapper">
            <div #map class="map"></div>
          </div>
        </div>

        <!-- Right: Customer Details Only -->
        <div class="detail-section">
          @if (selectedCustomer()) {
            <app-customer-detail
              [customer]="selectedCustomer()!"
              (close)="selectedCustomer.set(null)"
            />
          } @else {
            <div class="empty-state">
              <div class="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3>Select a Customer</h3>
              <p>Click on a customer from the list or map to view their details</p>
            </div>
          }
        </div>
      </div>

      <!-- Config Modal -->
      <app-config-modal
        [isOpen]="showConfig()"
        [initialConfig]="config()"
        (close)="showConfig.set(false)"
        (save)="onConfigSave($event)"
      />

      <!-- Loading Overlay -->
      @if (loading()) {
        <div class="loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Loading customer data...</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--bg-gradient);
      overflow: hidden;
    }

    /* Premium Header */
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      height: 72px;
      background: var(--surface-color);
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-md);
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: var(--primary-gradient);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .logo-text h1 {
      margin: 0;
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .logo-text .subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Header Filters */
    .header-filters {
      margin-left: 24px;
      flex: 1;
      max-width: 500px;
    }

    .header-filters :host {
      display: block;
    }

    .header-filters app-filter-panel {
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stats-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--bg-color);
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 8px;
    }

    .stat-value {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-value.success {
      color: var(--success-color);
    }

    .stat-value.warning {
      color: var(--warning-color);
    }

    .stat-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .stat-divider {
      width: 1px;
      height: 32px;
      background: var(--border-color);
    }

    .header-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border: none;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .header-btn.refresh-btn {
      background: var(--primary-light);
      color: var(--primary-color);
    }

    .header-btn.refresh-btn:hover:not(:disabled) {
      background: #e0e7ff;
      transform: translateY(-1px);
    }

    .header-btn.refresh-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .header-btn.settings-btn {
      background: var(--surface-color);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .header-btn.settings-btn:hover {
      background: var(--bg-color);
      border-color: var(--text-muted);
      color: var(--text-primary);
    }

    /* Main Layout - 3 Columns: Left=List, Center=Map, Right=Customer Details */
    .main-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
      gap: 1px;
      background: var(--border-color);
    }

    /* Left: Customer List Only */
    .list-section {
      width: 400px;
      background: var(--surface-color);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    /* Center: Map Section */
    .map-section {
      flex: 1;
      min-width: 400px;
      position: relative;
    }

    .map-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .map {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #aadaff 0%, #d4f1f4 100%);
    }

    /* Right Panel: Customer Details Only */
    .detail-section {
      width: 420px;
      background: var(--surface-color);
      border-left: 1px solid var(--border-color);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-icon {
      width: 96px;
      height: 96px;
      margin-bottom: 24px;
      background: var(--primary-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .empty-state p {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-muted);
      max-width: 280px;
    }

    /* Loading Overlay */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--primary-light);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-content p {
      margin: 0;
      font-size: 0.9375rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 1400px) {
      .detail-section {
        width: 360px;
      }
      .list-section {
        width: 380px;
      }
    }

    @media (max-width: 1200px) {
      .header-filters {
        display: none;
      }
      .main-layout {
        flex-direction: column;
      }
      .map-section {
        min-width: auto;
        height: 50%;
      }
      .detail-section {
        width: 100%;
        height: 40%;
        border: none;
        border-top: 1px solid var(--border-color);
      }
      .list-section {
        width: 100%;
        height: 30%;
        border: none;
        border-bottom: 1px solid var(--border-color);
      }
    }
  `]
})
export class MapViewComponent {
  @ViewChild('map') mapElement!: ElementRef;

  private sheetsService = inject(GoogleSheetsService);
  private geocodingService = inject(GeocodingService);
  private cacheService = inject(CacheService);

  // Signals
  customers = signal<Customer[]>([]);
  selectedCustomer = signal<Customer | null>(null);
  config = signal<GoogleSheetConfig | null>(null);
  showConfig = signal(false);
  loading = signal(false);

  // Filter state
  filterCategory = signal<string>('');
  filterCountry = signal<string>('');
  filterDistance = signal<number | null>(null);

  // Computed filtered customers
  filteredCustomers = computed(() => {
    let result = this.customers();

    if (this.filterCategory()) {
      result = result.filter(c => c.category === this.filterCategory());
    }
    if (this.filterCountry()) {
      result = result.filter(c => c.country === this.filterCountry());
    }
    if (this.filterDistance()) {
      // Distance filtering requires a reference point
      // For now, we'll skip this as it needs user location
    }

    return result;
  });

  // Computed stats
  mappedCount = computed(() => this.customers().filter(c => c.geocodeStatus === 'success').length);
  pendingCount = computed(() => this.customers().filter(c => c.geocodeStatus === 'pending').length);

  private map: L.Map | null = null;
  private markers: Map<string, L.CircleMarker> = new Map();
  private markersLayer: L.LayerGroup | null = null;
  private allCustomers: Customer[] = [];
  private geoSub?: Subscription;

  constructor() {
    const savedConfig = this.cacheService.getConfig();
    if (savedConfig) {
      this.config.set(savedConfig);
      this.loadData();
    } else if (environment.googleSheetConfig.sheetId && environment.googleSheetConfig.apiKey) {
      this.config.set(environment.googleSheetConfig);
      this.cacheService.setConfig(environment.googleSheetConfig);
      this.loadData();
    } else {
      this.showConfig.set(true);
    }
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.geoSub?.unsubscribe();
  }

  private initMap() {
    this.map = L.map(this.mapElement.nativeElement, {
      zoomControl: false,
      attributionControl: false
    }).setView([20, 0], 3);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    L.control.attribution({
      position: 'bottomleft'
    }).addTo(this.map);

    // Use CartoDB Voyager - more colorful than Positron
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  refreshData() {
    this.loadData();
  }

  onFilterChange(filters: { category: string; country: string; distance: number | null }) {
    this.filterCategory.set(filters.category);
    this.filterCountry.set(filters.country);
    this.filterDistance.set(filters.distance);

    // Update map to show only filtered customers
    this.updateMapForFilteredCustomers();
  }

  private updateMapForFilteredCustomers() {
    if (!this.map || !this.markersLayer) return;

    const filtered = this.filteredCustomers();

    // Clear all markers and re-add only filtered ones
    this.clearMarkers();

    // Add markers only for filtered customers that have coordinates
    filtered.forEach(customer => {
      if (customer.geocodeStatus === 'success' && customer.lat && customer.lng) {
        this.addMarker(customer);
      }
    });

    // Fit bounds to visible markers
    if (filtered.length > 0 && this.markers.size > 0) {
      this.fitBoundsToMarkers();
    }
  }

  onConfigSave(newConfig: GoogleSheetConfig) {
    this.config.set(newConfig);
    this.cacheService.setConfig(newConfig);
    this.showConfig.set(false);
    this.loadData();
  }

  private loadData() {
    const cfg = this.config();
    if (!cfg) return;

    this.loading.set(true);
    this.customers.set([]);
    this.clearMarkers();

    this.sheetsService.fetchCustomers(cfg).subscribe({
      next: (data) => {
        this.customers.set(data);
        this.startGeocoding(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch data:', err);
        alert('Failed to fetch data. Please check your configuration.');
        this.loading.set(false);
        this.showConfig.set(true);
      }
    });
  }

  private startGeocoding(customers: Customer[]) {
    this.geoSub?.unsubscribe();

    const geocodedCustomers: Customer[] = [];

    this.geoSub = this.geocodingService.geocodeCustomers(customers)
      .subscribe({
        next: (updated) => {
          const current = this.customers();
          const index = current.findIndex(c => c.id === updated.id);
          if (index >= 0) {
            const newCustomers = [...current];
            newCustomers[index] = updated;
            this.customers.set(newCustomers);

            if (updated.geocodeStatus === 'success' && updated.lat && updated.lng) {
              this.addMarker(updated);
              geocodedCustomers.push(updated);
              this.fitBoundsToMarkers();
            }
          }
        },
        error: (err) => {
          console.error('Geocoding error:', err);
        }
      });
  }

  private addMarker(customer: Customer) {
    if (!this.map || !customer.lat || !customer.lng || !this.markersLayer) return;

    // Premium marker with gradient colors
    const marker = L.circleMarker([customer.lat, customer.lng], {
      radius: 12,
      fillColor: '#667eea',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.95
    }).addTo(this.markersLayer);

    marker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif; padding: 4px;">
        <div style="font-weight: 600; font-size: 14px; color: #1a202c; margin-bottom: 4px;">${customer.name}</div>
        <div style="font-size: 12px; color: #4a5568; margin-bottom: 2px;">${customer.address}</div>
        <div style="font-size: 11px; color: #a0aec0;">${customer.country}${customer.category ? ' • ' + customer.category : ''}</div>
      </div>
    `, {
      closeButton: false,
      className: 'custom-popup',
      maxWidth: 280
    });

    marker.on('click', () => {
      this.selectedCustomer.set(customer);
    });

    this.markers.set(customer.id, marker);
  }

  private clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();
  }

  private fitBoundsToMarkers() {
    if (!this.map || this.markers.size === 0) return;

    const bounds = L.latLngBounds([]);
    this.markers.forEach((marker) => {
      bounds.extend(marker.getLatLng());
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
      });
    }
  }

  onSelectCustomer(customer: Customer) {
    this.selectedCustomer.set(customer);

    if (customer.lat && customer.lng && this.map) {
      this.map.setView([customer.lat, customer.lng], 15);
      const marker = this.markers.get(customer.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }
}
