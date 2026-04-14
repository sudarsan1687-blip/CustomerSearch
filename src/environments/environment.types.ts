export interface Environment {
  production: boolean;
  googleSheetConfig: {
    sheetId: string;
    apiKey: string;
    range: string;
  };
}

export function isValidConfig(config: { sheetId?: string; apiKey?: string } | null): boolean {
  return !!(config?.sheetId && config?.apiKey && config.sheetId.length > 0);
}
