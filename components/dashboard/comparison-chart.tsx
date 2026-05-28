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
} from 'recharts'

interface ComparisonChartData {
  label: string
  atual: number
  comparativo: number
}

interface ComparisonChartProps {
  title: string
  data: ComparisonChartData[]
  formatter?: 'number' | 'percent' | 'currency'
}

function formatValue(value: number, formatter: ComparisonChartProps['formatter']) {
  if (formatter === 'currency') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value)
  }

  if (formatter === 'percent') {
    return `${value.toFixed(2)}%`
  }

  return new Intl.NumberFormat('pt-BR').format(value)
}

export function ComparisonChart({
  title,
  data,
  formatter = 'number',
}: ComparisonChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => formatValue(Number(value), formatter)} />
            <Legend />
            <Bar dataKey="atual" name="Periodo Atual" fill="#3b5998" radius={[4, 4, 0, 0]} />
            <Bar dataKey="comparativo" name="Periodo Comparativo" fill="#2d9cdb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
