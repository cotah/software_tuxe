type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ChatCompletionRequest = {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
};

export type ChatCompletionResult = {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
};

export interface AIChatProvider {
  generateChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResult>;
}

export class OpenAIChatProvider implements AIChatProvider {
  constructor(private apiKey: string, private baseUrl?: string) {}

  async generateChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResult> {
    const { messages, model, temperature = 0.2 } = request;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${this.baseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        messages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI error: ${response.status} ${text}`);
    }

    const json: any = await response.json();
    const content = json?.choices?.[0]?.message?.content;

    return {
      content: content || '',
      usage: {
        promptTokens: json?.usage?.prompt_tokens || 0,
        completionTokens: json?.usage?.completion_tokens || 0,
        totalTokens: json?.usage?.total_tokens || 0,
      },
    };
  }
}
