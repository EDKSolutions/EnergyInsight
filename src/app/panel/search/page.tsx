"use client";

import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import AddressMap from "@/components/ui/AddressMap";
import { nestApiClient } from "@/services/nest_back";
import { parseGeoAddress } from "@/lib/parseGeoAddress";
import { useState } from "react";

export default function SearchPage() {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addressUserData, setAddressUserData] = useState<Record<string, unknown> | null>(null);

  const handleAddressSelect = async (address: string) => {
    setSelectedAddress(address);  
  };

  const handleCalculate = async () => {
    const geo = parseGeoAddress(selectedAddress);
    const addressUser = await nestApiClient.calculations.calculate({
      houseNumber: geo.number,
      street: geo.street,
      borough: geo.borough,
      address: selectedAddress
    });
    setAddressUserData(addressUser as Record<string, unknown>);
    console.log(addressUserData);
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white dark:bg-gray-dark md-p-6 2xl:p-10 p-4 rounded-lg shadow-lg w-full">
      <div className="flex flex-col items-center justify-center pt-6 w-full">
        <h1 className="text-2xl font-bold text-center">Search for an address in New York</h1>
        <div className="flex items-center justify-center pt-6 w-[500px] gap-4">
          <AddressAutocomplete onSelect={handleAddressSelect} />
          <button 
            className="bg-primary hover:bg-primary/80 py-4 text-white px-4 rounded-md w-[160px] text-lg"
            onClick={handleCalculate}
          >
            Calculate
          </button>
        </div>
        <div className="flex flex-col items-center justify-center pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Location on the map</h3>
          <div className="w-[700px] min-h-[600px]"> 
            <AddressMap address={selectedAddress} />
          </div>
        </div>
      </div>
    </div>
  )
}
