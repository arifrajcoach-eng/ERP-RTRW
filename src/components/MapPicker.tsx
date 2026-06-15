import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Navigation, MapPin, Loader2, Check } from 'lucide-react';

// Fix Leaflet's missing marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

// Controller to automatically center map when search result or location is selected
const MapFlyController = ({ center }: { center: L.LatLng | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 17);
    }
  }, [center, map]);
  return null;
};

const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
    locationfound(e) {
      // Auto-locate only if not set yet
      if (!position) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, 17);
      }
    }
  });

  useEffect(() => {
    if (!position) {
      map.locate();
    }
  }, []);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

export const MapPicker: React.FC<MapPickerProps> = ({ lat, lng, onChange }) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    (lat !== 0 && lng !== 0) && !isNaN(lat) && !isNaN(lng) ? new L.LatLng(lat, lng) : null
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');

  useEffect(() => {
    if (position) {
      onChange(position.lat, position.lng);
    }
  }, [position]);

  // Handle address geocoding search
  const handleSearchAddress = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchMsg('');
    setSearchResults([]);

    try {
      // OSM Nominatim works publicly and returns precise lat/lng
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SmaRtRw-AI-Applet-System'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setSearchResults(data);
        } else {
          setSearchMsg('Lokasi tidak ditemukan. Harap gunakan kata kunci lain (misalnya nama jalan, nama kota, atau nomor blok).');
        }
      } else {
        setSearchMsg('Gagal mencari alamat, silakan klik peta secara manual.');
      }
    } catch (err) {
      console.error("Nomitamin geocoding failed:", err);
      setSearchMsg('Koneksi pencarian terganggu, silakan tentukan langsung dengan mengetuk peta.');
    } finally {
      setSearching(false);
    }
  };

  // Run a high priority browser geolocation attempt with feedback
  const handleDetectGPS = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      alert("Browser Anda tidak mendukung deteksi lokasi langsung.");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
        setPosition(newCoords);
        setDetecting(false);
        alert(`Berhasil mengunci GPS! Akurasi sistem sekitar ~${pos.coords.accuracy.toFixed(0)} meter.`);
      },
      (err) => {
        console.warn("GPS lock error:", err);
        setDetecting(false);
        alert("Gagal mendeteksi koordinat otomatis (Sinyal lemah atau izin ditolak). Silakan cari alamat atau klik/geser pin langsung di peta.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="flex flex-col gap-2.5 font-sans">
      {/* Dynamic Geocoder Search & Manual Trigger Actions */}
      <div className="flex flex-col gap-2 bg-white dark:bg-slate-900 duration-150 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSearchAddress} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Jalan / Blok / Kelurahan (Contoh: Slipi Jakarta)"
              className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {searching && (
              <Loader2 className="absolute right-2.5 top-2 w-3.5 h-3.5 text-rose-500 animate-spin" />
            )}
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shrink-0 border-none transition-colors"
          >
            <Search className="w-3 h-3" />
            Cari
          </button>
        </form>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-2">
          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={detecting}
            className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider rounded-lg border-none transition-all active:scale-95 cursor-pointer max-w-max"
          >
            {detecting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-slate-950" />
                Mendeteksi GPS...
              </>
            ) : (
              <>
                <Navigation className="w-3 h-3 text-slate-950" />
                Deteksi GPS HP Saat Ini
              </>
            )}
          </button>
          
          <p className="text-[10px] text-right text-slate-400 dark:text-slate-500 italic max-w-[60%] shrink">
            Akurasi lebih terjamin di luar ruangan / dekat jendela.
          </p>
        </div>

        {/* Suggestion list */}
        {searchResults.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 p-2 max-h-[140px] overflow-y-auto space-y-1.5 shadow-inner mt-1">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight px-1">Hasil Pencarian Terdekat:</p>
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const newC = new L.LatLng(parseFloat(item.lat), parseFloat(item.lon));
                  setPosition(newC);
                  setSearchResults([]);
                  setSearchQuery(item.display_name.split(',')[0]);
                }}
                className="w-full text-left text-[11px] p-2 hover:bg-white dark:hover:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300 transition-colors flex items-start gap-1 cursor-pointer border-none"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2 leading-tight">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {searchMsg && (
          <p className="text-[10px] text-amber-600 font-medium px-1 leading-snug">{searchMsg}</p>
        )}
      </div>

      {/* Main Interactive Map Stage */}
      <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md relative z-0">
        <MapContainer
          center={position || [-6.1843, 106.7975]} 
          zoom={16}
          className="h-full w-full relative z-0"
          style={{ zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <MapFlyController center={position} />
        </MapContainer>
        
        {!position && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-rose-600/90 text-white px-3 py-1.5 rounded-full shadow-md text-[10px] font-black tracking-wide uppercase z-[1000] whitespace-nowrap animate-pulse">
            📍 Ketuk Peta atau Ketik Alamat Diatas!
          </div>
        )}
      </div>
    </div>
  );
};
