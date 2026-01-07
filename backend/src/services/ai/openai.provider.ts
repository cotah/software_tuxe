import { z } from 'zod';
import { IAIProvider, LeadClassificationResult, ConversationSummaryResult, DraftReplyResult } from './provider.interface';

const classificationSchema = z.object({
  temperature: z.enum(['HOT', 'WARM', 'COLD']),
  intent: z.string(),
  confidence: z.number().min(0).max(1),
  notes: z.string().optional(),
});

const summarySchema = z.object({
  summary: z.string(),
  nextActions: z.array(z.string()).default([]),
});

const draftSchema = z.object({
  replyText: z.string(),
});

function buildMessages(systemPrompt: string, userContent: string) {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}

type ChatCallParams = {
  apiKey: string;
  baseUrl?: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  userContent: string;
};

async function callChatCompletion(params: ChatCallParams): Promise<{ content: string; usage?: any }> {
  const { apiKey, baseUrl, model, temperature, systemPrompt, userContent } = params;
  const body = {
    model,
    messages: buildMessages(systemPrompt, userContent),
    temperature,
    response_format: { type: 'json_object' },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(`${baseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${text}`);
  }

  const json: any = await response.json();
  const content = json.choices?.[0]?.message?.content;
  return { content, usage: json.usage };
}

function tokensAndCost(usage: any): { promptTokens: number; completionTokens: number; estimatedCost: number } {
  const promptTokens = usage?.prompt_tokens || 0;
  const completionTokens = usage?.completion_tokens || 0;
  // rough estimate: $0.000002 per token (example)
  const estimatedCost = (promptTokens + completionTokens) * 0.000002;
  return { promptTokens, completionTokens, estimatedCost };
}

export class OpenAIProvider implements IAIProvider {
  constructor(private apiKey: string, private baseUrl?: string) {}

  async classifyLead(input: any): Promise<LeadClassificationResult> {
    const { lead, messages, model, temperature, locale } = input;
    const transcript = messages
      .map((m: any) => `${m.direction}: ${m.text || '[no text]'}`)
      .join('\n')
      .slice(0, 4000);

    const { content, usage } = await callChatCompletion({
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      model,
      temperature,
      systemPrompt:
        `You are a CRM assistant. Respond in ${locale || 'pt-BR'} and return JSON with temperature (HOT|WARM|COLD), intent (short), confidence (0-1), notes (short, no PII). Keep responses concise.`,
      userContent: `Lead: ${lead.fullName || 'Unknown'}\nTranscript:\n${transcript}`,
    });

    const parsed = classificationSchema.safeParse(JSON.parse(content || '{}'));
    if (!parsed.success) {
      throw new Error('Invalid AI response shape');
    }

    return {
      ...parsed.data,
      ...tokensAndCost(usage),
    };
  }

  async summarizeConversation(input: any): Promise<ConversationSummaryResult> {
    const { lead, messages, model, temperature, locale, style } = input;
    const transcript = messages
      .map((m: any) => `${m.direction}: ${m.text || '[no text]'}`)
      .join('\n')
      .slice(0, 4000);

    const { content, usage } = await callChatCompletion({
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      model,
      temperature,
      systemPrompt:
        `Summarize the conversation in ${locale || 'pt-BR'} with ${style || 'short'} style, under 120 words, and propose up to 3 next actions (array). Respond as JSON: {"summary":"...","nextActions":["..."]}`,
      userContent: `Lead: ${lead.fullName || 'Unknown'}\nTranscript:\n${transcript}`,
    });

    const parsed = summarySchema.safeParse(JSON.parse(content || '{}'));
    if (!parsed.success) {
      throw new Error('Invalid AI response shape');
    }

    return {
      ...parsed.data,
      ...tokensAndCost(usage),
      model,
    };
  }

  async draftReply(input: any): Promise<DraftReplyResult> {
    const { lead, messages, model, temperature, locale, goal, tone } = input;
    const transcript = messages
      .map((m: any) => `${m.direction}: ${m.text || '[no text]'}`)
      .join('\n')
      .slice(0, 4000);

    const { content, usage } = await callChatCompletion({
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      model,
      temperature,
      systemPrompt:
        `Suggest a concise, polite reply to the lead in ${locale || 'pt-BR'} for goal ${goal || 'generic'} with tone ${tone || 'neutral'}. Keep under 80 words. Respond as JSON: {"replyText":"...","quickReplies":["..."],"reasoningTags":["..."]}`,
      userContent: `Lead: ${lead.fullName || 'Unknown'}\nTranscript:\n${transcript}`,
    });

    const parsed = draftSchema
      .extend({
        quickReplies: z.array(z.string()).optional(),
        reasoningTags: z.array(z.string()).optional(),
      })
      .safeParse(JSON.parse(content || '{}'));
    if (!parsed.success) {
      throw new Error('Invalid AI response shape');
    }

    return {
      ...parsed.data,
      ...tokensAndCost(usage),
      model,
    };
  }
}
