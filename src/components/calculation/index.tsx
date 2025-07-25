import React from 'react'
import Property from '@/components/calculation/property'
import { CalculationResult } from '@/types/calculation-result-type'
import Unit from '@/components/calculation/unit'
import Energy from '@/components/calculation/energy'
import Data from '@/components/calculation/data'
import Cards from '@/components/calculation/cards'
import Calculate from '@/components/calculation/calculate'

const Calculation = ({ c }: { c: CalculationResult }) => {
  return (
    <div className="flex flex-col gap-4">
      <Property c={c} />
      <Cards c={c} />
      <Unit c={c} />
      <Energy c={c} />
      <Calculate 
        pluto={c.rawPlutoData}
        ll84={c.rawLL84Data}
      />
      <Data />
    </div>  
  )
}

export default Calculation; 
