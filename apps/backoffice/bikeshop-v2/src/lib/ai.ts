import { apiFetch } from '@/lib/http'
import type { AiChatRequest } from '@/types'

type AiChatApiResponse =
  | { reply: string }
  | { message?: { content?: string } }
  | { content?: string }

export async function sendAiMessage(payload: AiChatRequest): Promise<{ reply: string }> {
  try {
    const response = await apiFetch<AiChatApiResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if ('reply' in response && response.reply) {
      return { reply: response.reply }
    }

    if ('message' in response && response.message?.content) {
      return { reply: response.message.content }
    }

    if ('content' in response && response.content) {
      return { reply: response.content }
    }

    throw new Error('AI response invalid')
  } catch (error) {
    const status = (error as { status?: number })?.status
    if (status === 404 || status === 501) {
      throw new Error('AI not configured')
    }
    throw error
  }
}
