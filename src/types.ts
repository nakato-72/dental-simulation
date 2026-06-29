export type Scenario = 'increase-precision' | 'basic-to-precision'

export type HearingInput = {
  workingDays: number
  receiptsPerMonth: number
  newPatientsPerMonth: number
  patientsOver50: number
  chairs: number
  dr: number
  dh: number
  da: number
  basicExamPerDay: number
  precisionExamPerDay: number
  sptPatientsPerDay: number
  cancelRatePercent: number
  recallRatePercent: number
  insurancePercent: number
  selfPayPercent: number
  oralManagementStrong: boolean
}

export type SimulationInput = {
  examPersonCount: number
  hypofunctionPersonCount: number
}

export type SimulationBreakdown = {
  examPoints: number
  examRevenue: number
  hypofunctionPoints: number
  hypofunctionRevenue: number
  monthlyTotal: number
  yearlyTotal: number
}

export type SavedRecord = {
  id: string
  clinicName: string
  savedAt: string
  hearing: HearingInput
  scenario: Scenario
  examPersonCount: number
  hypofunctionPersonCount: number
}
