'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  businessName?: string;
}

export default function Map({ 
  latitude = 47.9184, 
  longitude = 106.9177, 
  address = 'Ulaanbaatar, Mongolia',
  businessName = 'Business Location'
}: MapProps) {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Initialize map
    const map = L.map('map').setView([latitude, longitude], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`<b>${businessName}</b><br>${address}`).openPopup();

    // Cleanup
    return () => {
      map.remove();
    };
  }, [latitude, longitude, address, businessName]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md">
      <div id="map" className="w-full h-full"></div>
    </div>
  );
}
