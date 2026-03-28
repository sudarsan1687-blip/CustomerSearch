import { Component, ElementRef, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Customer, GoogleSheetConfig } from '../../models/customer.model';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { GeocodingService } from '../../services/geocoding.service';
import { CacheService } from '../../services/cache.service';
import { CustomerListComponent } from '../customer-list/customer-list.component';
import { CustomerDetailComponent } from '../customer-detail/customer-detail.component';
import { ConfigModalComponent } from '../config-modal/config-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, CustomerListComponent, CustomerDetailComponent, ConfigModalComponent],
  template: `
    <div class="map-view">
      <header class="toolbar">
        <div class="toolbar-left">
          <div class="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <h1>Customer Map</h1>
          </div>
        </div>
        <div class="toolbar-right">
          @if (config()) {
            <button class="toolbar-btn refresh-btn" (click)="refreshData()" [disabled]="loading()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.spinning]="loading()">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              {{ loading() ? 'Loading...' : 'Refresh' }}
            </button>
          }
          <button class="toolbar-btn config-btn" (click)="showConfig.set(true)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Settings
          </button>
        </div>
      </header>

      <div class="main-content">
        <div class="sidebar">
          <app-customer-list
            [customers]="customers()"
            [selectedCustomer]="selectedCustomer()"
            (select)="onSelectCustomer($event)"
          />
        </div>
        <div class="map-container">
          <div #map class="map"></div>
        </div>
      </div>

      @if (selectedCustomer()) {
        <app-customer-detail
          [customer]="selectedCustomer()!"
          (close)="selectedCustomer.set(null)"
        />
      }

      <app-config-modal
        [isOpen]="showConfig()"
        [initialConfig]="config()"
        (close)="showConfig.set(false)"
        (save)="onConfigSave($event)"
      />
    </div>
  `,
  styles: [`
    .map-view {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--bg-color);
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      background: var(--surface-color);
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--primary-color);
    }
    .logo h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .toolbar-right {
      display: flex;
      gap: 12px;
    }
    .toolbar-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .refresh-btn {
      background: var(--primary-light);
      color: var(--primary-color);
    }
    .refresh-btn:hover {
      background: #bfdbfe;
    }
    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .config-btn {
      background: var(--surface-color);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }
    .config-btn:hover {
      background: var(--bg-color);
      border-color: var(--text-muted);
    }
    .spinning {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .main-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .sidebar {
      width: 380px;
      background: var(--surface-color);
      border-right: 1px solid var(--border-color);
      overflow: hidden;
    }
    .map-container {
      flex: 1;
      position: relative;
      background: #e5e7eb;
    }
    .map {
      width: 100%;
      height: 100%;
    }
    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        position: absolute;
        z-index: 100;
        height: 50%;
        bottom: 0;
        background: white;
      }
      .map-container {
        height: 50%;
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

  private map: L.Map | null = null;
  private markers: Map<string, L.CircleMarker> = new Map();
  private markersLayer: L.LayerGroup | null = null;
  private geoSub?: Subscription;

  constructor() {
    // Load saved config
    const savedConfig = this.cacheService.getConfig();
    if (savedConfig) {
      this.config.set(savedConfig);
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
      zoomControl: false
    }).setView([20, 0], 2);

    // Add zoom control to top right
    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);

    // Use CartoDB Positron - professional, clean, free tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    // Create a layer group for markers
    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  refreshData() {
    this.loadData();
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

    // Track geocoded customers to fit bounds later
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

              // Fit bounds to show all markers
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

    const marker = L.circleMarker([customer.lat, customer.lng], {
      radius: 10,
      fillColor: '#3b82f6',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9
    }).addTo(this.markersLayer);

    marker.bindPopup(`
      <div style="font-family: Inter, sans-serif; padding: 8px;">
        <strong style="font-size: 14px; color: #1e293b;">${customer.name}</strong><br>
        <span style="font-size: 12px; color: #64748b;">${customer.address}</span><br>
        <span style="font-size: 12px; color: #94a3b8;">${customer.country}</span>
      </div>
    `, {
      closeButton: false,
      className: 'custom-popup'
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
      this.map.setView([customer.lat, customer.lng], 16);
      const marker = this.markers.get(customer.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }
}
