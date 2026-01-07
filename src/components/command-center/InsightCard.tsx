'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Insight } from '@/types'

interface InsightCardProps {
  insights: Insight[]
}

export function InsightCard({ insights }: InsightCardProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const visibleInsights = insights
    .filter((insight) => !dismissedIds.has(insight.id))
    .slice(0, 2)

  const handleDismiss = (insightId: string) => {
    setDismissedIds((prev) => {
      const newSet = new Set(prev)
      newSet.add(insightId)
      return newSet
    })
  }

  if (visibleInsights.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Insights
      </h2>

      <div className="space-y-3">
        {visibleInsights.map((insight) => (
          <Card
            key={insight.id}
            className="bg-violet-50/50 border-violet-100"
          >
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-violet-100 h-fit">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-sm text-foreground leading-relaxed">
                    {insight.message}
                  </p>

                  <div className="flex gap-2">
                    {insight.actions.map((action) => (
                      <Button
                        key={action.label}
                        variant={action.action === 'ignore' ? 'ghost' : 'outline'}
                        size="sm"
                        onClick={() => handleDismiss(insight.id)}
                        className={
                          action.action === 'mark_to_buy'
                            ? 'border-violet-200 text-violet-700 hover:bg-violet-100'
                            : 'text-muted-foreground'
                        }
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
