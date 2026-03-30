import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, concatMap, from } from 'rxjs';
import { Customer } from '../models/customer.model';
import { CacheService } from './cache.service';
import { map, catchError } from 'rxjs/operators';

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private http = inject(HttpClient);
  private cacheService = inject(CacheService);

  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  private readonly REQUEST_DELAY = 600; // Reduced delay for faster processing

  /**
   * Geocode an address with enhanced handling for short addresses
   * Tries multiple strategies:
   * 1. Full address + country
   * 2. City/town name only (for short addresses like "Naples")
   * 3. Address with country code
   */
  geocodeAddress(address: string, country: string): Observable<{ lat: number; lng: number } | null> {
    const cacheKey = `${address}, ${country}`;
    const cache = this.cacheService.getGeocodeCache();

    if (cache[cacheKey]) {
      return of(cache[cacheKey]);
    }

    // Clean and normalize the address
    const cleanAddress = this.cleanAddress(address);
    const shortAddress = this.extractShortAddress(address);

    // Try multiple search strategies
    return this.tryGeocodeWithStrategies(cleanAddress, country, shortAddress).pipe(
      map(result => {
        if (result) {
          cache[cacheKey] = result;
          this.cacheService.setGeocodeCache(cache);
          return result;
        }
        cache[cacheKey] = null;
        this.cacheService.setGeocodeCache(cache);
        return null;
      }),
      catchError(() => {
        cache[cacheKey] = null;
        this.cacheService.setGeocodeCache(cache);
        return of(null);
      })
    );
  }

  /**
   * Try multiple geocoding strategies in sequence
   */
  private tryGeocodeWithStrategies(
    address: string,
    country: string,
    shortAddress: string
  ): Observable<{ lat: number; lng: number } | null> {
    const strategies = [
      // Strategy 1: Full address with country
      () => this.geocodeWithQuery(`${address}, ${country}`, { countrycodes: country.length === 2 ? country.toLowerCase() : undefined }),
      // Strategy 2: Just the short address (city name) with country
      () => shortAddress !== address
        ? this.geocodeWithQuery(`${shortAddress}, ${country}`, { countrycodes: country.length === 2 ? country.toLowerCase() : undefined })
        : of(null),
      // Strategy 3: Short address only (for well-known cities like Naples, Rome, etc.)
      () => this.geocodeWithQuery(shortAddress, { limit: 5 }),
      // Strategy 4: Address without country suffix if it's redundant
      () => address.includes(country)
        ? this.geocodeWithQuery(address.replace(new RegExp(`\\s*,?\\s*${country}`, 'i'), ''))
        : of(null),
    ];

    // Execute strategies sequentially until one succeeds
    return this.executeStrategies(strategies, 0);
  }

  private executeStrategies(
    strategies: Array<() => Observable<{ lat: number; lng: number } | null>>,
    index: number
  ): Observable<{ lat: number; lng: number } | null> {
    if (index >= strategies.length) {
      return of(null);
    }

    return strategies[index]().pipe(
      concatMap(result => {
        if (result) {
          return of(result);
        }
        return this.executeStrategies(strategies, index + 1);
      })
    );
  }

  /**
   * Clean address by removing common noise
   */
  private cleanAddress(address: string): string {
    return address
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .trim();
  }

  /**
   * Extract the most relevant part of address for geocoding
   * Handles cases like "Naples (NA)", "Rome (RM)", etc.
   */
  private extractShortAddress(address: string): string {
    // Handle "City (Province)" format common in Italy
    const parenMatch = address.match(/^([^(]+)\s*\([^)]+\)/);
    if (parenMatch) {
      return parenMatch[1].trim();
    }

    // Handle "City, Country" format
    const parts = address.split(',');
    if (parts.length > 0) {
      return parts[0].trim();
    }

    return address;
  }

  /**
   * Make geocoding request with options
   */
  private geocodeWithQuery(
    query: string,
    options: { countrycodes?: string; limit?: number } = {}
  ): Observable<{ lat: number; lng: number } | null> {
    const params: any = {
      format: 'json',
      q: query,
      limit: options.limit?.toString() || '1',
    };

    if (options.countrycodes) {
      params.countrycodes = options.countrycodes;
    }

    const url = `${this.NOMINATIM_URL}?${this.buildQueryString(params)}`;

    return this.http.get<NominatimResponse[]>(url).pipe(
      map(results => {
        if (results?.length > 0) {
          // Prefer results that are cities/towns over streets
          const cityResult = results.find(r =>
            r.address?.city || r.address?.town || r.address?.village
          );

          const result = cityResult || results[0];
          return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
          };
        }
        return null;
      })
    );
  }

  /**
   * Build query string from params object
   */
  private buildQueryString(params: Record<string, string>): string {
    return Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  }

  geocodeCustomers(customers: Customer[]): Observable<Customer> {
    return from(customers).pipe(
      concatMap(customer => {
        if (!customer.address) {
          return of({ ...customer, geocodeStatus: 'failed' as const });
        }

        return this.geocodeAddress(customer.address, customer.country).pipe(
          delay(this.REQUEST_DELAY),
          map(coords => {
            if (coords) {
              return {
                ...customer,
                lat: coords.lat,
                lng: coords.lng,
                geocodeStatus: 'success' as const
              };
            }
            return { ...customer, geocodeStatus: 'failed' as const };
          })
        );
      })
    );
  }
}
