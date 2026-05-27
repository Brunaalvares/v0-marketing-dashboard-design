'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = {
  primary: '#3b5998',
  secondary: '#2d9cdb',
  success: '#27ae60',
  warning: '#f2994a',
  danger: '#eb5757',
}

interface FunnelChartProps {
  data: {
    mqls: number
    demoAgendadas: number
    demoRealizadas: number
    onboarding: number
  }
}

export function FunnelChart({ data }: FunnelChartProps) {
  const chartData = [
    { name: 'MQLs', value: data.mqls, fill: COLORS.primary },
    { name: 'DEMO Agendadas', value: data.demoAgendadas, fill: COLORS.secondary },
    { name: 'DEMO Realizadas', value: data.demoRealizadas, fill: COLORS.success },
    { name: 'Onboarding', value: data.onboarding, fill: COLORS.warning },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Funil de Conversao</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip 
              formatter={(value: number) => new Intl.NumberFormat('pt-BR').format(value)}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface TrendChartProps {
  data: Array<{
    month: string
    mqls: number
    demoAgendadas: number
    demoRealizadas: number
    onboarding: number
  }>
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Tendencia Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="mqls"
              name="MQLs"
              stroke={COLORS.primary}
              strokeWidth={2}
              dot={{ fill: COLORS.primary }}
            />
            <Line
              type="monotone"
              dataKey="demoAgendadas"
              name="DEMO Agendadas"
              stroke={COLORS.secondary}
              strokeWidth={2}
              dot={{ fill: COLORS.secondary }}
            />
            <Line
              type="monotone"
              dataKey="demoRealizadas"
              name="DEMO Realizadas"
              stroke={COLORS.success}
              strokeWidth={2}
              dot={{ fill: COLORS.success }}
            />
            <Line
              type="monotone"
              dataKey="onboarding"
              name="Onboarding"
              stroke={COLORS.warning}
              strokeWidth={2}
              dot={{ fill: COLORS.warning }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface SourceDistributionChartProps {
  data: Array<{
    source: string
    value: number
  }>
}

export function SourceDistributionChart({ data }: SourceDistributionChartProps) {
  const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger, '#8884d8']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Distribuicao por Fonte</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface CostMetricsChartProps {
  data: Array<{
    month: string
    cpl: number
    cpo: number
    cpa: number
  }>
}

export function CostMetricsChart({ data }: CostMetricsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Metricas de Custo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
              }
            />
            <Legend />
            <Bar dataKey="cpl" name="CPL" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="cpo" name="CPO" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="cpa" name="CPA" fill={COLORS.success} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
