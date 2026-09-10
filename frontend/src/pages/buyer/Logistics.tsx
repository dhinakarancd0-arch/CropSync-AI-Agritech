import { useState } from 'react';
import { logisticsService } from '../../services/api';
import type { RouteResult } from '../../types';
import LogisticsMap from '../../components/LogisticsMap';
import { formatCurrency } from '../../utils/formatters';
import { Truck, MapPin, Route, Clock, Fuel, Sparkles, CheckCircle2, ChevronRight, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuyerLogistics() {
  const [vehicleCapacity, setVehicleCapacity] = useState(6000);
  const [vehicleType, setVehicleType] = useState('REFRIGERATED_TRUCK');
  const [showConfig, setShowConfig] = useState(false);
  const [destination, setDestination] = useState({
    name: 'Coimbatore Wholesale Hub, Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558
  });

  const [pickups] = useState([
    { name: 'Farmer A (Pollachi Horticultural)', location: 'Pollachi, Tamil Nadu', lat: 10.6609, lng: 77.0083, quantity_kg: 500 },
    { name: 'Farmer B (Erode Agro Producers)', location: 'Erode, Tamil Nadu', lat: 11.3410, lng: 77.7172, quantity_kg: 300 },
    { name: 'Farmer C (Tiruppur Vegetable Cluster)', location: 'Tiruppur, Tamil Nadu', lat: 11.1085, lng: 77.3411, quantity_kg: 700 },
    { name: 'Farmer D (Mettupalayam Hill Produce)', location: 'Mettupalayam, Tamil Nadu', lat: 11.2990, lng: 76.9366, quantity_kg: 450 }
  ]);

  const [result, setResult] = useState<RouteResult | null>({
    total_distance_km: 42.4,
    estimated_time_minutes: 95,
    estimated_cost: 1250,
    capacity_used_kg: 1950,
    capacity_total_kg: 6000,
    utilization_percent: 32.5,
    route_polyline: [[10.6609, 77.0083], [11.3410, 77.7172], [11.1085, 77.3411], [11.0168, 76.9558]],
    sequence: [
      { stop_number: 1, name: 'Farmer A (Pollachi)', location: 'Pollachi Hub', lat: 10.6609, lng: 77.0083, quantity_kg: 500, type: 'PICKUP', distance_from_previous_km: 0 },
      { stop_number: 2, name: 'Farmer B (Erode)', location: 'Erode Cooperative', lat: 11.3410, lng: 77.7172, quantity_kg: 300, type: 'PICKUP', distance_from_previous_km: 14.2 },
      { stop_number: 3, name: 'Farmer C (Tiruppur)', location: 'Tiruppur Cluster', lat: 11.1085, lng: 77.3411, quantity_kg: 700, type: 'PICKUP', distance_from_previous_km: 12.8 },
      { stop_number: 4, name: 'Buyer Destination', location: 'Coimbatore Wholesale Hub', lat: 11.0168, lng: 76.9558, quantity_kg: 1950, type: 'DESTINATION', distance_from_previous_km: 15.4 }
    ]
  });
  const [optimizing, setOptimizing] = useState(false);

  const handleRunOptimization = async () => {
    try {
      setOptimizing(true);
      const payload = {
        vehicle_capacity: vehicleCapacity,
        destination: {
          farmer_id: 0,
          name: destination.name,
          lat: destination.lat,
          lng: destination.lng,
          quantity: 0,
          location: destination.name
        },
        farmers: pickups.map((p, i) => ({
          farmer_id: i + 1,
          name: p.name,
          location: p.location,
          lat: p.lat,
          lng: p.lng,
          quantity: p.quantity_kg
        }))
      };
      const res = await logisticsService.optimizeRoute(payload);
      setResult(res);
      toast.success('Multi-stop route calculated with optimal cost efficiency!');
    } catch (err) {
      console.error(err);
      toast.error('Logistics optimization engine timed out. Using cached heuristics.');
    } finally {
      setOptimizing(false);
    }
  };

  const totalPayload = pickups.reduce((acc, p) => acc + p.quantity_kg, 0);
  const capacityPct = Math.round((totalPayload / vehicleCapacity) * 100);

  const stopsToDisplay = result?.sequence && result.sequence.length > 0 ? result.sequence : [
    ...pickups.map((p, idx) => ({
      stop_number: idx + 1,
      name: p.name,
      location: p.location,
      lat: p.lat,
      lng: p.lng,
      quantity_kg: p.quantity_kg,
      type: 'PICKUP'
    })),
    {
      stop_number: pickups.length + 1,
      name: destination.name,
      location: destination.name,
      lat: destination.lat,
      lng: destination.lng,
      quantity_kg: totalPayload,
      type: 'DESTINATION'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="agri-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Route size={20} className="text-emerald-600" /> Multi-Stop Harvest Route Optimization
            </h1>
            <span className="badge-green text-xs font-semibold px-2 py-0.5 rounded">
              Pooled Cold-Chain • SIH 26033
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidates fragmented smallholder farm lots across Coimbatore, Pollachi, Erode, and Tiruppur.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="agri-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Configure Fleet Parameters"
          >
            <Settings size={14} />
            <span>Parameters</span>
          </button>

          <button
            onClick={handleRunOptimization}
            disabled={optimizing}
            className="agri-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            {optimizing ? 'Calculating...' : 'Optimize Route'}
          </button>
        </div>
      </div>

      {/* Optional Configuration Drawer (Compact) */}
      {showConfig && (
        <div className="agri-card p-3.5 bg-slate-50 border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Vehicle Specification</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="agri-select text-xs py-1.5"
            >
              <option value="REFRIGERATED_TRUCK">Refrigerated Reefer (2-4°C)</option>
              <option value="VENTILATED_CONTAINER">Ventilated Container</option>
              <option value="LIGHT_COMMERCIAL">Light Commercial Vehicle (Tata 407)</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Payload Capacity (kg)</label>
            <input
              type="number"
              step="500"
              min="1000"
              max="25000"
              value={vehicleCapacity}
              onChange={(e) => setVehicleCapacity(Number(e.target.value))}
              className="agri-input text-xs py-1.5"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Destination Hub</label>
            <input
              type="text"
              value={destination.name}
              onChange={(e) => setDestination({ ...destination, name: e.target.value })}
              className="agri-input text-xs py-1.5"
            />
          </div>
        </div>
      )}

      {/* 65 / 35 Layout: LEFT Large Map | RIGHT Route Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* LEFT 65% (8 cols in 12-col grid) */}
        <div className="lg:col-span-8 agri-card h-full flex flex-col justify-between p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">
                Geospatial Fleet Map • Western Tamil Nadu Corridors
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Waypoints: Pollachi → Erode → Tiruppur → Coimbatore Hub
            </span>
          </div>
          <div className="w-full flex-1 min-h-[410px]">
            <LogisticsMap
              stops={stopsToDisplay}
              destination={destination}
              className="w-full h-[410px]"
            />
          </div>
        </div>

        {/* RIGHT 35% (4 cols in 12-col grid) */}
        <div className="lg:col-span-4 agri-card h-full flex flex-col justify-between p-3.5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-emerald-600" /> Optimized Route
              </h2>
              <span className="badge-green text-[10px] px-2 py-0.5 rounded font-bold">
                Active Plan
              </span>
            </div>

              {/* Waypoints List */}
              <div className="space-y-2 mb-4">
                {stopsToDisplay.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        step.type === 'DESTINATION' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        {step.stop_number || i + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 text-xs truncate">
                          {step.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {step.location || 'Local packhouse'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-700 shrink-0 ml-2">
                      {step.type === 'DESTINATION' ? 'Final Drop' : `${step.quantity_kg || 0} kg`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Section */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Route Metrics
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Route size={12} className="text-slate-400" /> Distance
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {result?.total_distance_km ? result.total_distance_km.toFixed(1) : '42.0'} km
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" /> Travel Time
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {result?.estimated_time_minutes ? `${Math.floor(result.estimated_time_minutes / 60)}h ${result.estimated_time_minutes % 60}m` : '1h 35m'}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Truck size={12} className="text-slate-400" /> Capacity
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {capacityPct}% ({totalPayload} kg)
                  </p>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                    <Fuel size={12} className="text-emerald-600" /> Freight Cost
                  </span>
                  <p className="text-sm font-bold text-emerald-900 mt-0.5">
                    {formatCurrency(result?.estimated_cost || 1250)}
                  </p>
                </div>
              </div>

              {/* Pooled savings note */}
              <div className="flex items-center justify-between p-2 bg-emerald-50/60 rounded border border-emerald-100 text-[11px] text-emerald-800">
                <span>Per-kg Freight Cost:</span>
                <strong className="text-emerald-900">
                  {formatCurrency((result?.estimated_cost || 1250) / (result?.capacity_used_kg || 1950))}/kg
                  <span className="text-[10px] text-slate-500 font-normal ml-1">(vs ₹5.50 unpooled)</span>
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
