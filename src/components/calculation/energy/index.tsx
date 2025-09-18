import React from 'react'
import Data from '@/components/calculation/energy/data'
import Comparation from '@/components/calculation/energy/comparation'
import { CalculationResult } from '@/types/calculation-result-type'
import CostCalculation from '@/components/calculation/energy/cost-calculation'
import EnergyCalculationBreakdown from '@/components/calculation/energy/energy-calculation-breakdown'
import EditAssumptionsToggle from '@/components/shared/EditAssumptionsToggle'

const Energy = ({ c }: { c: CalculationResult }) => {
  return (
    <div className="flex flex-col gap-4">
      <EditAssumptionsToggle c={c} />
      <Comparation c={c} />
      <EnergyCalculationBreakdown c={c} />
      <CostCalculation c={c} />
      <Data />
    </div>
  )
}

export default Energy;
