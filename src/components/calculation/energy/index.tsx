import React from 'react'
import Data from '@/components/calculation/energy/data'
import Comparation from '@/components/calculation/energy/comparation'
import { CalculationResult } from '@/types/calculation-result-type'
import EnergyCard from '@/components/calculation/energy/energy'
import Card from '@/components/calculation/energy/card'

const Energy = ({ c }: { c: CalculationResult }) => {
  return (
    <div className="flex flex-col gap-4">
      <Card c={c} />
      <Comparation c={c} />
      <EnergyCard c={c} />
      <Data />
    </div>
  )
}

export default Energy;
