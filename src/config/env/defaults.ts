import type { EnvConfig } from './schema';

export const defaultConfig: EnvConfig = {
  openai: {
    apiKey: 'sk-test-123',
  },
  airtable: {
    apiKey: 'key123abc',
    baseId: 'app123xyz',
  },
  make: {
    webhookUrl: 'https://hook.eu1.make.com/test123',
    webhookSecret: 'webhook-secret-123',
  },
};