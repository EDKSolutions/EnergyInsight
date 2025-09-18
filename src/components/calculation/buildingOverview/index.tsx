import React from 'react'
import Property from '@/components/calculation/buildingOverview/property'
import { CalculationResult } from '@/types/calculation-result-type'
import Unit from '@/components/calculation/buildingOverview/unit'
import Data from '@/components/calculation/buildingOverview/data'
import Cards from '@/components/calculation/buildingOverview/cards'
import Calculate from '@/components/calculation/buildingOverview/calculate'
import EditAssumptionsToggle from '@/components/shared/EditAssumptionsToggle'
import AiAnalysisNotes from '@/components/calculation/buildingOverview/aiAnalysisNotes'

const Calculation = ({ c }: { c: CalculationResult }) => {
  return (
    <div className="flex flex-col gap-4">
      <EditAssumptionsToggle c={c} showAiAssisted={true} />
      <Property c={c} />
      <Cards c={c} />
      <AiAnalysisNotes c={c} />
      <Unit c={c} />
      <Calculate
        pluto={c.rawPlutoData}
        ll84={c.rawLL84Data}
      />
      <Data />
    </div>  
  )
}

export default Calculation; 
