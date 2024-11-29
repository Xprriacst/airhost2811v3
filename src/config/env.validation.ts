import { getEnvVar } from '../utils/env';

export const validateEnv = () => {
  const requiredEnvVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_AIRTABLE_API_KEY',
    'VITE_AIRTABLE_BASE_ID',
    'VITE_MAKE_WEBHOOK_URL',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !getEnvVar(varName)
  );

  if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
};