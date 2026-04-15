export interface Customer {
  id: string;
  name: string;
  category: string;
  country: string;
  address: string;
  contact: string;
  email: string;
  website: string;
  buyer: string;
  notes: string;
  lat?: number;
  lng?: number;
  geocodeStatus: 'pending' | 'success' | 'failed';
  distance?: number;
}

export interface GoogleSheetConfig {
  sheetId: string;
  apiKey: string;
  range?: string;
}

export interface GeocodeCache {
  [key: string]: { lat: number; lng: number } | null;
}
