'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/http'

const HEALTH_ENDPOINTS = ['/api/health', '/health', '/api/status', '/status']

type HealthResult = {
  endpoint: string
  data: unknown
}

async function fetchHealth(): Promise<HealthResult> {
  let lastError: unknown

  for (const endpoint of HEALTH_ENDPOINTS) {
    try {
      const data = await api<unknown>(endpoint)
      return { endpoint, data }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error('Health check failed')
}

export default function TestPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['backend-health'],
    queryFn: fetchHealth,
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Backend integration test</h1>
          <p className="text-muted-foreground">Check if the backend is reachable from the browser.</p>
        </div>

        {isLoading && <p>Loading health check...</p>}

        {error && (
          <pre className="bg-red-50 text-red-900 p-4 rounded border border-red-200 text-sm overflow-auto">
            {String(error)}
          </pre>
        )}

        {data && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Endpoint: {data.endpoint}</p>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(data.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  )
}
