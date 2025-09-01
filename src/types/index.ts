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
  buildingName: string
  address: string
  yearBuilt: string
  stories: string
  buildingClass: string
  taxClass: string
  zoning: string
  boro: string
  totalSquareFeet: string
  totalResidentialUnits: string
  ptacUnits: string
  capRate: string
  buildingValue: string
  unitMixBreakDown: string
  energyProfile: string
  annualBuildingMMBtuCoolingPTAC?: number
  annualBuildingMMBtuHeatingPTAC?: number
  annualBuildingMMBtuTotalPTAC?: number
  annualBuildingMMBtuHeatingPTHP?: number
  annualBuildingMMBtuCoolingPTHP?: number
  annualBuildingMMBtuTotalPTHP?: number
  energyReductionPercentage?: number
  totalRetrofitCost?: number
  annualBuildingThermsHeatingPTAC?: number
  annualBuildingKwhCoolingPTAC?: number
  annualBuildingKwhHeatingPTHP?: number
  annualBuildingKwhCoolingPTHP?: number
  annualBuildingCostPTAC?: number
  annualBuildingCostPTHP?: number
  annualEnergySavings?: number
  siteEUI: string
  occupancyRate: string
  maintenanceCost: string
  rawPlutoData?: Record<string, unknown>
  rawLL84Data?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface CreateCalculationRequest {
  bbl: string
  buildingName: string
  address: string
  yearBuilt: string
  stories: string
  buildingClass: string
  taxClass: string
  zoning: string
  boro: string
  totalSquareFeet: string
  totalResidentialUnits: string
  ptacUnits: string
  capRate: string
  buildingValue: string
  unitMixBreakDown: string
  energyProfile: string
  siteEUI: string
  occupancyRate: string
  maintenanceCost: string
}

export interface AuthUser {
  sub: string
  email: string
  name?: string
  email_verified: boolean
}
