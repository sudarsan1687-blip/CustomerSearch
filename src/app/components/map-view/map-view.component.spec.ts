import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MapViewComponent } from './map-view.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { GeocodingService } from '../../services/geocoding.service';
import { CacheService } from '../../services/cache.service';
import { Customer, GoogleSheetConfig } from '../../models/customer.model';

// Mock Leaflet
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    setView: jest.fn().mockReturnThis(),
    remove: jest.fn()
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis()
  })),
  circleMarker: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    openPopup: jest.fn()
  })),
  Marker: {
    prototype: {
      openPopup: jest.fn()
    }
  }
}));

describe('MapViewComponent', () => {
  let component: MapViewComponent;
  let fixture: ComponentFixture<MapViewComponent>;
  let sheetsService: jest.Mocked<GoogleSheetsService>;
  let geocodingService: jest.Mocked<GeocodingService>;
  let cacheService: jest.Mocked<CacheService>;

  const mockConfig: GoogleSheetConfig = {
    sheetId: 'test-sheet-id',
    apiKey: 'test-api-key'
  };

  const mockCustomers: Customer[] = [
    { id: '1', name: 'Company A', category: 'Retail', country: 'USA', address: '123 Main St', contact: '+1-555-0100', website: '', buyer: 'John', geocodeStatus: 'pending' },
    { id: '2', name: 'Company B', category: 'Wholesale', country: 'UK', address: '456 High St', contact: '+44-20-7946', website: '', buyer: 'Jane', geocodeStatus: 'pending' }
  ];

  beforeEach(async () => {
    const sheetsSpy = {
      fetchCustomers: jest.fn()
    };

    const geocodeSpy = {
      geocodeCustomers: jest.fn()
    };

    const cacheSpy = {
      getConfig: jest.fn().mockReturnValue(null),
      setConfig: jest.fn(),
      getGeocodeCache: jest.fn().mockReturnValue({}),
      setGeocodeCache: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MapViewComponent, HttpClientTestingModule],
      providers: [
        { provide: GoogleSheetsService, useValue: sheetsSpy },
        { provide: GeocodingService, useValue: geocodeSpy },
        { provide: CacheService, useValue: cacheSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapViewComponent);
    component = fixture.componentInstance;
    sheetsService = TestBed.inject(GoogleSheetsService) as jest.Mocked<GoogleSheetsService>;
    geocodingService = TestBed.inject(GeocodingService) as jest.Mocked<GeocodingService>;
    cacheService = TestBed.inject(CacheService) as jest.Mocked<CacheService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show config modal on first load if no config', () => {
    cacheService.getConfig.mockReturnValue(null);
    fixture.detectChanges();

    expect(component.showConfig()).toBe(true);
  });

  it('should load saved config on init', () => {
    cacheService.getConfig.mockReturnValue(mockConfig);
    sheetsService.fetchCustomers.mockReturnValue(of(mockCustomers));
    geocodingService.geocodeCustomers.mockReturnValue(of());

    fixture.detectChanges();

    expect(component.config()).toEqual(mockConfig);
    expect(sheetsService.fetchCustomers).toHaveBeenCalledWith(mockConfig);
  });

  it('should update config and reload data when saving', () => {
    sheetsService.fetchCustomers.mockReturnValue(of(mockCustomers));
    geocodingService.geocodeCustomers.mockReturnValue(of());

    component.onConfigSave(mockConfig);

    expect(cacheService.setConfig).toHaveBeenCalledWith(mockConfig);
    expect(component.config()).toEqual(mockConfig);
    expect(sheetsService.fetchCustomers).toHaveBeenCalled();
  });

  it('should handle fetch error gracefully', fakeAsync(() => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    sheetsService.fetchCustomers.mockReturnValue(throwError(() => new Error('Fetch failed')));

    cacheService.getConfig.mockReturnValue(mockConfig);
    fixture.detectChanges();

    tick();

    expect(consoleSpy).toHaveBeenCalled();
    expect(component.loading()).toBe(false);
    expect(component.showConfig()).toBe(true);

    consoleSpy.mockRestore();
  }));

  it('should select customer and update view', () => {
    const customer = mockCustomers[0];
    component.onSelectCustomer(customer);

    expect(component.selectedCustomer()).toEqual(customer);
  });

  it('should display loading state', () => {
    component.loading.set(true);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.toolbar-btn')).nativeElement;
    expect(button.textContent).toContain('Loading');
    expect(button.disabled).toBe(true);
  });

  it('should trigger refresh when refresh button clicked', () => {
    sheetsService.fetchCustomers.mockReturnValue(of(mockCustomers));
    geocodingService.geocodeCustomers.mockReturnValue(of());

    component.config.set(mockConfig);
    fixture.detectChanges();

    const refreshSpy = jest.spyOn(component, 'refreshData');
    component.refreshData();

    expect(refreshSpy).toHaveBeenCalled();
  });
});
