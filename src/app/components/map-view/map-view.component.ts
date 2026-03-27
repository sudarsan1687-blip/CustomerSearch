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
          <h1>Customer Search</h1>
        </div>
        <div class="toolbar-right">
          @if (config()) {
            <button class="toolbar-btn" (click)="refreshData()" [disabled]="loading()">
              {{ loading() ? 'Loading...' : 'Refresh' }}
            </button>
          }
          <button class="toolbar-btn" (click)="showConfig.set(true)">
            Config
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
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background: #1976d2;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .toolbar h1 {
      margin: 0;
      font-size: 1.25rem;
    }
    .toolbar-right {
      display: flex;
      gap: 10px;
    }
    .toolbar-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: rgba(255,255,255,0.2);
      color: white;
      cursor: pointer;
      font-size: 14px;
    }
    .toolbar-btn:hover {
      background: rgba(255,255,255,0.3);
    }
    .toolbar-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .main-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .sidebar {
      width: 350px;
      border-right: 1px solid #e0e0e0;
      overflow: hidden;
    }
    .map-container {
      flex: 1;
      position: relative;
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
    this.map = L.map(this.mapElement.nativeElement).setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
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
            }
          }
        },
        error: (err) => {
          console.error('Geocoding error:', err);
        }
      });
  }

  private addMarker(customer: Customer) {
    if (!this.map || !customer.lat || !customer.lng) return;

    const marker = L.circleMarker([customer.lat, customer.lng], {
      radius: 8,
      fillColor: '#1976d2',
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(this.map);

    marker.bindPopup(`
      <b>${customer.name}</b><br>
      ${customer.address}<br>
      ${customer.country}
    `);

    marker.on('click', () => {
      this.selectedCustomer.set(customer);
    });

    this.markers.set(customer.id, marker);
  }

  private clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();
  }

  onSelectCustomer(customer: Customer) {
    this.selectedCustomer.set(customer);

    if (customer.lat && customer.lng && this.map) {
      this.map.setView([customer.lat, customer.lng], 14);
      const marker = this.markers.get(customer.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }
}
