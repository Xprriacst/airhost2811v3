import { z } from 'zod';

export const envSchema = z.object({
  openai: z.object({
    apiKey: z.string().min(1, 'OpenAI API key is required'),
  }),
  airtable: z.object({
    apiKey: z.string().min(1, 'Airtable API key is required'),
    baseId: z.string().min(1, 'Airtable Base ID is required'),
  }),
  make: z.object({
    webhookUrl: z.string().url('Make webhook URL must be a valid URL'),
    webhookSecret: z.string().min(1, 'Make webhook secret is required'),
  }),
});

export type EnvConfig = z.infer<typeof envSchema>;