'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { startOfMonth } from 'date-fns'
import { Activity, BarChart3, Clock, Eye, MousePointerClick } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/header'
import { DateFilter, CompareMode, getComparisonDates } from '@/components/dashboard/date-filter'
import { KPICard } from '@/components/dashboard/kpi-card'
import { ComparisonChart } from '@/components/dashboard/comparison-chart'
import { CustomMetricsSection } from '@/components/dashboard/custom-metrics-section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { calculateTrend } from '@/lib/dashboard-metrics'

interface GoogleAnalyticsTotals {
  activeUsers: number
  sessions: number
  screenPageViews: number
  eventCount: number
  userEngagementDuration: number
}

interface GoogleAnalyticsRow extends GoogleAnalyticsTotals {
  date: string
}

interface GoogleAnalyticsReport {
  totals: GoogleAnalyticsTotals
  rows: GoogleAnalyticsRow[]
}

interface GoogleAnalyticsResponse {
  current: GoogleAnalyticsReport
  compare: GoogleAnalyticsReport
  error?: string
}

function formatDateForApi(date: Date) {
  return date.toISOString().split('T')[0]
}

function formatAnalyticsDate(date: string) {
  if (date.length !== 8) return date

  return `${date.slice(6, 8)}/${date.slice(4, 6)}/${date.slice(0, 4)}`
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function secondsToMinutes(seconds: number) {
  return Math.round(seconds / 60)
}

const emptyTotals: GoogleAnalyticsTotals = {
  activeUsers: 0,
  sessions: 0,
  screenPageViews: 0,
  eventCount: 0,
  userEngagementDuration: 0,
}

export default function GoogleAnalyticsPage() {
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()))
  const [compareMode, setCompareMode] = useState<CompareMode>('month')
  const [currentReport, setCurrentReport] = useState<GoogleAnalyticsReport>({
    totals: emptyTotals,
    rows: [],
  })
  const [compareReport, setCompareReport] = useState<GoogleAnalyticsReport>({
    totals: emptyTotals,
    rows: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const comparisonDates = useMemo(
    () => getComparisonDates(selectedMonth, compareMode),
    [compareMode, selectedMonth]
  )

  const fetchReport = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/google-analytics/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentStart: formatDateForApi(comparisonDates.currentStart),
          currentEnd: formatDateForApi(comparisonDates.currentEnd),
          compareStart: formatDateForApi(comparisonDates.compareStart),
          compareEnd: formatDateForApi(comparisonDates.compareEnd),
        }),
      })

      const data = (await response.json()) as GoogleAnalyticsResponse

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar dados do Google Analytics.')
      }

      setCurrentReport(data.current)
      setCompareReport(data.compare)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Erro ao carregar dados do Google Analytics.'
      )
      setCurrentReport({ totals: emptyTotals, rows: [] })
      setCompareReport({ totals: emptyTotals, rows: [] })
    } finally {
      setIsLoading(false)
    }
  }, [comparisonDates])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const currentTotals = currentReport.totals
  const compareTotals = compareReport.totals
  const currentEngagementMinutes = secondsToMinutes(currentTotals.userEngagementDuration)
  const compareEngagementMinutes = secondsToMinutes(compareTotals.userEngagementDuration)

  const comparisonChartData = [
    {
      label: 'Usuarios',
      atual: currentTotals.activeUsers,
      comparativo: compareTotals.activeUsers,
    },
    {
      label: 'Sessoes',
      atual: currentTotals.sessions,
      comparativo: compareTotals.sessions,
    },
    {
      label: 'Visualizacoes',
      atual: currentTotals.screenPageViews,
      comparativo: compareTotals.screenPageViews,
    },
    {
      label: 'Eventos',
      atual: currentTotals.eventCount,
      comparativo: compareTotals.eventCount,
    },
    {
      label: 'Engajamento (min)',
      atual: currentEngagementMinutes,
      comparativo: compareEngagementMinutes,
    },
  ]

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Google Analytics"
        subtitle="Dados de audiencia, sessoes, visualizacoes e eventos vindos da Google Analytics Data API"
      />

      <div className="p-8 space-y-8">
        <DateFilter
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          compareMode={compareMode}
          onCompareModeChange={setCompareMode}
        />

        {errorMessage && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando dados do Google Analytics...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <KPICard
                title="Usuarios ativos"
                value={currentTotals.activeUsers}
                previousValue={compareTotals.activeUsers}
                trend={calculateTrend(currentTotals.activeUsers, compareTotals.activeUsers)}
                format="number"
                icon={<Activity className="h-4 w-4" />}
              />
              <KPICard
                title="Sessoes"
                value={currentTotals.sessions}
                previousValue={compareTotals.sessions}
                trend={calculateTrend(currentTotals.sessions, compareTotals.sessions)}
                format="number"
                icon={<MousePointerClick className="h-4 w-4" />}
              />
              <KPICard
                title="Visualizacoes"
                value={currentTotals.screenPageViews}
                previousValue={compareTotals.screenPageViews}
                trend={calculateTrend(currentTotals.screenPageViews, compareTotals.screenPageViews)}
                format="number"
                icon={<Eye className="h-4 w-4" />}
              />
              <KPICard
                title="Eventos"
                value={currentTotals.eventCount}
                previousValue={compareTotals.eventCount}
                trend={calculateTrend(currentTotals.eventCount, compareTotals.eventCount)}
                format="number"
                icon={<BarChart3 className="h-4 w-4" />}
              />
              <KPICard
                title="Engajamento (min)"
                value={currentEngagementMinutes}
                previousValue={compareEngagementMinutes}
                trend={calculateTrend(currentEngagementMinutes, compareEngagementMinutes)}
                format="number"
                icon={<Clock className="h-4 w-4" />}
              />
            </div>

            <ComparisonChart title="Comparativo Google Analytics" data={comparisonChartData} />

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Dados diarios do periodo</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Usuarios</TableHead>
                      <TableHead className="text-right">Sessoes</TableHead>
                      <TableHead className="text-right">Visualizacoes</TableHead>
                      <TableHead className="text-right">Eventos</TableHead>
                      <TableHead className="text-right">Engajamento (min)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentReport.rows.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell>{formatAnalyticsDate(row.date)}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.activeUsers)}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.sessions)}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.screenPageViews)}</TableCell>
                        <TableCell className="text-right">{formatNumber(row.eventCount)}</TableCell>
                        <TableCell className="text-right">
                          {formatNumber(secondsToMinutes(row.userEngagementDuration))}
                        </TableCell>
                      </TableRow>
                    ))}
                    {currentReport.rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhum dado encontrado para o periodo.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        <CustomMetricsSection
          tabKey="google_analytics"
          selectedMonth={selectedMonth}
          compareMode={compareMode}
          title="Metricas customizadas do Google Analytics"
          description="Adicione indicadores extras para acompanhar junto dos dados importados do Google Analytics."
        />
      </div>
    </div>
  )
}
