'use client'

import { useState } from 'react'
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type CompareMode = 'week' | 'month' | 'year'

const weekOptions = { weekStartsOn: 1 as const }

interface DateFilterProps {
  selectedMonth: Date
  onMonthChange: (date: Date) => void
  compareMode: CompareMode
  onCompareModeChange: (mode: CompareMode) => void
}

export function DateFilter({
  selectedMonth,
  onMonthChange,
  compareMode,
  onCompareModeChange,
}: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Generate last 12 months for selection
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i)
    return {
      date: startOfMonth(date),
      label: format(date, 'MMMM yyyy', { locale: ptBR }),
    }
  })

  const weeks = Array.from({ length: 12 }, (_, i) => {
    const date = startOfWeek(subWeeks(new Date(), i), weekOptions)
    return {
      date,
      label: `Semana de ${format(date, "dd 'de' MMM", { locale: ptBR })}`,
    }
  })

  const options = compareMode === 'week' ? weeks : months
  const selectedLabel = compareMode === 'week'
    ? `Semana de ${format(startOfWeek(selectedMonth, weekOptions), "dd 'de' MMM", { locale: ptBR })}`
    : format(selectedMonth, 'MMMM yyyy', { locale: ptBR })

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Period Selector */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">
              {selectedLabel}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-64 overflow-auto">
          {options.map(({ date, label }) => (
            <DropdownMenuItem
              key={label}
              onClick={() => {
                onMonthChange(date)
                setIsOpen(false)
              }}
              className="capitalize"
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Compare Mode Toggle */}
      <div className="flex flex-wrap items-center rounded-md border border-border">
        <Button
          variant={compareMode === 'week' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onCompareModeChange('week')}
          className="rounded-r-none"
        >
          vs Semana Anterior
        </Button>
        <Button
          variant={compareMode === 'month' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onCompareModeChange('month')}
          className="rounded-none"
        >
          vs Mes Anterior
        </Button>
        <Button
          variant={compareMode === 'year' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onCompareModeChange('year')}
          className="rounded-l-none"
        >
          vs Ano Anterior
        </Button>
      </div>
    </div>
  )
}

export function getComparisonDates(selectedMonth: Date, compareMode: CompareMode) {
  const isWeekly = compareMode === 'week'
  const currentStart = isWeekly
    ? startOfWeek(selectedMonth, weekOptions)
    : startOfMonth(selectedMonth)
  const currentEnd = isWeekly
    ? endOfWeek(selectedMonth, weekOptions)
    : endOfMonth(selectedMonth)

  const compareDate =
    compareMode === 'week'
      ? subWeeks(selectedMonth, 1)
      : compareMode === 'month'
        ? subMonths(selectedMonth, 1)
        : subYears(selectedMonth, 1)

  const compareStart = isWeekly
    ? startOfWeek(compareDate, weekOptions)
    : startOfMonth(compareDate)
  const compareEnd = isWeekly
    ? endOfWeek(compareDate, weekOptions)
    : endOfMonth(compareDate)

  return {
    currentStart,
    currentEnd,
    compareStart,
    compareEnd,
    currentLabel: isWeekly
      ? `Semana de ${format(currentStart, "dd MMM", { locale: ptBR })}`
      : format(selectedMonth, 'MMM yyyy', { locale: ptBR }),
    compareLabel: isWeekly
      ? `Semana de ${format(compareStart, "dd MMM", { locale: ptBR })}`
      : format(compareDate, 'MMM yyyy', { locale: ptBR }),
  }
}
