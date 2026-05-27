'use client'

import { useState, useEffect, useCallback } from 'react'
import { startOfMonth } from 'date-fns'
import { Plus, DollarSign, Users, Calendar, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/header'
import { DateFilter, CompareMode, getComparisonDates } from '@/components/dashboard/date-filter'
import { KPICard } from '@/components/dashboard/kpi-card'
import { MarketingTable } from '@/components/dashboard/marketing-table'
import { MetricFormDialog } from '@/components/dashboard/metric-form-dialog'
import { FunnelChart, TrendChart, CostMetricsChart, SourceDistributionChart } from '@/components/dashboard/charts'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarketingMetric } from '@/lib/types'
import Link from 'next/link'

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()))
  const [compareMode, setCompareMode] = useState<CompareMode>('month')
  const [metrics, setMetrics] = useState<MarketingMetric[]>([])
  const [compareMetrics, setCompareMetrics] = useState<MarketingMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMetric, setEditingMetric] = useState<MarketingMetric | null>(null)

  const fetchMetrics = useCallback(async () => {
    const supabase = createClient()
    const { currentStart, currentEnd, compareStart, compareEnd } = getComparisonDates(
      selectedMonth,
      compareMode
    )

    setIsLoading(true)

    // Fetch current period metrics
    const { data: currentData } = await supabase
      .from('marketing_metrics')
      .select('*')
      .gte('reference_date', currentStart.toISOString().split('T')[0])
      .lte('reference_date', currentEnd.toISOString().split('T')[0])

    // Fetch comparison period metrics
    const { data: compareData } = await supabase
      .from('marketing_metrics')
      .select('*')
      .gte('reference_date', compareStart.toISOString().split('T')[0])
      .lte('reference_date', compareEnd.toISOString().split('T')[0])

    setMetrics(currentData || [])
    setCompareMetrics(compareData || [])
    setIsLoading(false)
  }, [selectedMonth, compareMode])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const handleSubmit = async (data: Partial<MarketingMetric>) => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) return

    if (data.id) {
      // Update existing metric
      await supabase
        .from('marketing_metrics')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
    } else {
      // Create new metric
      await supabase.from('marketing_metrics').insert({
        ...data,
        user_id: userData.user.id,
      })
    }

    fetchMetrics()
    setEditingMetric(null)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('marketing_metrics').delete().eq('id', id)
    fetchMetrics()
  }

  const handleEdit = (metric: MarketingMetric) => {
    setEditingMetric(metric)
    setDialogOpen(true)
  }

  // Calculate KPIs
  const totalInvestimento = metrics.reduce((acc, m) => acc + Number(m.investimento), 0)
  const totalMqls = metrics.reduce((acc, m) => acc + m.mqls, 0)
  const totalDemoAgendadas = metrics.reduce((acc, m) => acc + m.demo_agendadas, 0)
  const totalDemoRealizadas = metrics.reduce((acc, m) => acc + m.demo_realizadas, 0)
  const totalOnboarding = metrics.reduce((acc, m) => acc + m.onboarding, 0)
  const avgCicloVenda = metrics.length > 0 
    ? metrics.reduce((acc, m) => acc + m.ciclo_venda, 0) / metrics.length 
    : 0

  // Compare period KPIs
  const prevInvestimento = compareMetrics.reduce((acc, m) => acc + Number(m.investimento), 0)
  const prevMqls = compareMetrics.reduce((acc, m) => acc + m.mqls, 0)
  const prevOnboarding = compareMetrics.reduce((acc, m) => acc + m.onboarding, 0)

  // Calculate trends
  const investimentoTrend = prevInvestimento === 0 ? 'neutral' : totalInvestimento > prevInvestimento ? 'up' : 'down'
  const mqlsTrend = prevMqls === 0 ? 'neutral' : totalMqls > prevMqls ? 'up' : 'down'
  const onboardingTrend = prevOnboarding === 0 ? 'neutral' : totalOnboarding > prevOnboarding ? 'up' : 'down'

  // Chart data
  const funnelData = {
    mqls: totalMqls,
    demoAgendadas: totalDemoAgendadas,
    demoRealizadas: totalDemoRealizadas,
    onboarding: totalOnboarding,
  }

  const sourceDistribution = ['Inbound', 'Busca Paga', 'Busca Organica', 'Email Marketing', 'Redes Sociais', 'Trafego Direto']
    .map(source => ({
      source,
      value: metrics.filter(m => m.source === source).reduce((acc, m) => acc + m.mqls, 0),
    }))
    .filter(d => d.value > 0)

  // Mock trend data - in real app, fetch last 6 months
  const trendData = [
    { month: 'Jan', mqls: 320, demoAgendadas: 45, demoRealizadas: 15, onboarding: 58 },
    { month: 'Fev', mqls: 350, demoAgendadas: 48, demoRealizadas: 16, onboarding: 62 },
    { month: 'Mar', mqls: 380, demoAgendadas: 52, demoRealizadas: 17, onboarding: 68 },
    { month: 'Abr', mqls: 403, demoAgendadas: 56, demoRealizadas: 18, onboarding: 72 },
  ]

  const costData = [
    { month: 'Jan', cpl: 180, cpo: 4000, cpa: 1000 },
    { month: 'Fev', cpl: 175, cpo: 3900, cpa: 980 },
    { month: 'Mar', cpl: 170, cpo: 3850, cpa: 960 },
    { month: 'Abr', cpl: 173.70, cpo: 3888.89, cpa: 972.22 },
  ]

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="Visao Geral"
        subtitle="Metricas gerais de marketing da Avalyst"
      />

      <div className="p-8">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between mb-6">
          <DateFilter
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            compareMode={compareMode}
            onCompareModeChange={setCompareMode}
          />
          <Button onClick={() => { setEditingMetric(null); setDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Dados
          </Button>
        </div>

        {/* Quick Navigation Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Visao Geral</TabsTrigger>
            <TabsTrigger value="content" asChild>
              <Link href="/dashboard/conteudo">Conteudo</Link>
            </TabsTrigger>
            <TabsTrigger value="crm" asChild>
              <Link href="/dashboard/crm">CRM</Link>
            </TabsTrigger>
            <TabsTrigger value="ads" asChild>
              <Link href="/dashboard/ads">ADS</Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <KPICard
                title="Investimento Total"
                value={totalInvestimento}
                previousValue={prevInvestimento}
                format="currency"
                trend={investimentoTrend}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <KPICard
                title="MQLs"
                value={totalMqls}
                previousValue={prevMqls}
                format="number"
                trend={mqlsTrend}
                icon={<Users className="h-4 w-4" />}
              />
              <KPICard
                title="Onboarding"
                value={totalOnboarding}
                previousValue={prevOnboarding}
                format="number"
                trend={onboardingTrend}
                icon={<TrendingUp className="h-4 w-4" />}
              />
              <KPICard
                title="Ciclo de Venda (dias)"
                value={Math.round(avgCicloVenda)}
                format="number"
                icon={<Calendar className="h-4 w-4" />}
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <FunnelChart data={funnelData} />
              <SourceDistributionChart data={sourceDistribution} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <TrendChart data={trendData} />
              <CostMetricsChart data={costData} />
            </div>

            {/* Marketing Table */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Detalhamento por Fonte</h2>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando dados...
                </div>
              ) : (
                <MarketingTable
                  data={metrics}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <MetricFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        metric={editingMetric}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
