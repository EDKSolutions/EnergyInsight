"use client";
import React, { useState } from "react";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import AddressMap from "@/components/ui/AddressMap";

export default function DashboardPage() {
  const [selectedAddress, setSelectedAddress] = useState("");

  const handleAddressSelect = (address: string) => {
    setSelectedAddress(address);
    // Aquí puedes hacer la petición a tu otra API con la dirección seleccionada
    console.log("Dirección seleccionada:", address);
    // Ejemplo: fetch('/api/tu-api', { method: 'POST', body: JSON.stringify({ address }) })
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo - Búsqueda */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar dirección en Nueva York
            </label>
            <AddressAutocomplete onSelect={handleAddressSelect} />
          </div>
          
          {selectedAddress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Dirección seleccionada:</h3>
              <p className="text-blue-800">{selectedAddress}</p>
            </div>
          )}
        </div>

        {/* Panel derecho - Mapa */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Ubicación en el mapa</h3>
          <AddressMap address={selectedAddress} />
        </div>
      </div>
    </div>
  );
}
