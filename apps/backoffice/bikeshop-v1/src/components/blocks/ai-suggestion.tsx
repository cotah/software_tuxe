'use client'

import { Sparkles, ArrowRight, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AiSuggestionCardProps {
  title?: string
  children: React.ReactNode
  onDismiss?: () => void
  className?: string
}

export function AiSuggestionCard({
  title = 'Sugestão',
  children,
  onDismiss,
  className,
}: AiSuggestionCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl border border-ai-100 bg-ai-50 p-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-ai-100">
          <Sparkles className="h-3 w-3 text-ai-500" />
        </span>
        <span className="text-sm font-medium text-ai-500">{title}</span>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-ai-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="text-sm text-text-primary">{children}</div>
    </div>
  )
}

// Inline AI suggestion for message replies
interface AiReplySuggestionProps {
  suggestion: string
  onUse: () => void
  onDismiss?: () => void
}

export function AiReplySuggestion({
  suggestion,
  onUse,
  onDismiss,
}: AiReplySuggestionProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-ai-50 border border-ai-100">
      <Sparkles className="h-4 w-4 text-ai-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">{suggestion}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onUse}
            className="h-7 text-xs bg-white"
          >
            Usar sugestão
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-text-tertiary hover:text-text-secondary"
            >
              Ignorar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// AI Summary card for customer profiles
interface AiSummaryCardProps {
  summary: string
  onExpand?: () => void
}

export function AiSummaryCard({ summary, onExpand }: AiSummaryCardProps) {
  return (
    <div className="rounded-xl border border-ai-100 bg-ai-50 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-ai-100">
          <Sparkles className="h-3 w-3 text-ai-500" />
        </span>
        <span className="text-sm font-medium text-ai-500">Resumo</span>
      </div>
      
      <p className="text-sm text-text-primary leading-relaxed">{summary}</p>
      
      {onExpand && (
        <button
          onClick={onExpand}
          className="flex items-center gap-1 mt-3 text-xs font-medium text-ai-500 hover:text-ai-500/80 transition-colors"
        >
          Ver histórico completo
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

// AI Insight item for reports
interface AiInsightProps {
  insight: string
}

export function AiInsight({ insight }: AiInsightProps) {
  return (
    <div className="flex items-start gap-2 py-2">
      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-ai-500 flex-shrink-0" />
      <p className="text-sm text-text-primary">{insight}</p>
    </div>
  )
}
