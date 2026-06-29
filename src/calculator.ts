import type { HearingInput, Scenario, SimulationBreakdown, SimulationInput } from './types'

export const POINT_VALUES = {
  basicExam: 200,
  precisionExam: 400,
  /** 口腔機能低下症（検査あり）= ヒアリング項目!B50、口管強「あり」 */
  hypofunctionWithExam: 196,
  /** 口腔機能低下症（検査なし）= ヒアリング項目!B51、口管強「なし」 */
  hypofunctionNoExam: 146,
} as const

export function getHypofunctionPointValue(oralManagementStrong: boolean): number {
  return oralManagementStrong
    ? POINT_VALUES.hypofunctionWithExam
    : POINT_VALUES.hypofunctionNoExam
}

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

  const hypofunctionPointValue = getHypofunctionPointValue(
    hearing.oralManagementStrong,
  )
  const hypofunctionPoints =
    hypofunctionPersonCount * hypofunctionPointValue * workingDays
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
