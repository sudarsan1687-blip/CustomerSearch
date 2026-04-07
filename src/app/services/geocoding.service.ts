import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, concatMap, from, merge } from 'rxjs';
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

  // Country code mapping for common country names
  private readonly countryCodeMap: Map<string, string> = new Map([
    ['united kingdom', 'gb'],
    ['uk', 'gb'],
    ['great britain', 'gb'],
    ['england', 'gb'],
    ['scotland', 'gb'],
    ['wales', 'gb'],
    ['northern ireland', 'gb'],
    ['united states', 'us'],
    ['usa', 'us'],
    ['united states of america', 'us'],
    ['america', 'us'],
    ['india', 'in'],
    ['germany', 'de'],
    ['france', 'fr'],
    ['italy', 'it'],
    ['spain', 'es'],
    ['netherlands', 'nl'],
    ['belgium', 'be'],
    ['switzerland', 'ch'],
    ['austria', 'at'],
    ['poland', 'pl'],
    ['ireland', 'ie'],
    ['portugal', 'pt'],
    ['sweden', 'se'],
    ['norway', 'no'],
    ['denmark', 'dk'],
    ['finland', 'fi'],
    ['australia', 'au'],
    ['canada', 'ca'],
    ['japan', 'jp'],
    ['china', 'cn'],
    ['singapore', 'sg'],
    ['uae', 'ae'],
    ['united arab emirates', 'ae'],
  ]);

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

    // Get country code for strict filtering
    const countryCode = this.getCountryCode(country);

    // Try multiple search strategies with strict country filtering
    return this.tryGeocodeWithStrategies(cleanAddress, country, countryCode, shortAddress).pipe(
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
   * Get ISO country code from country name
   */
  private getCountryCode(country: string): string | undefined {
    const lowerCountry = country.toLowerCase().trim();
    // Check if it's already a 2-letter code
    if (country.length === 2 && /^[A-Z]{2}$/.test(country)) {
      return country.toLowerCase();
    }
    // Look up in our map
    return this.countryCodeMap.get(lowerCountry);
  }

  /**
   * Try multiple geocoding strategies in sequence with strict country filtering
   */
  private tryGeocodeWithStrategies(
    address: string,
    country: string,
    countryCode: string | undefined,
    shortAddress: string
  ): Observable<{ lat: number; lng: number } | null> {
    // Always use country code for strict filtering when available
    const codeParam = countryCode || (country.length === 2 ? country.toLowerCase() : undefined);

    const strategies = [
      // Strategy 1: Full address with strict country code filtering
      () => this.geocodeWithQuery(`${address}, ${country}`, { countrycodes: codeParam, viewbox: this.getCountryViewbox(codeParam), bounded: 1 }),
      // Strategy 2: Just the short address (city name) with strict country filtering
      () => shortAddress !== address && codeParam
        ? this.geocodeWithQuery(`${shortAddress}`, { countrycodes: codeParam, viewbox: this.getCountryViewbox(codeParam), bounded: 1 })
        : of(null),
      // Strategy 3: Full address without bounding (fallback)
      () => this.geocodeWithQuery(`${address}, ${country}`, { countrycodes: codeParam }),
      // Strategy 4: Short address only (for well-known cities) - last resort
      () => this.geocodeWithQuery(shortAddress, { limit: 5 }),
    ];

    // Execute strategies sequentially until one succeeds
    return this.executeStrategies(strategies, 0);
  }

  /**
   * Get viewbox coordinates for country bounding
   * Format: minLon,minLat,maxLon,maxLat
   */
  private getCountryViewbox(countryCode: string | undefined): string | undefined {
    if (!countryCode) return undefined;

    const viewboxes: Map<string, string> = new Map([
      ['gb', '-8.65,49.87,1.76,60.86'],     // UK
      ['us', '-125.0,24.5,-66.9,49.4'],      // USA
      ['in', '68.1,6.7,97.4,37.1'],          // India
      ['de', '5.8,47.3,15.0,55.1'],          // Germany
      ['fr', '-5.2,42.3,9.6,51.1'],          // France
      ['it', '6.6,36.6,18.5,47.1'],          // Italy
      ['es', '-9.3,36.0,3.3,43.8'],          // Spain
      ['nl', '3.3,50.7,7.2,53.6'],           // Netherlands
      ['be', '2.5,49.5,6.4,51.5'],           // Belgium
      ['ch', '6.0,45.8,10.5,47.8'],          // Switzerland
      ['at', '9.5,46.4,17.2,49.0'],          // Austria
      ['pl', '14.1,49.0,24.2,54.8'],         // Poland
      ['ie', '-10.5,51.4,-5.0,55.4'],        // Ireland
      ['pt', '-9.5,36.7,-6.2,42.2'],         // Portugal
      ['se', '11.0,55.3,24.2,69.1'],         // Sweden
      ['no', '4.6,58.0,31.1,71.2'],          // Norway
      ['dk', '8.0,54.6,12.8,57.7'],          // Denmark
      ['fi', '20.5,59.7,31.6,70.1'],         // Finland
      ['au', '113.1,-44.0,153.6,-10.0'],     // Australia
      ['ca', '-141.0,41.7,-52.6,83.1'],      // Canada
      ['jp', '122.9,24.0,145.8,45.5'],       // Japan
      ['cn', '73.5,18.2,135.0,53.6'],        // China
      ['sg', '103.6,1.2,104.4,1.5'],         // Singapore
      ['ae', '51.5,22.5,56.4,26.1'],         // UAE
    ]);

    return viewboxes.get(countryCode);
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
    options: { countrycodes?: string; limit?: number; viewbox?: string; bounded?: number } = {}
  ): Observable<{ lat: number; lng: number } | null> {
    const params: any = {
      format: 'json',
      q: query,
      limit: options.limit?.toString() || '1',
    };

    if (options.countrycodes) {
      params.countrycodes = options.countrycodes;
    }

    if (options.viewbox) {
      params.viewbox = options.viewbox;
    }

    if (options.bounded) {
      params.bounded = options.bounded.toString();
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
    // Separate cached and non-cached customers
    const cached: Customer[] = [];
    const toGeocode: Customer[] = [];

    customers.forEach(customer => {
      if (!customer.address) {
        cached.push({ ...customer, geocodeStatus: 'failed' as const });
        return;
      }

      const cacheKey = `${customer.address}, ${customer.country}`;
      const cache = this.cacheService.getGeocodeCache();

      if (cache[cacheKey]) {
        const cachedCoords = cache[cacheKey];
        if (cachedCoords) {
          cached.push({
            ...customer,
            lat: cachedCoords.lat,
            lng: cachedCoords.lng,
            geocodeStatus: 'success' as const
          });
        } else {
          cached.push({ ...customer, geocodeStatus: 'failed' as const });
        }
      } else {
        toGeocode.push(customer);
      }
    });

    // Emit cached results immediately (no delay)
    const cached$ = from(cached);

    // Process non-cached with delay
    const geocode$ = from(toGeocode).pipe(
      concatMap(customer =>
        this.geocodeAddress(customer.address, customer.country).pipe(
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
        )
      )
    );

    // Emit cached first, then geocoded results
    return merge(cached$, geocode$);
  }
}
