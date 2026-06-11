'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChartNoAxesCombined, Pencil, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateTrend, sum } from '@/lib/dashboard-metrics'
import { CompareMode, getComparisonDates } from '@/components/dashboard/date-filter'
import { ComparisonChart } from '@/components/dashboard/comparison-chart'
import { KPICard } from '@/components/dashboard/kpi-card'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DashboardCustomMetric, DashboardMetricTab } from '@/lib/types'

interface CustomMetricsSectionProps {
  tabKey: DashboardMetricTab
  sectionKey?: string | null
  selectedMonth: Date
  compareMode: CompareMode
  title?: string
  description?: string
}

interface CustomMetricFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  metric: DashboardCustomMetric | null
  onSubmit: (data: Partial<DashboardCustomMetric>) => Promise<void>
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function CustomMetricFormDialog({
  open,
  onOpenChange,
  metric,
  onSubmit,
}: CustomMetricFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    reference_date: '',
    metric_name: '',
    metric_value: '',
  })

  useEffect(() => {
    if (metric) {
      setFormData({
        reference_date: metric.reference_date,
        metric_name: metric.metric_name,
        metric_value: String(metric.metric_value),
      })
      return
    }

    setFormData({
      reference_date: new Date().toISOString().split('T')[0],
      metric_name: '',
      metric_value: '',
    })
  }, [metric, open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        ...(metric && { id: metric.id }),
        reference_date: formData.reference_date,
        metric_name: formData.metric_name.trim(),
        metric_value: parseFloat(formData.metric_value) || 0,
      })
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{metric ? 'Editar Metrica Customizada' : 'Adicionar Metrica Customizada'}</DialogTitle>
          <DialogDescription>
            Defina o indicador que deseja acompanhar nesta aba e registre o valor por data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom_metric_reference_date">Data de Referencia</Label>
              <Input
                id="custom_metric_reference_date"
                type="date"
                value={formData.reference_date}
                onChange={(event) => setFormData({ ...formData, reference_date: event.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom_metric_name">Nome da metrica</Label>
              <Input
                id="custom_metric_name"
                value={formData.metric_name}
                onChange={(event) => setFormData({ ...formData, metric_name: event.target.value })}
                placeholder="Ex.: Conversoes LP"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom_metric_value">Valor da metrica</Label>
              <Input
                id="custom_metric_value"
                type="number"
                step="0.01"
                value={formData.metric_value}
                onChange={(event) => setFormData({ ...formData, metric_value: event.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CustomMetricsSection({
  tabKey,
  sectionKey = null,
  selectedMonth,
  compareMode,
  title = 'Metricas customizadas',
  description = 'Adicione indicadores especificos para acompanhar nesta aba.',
}: CustomMetricsSectionProps) {
  const [metrics, setMetrics] = useState<DashboardCustomMetric[]>([])
  const [compareMetrics, setCompareMetrics] = useState<DashboardCustomMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMetric, setEditingMetric] = useState<DashboardCustomMetric | null>(null)

  const fetchMetrics = useCallback(async () => {
    const supabase = createClient()
    const { currentStart, currentEnd, compareStart, compareEnd } = getComparisonDates(
      selectedMonth,
      compareMode
    )

    setIsLoading(true)
    setErrorMessage(null)

    let currentQuery = supabase
      .from('dashboard_custom_metrics')
      .select('*')
      .eq('tab_key', tabKey)
      .gte('reference_date', currentStart.toISOString().split('T')[0])
      .lte('reference_date', currentEnd.toISOString().split('T')[0])

    let compareQuery = supabase
      .from('dashboard_custom_metrics')
      .select('*')
      .eq('tab_key', tabKey)
      .gte('reference_date', compareStart.toISOString().split('T')[0])
      .lte('reference_date', compareEnd.toISOString().split('T')[0])

    if (sectionKey) {
      currentQuery = currentQuery.eq('section_key', sectionKey)
      compareQuery = compareQuery.eq('section_key', sectionKey)
    } else {
      currentQuery = currentQuery.is('section_key', null)
      compareQuery = compareQuery.is('section_key', null)
    }

    const { data: currentData, error: currentError } = await currentQuery.order('reference_date', {
      ascending: false,
    })
    const { data: previousData, error: previousError } = await compareQuery.order('reference_date', {
      ascending: false,
    })

    if (currentError || previousError) {
      setErrorMessage(
        currentError?.message ||
          previousError?.message ||
          'Erro ao carregar metricas customizadas.'
      )
      setMetrics([])
      setCompareMetrics([])
      setIsLoading(false)
      return
    }

    setMetrics(currentData || [])
    setCompareMetrics(previousData || [])
    setIsLoading(false)
  }, [compareMode, selectedMonth, sectionKey, tabKey])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const handleSubmit = async (data: Partial<DashboardCustomMetric>) => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    if (data.id) {
      const { error } = await supabase
        .from('dashboard_custom_metrics')
        .update({
          reference_date: data.reference_date,
          metric_name: data.metric_name,
          metric_value: data.metric_value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)

      if (error) {
        setErrorMessage(error.message)
        return
      }
    } else {
      const { error } = await supabase.from('dashboard_custom_metrics').insert({
        tab_key: tabKey,
        section_key: sectionKey,
        reference_date: data.reference_date,
        metric_name: data.metric_name,
        metric_value: data.metric_value,
        user_id: userData.user.id,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }
    }

    setErrorMessage(null)
    setEditingMetric(null)
    fetchMetrics()
  }

  const handleDelete = async (metricId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('dashboard_custom_metrics')
      .delete()
      .eq('id', metricId)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setErrorMessage(null)
    fetchMetrics()
  }

  const metricNames = useMemo(() => {
    return Array.from(
      new Set([
        ...metrics.map((metric) => metric.metric_name),
        ...compareMetrics.map((metric) => metric.metric_name),
      ])
    ).sort((firstMetric, secondMetric) => firstMetric.localeCompare(secondMetric))
  }, [compareMetrics, metrics])

  const chartData = metricNames.map((metricName) => {
    const current = sum(
      metrics
        .filter((metric) => metric.metric_name === metricName)
        .map((metric) => Number(metric.metric_value))
    )
    const previous = sum(
      compareMetrics
        .filter((metric) => metric.metric_name === metricName)
        .map((metric) => Number(metric.metric_value))
    )

    return {
      label: metricName,
      atual: current,
      comparativo: previous,
    }
  })

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button onClick={() => { setEditingMetric(null); setDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Metrica
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage && (
            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando metricas customizadas...
            </div>
          ) : (
            <>
              {metricNames.length > 0 ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {chartData.map((metric) => (
                      <KPICard
                        key={metric.label}
                        title={metric.label}
                        value={metric.atual}
                        previousValue={metric.comparativo}
                        trend={calculateTrend(metric.atual, metric.comparativo)}
                        format="number"
                        icon={<ChartNoAxesCombined className="h-4 w-4" />}
                      />
                    ))}
                  </div>

                  <ComparisonChart title="Comparativo de metricas customizadas" data={chartData} />
                </>
              ) : (
                <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                  Nenhuma metrica customizada cadastrada para esta aba.
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Metrica</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell>{metric.reference_date}</TableCell>
                      <TableCell>{metric.metric_name}</TableCell>
                      <TableCell className="text-right">
                        {formatNumber(Number(metric.metric_value))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => { setEditingMetric(metric); setDialogOpen(true) }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(metric.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {metrics.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nenhum registro encontrado para o periodo.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <CustomMetricFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        metric={editingMetric}
        onSubmit={handleSubmit}
      />
    </>
  )
}
