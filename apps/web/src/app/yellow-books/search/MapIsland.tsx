'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Organization } from '../../../types/organization';

// Fix default marker icon
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapIslandProps {
  organizations: Organization[];
}

export default function MapIsland({ organizations }: MapIslandProps) {
  // Filter organizations with valid coordinates
  const orgsWithCoords = organizations.filter(
    (org) => org.coordinates?.lat && org.coordinates?.lng
  );

  // Calculate center point (average of all coordinates)
  const centerLat = orgsWithCoords.reduce((sum, org) => sum + (org.coordinates?.lat || 0), 0) / orgsWithCoords.length;
  const centerLng = orgsWithCoords.reduce((sum, org) => sum + (org.coordinates?.lng || 0), 0) / orgsWithCoords.length;

  // Google Maps URL generator
  const getGoogleMapsUrl = (lat: number, lng: number, name: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;
  };

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-yellow-300 shadow-xl">
      <MapContainer
        center={[centerLat || 40.7589, centerLng || -73.9851]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {orgsWithCoords.map((org) => (
          <Marker
            key={org.id}
            position={[org.coordinates?.lat ?? 0, org.coordinates?.lng ?? 0]}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{org.logo}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{org.name}</h3>
                    <p className="text-xs text-gray-600">{org.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{org.description}</p>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/yellow-books/${org.id}`}
                    className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                  >
                    Дэлгэрэнгүй үзэх →
                  </Link>
                  <a
                    href={getGoogleMapsUrl(org.coordinates?.lat ?? 0, org.coordinates?.lng ?? 0, org.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Google Maps-д үзэх
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
