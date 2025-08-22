"use client";

import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import AddressMap from "@/components/ui/AddressMap";
import { nestApiClient } from "@/services/nest_back";
import { parseGeoAddress } from "@/lib/parseGeoAddress";
import { useState } from "react";
import { useCalculationResultStore } from "@/store/useCalculationResultStore";
import { CalculationResult } from "@/types/calculation-result-type";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setCalculationResult } = useCalculationResultStore();
  const router = useRouter();
  const handleAddressSelect = async (address: string) => {
    setSelectedAddress(address);  
    setError(null);
  };

  const handleCalculate = async () => {
    setError(null);
    setIsLoading(true);
    const geo = parseGeoAddress(selectedAddress);
    try {
      const result = await nestApiClient.calculations.calculate({
        houseNumber: geo.number,
        street: geo.street,
        borough: geo.borough,
        address: selectedAddress
      });
      setCalculationResult(result as CalculationResult);
      router.push(`/panel/calculations/${(result as CalculationResult).id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[80vh] bg-white dark:bg-gray-dark md-p-6 2xl:p-10 p-4 rounded-lg shadow-lg w-full">
      <div className="flex flex-col items-center justify-center pt-6 w-full">
        <h1 className="text-2xl font-bold text-center">Search for an address in New York</h1>
        <div className="flex items-center justify-center pt-6 w-[500px] gap-4">
          <AddressAutocomplete onSelect={handleAddressSelect} />
          <button 
            className="bg-primary hover:bg-primary/80 py-4 text-white px-4 rounded-md w-[160px] text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleCalculate}
            disabled={isLoading}
          >
            {isLoading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {isLoading ? 'Calculating...' : 'Calculate'}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded w-[500px] text-center">
            {error}
          </div>
        )}
        <div className="flex flex-col items-center justify-center pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Location on the map</h3>
          <div className="w-[700px] min-h-[80vh]"> 
            <AddressMap address={selectedAddress} />
          </div>
        </div>
      </div>
    </div>
  )
}
