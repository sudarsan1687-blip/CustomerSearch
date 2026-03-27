import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, concatMap, from } from 'rxjs';
import { Customer } from '../models/customer.model';
import { CacheService } from './cache.service';

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private http = inject(HttpClient);
  private cacheService = inject(CacheService);

  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  private readonly REQUEST_DELAY = 1100; // Rate limit: ~1 req/sec

  geocodeAddress(address: string, country: string): Observable<{ lat: number; lng: number } | null> {
    const cacheKey = `${address}, ${country}`;
    const cache = this.cacheService.getGeocodeCache();

    if (cache[cacheKey]) {
      return of(cache[cacheKey]);
    }

    const fullAddress = `${address}, ${country}`;
    const url = `${this.NOMINATIM_URL}?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`;

    return this.http.get<NominatimResponse[]>(url).pipe(
      map(results => {
        if (results?.length > 0) {
          const result = {
            lat: parseFloat(results[0].lat),
            lng: parseFloat(results[0].lon)
          };
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

// Import map and catchError
import { map, catchError } from 'rxjs/operators';
