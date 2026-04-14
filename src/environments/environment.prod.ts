import { Environment, isValidConfig } from './environment.types';

export const environment: Environment = {
  production: true,
  googleSheetConfig: {
    sheetId: '', // TODO: Add your Google Sheet ID here
    apiKey: '', // TODO: Add your Google API Key here via Settings UI
    range: 'Merged Contacts!A:G'
  }
};

export { isValidConfig };
