'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, subMonths, subYears } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type CompareMode = 'month' | 'year'

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

  return (
    <div className="flex items-center gap-3">
      {/* Month Selector */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">
              {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-64 overflow-auto">
          {months.map(({ date, label }) => (
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
      <div className="flex items-center rounded-md border border-border">
        <Button
          variant={compareMode === 'month' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onCompareModeChange('month')}
          className="rounded-r-none"
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
  const currentStart = startOfMonth(selectedMonth)
  const currentEnd = endOfMonth(selectedMonth)
  
  const compareDate = compareMode === 'month' 
    ? subMonths(selectedMonth, 1)
    : subYears(selectedMonth, 1)
  
  const compareStart = startOfMonth(compareDate)
  const compareEnd = endOfMonth(compareDate)

  return {
    currentStart,
    currentEnd,
    compareStart,
    compareEnd,
    currentLabel: format(selectedMonth, 'MMM yyyy', { locale: ptBR }),
    compareLabel: format(compareDate, 'MMM yyyy', { locale: ptBR }),
  }
}
