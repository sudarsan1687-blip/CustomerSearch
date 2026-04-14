import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, throwError, catchError } from 'rxjs';
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

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        if (!response) {
          throw new Error('Empty response from Google Sheets API');
        }
        return this.parseSheetData(response.values || []);
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Unknown error';
        if (error.status === 403) {
          errorMessage = 'API Key is invalid or has insufficient permissions. Please enable the Google Sheets API in your Google Cloud Console.';
        } else if (error.status === 404) {
          errorMessage = 'Google Sheet not found. Please verify the Sheet ID.';
        } else if (error.status === 400) {
          errorMessage = 'Invalid request. Check the Sheet ID and range format.';
        } else if (error.error?.error?.message) {
          errorMessage = error.error.error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
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
