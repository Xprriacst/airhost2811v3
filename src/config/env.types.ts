export interface EnvConfig {
  openai: {
    apiKey: string;
  };
  airtable: {
    apiKey: string;
    baseId: string;
  };
  make: {
    webhookUrl: string;
    webhookSecret: string;
  };
}