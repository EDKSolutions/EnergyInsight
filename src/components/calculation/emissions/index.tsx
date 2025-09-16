import React from 'react';
import { CalculationResult } from '@/types/calculation-result-type';
import EmissionsComparison from '../ll97/emissions-comparison';

interface EmissionsProps {
  c: CalculationResult;
}

const Emissions: React.FC<EmissionsProps> = ({ c }) => {
  return (
    <div className="flex flex-col gap-6">
      <EmissionsComparison c={c} />
    </div>
  );
};

export default Emissions;
