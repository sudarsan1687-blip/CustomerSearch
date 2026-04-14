import { Environment, isValidConfig } from './environment.types';

export const environment: Environment = {
  production: false,
  googleSheetConfig: {
    sheetId: '', // Add your Google Sheet ID here
    apiKey: '', // TODO: Add your Google API Key here
    range: 'Merged Contacts!A:G'
  }
};

export { isValidConfig };
