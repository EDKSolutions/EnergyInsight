import React from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import EmissionsComparison from '../ll97/emissions-comparison';
import EditAssumptionsToggle from '@/components/shared/EditAssumptionsToggle';

interface EmissionsProps {
  c: CalculationResult;
}

const Emissions: React.FC<EmissionsProps> = ({ c }) => {
  return (
    <div className="flex flex-col gap-6">
      <EditAssumptionsToggle c={c} />
      <EmissionsComparison c={c} />
    </div>
  );
};

export default Emissions;
