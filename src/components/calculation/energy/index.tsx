import React from 'react'
import Data from '@/components/calculation/energy/data'
import Comparation from '@/components/calculation/energy/comparation'
import { CalculationResult } from '@/types/calculation-result-type'

const Energy = ({ c }: { c: CalculationResult }) => {
  console.log(c)
  return (
    <div className="flex flex-col gap-4">
      <Comparation c={c} />
      <Data />
    </div>
  )
}

export default Energy;
