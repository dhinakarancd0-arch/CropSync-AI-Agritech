import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { requirementService, offerService, orderService, produceService, marketService } from '../../services/api';
import type { BuyerRequirement, Offer, Order, ProduceListing, MarketPrice } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  FileText,
  Handshake,
  ShoppingCart,
  Truck,
  Plus,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recommendedListings, setRecommendedListings] = useState<ProduceListing[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqs, offList, ordList, prodList, prices] = await Promise.all([
        requirementService.list().catch(() => []),
        offerService.list().catch(() => []),
        orderService.list().catch(() => []),
        produceService.list().catch(() => []),
        marketService.getPrices().catch(() => [])
      ]);
      setRequirements(reqs.filter(r => r.buyer_id === user?.id));
      setOffers(offList.filter(o => o.buyer_id === user?.id));
      setOrders(ordList.filter(o => o.buyer_id === user?.id));
      setRecommendedListings(prodList.slice(0, 4));
      setMarketPrices(prices.slice(0, 4));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalProcuredVolume = orders.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  return (
    <div className="space-y-4 w-full">
      {/* ============================================================
          TOP HEADER: Company Name + Verification + Primary Action
          ============================================================ */}
      <div className="agri-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-tight">
              {user?.full_name || 'FreshMart Wholesale'}
            </h1>
            <span className="badge-status badge-blue text-xs py-0.5 px-2">
              <ShieldCheck size={13} /> GST Verified Buyer
            </span>
          </div>
          <p className="text-[13.5px] text-slate-500 flex items-center gap-1.5 mt-0.5">
            <MapPin size={13} className="text-emerald-600 shrink-0" />
            <span>{user?.location || 'Coimbatore Terminal Hub, Tamil Nadu'}</span>
            <span className="text-slate-300">•</span>
            <span>Direct procurement network linked with regional FPO collectives</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/buyer/post-requirement" className="agri-btn-primary">
            <Plus size={16} /> Post Requirement
          </Link>
          <Link to="/buyer/marketplace" className="agri-btn-secondary">
            Find Produce
          </Link>
        </div>
      </div>

      {/* ============================================================
          KPI ROW: 4 Equal Cards (Active Demands, Offers, Volume, Transit)
          ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="agri-card flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Demands</span>
            <FileText size={16} className="text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{requirements.length}</div>
            <p className="text-xs text-slate-500 mt-1">Live procurement postings</p>
          </div>
        </div>

        <div className="agri-card flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Offers</span>
            <Handshake size={16} className="text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{offers.length}</div>
            <p className="text-xs text-slate-500 mt-1">Direct producer bids</p>
          </div>
        </div>

        <div className="agri-card flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Procured</span>
            <ShoppingCart size={16} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{formatNumber(totalProcuredVolume)} kg</div>
            <p className="text-xs text-slate-500 mt-1">From verified farm gates</p>
          </div>
        </div>

        <div className="agri-card flex flex-col justify-between h-24">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Active Transit</span>
            <Truck size={16} className="text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-none">
              {orders.filter(o => o.status !== 'DELIVERED').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">TSP optimized dispatches</p>
          </div>
        </div>
      </div>

      {/* ============================================================
          2-COLUMN SPLIT: Active Requirements (LEFT) | Recommended Farmers (RIGHT)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
        {/* LEFT: Active Sourcing Requirements */}
        <div className="agri-card h-full flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-600" />
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  Active Sourcing Requirements
                </h3>
              </div>
              <Link to="/buyer/requirements" className="text-xs font-semibold text-blue-700 hover:underline">
                Manage ({requirements.length})
              </Link>
            </div>

            {requirements.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p>No active sourcing requirements.</p>
                <Link to="/buyer/post-requirement" className="inline-block mt-1 font-bold text-blue-700 hover:underline">
                  + Post a bulk requirement
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {requirements.slice(0, 3).map(r => (
                  <div key={r.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{r.crop}</h4>
                        <span className="badge-status badge-gray text-[11px] py-0.5 px-2 shrink-0">
                          Grade {r.quality}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        Req #{r.id} • {formatNumber(r.quantity)} kg required
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-slate-900 block">
                        Max {formatCurrency(r.max_price)}/kg
                      </span>
                      <Link to={`/buyer/matches`} className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1 mt-0.5">
                        Find Matches <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Algorithmic matching active</span>
            <Link to="/buyer/requirements" className="font-semibold text-slate-700 hover:text-emerald-700">
              View All Requirements →
            </Link>
          </div>
        </div>

        {/* RIGHT: Recommended Produce Lots Nearby */}
        <div className="agri-card h-full flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600" />
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  Recommended Produce Lots
                </h3>
              </div>
              <Link to="/buyer/marketplace" className="text-xs font-semibold text-emerald-700 hover:underline">
                Marketplace →
              </Link>
            </div>

            <div className="space-y-2">
              {recommendedListings.map(item => (
                <div key={item.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition flex items-center justify-between">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{item.crop}</h4>
                      <span className="badge-status badge-green text-[11px] py-0.5 px-2 shrink-0">
                        {item.quality_grade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate flex items-center gap-1">
                      <MapPin size={11} className="text-emerald-600 shrink-0" />
                      <span>{item.location || 'Pollachi Hub'}</span>
                      <span>•</span>
                      <span>{formatNumber(item.quantity)} {item.unit} lot</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-emerald-800 block">
                      {formatCurrency(item.min_price)} / kg
                    </span>
                    <Link to="/buyer/marketplace" className="agri-btn-sm agri-btn-secondary mt-1">
                      Inspect Lot
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pre-screened farm lots</span>
            <Link to="/buyer/marketplace" className="font-semibold text-slate-700 hover:text-emerald-700">
              Browse 40+ Lots →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
