import { format } from 'date-fns'
import { Goal } from './types'

export interface QuarterInfo {
  quarter: number
  label: string
  months: string
  startMonth: number
  endMonth: number
  year: number
}

/**
 * Get the quarter (1-4) for a given date
 */
export function getQuarter(date: Date): number {
  const month = date.getMonth() // 0-11
  return Math.floor(month / 3) + 1
}

/**
 * Get quarter information for a given date
 */
export function getQuarterInfo(date: Date): QuarterInfo {
  const quarter = getQuarter(date)
  const year = date.getFullYear()
  
  const quarterData: Record<number, { months: string; startMonth: number; endMonth: number }> = {
    1: { months: 'Jan - Mar', startMonth: 0, endMonth: 2 },
    2: { months: 'Apr - Jun', startMonth: 3, endMonth: 5 },
    3: { months: 'Jul - Sep', startMonth: 6, endMonth: 8 },
    4: { months: 'Oct - Dec', startMonth: 9, endMonth: 11 },
  }
  
  const data = quarterData[quarter]
  
  return {
    quarter,
    label: `Q${quarter} ${year}`,
    months: data.months,
    startMonth: data.startMonth,
    endMonth: data.endMonth,
    year,
  }
}

/**
 * Group goals by quarter based on their start date
 */
export function groupGoalsByQuarter(goals: Goal[]): Map<string, Goal[]> {
  const grouped = new Map<string, Goal[]>()
  
  goals.forEach(goal => {
    const startDate = new Date(goal.start_date)
    const quarterInfo = getQuarterInfo(startDate)
    const key = `${quarterInfo.year}-Q${quarterInfo.quarter}`
    
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(goal)
  })
  
  // Sort goals within each quarter by start date
  grouped.forEach((quarterGoals, key) => {
    quarterGoals.sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )
  })
  
  return grouped
}

/**
 * Get all quarters for the current year and next year
 */
export function getAllQuarters(): QuarterInfo[] {
  const quarters: QuarterInfo[] = []
  const currentYear = new Date().getFullYear()
  
  // Current year quarters
  for (let q = 1; q <= 4; q++) {
    const date = new Date(currentYear, (q - 1) * 3, 1)
    quarters.push(getQuarterInfo(date))
  }
  
  // Next year quarters
  for (let q = 1; q <= 4; q++) {
    const date = new Date(currentYear + 1, (q - 1) * 3, 1)
    quarters.push(getQuarterInfo(date))
  }
  
  return quarters
}

/**
 * Check if a quarter is the current quarter
 */
export function isCurrentQuarter(quarterInfo: QuarterInfo): boolean {
  const now = new Date()
  const currentQuarter = getQuarterInfo(now)
  return (
    quarterInfo.quarter === currentQuarter.quarter &&
    quarterInfo.year === currentQuarter.year
  )
}

/**
 * Check if a quarter is in the past
 */
export function isPastQuarter(quarterInfo: QuarterInfo): boolean {
  const now = new Date()
  const currentQuarter = getQuarterInfo(now)
  
  if (quarterInfo.year < currentQuarter.year) return true
  if (quarterInfo.year === currentQuarter.year && quarterInfo.quarter < currentQuarter.quarter) return true
  return false
}

/**
 * Parse a quarter key (e.g., "2024-Q4") into QuarterInfo
 */
export function parseQuarterKey(key: string): QuarterInfo {
  const match = key.match(/(\d+)-Q(\d+)/)
  if (!match) {
    throw new Error(`Invalid quarter key: ${key}`)
  }
  const year = parseInt(match[1], 10)
  const quarter = parseInt(match[2], 10)
  const date = new Date(year, (quarter - 1) * 3, 1)
  return getQuarterInfo(date)
}
