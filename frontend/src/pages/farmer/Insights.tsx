import { useState, useEffect } from 'react';
import { forecastService } from '../../services/api';
import type { Forecast } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { Sparkles, TrendingUp, Calendar, Lightbulb, Brain, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function FarmerInsights() {
  const [crop, setCrop] = useState('Tomato');
  const [location, setLocation] = useState('Coimbatore');
  const [period, setPeriod] = useState(14);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadForecast();
  }, [crop, location, period]);

  const loadForecast = async () => {
    try {
      setLoading(true);
      const data = await forecastService.getForecast(crop, location, period);
      setForecast(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = forecast
    ? [...(forecast.historical || []), ...(forecast.forecast || [])]
    : [];

  return (
    <div className="space-y-4 w-full">
      {/* Header Banner */}
      <div className="agri-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mb-1">
            <Brain size={12} className="text-emerald-600" /> Machine Learning Decision Core
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            AI Demand & Price Trajectory Insights
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive modeling factoring seasonal consumption, regional arrivals, and wholesale demand velocity.
          </p>
        </div>

        <span className="badge-status badge-green text-xs self-start sm:self-auto">
          Multi-variable Linear Regression
        </span>
      </div>

      {/* Filter Bar */}
      <div className="agri-card flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2.5 items-center">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Commodity</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="agri-select text-xs h-8 py-0"
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
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Trading Hub</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="agri-select text-xs h-8 py-0"
            >
              <option value="Coimbatore">Coimbatore Hub</option>
              <option value="Pollachi">Pollachi Cluster</option>
              <option value="Erode">Erode Mandi</option>
              <option value="Tiruppur">Tiruppur Market</option>
              <option value="Mettupalayam">Mettupalayam Foothills</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Forecast Window</label>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="agri-select text-xs h-8 py-0"
            >
              <option value={7}>Next 7 Days</option>
              <option value={14}>Next 14 Days</option>
              <option value={30}>Next 30 Days</option>
            </select>
          </div>
        </div>

        {forecast && (
          <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold">
            <span>Trend: <strong>{forecast.trend}</strong></span>
            <span className="text-emerald-300">•</span>
            <span>Confidence: <strong>{(forecast.confidence * 100).toFixed(0)}%</strong></span>
          </div>
        )}
      </div>

      {/* LEFT 65% Demand Forecast Chart | RIGHT 35% AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* LEFT 65%: Chart (lg:col-span-8) */}
        <div className="lg:col-span-8 agri-card h-full flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp size={14} className="text-emerald-600" />
                {crop} Demand & Price Index: {location}
              </h3>
              <span className="text-[11px] text-slate-400">Past Actuals + Forward Forecast</span>
            </div>

            <div className="h-60 w-full pt-1">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Computing regression trajectory...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px' }}
                      formatter={(val: any) => [`${val} Index`, 'Demand Score']}
                    />
                    <Area type="monotone" dataKey="demand" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#chartGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT 35%: AI Recommendation Card (lg:col-span-4) */}
        <div className="lg:col-span-4 agri-card h-full flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <Lightbulb size={15} className="text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  AI Recommendation
                </h3>
              </div>
              <span className="badge-status badge-green text-[10px]">Actionable</span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-slate-800 leading-relaxed">
              <p className="font-semibold text-emerald-900 mb-1">Harvest Timing Advisory:</p>
              {forecast?.explanation || `"Demand for ${crop} in ${location} is on an upward trajectory. Forward contract your standing crop to capture premium wholesale realization."`}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 mt-2.5">
              <div className="flex justify-between p-2 bg-slate-50 rounded-md border border-slate-100">
                <span>Optimal Harvest Window:</span>
                <strong className="text-slate-800">Next 4 – 7 Days</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-md border border-slate-100">
                <span>Recommended Action:</span>
                <strong className="text-emerald-700">List in Marketplace</strong>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Updated based on TN Mandi arrivals
          </div>
        </div>
      </div>

      {/* BELOW: 4 Key Metrics Cards (Current Demand, Predicted Demand, Demand Trend, Confidence) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="agri-card flex flex-col justify-between h-20">
          <span className="text-[11px] font-semibold text-slate-500">Current Demand</span>
          <div className="text-xl font-extrabold text-slate-900">
            {formatNumber(forecast?.current_demand || 1200)} <span className="text-xs font-normal text-slate-500">kg/day</span>
          </div>
        </div>

        <div className="agri-card flex flex-col justify-between h-20">
          <span className="text-[11px] font-semibold text-slate-500">Predicted Demand</span>
          <div className="text-xl font-extrabold text-emerald-700">
            {formatNumber(forecast?.predicted_demand || 1450)} <span className="text-xs font-normal text-slate-500">kg/day</span>
          </div>
        </div>

        <div className="agri-card flex flex-col justify-between h-20">
          <span className="text-[11px] font-semibold text-slate-500">Demand Trend</span>
          <div className="text-xl font-extrabold text-slate-900">
            {forecast?.trend || 'HIGH EXPANSION'}
          </div>
        </div>

        <div className="agri-card flex flex-col justify-between h-20">
          <span className="text-[11px] font-semibold text-slate-500">Algorithm Confidence</span>
          <div className="text-xl font-extrabold text-blue-700">
            {forecast ? `${(forecast.confidence * 100).toFixed(0)}%` : '92%'}
          </div>
        </div>
      </div>
    </div>
  );
}
