"use client"
import React, { useEffect } from 'react'
import { nestApiClient } from '@/services/nest_back';
import type { Calculation } from '@/types/calculations';
import { useCalculationsStore } from '@/store/useCalculationsStore';
import { useRouter } from 'next/navigation';

export default function CalculationsPage() {
  // Importa useState y define el tipo CalculationResult si no está definido en otro lugar
  const { calculations, setCalculations } = useCalculationsStore();
  const router = useRouter();

  useEffect(() => {
    const fetchCalculations = async () => {
      const calculationsData = await nestApiClient.calculations.getCalculations();
      // Suponiendo que calculationsData es Calculation[]
      setCalculations(calculationsData as Calculation[]);
    };
    fetchCalculations();
  }, [setCalculations]);
  return (
    <div className="flex flex-col h-[70vh] bg-white dark:bg-gray-dark md-p-6 2xl:p-10 p-4 rounded-lg shadow-lg w-full">
      <h1 className="text-2xl font-bold text-center">Calculations</h1>
      <div className="flex flex-col items-center justify-center overflow-x-auto">
        <table className="w-full min-w-[700px] border-separate border-spacing-0 rounded-lg shadow-md bg-white dark:bg-gray-800">
          <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase border-b border-gray-200 dark:border-gray-700">Address</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase border-b border-gray-200 dark:border-gray-700">BBL</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase border-b border-gray-200 dark:border-gray-700">Building Class</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase border-b border-gray-200 dark:border-gray-700">Building Value</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase border-b border-gray-200 dark:border-gray-700">Cap Rate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase border-b border-gray-200 dark:border-gray-700">Annual Energy</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase border-b border-gray-200 dark:border-gray-700">Options</th>
            </tr>
          </thead>
          <tbody className="text-center text-gray-800 dark:text-gray-100">
            {calculations?.map((c, idx) => (
              <tr key={c.calculation.id} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}>
                <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 max-w-[200px] truncate text-left">{c.calculation.address}</td>
                <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">{c.calculation.bbl}</td>
                <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">{c.calculation.buildingClass}</td>
                <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">{c.calculation.buildingValue}</td>
                <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">{c.calculation.capRate}</td>
                <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">{c.calculation.annualEnergy}</td>
                <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-center">
                  <button
                    className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-1.5 rounded-full shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    aria-label="View calculation"
                    onClick={() => router.push(`/panel/calculations/${c.calculation.id}`)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 10C3.5 6.5 7.5 4 10 4c2.5 0 6.5 2.5 7.75 6-1.25 3.5-5.25 6-7.75 6-2.5 0-6.5-2.5-7.75-6z" />
                      <circle cx="10" cy="10" r="2.2" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
