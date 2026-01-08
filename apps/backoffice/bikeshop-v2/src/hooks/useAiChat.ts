'use client'

import { useMutation } from '@tanstack/react-query'
import type { AiChatRequest } from '@/types'
import { sendAiMessage } from '@/lib/ai'

export function useAiChat() {
  return useMutation({
    mutationKey: ['ai', 'chat'],
    mutationFn: (payload: AiChatRequest) => sendAiMessage(payload),
  })
}
