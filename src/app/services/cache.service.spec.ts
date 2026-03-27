import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { GoogleSheetConfig, GeocodeCache } from '../models/customer.model';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheService]
    });
    service = TestBed.inject(CacheService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Geocode Cache', () => {
    it('should save and retrieve geocode cache', () => {
      const cache: GeocodeCache = {
        '123 Main St, USA': { lat: 40.7128, lng: -74.0060 },
        '456 High St, UK': { lat: 51.5074, lng: -0.1278 }
      };

      service.setGeocodeCache(cache);
      const retrieved = service.getGeocodeCache();

      expect(retrieved).toEqual(cache);
    });

    it('should return empty object when no cache exists', () => {
      const cache = service.getGeocodeCache();
      expect(cache).toEqual({});
    });

    it('should handle corrupted cache data', () => {
      localStorage.setItem('cs_geocode_cache', 'invalid-json');
      const cache = service.getGeocodeCache();
      expect(cache).toEqual({});
    });

    it('should update cache with new values', () => {
      const initialCache: GeocodeCache = {
        'Address 1': { lat: 1, lng: 2 }
      };

      service.setGeocodeCache(initialCache);

      const updatedCache: GeocodeCache = {
        ...initialCache,
        'Address 2': { lat: 3, lng: 4 }
      };

      service.setGeocodeCache(updatedCache);
      const retrieved = service.getGeocodeCache();

      expect(retrieved['Address 1']).toEqual({ lat: 1, lng: 2 });
      expect(retrieved['Address 2']).toEqual({ lat: 3, lng: 4 });
    });

    it('should clear geocode cache', () => {
      const cache: GeocodeCache = { 'Address': { lat: 1, lng: 2 } };
      service.setGeocodeCache(cache);

      service.clearCache();

      const retrieved = service.getGeocodeCache();
      expect(retrieved).toEqual({});
    });
  });

  describe('Config Cache', () => {
    it('should save and retrieve config', () => {
      const config: GoogleSheetConfig = {
        sheetId: 'test-sheet-id',
        apiKey: 'test-api-key',
        range: 'Sheet1!A:G'
      };

      service.setConfig(config);
      const retrieved = service.getConfig();

      expect(retrieved).toEqual(config);
    });

    it('should return null when no config exists', () => {
      const config = service.getConfig();
      expect(config).toBeNull();
    });

    it('should handle corrupted config data', () => {
      localStorage.setItem('cs_config', 'invalid-json');
      const config = service.getConfig();
      expect(config).toBeNull();
    });

    it('should overwrite existing config', () => {
      const config1: GoogleSheetConfig = {
        sheetId: 'id-1',
        apiKey: 'key-1'
      };

      const config2: GoogleSheetConfig = {
        sheetId: 'id-2',
        apiKey: 'key-2',
        range: 'New Range'
      };

      service.setConfig(config1);
      service.setConfig(config2);

      const retrieved = service.getConfig();
      expect(retrieved).toEqual(config2);
      expect(retrieved?.sheetId).toBe('id-2');
    });
  });
});
