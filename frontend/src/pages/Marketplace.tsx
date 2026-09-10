import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import { produceService, offerService } from '../services/api';
import type { ProduceListing } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { Search, Filter, ShieldCheck, MapPin, Send, AlertCircle, ShoppingBag, ArrowRight, Check, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Marketplace() {
  const { user } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(200);

  // Offer modal state
  const [activeListing, setActiveListing] = useState<ProduceListing | null>(null);
  const [offerQty, setOfferQty] = useState<number>(100);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveListing(null);
      }
    };
    if (activeListing) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeListing]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await produceService.list();
      setListings(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOfferModal = (listing: ProduceListing) => {
    if (!user) {
      toast.error('Please sign in to place an offer or direct order');
      return;
    }
    setActiveListing(listing);
    setOfferQty(Math.min(100, listing.quantity));
    setOfferPrice(listing.min_price);
    setOfferMessage(`Direct purchase contract inquiry for ${listing.crop} lot.`);
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListing || !user) return;

    try {
      setSubmittingOffer(true);
      await offerService.create({
        listing_id: activeListing.id,
        farmer_id: activeListing.farmer_id,
        quantity: Number(offerQty),
        price_per_kg: Number(offerPrice),
        message: offerMessage
      });
      toast.success('Direct purchase proposal dispatched to grower!');
      setActiveListing(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || 'Failed to submit proposal');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const crops = ['ALL', ...Array.from(new Set(listings.map(l => l.crop).filter(Boolean)))];
  const locations = ['ALL', ...Array.from(new Set(listings.map(l => l.location).filter(Boolean)))];

  const filteredListings = listings.filter(l => {
    const matchesSearch = l.crop.toLowerCase().includes(search.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(search.toLowerCase())) ||
      (l.location && l.location.toLowerCase().includes(search.toLowerCase()));
    const matchesCrop = selectedCrop === 'ALL' || l.crop === selectedCrop;
    const matchesGrade = selectedGrade === 'ALL' || l.quality_grade === selectedGrade;
    const matchesLocation = selectedLocation === 'ALL' || l.location === selectedLocation;
    const matchesPrice = l.min_price <= maxPrice;
    return matchesSearch && matchesCrop && matchesGrade && matchesLocation && matchesPrice;
  });

  return (
    <div className="space-y-4 w-full">
      {/* Header Banner */}
      <div className="agri-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mb-1">
            <ShieldCheck size={12} className="text-emerald-600" /> Direct Farm Origin Lots
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Agricultural Produce Marketplace
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Source graded lots directly from verified farmers and FPOs with transparent floor pricing.
          </p>
        </div>

        <span className="badge-status badge-gray text-xs self-start sm:self-auto">
          {filteredListings.length} Active Lots
        </span>
      </div>

      {/* Filter Bar */}
      <div className="agri-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by crop, variety, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="agri-input w-full pl-8 text-xs"
            />
          </div>

          <div>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="agri-select w-full text-xs"
            >
              {crops.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Crops' : c}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="agri-select w-full text-xs"
            >
              <option value="ALL">All Quality Grades</option>
              <option value="Grade A">Grade A (Premium)</option>
              <option value="Grade B">Grade B (Standard)</option>
              <option value="Grade C">Grade C (Bulk)</option>
              <option value="Organic">Certified Organic</option>
            </select>
          </div>

          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="agri-select w-full text-xs"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc === 'ALL' ? 'All Locations' : loc}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 flex items-center gap-1 text-xs">
              <Filter size={13} className="text-slate-500" /> Max Price: {formatCurrency(maxPrice)}/kg
            </span>
            <input
              type="range"
              min={10}
              max={300}
              step={5}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-emerald-600 cursor-pointer w-28 sm:w-44"
            />
          </div>
          <span className="text-[11px] text-slate-500">
            Showing <strong>{filteredListings.length}</strong> matching crops
          </span>
        </div>
      </div>

      {/* Produce Grid (3-4 cards per row, equal height h-[360px]) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="agri-card h-[360px] animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="agri-card p-12 text-center text-slate-500">
          <AlertCircle className="mx-auto mb-2 text-slate-400" size={32} />
          <h3 className="text-sm font-bold text-slate-800">No matching harvest lots found</h3>
          <p className="text-xs mt-0.5">Try resetting search filters or increasing price ceiling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredListings.map(listing => (
            <div
              key={listing.id}
              className="agri-card p-0 overflow-hidden flex flex-col justify-between h-[360px]"
            >
              <div>
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img
                    src={listing.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                    alt={listing.crop}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    <span className="bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs border border-slate-200">
                      {listing.quality_grade}
                    </span>
                    {listing.farmer_verified && (
                      <span className="badge-status badge-green text-[10px] shadow-xs">
                        <Check size={10} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {formatNumber(listing.quantity)} {listing.unit}
                  </div>
                </div>

                <div className="p-3.5 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate">{listing.crop}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={11} className="text-emerald-600 shrink-0" /> {listing.location || 'Tamil Nadu'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-base font-extrabold text-slate-900">{formatCurrency(listing.min_price)}</span>
                      <span className="text-[10px] text-slate-500">/kg</span>
                    </div>
                  </div>

                  {listing.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>
                  )}

                  <div className="text-[11px] bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center justify-between text-slate-600">
                    <span className="truncate">Grower: <strong className="text-slate-800 font-medium">{listing.farmer_name || 'Farmer Partner'}</strong></span>
                    {listing.expected_harvest && (
                      <span className="text-emerald-700 font-medium shrink-0 ml-1">Ready: {new Date(listing.expected_harvest).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 pt-0">
                <button
                  type="button"
                  onClick={() => handleOpenOfferModal(listing)}
                  className="w-full agri-btn-primary h-8 text-xs font-semibold cursor-pointer relative z-10"
                >
                  <Send size={12} />
                  {user?.role === 'BUYER' ? 'Make Direct Offer' : 'Negotiate / Order'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Contract Proposal Modal */}
      {activeListing && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-anim"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.50)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveListing(null);
          }}
        >
          <div
            className="w-full max-w-[540px] bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 modal-anim space-y-5 my-auto max-h-[95vh] overflow-y-auto"
            style={{ width: 'min(540px, calc(100vw - 24px))' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contract-modal-title"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
                  <FileText size={20} className="text-emerald-700" />
                </div>
                <div>
                  <h2 id="contract-modal-title" className="text-[20px] sm:text-[21px] font-bold text-slate-900 tracking-tight leading-snug">
                    Direct Contract Proposal
                  </h2>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    Create a purchase offer for this producer lot.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveListing(null)}
                aria-label="Close modal"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitOffer} className="space-y-5">
              {/* Product Summary Card */}
              <div className="bg-[#f0fdf4]/80 border border-[#bbf7d0] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[16px] font-bold text-slate-900 tracking-wide uppercase">
                    {activeListing.crop}
                  </span>
                  <span className="text-[12.5px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-200/70 shrink-0">
                    Available: {formatNumber(activeListing.quantity)} {activeListing.unit}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-emerald-100/90 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11.5px] block font-medium">Producer</span>
                    <strong className="text-slate-900 font-semibold text-[13px] block mt-0.5 truncate" title={activeListing.farmer_name || 'Farmer Partner'}>
                      {activeListing.farmer_name || 'Farmer Partner'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11.5px] block font-medium">Quality</span>
                    <strong className="text-slate-900 font-semibold text-[13px] block mt-0.5">
                      {activeListing.quality_grade || 'Standard'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11.5px] block font-medium">Floor Price</span>
                    <strong className="text-emerald-700 font-bold text-[13px] block mt-0.5">
                      {formatCurrency(activeListing.min_price)}/kg
                    </strong>
                  </div>
                </div>
              </div>

              {/* Offer Details Section */}
              <div className="space-y-2.5">
                <div className="text-[11.5px] font-bold tracking-wider text-slate-400 uppercase">
                  OFFER DETAILS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="modal-offer-qty" className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      QUANTITY ({activeListing.unit.toUpperCase()})
                    </label>
                    <input
                      id="modal-offer-qty"
                      type="number"
                      min="1"
                      max={activeListing.quantity}
                      value={offerQty || ''}
                      onChange={(e) => setOfferQty(Number(e.target.value))}
                      required
                      placeholder={`Max ${formatNumber(activeListing.quantity)}`}
                      className="w-full h-[46px] px-3.5 text-[14px] text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label htmlFor="modal-offer-rate" className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                      OFFERED RATE (₹ / KG)
                    </label>
                    <input
                      id="modal-offer-rate"
                      type="number"
                      step="0.5"
                      min="1"
                      value={offerPrice || ''}
                      onChange={(e) => setOfferPrice(Number(e.target.value))}
                      required
                      placeholder={`Floor ${formatCurrency(activeListing.min_price)}`}
                      className="w-full h-[46px] px-3.5 text-[14px] text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Inline Floor Price Warning */}
                {offerPrice > 0 && offerPrice < activeListing.min_price && (
                  <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200/90 rounded-lg text-[12px] text-amber-900 animate-in fade-in duration-150">
                    <AlertCircle size={15} className="text-amber-600 shrink-0" />
                    <span>
                      Offer is below the producer's floor price of <strong>{formatCurrency(activeListing.min_price)}/kg</strong>.
                    </span>
                  </div>
                )}
              </div>

              {/* Logistics & Notes */}
              <div className="space-y-1.5">
                <label htmlFor="modal-offer-notes" className="block text-[11.5px] font-bold tracking-wider text-slate-400 uppercase">
                  LOGISTICS & NOTES
                </label>
                <textarea
                  id="modal-offer-notes"
                  rows={2}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="Add pickup, delivery, timing or contract notes..."
                  className="w-full min-h-[76px] p-3 text-[13.5px] text-slate-900 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none transition-all resize-y shadow-xs"
                />
              </div>

              {/* Contract Total Card */}
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[12.5px] font-semibold text-emerald-950 block">
                    Contract Commitment
                  </span>
                  <span className="text-[11.5px] text-emerald-700/90 mt-0.5 block font-medium">
                    {formatNumber(offerQty || 0)} {activeListing.unit} × {formatCurrency(offerPrice || 0)}/kg
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[20px] sm:text-[22px] font-bold text-emerald-800 tracking-tight block">
                    {formatCurrency((offerQty || 0) * (offerPrice || 0))}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveListing(null)}
                  className="flex-1 h-[46px] px-4 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold text-[13.5px] hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-xs flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="flex-1 h-[46px] px-4 rounded-lg bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  {submittingOffer ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <span>Dispatch Offer</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
