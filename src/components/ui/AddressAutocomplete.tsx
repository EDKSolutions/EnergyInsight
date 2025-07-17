"use client";
import React, { useState, useEffect } from "react";
import PlacesAutocomplete from "react-places-autocomplete";

// Variable global para evitar cargas múltiples
let googleMapsLoadingPromise: Promise<void> | null = null;

interface AddressAutocompleteProps {
  onSelect: (address: string) => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ onSelect }) => {
  const [address, setAddress] = useState("");
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (typeof window !== "undefined" && window.google) {
        setIsGoogleLoaded(true);
        return;
      }
      if (googleMapsLoadingPromise) {
        await googleMapsLoadingPromise;
        setIsGoogleLoaded(true);
        return;
      }
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const checkGoogle = () => {
          if (window.google) setIsGoogleLoaded(true);
          else setTimeout(checkGoogle, 100);
        };
        checkGoogle();
        return;
      }
      googleMapsLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setIsGoogleLoaded(true);
          resolve();
        };
        document.head.appendChild(script);
      });
      await googleMapsLoadingPromise;
    };
    loadGoogleMaps();
  }, []);

  // Definir searchOptions solo con las opciones compatibles
  const searchOptions = {
    types: ["address"],
    componentRestrictions: { country: "us" },
  };

  if (!isGoogleLoaded) {
    return (
      <div className="border rounded px-2 py-1 w-full bg-gray-100">
        <input
          placeholder="Cargando Google Maps..."
          disabled
          className="w-full bg-transparent"
        />
      </div>
    );
  }

  return (
    <PlacesAutocomplete
      value={address}
      onChange={setAddress}
      onSelect={(value) => {
        setAddress(value);
        onSelect(value);
      }}
      searchOptions={searchOptions}
    >
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div>
          <input
            {...getInputProps({
              placeholder: "Buscar dirección en Nueva York...",
              className: "input border rounded px-2 py-1 w-full",
            })}
          />
          <div className="bg-white border rounded shadow mt-1">
            {loading && <div className="p-2">Cargando...</div>}
            {suggestions.map((suggestion) => (
              <div
                {...getSuggestionItemProps(suggestion)}
                key={suggestion.placeId}
                className={`p-2 cursor-pointer ${suggestion.active ? "bg-gray-200" : ""}`}
              >
                {suggestion.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </PlacesAutocomplete>
  );
};

export default AddressAutocomplete; 
