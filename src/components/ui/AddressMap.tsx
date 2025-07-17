"use client";
import React, { useEffect, useRef, useState } from "react";

// Variable global para evitar cargas múltiples
let googleMapsLoadingPromise: Promise<void> | null = null;

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

  useEffect(() => {
    if (!address || !mapRef.current || !isGoogleLoaded || typeof window === "undefined" || !window.google) {
      return;
    }

    // Crear el mapa si no existe
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: 40.7128, lng: -74.0060 }, // Centro de Nueva York
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        fullscreenControl: false,
      });
    }

    // Geocodificar la dirección
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        
        // Centrar el mapa en la ubicación
        mapInstanceRef.current?.setCenter(location);
        
        // Crear o actualizar el marcador
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

        // Agregar InfoWindow con la dirección
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style=\"padding: 8px;\"><strong>${address}</strong></div>`,
        });

        markerRef.current.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current, markerRef.current);
        });

        // Mostrar InfoWindow automáticamente
        infoWindow.open(mapInstanceRef.current, markerRef.current);
      }
    });
  }, [address, isGoogleLoaded]);

  if (!address) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height: "300px" }}>
        <p className="text-gray-500">Selecciona una dirección para ver el mapa</p>
      </div>
    );
  }

  if (!isGoogleLoaded) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height: "300px" }}>
        <p className="text-gray-500">Cargando mapa...</p>
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
