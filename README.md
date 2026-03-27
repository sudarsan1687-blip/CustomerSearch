# Customer Search - Angular PWA

An Angular-based Progressive Web App (PWA) that displays customer locations on a map using data from Google Sheets.

## Features

✅ **Google Sheets Integration** - Pull customer data directly from your Google Sheet
✅ **Geocoding** - Automatic address-to-coordinates conversion using OpenStreetMap/Nominatim
✅ **Interactive Map** - Leaflet.js powered map with customer markers
✅ **PWA Support** - Install as a standalone app, works offline
✅ **Caching** - Geocoding results cached in localStorage for performance
✅ **Search & Filter** - Search customers by name, address, or country
✅ **Responsive Design** - Works on desktop and mobile

## Prerequisites

- **Node.js** 18+
- **npm** 9+
- **Google Sheets API Key** - Get one from [Google Cloud Console](https://console.cloud.google.com/)
- **Google Sheet** with the following columns: Name, Category, Country, Address, Contact, Website, Buyer

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/sudarsan1687-blip/CustomerSearch.git
cd CustomerSearch-Angular
npm install
```

### 2. Configure Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Google Sheets API**
4. Create an **API Key** (restrict it to Sheets API for security)
5. Make your Google Sheet **public** (or share with the service account)
6. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID/edit
   ```

### 3. Run the App

```bash
# Development server
npm start

# Build for production
npm run build:prod
```

### 4. First Launch

1. Open http://localhost:4200
2. Click **Config** button
3. Enter your **Sheet ID** and **API Key**
4. Click **Save** - data will load automatically

## Project Structure

```
src/app/
├── components/
│   ├── map-view/          # Main map + sidebar layout
│   ├── customer-list/     # Searchable customer list
│   ├── customer-detail/   # Slide-in detail panel
│   └── config-modal/      # Settings modal
├── services/
│   ├── google-sheets.service.ts   # Fetch from Sheets API
│   ├── geocoding.service.ts       # Nominatim geocoding
│   └── cache.service.ts           # localStorage caching
└── models/
    └── customer.model.ts          # TypeScript interfaces
```

## Google Sheet Format

Your sheet should have these columns (A-G):

| A: Name | B: Category | C: Country | D: Address | E: Contact | F: Website | G: Buyer |
|---------|-------------|------------|------------|------------|------------|----------|

Example data:
```
Name           | Category | Country | Address              | Contact        | Website          | Buyer
---------------|----------|---------|----------------------|----------------|------------------|-------
ABC Corp       | Retail   | USA     | 123 Main St, NY      | +1-555-0100    | www.abccorp.com  | John Doe
XYZ Ltd        | Wholesale| UK      | 456 High St, London  | +44-20-7946    | www.xyz.uk       | Jane Smith
```

## Deployment

### GitHub Pages
```bash
npm run build:prod
npx angular-cli-ghpages --dir=dist/customer-search
```

### Netlify
```bash
npm run build:prod
drag dist/customer-search folder to Netlify
```

## Technologies Used

- **Angular 17** - Modern standalone components
- **TypeScript** - Type safety
- **Leaflet.js** - Interactive maps
- **RxJS** - Reactive programming
- **Angular PWA** - Service workers, offline support
- **Google Sheets API v4** - Data source
- **Nominatim** - Free geocoding service

## Differences from Original

| Feature | Original (HTML) | Angular Version |
|---------|-----------------|-----------------|
| Architecture | Single file | Modular components |
| State Management | Variables | Angular Signals |
| Type Safety | None | TypeScript |
| Build System | None | Angular CLI |
| PWA | Manual | Built-in Angular PWA |
| Testing | Manual | Unit test ready |

## License

MIT
