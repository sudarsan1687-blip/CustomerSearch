import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GoogleSheetsService } from './google-sheets.service';
import { GoogleSheetConfig, Customer } from '../models/customer.model';

describe('GoogleSheetsService', () => {
  let service: GoogleSheetsService;
  let httpMock: HttpTestingController;

  const mockConfig: GoogleSheetConfig = {
    sheetId: 'test-sheet-id',
    apiKey: 'test-api-key',
    range: 'Merged Contacts!A:G'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GoogleSheetsService]
    });
    service = TestBed.inject(GoogleSheetsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchCustomers', () => {
    it('should fetch and parse customer data from Google Sheets', () => {
      const mockResponse = {
        values: [
          ['Name', 'Category', 'Country', 'Address', 'Contact', 'Website', 'Buyer'],
          ['ABC Corp', 'Retail', 'USA', '123 Main St', '+1-555-0100', 'www.abc.com', 'John'],
          ['XYZ Ltd', 'Wholesale', 'UK', '456 High St', '+44-20-7946', 'www.xyz.com', 'Jane']
        ]
      };

      service.fetchCustomers(mockConfig).subscribe((customers: Customer[]) => {
        expect(customers.length).toBe(2);
        expect(customers[0].name).toBe('ABC Corp');
        expect(customers[0].category).toBe('Retail');
        expect(customers[0].country).toBe('USA');
        expect(customers[0].address).toBe('123 Main St');
        expect(customers[0].contact).toBe('+1-555-0100');
        expect(customers[0].website).toBe('www.abc.com');
        expect(customers[0].buyer).toBe('John');
        expect(customers[0].geocodeStatus).toBe('pending');
      });

      const req = httpMock.expectOne(
        `https://sheets.googleapis.com/v4/spreadsheets/${mockConfig.sheetId}/values/${mockConfig.range}?key=${mockConfig.apiKey}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty data', () => {
      const mockResponse = { values: [] };

      service.fetchCustomers(mockConfig).subscribe((customers: Customer[]) => {
        expect(customers.length).toBe(0);
      });

      const req = httpMock.expectOne(
        `https://sheets.googleapis.com/v4/spreadsheets/${mockConfig.sheetId}/values/${mockConfig.range}?key=${mockConfig.apiKey}`
      );
      req.flush(mockResponse);
    });

    it('should handle missing optional range', () => {
      const configWithoutRange: GoogleSheetConfig = {
        sheetId: 'test-sheet-id',
        apiKey: 'test-api-key'
      };

      const mockResponse = {
        values: [
          ['Name', 'Category', 'Country', 'Address', 'Contact', 'Website', 'Buyer'],
          ['Test Company', 'Category', 'Country', 'Address', 'Contact', 'Website', 'Buyer']
        ]
      };

      service.fetchCustomers(configWithoutRange).subscribe();

      const req = httpMock.expectOne(
        `https://sheets.googleapis.com/v4/spreadsheets/${configWithoutRange.sheetId}/values/Merged Contacts!A:G?key=${configWithoutRange.apiKey}`
      );
      req.flush(mockResponse);
    });

    it('should throw error when config is invalid', () => {
      const invalidConfig: GoogleSheetConfig = {
        sheetId: '',
        apiKey: ''
      };

      service.fetchCustomers(invalidConfig).subscribe({
        error: (error) => {
          expect(error.message).toBe('Sheet ID and API Key are required');
        }
      });
    });

    it('should handle missing fields gracefully', () => {
      const mockResponse = {
        values: [
          ['Name', 'Category', 'Country', 'Address', 'Contact', 'Website', 'Buyer'],
          ['Partial Data']  // Only name provided
        ]
      };

      service.fetchCustomers(mockConfig).subscribe((customers: Customer[]) => {
        expect(customers[0].name).toBe('Partial Data');
        expect(customers[0].category).toBe('');
        expect(customers[0].country).toBe('');
      });

      const req = httpMock.expectOne(
        `https://sheets.googleapis.com/v4/spreadsheets/${mockConfig.sheetId}/values/${mockConfig.range}?key=${mockConfig.apiKey}`
      );
      req.flush(mockResponse);
    });
  });
});
