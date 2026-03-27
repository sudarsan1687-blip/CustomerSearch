import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { Customer, GoogleSheetConfig } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private http = inject(HttpClient);

  fetchCustomers(config: GoogleSheetConfig): Observable<Customer[]> {
    const { sheetId, apiKey, range = 'Merged Contacts!A:G' } = config;

    if (!sheetId || !apiKey) {
      return throwError(() => new Error('Sheet ID and API Key are required'));
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    return this.http.get<any>(url).pipe(
      map(response => this.parseSheetData(response.values || []))
    );
  }

  private parseSheetData(rows: any[][]): Customer[] {
    if (!rows.length) return [];

    // Skip header row
    const dataRows = rows.slice(1);

    return dataRows.map((row, index) => ({
      id: `customer-${index}`,
      name: row[0] || '',
      category: row[1] || '',
      country: row[2] || '',
      address: row[3] || '',
      contact: row[4] || '',
      website: row[5] || '',
      buyer: row[6] || '',
      geocodeStatus: 'pending'
    }));
  }
}
