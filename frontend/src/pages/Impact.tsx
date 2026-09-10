import { TrendingUp, Users, Leaf, ShieldAlert, Award, HeartHandshake, CheckCircle2, ShieldCheck, Scale, ArrowUpRight } from 'lucide-react';

export default function Impact() {
  return (
    <div className="space-y-4 w-full">
      {/* Header Banner */}
      <div className="agri-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 mb-1">
            <Award size={13} className="text-emerald-600" /> SIH Problem Statement 26033 Impact Mission
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Measurable Agricultural Prosperity & Fair Value
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical outcomes from eliminating fragmented broker networks across Coimbatore and western Tamil Nadu
          </p>
        </div>
      </div>

      {/* Impact KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-3xl font-black text-emerald-700">
            +38<span className="text-emerald-600 text-lg">%</span>
          </div>
          <h3 className="font-bold text-xs text-slate-900 pt-1">Farmer Value Realization</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Higher net earnings per kg compared to local commission mandi bids</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-3xl font-black text-blue-700">
            -72<span className="text-blue-600 text-lg">%</span>
          </div>
          <h3 className="font-bold text-xs text-slate-900 pt-1">Post-Harvest Spoilage</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Direct farm dispatch cuts rotting from multi-day mandi delays</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-3xl font-black text-purple-700">
            1,200<span className="text-purple-600 text-lg">+</span>
          </div>
          <h3 className="font-bold text-xs text-slate-900 pt-1">Growers & FPO Members</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Active across Coimbatore, Pollachi, Erode, Tiruppur clusters</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-3xl font-black text-amber-700">
            -28<span className="text-amber-600 text-lg">%</span>
          </div>
          <h3 className="font-bold text-xs text-slate-900 pt-1">Logistics Deadheading</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">TSP aggregation achieves higher capacity and lower fuel burn</p>
        </div>
      </div>

      {/* Structural Realities: Legacy Mandi vs AgriDirect Platform */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Transforming Ground Realities</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comparing legacy commission mandi pipelines against the direct digital model</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">For Farmers & FPOs</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Guaranteed floor price prior to harvest dispatch</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero arbitrary commission agent deductions</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Direct bank account credit within 24 hours of weighing</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">For Institutional Buyers</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-blue-600 shrink-0 mt-0.5" />
                <span>Certified quality grading verified at harvest</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-blue-600 shrink-0 mt-0.5" />
                <span>Consolidated multi-farmer truck aggregation</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-blue-600 shrink-0 mt-0.5" />
                <span>Traceable provenance direct to farmer Aadhaar</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">For Consumers & Market</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-purple-600 shrink-0 mt-0.5" />
                <span>15-20% lower retail prices for fresher produce</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-purple-600 shrink-0 mt-0.5" />
                <span>Substantially lower post-harvest food waste</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-purple-600 shrink-0 mt-0.5" />
                <span>Transparent national agricultural trade data</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
