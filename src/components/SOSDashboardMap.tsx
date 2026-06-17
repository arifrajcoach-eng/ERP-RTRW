import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { EmergencyLog } from '../types';

// Custom Red Icon for SOS
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Update Map center when emergencies change
const MapUpdater = ({ emergencies }: { emergencies: EmergencyLog[] }) => {
  const map = useMap();
  useEffect(() => {
    if (emergencies.length > 0) {
      const active = emergencies[0];
      const lat = active.location?.lat || (active as any).latitude || (active as any).lat;
      const lng = active.location?.lng || (active as any).longitude || (active as any).lng;
      if (lat && lng) {
        map.flyTo([lat, lng], 17);
      }
    }
  }, [emergencies, map]);
  return null;
};

interface SOSDashboardMapProps {
  emergencies: EmergencyLog[];
}

export const SOSDashboardMap: React.FC<SOSDashboardMapProps> = ({ emergencies }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[400px] w-full bg-slate-900 animate-pulse rounded-3xl" />;

  const centerLat = emergencies.length > 0 
    ? (emergencies[0].location?.lat || (emergencies[0] as any).latitude || (emergencies[0] as any).lat || -6.2088)
    : -6.2088;
  const centerLng = emergencies.length > 0 
    ? (emergencies[0].location?.lng || (emergencies[0] as any).longitude || (emergencies[0] as any).lng || 106.8456)
    : 106.8456;

  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden border-2 border-red-900/30 shadow-2xl relative z-0">
      <MapContainer 
        key={`${centerLat}-${centerLng}`}
        center={[centerLat, centerLng]} 
        zoom={15} 
        className="h-full w-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {emergencies.map((emergency) => {
          const lat = emergency.location?.lat || (emergency as any).latitude || (emergency as any).lat;
          const lng = emergency.location?.lng || (emergency as any).longitude || (emergency as any).lng;
          
          if (!lat || !lng) return null;

          return (
            <Marker 
              key={emergency.id} 
              position={[lat, lng]} 
              icon={redIcon}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <h3 className="font-bold text-red-600 uppercase text-xs">{emergency.userName}</h3>
                  <p className="text-[10px] text-slate-600 font-bold mb-1">{emergency.userPhone}</p>
                  <p className="text-[9px] text-slate-400 font-mono">{new Date(emergency.timestamp).toLocaleString()}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <MapUpdater emergencies={emergencies} />
      </MapContainer>

      {/* Map Overlay for SOS Pulsing */}
      {emergencies.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full" />
          Live SOS Aktif
        </div>
      )}
    </div>
  );
};
