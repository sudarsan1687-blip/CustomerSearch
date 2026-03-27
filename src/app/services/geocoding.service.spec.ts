import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GeocodingService } from './geocoding.service';
import { CacheService } from './cache.service';
import { Customer } from '../models/customer.model';

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpMock: HttpTestingController;
  let cacheService: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GeocodingService,
        CacheService
      ]
    });
    service = TestBed.inject(GeocodingService);
    httpMock = TestBed.inject(HttpTestingController);
    cacheService = TestBed.inject(CacheService);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('geocodeAddress', () => {
    it('should geocode an address successfully', fakeAsync(() => {
      const address = '123 Main St';
      const country = 'USA';
      const mockResponse = [
        { lat: '40.7128', lon: '-74.0060', display_name: '123 Main St, New York' }
      ];

      service.geocodeAddress(address, country).subscribe((result) => {
        expect(result).toEqual({ lat: 40.7128, lng: -74.0060 });
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('nominatim.openstreetmap.org/search')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      tick(1100);
    }));

    it('should return null for no results', fakeAsync(() => {
      const address = 'Nonexistent Address';
      const country = 'Nowhere';

      service.geocodeAddress(address, country).subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('nominatim.openstreetmap.org')
      );
      req.flush([]);

      tick(1100);
    }));

    it('should return cached result without API call', fakeAsync(() => {
      const address = '123 Main St';
      const country = 'USA';
      const cacheKey = `${address}, ${country}`;
      const cachedResult = { lat: 40.7128, lng: -74.0060 };

      // Pre-populate cache
      const cache = { [cacheKey]: cachedResult };
      localStorage.setItem('cs_geocode_cache', JSON.stringify(cache));

      service.geocodeAddress(address, country).subscribe((result) => {
        expect(result).toEqual(cachedResult);
      });

      // No HTTP request should be made
      httpMock.expectNone((request) =>
        request.url.includes('nominatim.openstreetmap.org')
      );

      tick();
    }));

    it('should cache failed results', fakeAsync(() => {
      const address = 'Bad Address';
      const country = 'Bad Country';

      service.geocodeAddress(address, country).subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('nominatim.openstreetmap.org')
      );
      req.flush([]);

      tick(1100);

      // Check cache contains null for failed geocode
      const cache = JSON.parse(localStorage.getItem('cs_geocode_cache') || '{}');
      expect(cache[`${address}, ${country}`]).toBeNull();
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      const address = 'Error Address';
      const country = 'Error Country';

      service.geocodeAddress(address, country).subscribe((result) => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes('nominatim.openstreetmap.org')
      );
      req.error(new ProgressEvent('Network error'));

      tick(1100);
    }));
  });

  describe('geocodeCustomers', () => {
    it('should geocode multiple customers with rate limiting', fakeAsync(() => {
      const customers: Customer[] = [
        { id: '1', name: 'Company A', address: 'Address A', country: 'USA', category: '', contact: '', website: '', buyer: '', geocodeStatus: 'pending' },
        { id: '2', name: 'Company B', address: 'Address B', country: 'UK', category: '', contact: '', website: '', buyer: '', geocodeStatus: 'pending' }
      ];

      const results: Customer[] = [];

      service.geocodeCustomers(customers).subscribe((customer) => {
        results.push(customer);
      });

      // First request
      let req = httpMock.expectOne((request) =>
        request.url.includes('nominatim.openstreetmap.org')
      );
      req.flush([{ lat: '40.0', lon: '-74.0', display_name: 'A' }]);

      tick(1100);

      // Second request
      req = httpMock.expectOne((request) =>
        request.url.includes('nominatim.openstreetmap.org')
      );
      req.flush([{ lat: '51.0', lon: '-0.1', display_name: 'B' }]);

      tick(1100);

      expect(results.length).toBe(2);
      expect(results[0].lat).toBe(40.0);
      expect(results[1].lat).toBe(51.0);
    }));

    it('should mark customers without address as failed', fakeAsync(() => {
      const customers: Customer[] = [
        { id: '1', name: 'No Address Co', address: '', country: 'USA', category: '', contact: '', website: '', buyer: '', geocodeStatus: 'pending' }
      ];

      service.geocodeCustomers(customers).subscribe((customer) => {
        expect(customer.geocodeStatus).toBe('failed');
        expect(customer.lat).toBeUndefined();
      });

      tick();
    }));
  });
});
