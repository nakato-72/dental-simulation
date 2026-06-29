import type { HearingInput, Scenario, SimulationBreakdown, SimulationInput } from './types'

export const POINT_VALUES = {
  basicExam: 200,
  precisionExam: 400,
  hypofunctionNoExam: 146,
} as const

const YEN_PER_POINT = 10

export function calculateSimulation(
  hearing: HearingInput,
  simulation: SimulationInput,
  scenario: Scenario,
): SimulationBreakdown {
  const { workingDays } = hearing
  const { examPersonCount, hypofunctionPersonCount } = simulation

  const examPointsPerPerson =
    scenario === 'increase-precision'
      ? POINT_VALUES.precisionExam
      : POINT_VALUES.basicExam

  const examPoints = examPersonCount * examPointsPerPerson * workingDays
  const examRevenue = examPoints * YEN_PER_POINT

  const hypofunctionPoints =
    hypofunctionPersonCount * POINT_VALUES.hypofunctionNoExam * workingDays
  const hypofunctionRevenue = hypofunctionPoints * YEN_PER_POINT

  const monthlyTotal = examRevenue + hypofunctionRevenue
  const yearlyTotal = monthlyTotal * 12

  return {
    examPoints,
    examRevenue,
    hypofunctionPoints,
    hypofunctionRevenue,
    monthlyTotal,
    yearlyTotal,
  }
}

export function formatYen(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ja-JP').format(value)
}
