import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const serverEnvSchema = z.object({
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

export const serverEnv = serverEnvSchema.parse({
  openai: {
    apiKey: process.env.VITE_OPENAI_API_KEY,
  },
  airtable: {
    apiKey: process.env.VITE_AIRTABLE_API_KEY,
    baseId: process.env.VITE_AIRTABLE_BASE_ID,
  },
  make: {
    webhookUrl: process.env.VITE_MAKE_WEBHOOK_URL,
    webhookSecret: process.env.MAKE_WEBHOOK_SECRET,
  },
});

export type ServerEnvConfig = z.infer<typeof serverEnvSchema>;