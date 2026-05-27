'use client'

import { useState, useEffect, useCallback } from 'react'
import { startOfMonth } from 'date-fns'
import { Plus, Mail, Search, Instagram, Linkedin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { DashboardHeader } from '@/components/dashboard/header'
import { DateFilter, CompareMode, getComparisonDates } from '@/components/dashboard/date-filter'
import { KPICard } from '@/components/dashboard/kpi-card'
import { ContentFormDialog } from '@/components/dashboard/content-form-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ContentMetric } from '@/lib/types'
import { Pencil, Trash2 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

const COLORS = {
  primary: '#3b5998',
  secondary: '#2d9cdb',
  success: '#27ae60',
  warning: '#f2994a',
}

export default function ConteudoPage() {
  const [selectedMonth, setSelectedMonth] = useState(startOfMonth(new Date()))
  const [compareMode, setCompareMode] = useState<CompareMode>('month')
  const [metrics, setMetrics] = useState<ContentMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMetric, setEditingMetric] = useState<ContentMetric | null>(null)
  const [activeChannel, setActiveChannel] = useState('email_marketing')

  const fetchMetrics = useCallback(async () => {
    const supabase = createClient()
    const { currentStart, currentEnd } = getComparisonDates(selectedMonth, compareMode)

    setIsLoading(true)

    const { data } = await supabase
      .from('content_metrics')
      .select('*')
      .gte('reference_date', currentStart.toISOString().split('T')[0])
      .lte('reference_date', currentEnd.toISOString().split('T')[0])

    setMetrics(data || [])
    setIsLoading(false)
  }, [selectedMonth, compareMode])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const handleSubmit = async (data: Partial<ContentMetric>) => {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    if (!userData.user) return

    if (data.id) {
      await supabase
        .from('content_metrics')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', data.id)
    } else {
      await supabase.from('content_metrics').insert({
        ...data,
        user_id: userData.user.id,
      })
    }

    fetchMetrics()
    setEditingMetric(null)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('content_metrics').delete().eq('id', id)
    fetchMetrics()
  }

  // Filter metrics by channel
  const emailMetrics = metrics.filter(m => m.channel === 'email_marketing')
  const seoMetrics = metrics.filter(m => m.channel === 'seo')
  const instagramMetrics = metrics.filter(m => m.channel === 'instagram')
  const linkedinMetrics = metrics.filter(m => m.channel === 'linkedin')

  // Calculate averages for email marketing
  const avgTaxaEntrega = emailMetrics.length > 0
    ? emailMetrics.reduce((acc, m) => acc + Number(m.taxa_entrega), 0) / emailMetrics.length
    : 0
  const avgTaxaAbertura = emailMetrics.length > 0
    ? emailMetrics.reduce((acc, m) => acc + Number(m.taxa_abertura), 0) / emailMetrics.length
    : 0
  const avgTaxaClique = emailMetrics.length > 0
    ? emailMetrics.reduce((acc, m) => acc + Number(m.taxa_clique), 0) / emailMetrics.length
    : 0

  // SEO totals
  const totalTrafegoOrganico = seoMetrics.reduce((acc, m) => acc + m.trafego_organico, 0)
  const totalSessoes = seoMetrics.reduce((acc, m) => acc + m.sessoes, 0)
  const totalPalavrasIndexadas = seoMetrics.reduce((acc, m) => acc + m.palavras_indexadas, 0)

  // Social totals
  const totalInstagramLeads = instagramMetrics.reduce((acc, m) => acc + m.conversao_lead, 0)
  const totalLinkedinLeads = linkedinMetrics.reduce((acc, m) => acc + m.conversao_lead, 0)

  // Mock chart data
  const emailChartData = [
    { month: 'Jan', entrega: 95, abertura: 22, clique: 3.5 },
    { month: 'Fev', entrega: 96, abertura: 24, clique: 3.8 },
    { month: 'Mar', entrega: 94, abertura: 23, clique: 4.0 },
    { month: 'Abr', entrega: 97, abertura: 25, clique: 4.2 },
  ]

  const seoChartData = [
    { month: 'Jan', trafego: 12000, sessoes: 15000, usuarios: 8000 },
    { month: 'Fev', trafego: 13500, sessoes: 16500, usuarios: 9000 },
    { month: 'Mar', trafego: 14200, sessoes: 17200, usuarios: 9500 },
    { month: 'Abr', trafego: 15000, sessoes: 18000, usuarios: 10000 },
  ]

  const renderChannelContent = () => {
    switch (activeChannel) {
      case 'email_marketing':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
              <KPICard
                title="Taxa de Entrega"
                value={avgTaxaEntrega}
                format="percent"
                icon={<Mail className="h-4 w-4" />}
              />
              <KPICard
                title="Taxa Hard Bounce"
                value={emailMetrics.length > 0 
                  ? emailMetrics.reduce((acc, m) => acc + Number(m.taxa_hard_bounce), 0) / emailMetrics.length 
                  : 0}
                format="percent"
              />
              <KPICard
                title="Taxa de Abertura"
                value={avgTaxaAbertura}
                format="percent"
              />
              <KPICard
                title="Taxa de Clique"
                value={avgTaxaClique}
                format="percent"
              />
              <KPICard
                title="Taxa de Conversao"
                value={emailMetrics.length > 0 
                  ? emailMetrics.reduce((acc, m) => acc + Number(m.taxa_conversao), 0) / emailMetrics.length 
                  : 0}
                format="percent"
              />
            </div>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base font-medium">Evolucao Email Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={emailChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="entrega" name="Entrega %" stroke={COLORS.primary} strokeWidth={2} />
                    <Line type="monotone" dataKey="abertura" name="Abertura %" stroke={COLORS.secondary} strokeWidth={2} />
                    <Line type="monotone" dataKey="clique" name="Clique %" stroke={COLORS.success} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )
      case 'seo':
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
              <KPICard
                title="Trafego Organico"
                value={totalTrafegoOrganico}
                format="number"
                icon={<Search className="h-4 w-4" />}
              />
              <KPICard
                title="Sessoes"
                value={totalSessoes}
                format="number"
              />
              <KPICard
                title="Usuarios"
                value={seoMetrics.reduce((acc, m) => acc + m.usuarios, 0)}
                format="number"
              />
              <KPICard
                title="Palavras Indexadas"
                value={totalPalavrasIndexadas}
                format="number"
              />
              <KPICard
                title="Desempenho Site"
                value={seoMetrics.length > 0 
                  ? seoMetrics.reduce((acc, m) => acc + Number(m.desempenho_site), 0) / seoMetrics.length 
                  : 0}
                format="percent"
              />
            </div>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base font-medium">Evolucao SEO</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={seoChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="trafego" name="Trafego" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sessoes" name="Sessoes" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="usuarios" name="Usuarios" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )
      case 'instagram':
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <KPICard
              title="Trafego/Sessoes"
              value={instagramMetrics.reduce((acc, m) => acc + m.trafego_organico, 0)}
              format="number"
              icon={<Instagram className="h-4 w-4" />}
            />
            <KPICard
              title="Conversao de Lead"
              value={totalInstagramLeads}
              format="number"
            />
            <KPICard
              title="Taxa de Conversao"
              value={instagramMetrics.length > 0 
                ? instagramMetrics.reduce((acc, m) => acc + Number(m.taxa_conversao), 0) / instagramMetrics.length 
                : 0}
              format="percent"
            />
          </div>
        )
      case 'linkedin':
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <KPICard
              title="Trafego/Sessoes"
              value={linkedinMetrics.reduce((acc, m) => acc + m.trafego_organico, 0)}
              format="number"
              icon={<Linkedin className="h-4 w-4" />}
            />
            <KPICard
              title="Conversao de Lead"
              value={totalLinkedinLeads}
              format="number"
            />
            <KPICard
              title="Taxa de Conversao"
              value={linkedinMetrics.length > 0 
                ? linkedinMetrics.reduce((acc, m) => acc + Number(m.taxa_conversao), 0) / linkedinMetrics.length 
                : 0}
              format="percent"
            />
          </div>
        )
      default:
        return null
    }
  }

  const getChannelMetrics = () => {
    switch (activeChannel) {
      case 'email_marketing': return emailMetrics
      case 'seo': return seoMetrics
      case 'instagram': return instagramMetrics
      case 'linkedin': return linkedinMetrics
      default: return []
    }
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader
        title="KPIs de Conteudo"
        subtitle="Metricas de E-mail Marketing, SEO e Redes Sociais"
      />

      <div className="p-8">
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

        <Tabs value={activeChannel} onValueChange={setActiveChannel} className="mb-8">
          <TabsList>
            <TabsTrigger value="email_marketing">E-mail Marketing</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          </TabsList>

          <TabsContent value={activeChannel} className="mt-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando dados...
              </div>
            ) : (
              <>
                {renderChannelContent()}

                {/* Data Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Dados do Periodo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          {activeChannel === 'email_marketing' && (
                            <>
                              <TableHead className="text-right">Entrega %</TableHead>
                              <TableHead className="text-right">Abertura %</TableHead>
                              <TableHead className="text-right">Clique %</TableHead>
                              <TableHead className="text-right">Conversao %</TableHead>
                            </>
                          )}
                          {activeChannel === 'seo' && (
                            <>
                              <TableHead className="text-right">Trafego</TableHead>
                              <TableHead className="text-right">Sessoes</TableHead>
                              <TableHead className="text-right">Usuarios</TableHead>
                              <TableHead className="text-right">Palavras</TableHead>
                            </>
                          )}
                          {(activeChannel === 'instagram' || activeChannel === 'linkedin') && (
                            <>
                              <TableHead className="text-right">Trafego</TableHead>
                              <TableHead className="text-right">Leads</TableHead>
                              <TableHead className="text-right">Conversao %</TableHead>
                            </>
                          )}
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getChannelMetrics().map((metric) => (
                          <TableRow key={metric.id}>
                            <TableCell>{metric.reference_date}</TableCell>
                            {activeChannel === 'email_marketing' && (
                              <>
                                <TableCell className="text-right">{Number(metric.taxa_entrega).toFixed(2)}%</TableCell>
                                <TableCell className="text-right">{Number(metric.taxa_abertura).toFixed(2)}%</TableCell>
                                <TableCell className="text-right">{Number(metric.taxa_clique).toFixed(2)}%</TableCell>
                                <TableCell className="text-right">{Number(metric.taxa_conversao).toFixed(2)}%</TableCell>
                              </>
                            )}
                            {activeChannel === 'seo' && (
                              <>
                                <TableCell className="text-right">{metric.trafego_organico}</TableCell>
                                <TableCell className="text-right">{metric.sessoes}</TableCell>
                                <TableCell className="text-right">{metric.usuarios}</TableCell>
                                <TableCell className="text-right">{metric.palavras_indexadas}</TableCell>
                              </>
                            )}
                            {(activeChannel === 'instagram' || activeChannel === 'linkedin') && (
                              <>
                                <TableCell className="text-right">{metric.trafego_organico}</TableCell>
                                <TableCell className="text-right">{metric.conversao_lead}</TableCell>
                                <TableCell className="text-right">{Number(metric.taxa_conversao).toFixed(2)}%</TableCell>
                              </>
                            )}
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => { setEditingMetric(metric); setDialogOpen(true) }}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(metric.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {getChannelMetrics().length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              Nenhum dado encontrado para este periodo.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ContentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        metric={editingMetric}
        onSubmit={handleSubmit}
        defaultChannel={activeChannel}
      />
    </div>
  )
}
