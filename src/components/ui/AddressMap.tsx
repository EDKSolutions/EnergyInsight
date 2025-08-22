"use client";
import React, { useEffect, useRef, useState } from "react";

interface AddressMapProps {
  address: string;
  className?: string;
}

const AddressMap: React.FC<AddressMapProps> = ({ address, className = "" }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
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

  useEffect(() => {
    if (!address || !mapRef.current || !isGoogleLoaded || typeof window === "undefined" || !window.google) {
      return;
    }

    // Create the map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: 40.7128, lng: -74.0060 }, // Center of New York
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        fullscreenControl: false,
      });
    }

    // Geocode the address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        
        // Center the map on the location
        mapInstanceRef.current?.setCenter(location);
        
        // Create or update the marker
        if (markerRef.current) {
          markerRef.current.setPosition(location);
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            title: address,
            animation: window.google.maps.Animation.DROP,
          });
        }

        // Add InfoWindow with the address
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style=\"padding: 8px;\"><strong>${address}</strong></div>`,
        });

        markerRef.current.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current, markerRef.current);
        });

        // Show InfoWindow automatically
        infoWindow.open(mapInstanceRef.current, markerRef.current);
      }
    });
  }, [address, isGoogleLoaded]);

  if (!address) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height: "300px" }}>
        <p className="text-gray-500">Select an address to see the map</p>
      </div>
    );
  }

  if (!isGoogleLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height: "300px" }}>
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border ${className}`}>
      <div ref={mapRef} style={{ height: "300px", width: "100%" }} />
    </div>
  );
};

export default AddressMap; 
