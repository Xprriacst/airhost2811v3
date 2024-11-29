import type { EnvConfig } from './env.types';

// Default development values
const defaultConfig: EnvConfig = {
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

export const env: EnvConfig = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || defaultConfig.openai.apiKey,
  },
  airtable: {
    apiKey: import.meta.env.VITE_AIRTABLE_API_KEY || defaultConfig.airtable.apiKey,
    baseId: import.meta.env.VITE_AIRTABLE_BASE_ID || defaultConfig.airtable.baseId,
  },
  make: {
    webhookUrl: import.meta.env.VITE_MAKE_WEBHOOK_URL || defaultConfig.make.webhookUrl,
    webhookSecret: import.meta.env.MAKE_WEBHOOK_SECRET || defaultConfig.make.webhookSecret,
  },
};

// Validate environment
const validateEnv = () => {
  const missingVars = [];
  
  if (!env.openai.apiKey) missingVars.push('VITE_OPENAI_API_KEY');
  if (!env.airtable.apiKey) missingVars.push('VITE_AIRTABLE_API_KEY');
  if (!env.airtable.baseId) missingVars.push('VITE_AIRTABLE_BASE_ID');
  if (!env.make.webhookUrl) missingVars.push('VITE_MAKE_WEBHOOK_URL');

  if (missingVars.length > 0) {
    console.warn('Using development environment variables for:', missingVars.join(', '));
  }
};

validateEnv();