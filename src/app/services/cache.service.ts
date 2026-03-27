import { Injectable } from '@angular/core';
import { GeocodeCache, GoogleSheetConfig } from '../models/customer.model';

const GEOCODE_CACHE_KEY = 'cs_geocode_cache';
const CONFIG_KEY = 'cs_config';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  getGeocodeCache(): GeocodeCache {
    try {
      const cached = localStorage.getItem(GEOCODE_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  }

  setGeocodeCache(cache: GeocodeCache): void {
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(cache));
  }

  getConfig(): GoogleSheetConfig | null {
    try {
      const config = localStorage.getItem(CONFIG_KEY);
      return config ? JSON.parse(config) : null;
    } catch {
      return null;
    }
  }

  setConfig(config: GoogleSheetConfig): void {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }

  clearCache(): void {
    localStorage.removeItem(GEOCODE_CACHE_KEY);
  }
}
