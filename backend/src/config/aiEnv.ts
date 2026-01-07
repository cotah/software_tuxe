import { z } from 'zod';

const aiSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  DEFAULT_AI_MODEL: z.string().optional(),
});

export type AIEnv = {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
};

export function loadAIEnv(): AIEnv {
  const parsed = aiSchema.safeParse(process.env);
  if (!parsed.success) {
    return {};
  }
  return {
    apiKey: parsed.data.OPENAI_API_KEY || undefined,
    baseUrl: parsed.data.OPENAI_BASE_URL || undefined,
    defaultModel: parsed.data.DEFAULT_AI_MODEL || undefined,
  };
}
