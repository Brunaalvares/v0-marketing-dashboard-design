export function calculateTrend(
  currentValue: number,
  previousValue: number
): 'up' | 'down' | 'neutral' {
  if (previousValue === 0) {
    return currentValue === 0 ? 'neutral' : 'up'
  }

  if (currentValue > previousValue) return 'up'
  if (currentValue < previousValue) return 'down'
  return 'neutral'
}

export function toMonthLabel(referenceDate: string): string {
  const parsed = new Date(referenceDate)
  const month = parsed.toLocaleDateString('pt-BR', { month: 'short' })
  return month.charAt(0).toUpperCase() + month.slice(1)
}

export function sum(numbers: number[]): number {
  return numbers.reduce((acc, value) => acc + value, 0)
}
