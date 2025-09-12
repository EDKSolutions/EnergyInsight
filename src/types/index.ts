export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface Calculations {
  id: string
  bbl: string
  address: string
  boro: string
  yearBuilt: number
  stories: number
  buildingClass: string
  totalSquareFeet: number
  totalResidentialUnits: number
  ptacUnits: number
  capRate: number
  buildingValue: number
  unitMixBreakDown: string
  isRentStabilized?: boolean
  annualBuildingMMBtuCoolingPTAC?: number
  annualBuildingMMBtuHeatingPTAC?: number
  annualBuildingMMBtuTotalPTAC?: number
  annualBuildingMMBtuHeatingPTHP?: number
  annualBuildingMMBtuCoolingPTHP?: number
  annualBuildingMMBtuTotalPTHP?: number
  energyReductionPercentage?: number
  totalRetrofitCost?: number
  annualBuildingThermsHeatingPTAC?: number
  annualBuildingkWhCoolingPTAC?: number
  annualBuildingkWhHeatingPTHP?: number
  annualBuildingkWhCoolingPTHP?: number
  annualBuildingCostPTAC?: number
  annualBuildingCostPTHP?: number
  annualEnergySavings?: number
  rawPlutoData?: Record<string, unknown>
  rawLL84Data?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface CreateCalculationRequest {
  bbl: string
  address: string
  boro: string
  yearBuilt: number
  stories: number
  buildingClass: string
  totalSquareFeet: number
  totalResidentialUnits: number
  ptacUnits: number
  capRate: number
  buildingValue: number
  unitMixBreakDown: string
  isRentStabilized?: boolean
}

export interface AuthUser {
  sub: string
  email: string
  name?: string
  email_verified: boolean
}
