"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nestApiClient } from '@/services/nest_back';
import type { CalculationResult } from '@/types/calculation-result-type';
import CalculationTabs from '@/components/CalculationTabs';
import { useCalculationResultStore } from '@/store/useCalculationResultStore';

export default function CalculationDetailPage() {
  const { id } = useParams();
  const { calculationResult, setCalculationResult } = useCalculationResultStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      nestApiClient.calculations.getCalculation(id as string)
        .then((data) => {
          setCalculationResult(data as CalculationResult);
          setLoading(false);
        })
        .catch(() => {
          setError('Error loading calculation');
          setLoading(false);
        });
    }
  }, [id, setCalculationResult]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!calculationResult) return <div className="p-8 text-center">Calculation not found</div>;

  return (
    <CalculationTabs c={calculationResult}/>
  );
}
