"use client";
import React, { useState, useEffect, useRef } from "react";

interface AddressAutocompleteProps {
  onSelect: (address: string) => void;
}

interface Suggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ onSelect }) => {
  const [address, setAddress] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isGoogleLoaded || !address.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions({
          input: address,
          types: ["address"],
          componentRestrictions: { country: "us" },
        }, (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [address, isGoogleLoaded]);

  const handleInputChange = (value: string) => {
    setAddress(value);
    setShowSuggestions(true);
    setActiveIndex(-1);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setAddress(suggestion.description);
    setShowSuggestions(false);
    onSelect(suggestion.description);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSuggestionClick(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }, 200);
  };

  if (!isGoogleLoaded) {
    return (
      <div className="border rounded px-2 py-1 w-full bg-gray-100">
        <input
          value=""
          placeholder="Cargando Google Maps..."
          disabled
          className="w-full bg-transparent"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={address || ""}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(true)}
        onBlur={handleInputBlur}
        placeholder="Search for an address in New York..."
        className="input border rounded px-4 py-4 w-[500px]"
      />
      
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 bg-white border rounded shadow mt-1 z-50 max-h-60 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-2 text-gray-500">Cargando...</div>
          )}
          
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                index === activeIndex ? "bg-gray-200" : ""
              }`}
            >
              <div className="font-medium">{suggestion.structured_formatting.main_text}</div>
              <div className="text-sm text-gray-500">
                {suggestion.structured_formatting.secondary_text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete; 
