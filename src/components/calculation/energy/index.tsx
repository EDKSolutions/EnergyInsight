import React from 'react'
import Data from '@/components/calculation/energy/data'
import Comparation from '@/components/calculation/energy/comparation'
import { CalculationResult } from '@/types/calculation-result-type'
import EnergyCard from '@/components/calculation/energy/energy'
import CostCalculation from '@/components/calculation/energy/cost-calculation'

const Energy = ({ c }: { c: CalculationResult }) => {
  return (
    <div className="flex flex-col gap-4">
      <Comparation c={c} />
      <CostCalculation c={c} />
      <EnergyCard c={c} />
      <Data />
    </div>
  )
}

export default Energy;
