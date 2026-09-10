import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for standard leaflet marker icons in React
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Stop {
  name: string;
  location?: string;
  lat: number;
  lng: number;
  quantity_kg?: number;
  type?: string;
  stop_number?: number;
}

interface LogisticsMapProps {
  stops: Stop[];
  destination: { name: string; lat: number; lng: number; location?: string };
  className?: string;
}

export default function LogisticsMap({ stops, destination, className = 'w-full h-[460px]' }: LogisticsMapProps) {
  // Center around Coimbatore region
  const centerLat = destination.lat || 11.0168;
  const centerLng = destination.lng || 76.9558;

  // Build coordinates array for polyline
  const polylineCoords: [number, number][] = stops
    .filter(s => s.lat && s.lng)
    .map(s => [s.lat, s.lng]);

  if (destination.lat && destination.lng) {
    polylineCoords.push([destination.lat, destination.lng]);
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden border border-slate-200 shadow-sm relative z-0`}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={9}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pickup Waypoint Markers */}
        {stops.map((stop, idx) => (
          <Marker
            key={idx}
            position={[stop.lat, stop.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <strong className="block text-slate-800">
                  Stop #{stop.stop_number || idx + 1}: {stop.name}
                </strong>
                <p className="text-slate-500">{stop.location || 'Farm packhouse'}</p>
                {stop.quantity_kg && (
                  <span className="font-semibold text-emerald-700 block">
                    Pickup: {stop.quantity_kg} kg
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Destination Warehouse Marker */}
        {destination.lat && destination.lng && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={destinationIcon}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <strong className="block text-rose-700 font-bold">
                  Final Destination Dropoff
                </strong>
                <p className="text-slate-700">{destination.name}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Optimized Route Polyline */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            color="#16a34a"
            weight={4}
            dashArray="6, 8"
          />
        )}
      </MapContainer>
    </div>
  );
}
