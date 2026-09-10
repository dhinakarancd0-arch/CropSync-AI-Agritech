import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { produceService, offerService, orderService, marketService } from '../../services/api';
import type { ProduceListing, Offer, Order, MarketPrice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Package,
  Handshake,
  ShoppingCart,
  TrendingUp,
  Plus,
  ArrowRight,
  Check,
  X,
  ShieldCheck,
  Brain,
  Calendar,
  MapPin,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [listingsData, offersData, ordersData, pricesData] = await Promise.all([
        produceService.list().catch(() => []),
        offerService.list().catch(() => []),
        orderService.list().catch(() => []),
        marketService.getPrices().catch(() => [])
      ]);
      setListings(listingsData);
      setOffers(offersData);
      setOrders(ordersData);
      setMarketTrends(pricesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (id: number) => {
    try {
      await offerService.accept(id);
      toast.success('Offer accepted! Contract initiated.');
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to accept offer');
    }
  };

  const handleRejectOffer = async (id: number) => {
    try {
      await offerService.reject(id);
      toast.success('Offer declined.');
      loadData();
    } catch (err: any) {
      toast.error('Failed to reject offer');
    }
  };

  const myListings = listings.filter(l => l.farmer_id === user?.id);
  const pendingOffers = offers.filter(o => o.farmer_id === user?.id && o.status === 'PENDING');
  const myOrders = orders.filter(o => o.farmer_id === user?.id);

  return (
    <div className="space-y-4 w-full">
      {/* ============================================================
          TOP HEADER: Welcome + Location + Primary Action
          ============================================================ */}
      <div className="agri-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-tight">
              Good morning, {user?.full_name?.split(' ')[0] || 'Naveen'}
            </h1>
            {user?.is_verified && (
              <span className="badge-status badge-green text-xs py-0.5 px-2">
                <ShieldCheck size={13} /> Verified Producer
              </span>
            )}
          </div>
          <p className="text-[13.5px] text-slate-500 flex items-center gap-1.5 mt-0.5">
            <MapPin size={13} className="text-emerald-600 shrink-0" />
            <span>{user?.location || 'Coimbatore Cluster, Tamil Nadu'}</span>
            <span className="text-slate-300">•</span>
            <span>Direct access to 45+ bulk buyers & terminal mandis</span>
          </p>
        </div>

        <div>
          <Link to="/farmer/list-produce" className="agri-btn-primary">
            <Plus size={16} /> List Produce
          </Link>
        </div>
      </div>

      {/* ============================================================
          TODAY'S MARKET PRICE SNAPSHOT (4 Equal Cards)
          ============================================================ */}
      <div className="agri-card space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-600" />
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">
              Today's Market Price Snapshot
            </h3>
          </div>
          <Link to="/farmer/market-prices" className="text-xs font-semibold text-emerald-700 hover:underline">
            View All Prices →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Tomato */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-slate-900">Tomato</span>
              <span className="badge-status badge-green text-[11px] py-0 px-1.5">↑ 8%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">₹28<span className="text-xs font-normal text-slate-500">/kg</span></span>
              <span className="text-xs text-slate-600">Demand: <strong className="text-emerald-700 font-semibold">High</strong></span>
            </div>
          </div>

          {/* Onion */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-slate-900">Onion</span>
              <span className="badge-status badge-gray text-[11px] py-0 px-1.5">Stable</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">₹31<span className="text-xs font-normal text-slate-500">/kg</span></span>
              <span className="text-xs text-slate-600">Demand: <strong className="text-slate-700 font-semibold">Medium</strong></span>
            </div>
          </div>

          {/* Banana */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-slate-900">Banana</span>
              <span className="badge-status badge-green text-[11px] py-0 px-1.5">↑ 5%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">₹35<span className="text-xs font-normal text-slate-500">/kg</span></span>
              <span className="text-xs text-slate-600">Demand: <strong className="text-emerald-700 font-semibold">High</strong></span>
            </div>
          </div>

          {/* Coconut */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-slate-900">Coconut</span>
              <span className="badge-status badge-gray text-[11px] py-0 px-1.5">Stable</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">₹42<span className="text-xs font-normal text-slate-500">/kg</span></span>
              <span className="text-xs text-slate-600">Demand: <strong className="text-slate-700 font-semibold">Fair</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          2-COLUMN ROW 1: (LEFT 60% My Active Produce | RIGHT 40% AI Recommendation)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* LEFT 60%: My Active Produce Listings (lg:col-span-7) */}
        <div className="lg:col-span-7 agri-card h-full flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-emerald-600" />
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  My Active Produce Listings
                </h3>
              </div>
              <Link to="/farmer/produce" className="text-xs font-semibold text-emerald-700 hover:underline">
                Manage All ({myListings.length})
              </Link>
            </div>

            {myListings.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p>No active harvest lots listed.</p>
                <Link to="/farmer/list-produce" className="inline-block mt-1 font-bold text-emerald-700 hover:underline">
                  + List your first lot
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {myListings.slice(0, 4).map(item => (
                  <div key={item.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition flex items-center justify-between">
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{item.crop}</h4>
                        <span className="badge-status badge-gray text-[11px] py-0 px-1.5 shrink-0">
                          {item.quality_grade}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        {item.quantity} {item.unit} • {formatCurrency(item.min_price)}/{item.unit}
                      </p>
                    </div>
                    <span className={`badge-status text-[11px] shrink-0 ${
                      item.status === 'AVAILABLE' ? 'badge-green' : 'badge-blue'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 40%: AI Recommendation (lg:col-span-5) */}
        <div className="lg:col-span-5 agri-card h-full flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-emerald-600" />
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  AI Recommendation
                </h3>
              </div>
              <span className="badge-status badge-green text-[11px]">High Signal</span>
            </div>

            <p className="text-[13px] text-slate-700 leading-relaxed">
              "Tomato demand in Coimbatore and Pollachi is projected to rise <strong>+20.8% next week</strong>. Consider listing available stock early to capture forward contract premiums."
            </p>

            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center text-xs mt-3">
              <span className="text-emerald-900 font-medium text-[13px]">Projected Benchmark:</span>
              <strong className="text-emerald-800 text-sm font-bold">₹29 – ₹31 / kg</strong>
            </div>
          </div>

          <Link
            to="/farmer/insights"
            className="w-full agri-btn-secondary h-9 text-[13px] font-semibold justify-center mt-2"
          >
            View Demand Forecast →
          </Link>
        </div>
      </div>

      {/* ============================================================
          2-COLUMN ROW 2: (LEFT 60% New Buyer Offers | RIGHT 40% Upcoming Harvest)
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* LEFT 60%: New Buyer Offers (lg:col-span-7) */}
        <div className="lg:col-span-7 agri-card h-full flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <Handshake size={16} className="text-blue-600" />
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  New Buyer Offers
                </h3>
              </div>
              <span className="badge-status badge-blue text-[11px]">
                {pendingOffers.length} Pending
              </span>
            </div>

            {pendingOffers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                No new buyer offers waiting. When institutional buyers bid on your produce, they appear here.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingOffers.map(offer => (
                  <div key={offer.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs truncate">
                        <span className="text-slate-500">Buyer:</span>
                        <strong className="text-slate-900 font-semibold text-sm truncate">{offer.buyer_name || 'Verified Agro Buyer'}</strong>
                      </div>
                      <p className="text-[13px] text-slate-700 truncate">
                        <strong>{offer.quantity} kg</strong> {offer.crop} @ <strong className="text-emerald-700">{formatCurrency(offer.price_per_kg)}/kg</strong>
                      </p>
                      <p className="text-xs text-slate-500">
                        Total: {formatCurrency((offer.quantity || 0) * (offer.price_per_kg || 0))}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRejectOffer(offer.id)}
                        className="agri-btn-danger h-8 text-xs font-semibold px-2.5"
                      >
                        <X size={13} /> Decline
                      </button>
                      <button
                        onClick={() => handleAcceptOffer(offer.id)}
                        className="agri-btn-primary h-8 text-xs font-semibold px-3"
                      >
                        <Check size={13} /> Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 40%: Order Status (lg:col-span-5) */}
        <div className="lg:col-span-5 agri-card h-full flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-emerald-600" />
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  Confirmed Orders
                </h3>
              </div>
              <Link to="/farmer/orders" className="text-xs font-semibold text-emerald-700 hover:underline">
                View All ({myOrders.length})
              </Link>
            </div>

            {myOrders.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                No orders confirmed yet.
              </div>
            ) : (
              <div className="space-y-2">
                {myOrders.slice(0, 3).map(ord => (
                  <div key={ord.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Order #{ord.id}</p>
                      <p className="text-slate-500">{ord.quantity} kg • {formatCurrency(ord.total || (ord.quantity * ord.price_per_kg))}</p>
                    </div>
                    <span className="badge-status badge-green text-[11px]">
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/farmer/produce"
            className="w-full agri-btn-secondary h-9 text-[13px] font-semibold justify-center mt-2"
          >
            Manage Inventory & Harvests →
          </Link>
        </div>
      </div>
    </div>
  );
}
