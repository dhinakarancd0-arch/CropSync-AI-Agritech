import { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle, TrendingUp, ShieldCheck, Scale, Truck, Layers } from 'lucide-react';

export default function SupplyChain() {
  const [crop, setCrop] = useState('Tomato');
  const [quantity, setQuantity] = useState(1000); // in kg

  const cropData: Record<string, { farmerOld: number; consumerOld: number; farmerNew: number; consumerNew: number; spoilageOld: number; spoilageNew: number }> = {
    Tomato: { farmerOld: 12, consumerOld: 45, farmerNew: 28, consumerNew: 36, spoilageOld: 28, spoilageNew: 4 },
    Onion: { farmerOld: 14, consumerOld: 40, farmerNew: 26, consumerNew: 32, spoilageOld: 22, spoilageNew: 3 },
    Potato: { farmerOld: 10, consumerOld: 30, farmerNew: 18, consumerNew: 24, spoilageOld: 15, spoilageNew: 2 },
    Banana: { farmerOld: 16, consumerOld: 48, farmerNew: 32, consumerNew: 38, spoilageOld: 24, spoilageNew: 3 },
    Coconut: { farmerOld: 22, consumerOld: 55, farmerNew: 38, consumerNew: 46, spoilageOld: 12, spoilageNew: 1.5 },
    Carrot: { farmerOld: 18, consumerOld: 52, farmerNew: 34, consumerNew: 42, spoilageOld: 20, spoilageNew: 2.5 },
  };

  const current = cropData[crop] || cropData.Tomato;

  const traditionalFarmerTotal = current.farmerOld * quantity;
  const traditionalConsumerTotal = current.consumerOld * quantity;
  const traditionalMiddlemanCut = traditionalConsumerTotal - traditionalFarmerTotal;
  const traditionalSpoilageKg = (quantity * current.spoilageOld) / 100;

  const agriDirectFarmerTotal = current.farmerNew * quantity;
  const agriDirectConsumerTotal = current.consumerNew * quantity;
  const farmerGain = agriDirectFarmerTotal - traditionalFarmerTotal;
  const consumerSavings = traditionalConsumerTotal - agriDirectConsumerTotal;
  const agriDirectSpoilageKg = (quantity * current.spoilageNew) / 100;

  return (
    <div className="space-y-4 w-full">
      {/* Header Banner */}
      <div className="agri-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mb-1">
            <ShieldCheck size={13} className="text-emerald-600" /> SIH Problem Statement 26033
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Supply Chain Disintermediation & Value Realization
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analyzing how eliminating unnecessary intermediation layers improves grower realization while reducing consumer prices.
          </p>
        </div>
      </div>

      {/* Interactive Value Simulation Calculator */}
      <div className="agri-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Interactive Value Shift Calculator</h2>
            <p className="text-xs text-slate-500 mt-0.5">Simulate economic margin transfers based on lot volume</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Crop</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Tomato">Tomato</option>
                <option value="Onion">Onion</option>
                <option value="Potato">Potato</option>
                <option value="Banana">Banana</option>
                <option value="Coconut">Coconut</option>
                <option value="Carrot">Carrot</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Batch Weight (kg)</label>
              <input
                type="number"
                min="100"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TRADITIONAL COLUMN */}
          <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Fragmented Supply Chain
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">Conventional Mandi System</h3>
              </div>
              <span className="text-xs font-bold text-rose-600">5-7 Intermediaries</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-600">Farmer Received Price:</span>
                <span className="font-bold text-slate-900">₹{current.farmerOld}/kg (₹{traditionalFarmerTotal.toLocaleString('en-IN')})</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-600">Consumer Paid Price:</span>
                <span className="font-bold text-slate-900">₹{current.consumerOld}/kg (₹{traditionalConsumerTotal.toLocaleString('en-IN')})</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                <span className="text-rose-800 font-semibold">Margin Loss to Middlemen:</span>
                <span className="font-extrabold text-rose-700">₹{traditionalMiddlemanCut.toLocaleString('en-IN')} ({(traditionalMiddlemanCut / traditionalConsumerTotal * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-600">Post-Harvest Spoilage Losses:</span>
                <span className="font-bold text-rose-600">{current.spoilageOld}% ({traditionalSpoilageKg.toFixed(0)} kg)</span>
              </div>
            </div>
          </div>

          {/* AGRIDIRECT COLUMN */}
          <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Coordinated Platform
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">AgriDirect Direct Model</h3>
              </div>
              <span className="text-xs font-bold text-emerald-700">Direct Contract</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-600">Farmer Fair Price:</span>
                <span className="font-bold text-emerald-800">₹{current.farmerNew}/kg (₹{agriDirectFarmerTotal.toLocaleString('en-IN')})</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-600">Consumer Direct Price:</span>
                <span className="font-bold text-slate-900">₹{current.consumerNew}/kg (₹{agriDirectConsumerTotal.toLocaleString('en-IN')})</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-emerald-800 font-semibold">Net Extra Farmer Realization:</span>
                <span className="font-extrabold text-emerald-700">+₹{farmerGain.toLocaleString('en-IN')} (+{((farmerGain / traditionalFarmerTotal) * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-600">Reduced Post-Harvest Spoilage:</span>
                <span className="font-bold text-emerald-700">{current.spoilageNew}% ({agriDirectSpoilageKg.toFixed(0)} kg)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Outcome Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-emerald-600 shrink-0" />
            <span className="text-slate-700">
              For this <strong>{quantity.toLocaleString('en-IN')} kg {crop}</strong> batch, farmers earn <strong className="text-emerald-700 font-bold">+₹{farmerGain.toLocaleString('en-IN')}</strong> extra while consumers save <strong className="text-blue-700 font-bold">₹{consumerSavings.toLocaleString('en-IN')}</strong>.
            </span>
          </div>
          <span className="text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 shrink-0">
            Win-Win Disintermediation
          </span>
        </div>
      </div>
    </div>
  );
}
