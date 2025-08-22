"use client";
import React, { useState, useEffect } from "react";
import PlacesAutocomplete from "react-places-autocomplete";

interface AddressAutocompleteProps {
  onSelect: (address: string) => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ onSelect }) => {
  const [address, setAddress] = useState("");
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== "undefined" && window.google) {
        setIsGoogleLoaded(true);
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    checkGoogleMaps();
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
              placeholder: "Search for an address in New York...",
              className: "input border rounded px-4 py-4 w-[500px]",
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
