"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { nestApiClient } from '@/services/nest_back';
import type { CalculationResult } from '@/types/calculation-result-type';
import Calculation from '@/components/calculation';

export default function CalculationDetailPage() {
  const { id } = useParams();
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      nestApiClient.calculations.getCalculation(id as string)
        .then((data) => {
          setCalculation(data as CalculationResult);
          setLoading(false);
        })
        .catch((err) => {
          setError('Error loading calculation');
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!calculation) return <div className="p-8 text-center">Calculation not found</div>;

  const c = calculation;

  console.log(c);

  return (
    <Calculation c={c} />
  );
}
