'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { MarketingMetric } from '@/lib/types'

interface MarketingTableProps {
  data: MarketingMetric[]
  onEdit: (metric: MarketingMetric) => void
  onDelete: (id: string) => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

export function MarketingTable({ data, onEdit, onDelete }: MarketingTableProps) {
  // Group data by source and calculate totals
  const sources = ['Inbound', 'Busca Paga', 'Busca Organica', 'Email Marketing', 'Redes Sociais', 'Trafego Direto']
  
  const groupedData = sources.map(source => {
    const sourceData = data.filter(d => d.source === source)
    if (sourceData.length === 0) {
      return {
        source,
        metric: null,
        investimento: 0,
        mqls: 0,
        mqls_percent: 0,
        demo_agendadas: 0,
        demo_agendadas_percent: 0,
        demo_realizadas: 0,
        demo_realizadas_percent: 0,
        onboarding: 0,
        cpl: 0,
        cpo: 0,
        cpa: 0,
        ciclo_venda: 0,
      }
    }
    // Aggregate data for the source
    const totals = sourceData.reduce((acc, curr) => ({
      investimento: acc.investimento + Number(curr.investimento),
      mqls: acc.mqls + curr.mqls,
      demo_agendadas: acc.demo_agendadas + curr.demo_agendadas,
      demo_realizadas: acc.demo_realizadas + curr.demo_realizadas,
      onboarding: acc.onboarding + curr.onboarding,
    }), { investimento: 0, mqls: 0, demo_agendadas: 0, demo_realizadas: 0, onboarding: 0 })

    const mqls_percent = totals.mqls > 0 ? (totals.demo_agendadas / totals.mqls) * 100 : 0
    const demo_agendadas_percent = totals.demo_agendadas > 0 ? (totals.demo_realizadas / totals.demo_agendadas) * 100 : 0
    const demo_realizadas_percent = totals.demo_realizadas > 0 ? (totals.onboarding / totals.demo_realizadas) * 100 : 0
    const cpl = totals.mqls > 0 ? totals.investimento / totals.mqls : 0
    const cpo = totals.demo_realizadas > 0 ? totals.investimento / totals.demo_realizadas : 0
    const cpa = totals.onboarding > 0 ? totals.investimento / totals.onboarding : 0

    return {
      source,
      metric: sourceData[0],
      ...totals,
      mqls_percent,
      demo_agendadas_percent,
      demo_realizadas_percent,
      cpl,
      cpo,
      cpa,
      ciclo_venda: sourceData[0]?.ciclo_venda || 0,
    }
  })

  // Calculate grand totals
  const totals = groupedData.reduce((acc, curr) => ({
    investimento: acc.investimento + curr.investimento,
    mqls: acc.mqls + curr.mqls,
    demo_agendadas: acc.demo_agendadas + curr.demo_agendadas,
    demo_realizadas: acc.demo_realizadas + curr.demo_realizadas,
    onboarding: acc.onboarding + curr.onboarding,
  }), { investimento: 0, mqls: 0, demo_agendadas: 0, demo_realizadas: 0, onboarding: 0 })

  const totalMqlsPercent = totals.mqls > 0 ? (totals.demo_agendadas / totals.mqls) * 100 : 0
  const totalDemoAgendadasPercent = totals.demo_agendadas > 0 ? (totals.demo_realizadas / totals.demo_agendadas) * 100 : 0
  const totalDemoRealizadasPercent = totals.demo_realizadas > 0 ? (totals.onboarding / totals.demo_realizadas) * 100 : 0
  const totalCpl = totals.mqls > 0 ? totals.investimento / totals.mqls : 0
  const totalCpo = totals.demo_realizadas > 0 ? totals.investimento / totals.demo_realizadas : 0
  const totalCpa = totals.onboarding > 0 ? totals.investimento / totals.onboarding : 0

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Fonte</TableHead>
            <TableHead className="text-right font-semibold">Investimento</TableHead>
            <TableHead className="text-right font-semibold">MQLs</TableHead>
            <TableHead className="text-right font-semibold">%</TableHead>
            <TableHead className="text-right font-semibold">DEMO Agendadas</TableHead>
            <TableHead className="text-right font-semibold">%</TableHead>
            <TableHead className="text-right font-semibold">DEMO Realizadas</TableHead>
            <TableHead className="text-right font-semibold">%</TableHead>
            <TableHead className="text-right font-semibold">Onboarding</TableHead>
            <TableHead className="text-right font-semibold">CPL</TableHead>
            <TableHead className="text-right font-semibold">CPO</TableHead>
            <TableHead className="text-right font-semibold">CPA</TableHead>
            <TableHead className="text-right font-semibold">Ciclo</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedData.map((row) => (
            <TableRow key={row.source}>
              <TableCell className="font-medium">{row.source}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.investimento)}</TableCell>
              <TableCell className="text-right">{row.mqls}</TableCell>
              <TableCell className="text-right">{formatPercent(row.mqls_percent)}</TableCell>
              <TableCell className="text-right">{row.demo_agendadas}</TableCell>
              <TableCell className="text-right">{formatPercent(row.demo_agendadas_percent)}</TableCell>
              <TableCell className="text-right">{row.demo_realizadas}</TableCell>
              <TableCell className="text-right">{formatPercent(row.demo_realizadas_percent)}</TableCell>
              <TableCell className="text-right">{row.onboarding}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.cpl)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.cpo)}</TableCell>
              <TableCell className="text-right">{formatCurrency(row.cpa)}</TableCell>
              <TableCell className="text-right">{row.ciclo_venda}</TableCell>
              <TableCell>
                {row.metric && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(row.metric!)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(row.metric!.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {/* Totals Row */}
          <TableRow className="bg-muted/50 font-semibold">
            <TableCell>TOTAL</TableCell>
            <TableCell className="text-right">{formatCurrency(totals.investimento)}</TableCell>
            <TableCell className="text-right">{totals.mqls}</TableCell>
            <TableCell className="text-right">{formatPercent(totalMqlsPercent)}</TableCell>
            <TableCell className="text-right">{totals.demo_agendadas}</TableCell>
            <TableCell className="text-right">{formatPercent(totalDemoAgendadasPercent)}</TableCell>
            <TableCell className="text-right">{totals.demo_realizadas}</TableCell>
            <TableCell className="text-right">{formatPercent(totalDemoRealizadasPercent)}</TableCell>
            <TableCell className="text-right">{totals.onboarding}</TableCell>
            <TableCell className="text-right">{formatCurrency(totalCpl)}</TableCell>
            <TableCell className="text-right">{formatCurrency(totalCpo)}</TableCell>
            <TableCell className="text-right">{formatCurrency(totalCpa)}</TableCell>
            <TableCell className="text-right">-</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
