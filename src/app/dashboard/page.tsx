"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import AddressMap from "@/components/ui/AddressMap";
import { useAuthContext } from "@/context/AuthContext";

export default function DashboardPage() {
  const [selectedAddress, setSelectedAddress] = useState("");
  const { logout, user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  // Verificar autenticación al cargar la página
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/sign-in?redirect=/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleAddressSelect = (address: string) => {
    setSelectedAddress(address);
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (el useEffect se encargará de la redirección)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {user && (
            <p className="text-gray-600 mt-1">Bienvenido, {user.email}</p>
          )}
        </div>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow"
        >
          Cerrar sesión
        </button>
      </div>
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
