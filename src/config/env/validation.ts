import { envSchema } from './schema';
import type { EnvConfig } from './schema';

export const validateEnv = (config: EnvConfig): void => {
  try {
    envSchema.parse(config);
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw error;
  }
};

export const validateEnvVar = (name: string, value?: string): void => {
  if (!value) {
    console.warn(`Environment variable ${name} is not set`);
  }
};