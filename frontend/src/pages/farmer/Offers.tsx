import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { offerService } from '../../services/api';
import type { Offer } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Handshake, Check, X, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await offerService.list();
      setOffers(data.filter(o => o.farmer_id === user?.id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load received offers');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await offerService.accept(id);
      toast.success('Offer accepted! Binding contract generated.');
      loadOffers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to accept offer');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await offerService.reject(id);
      toast.success('Offer declined');
      loadOffers();
    } catch (err: any) {
      toast.error('Failed to reject offer');
    }
  };

  const filteredOffers = offers.filter(o => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="agri-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Handshake size={20} className="text-emerald-600" />
            Received Buyer Proposals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, accept or decline direct procurement offers from verified institutional buyers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  filter === tab ? 'bg-white text-slate-800 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={loadOffers}
            className="agri-btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 agri-card animate-pulse" />)}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="agri-card p-10 text-center text-slate-500">
          <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
          <h3 className="font-semibold text-slate-800 text-sm">
            No {filter !== 'ALL' ? filter.toLowerCase() : ''} proposals found
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Incoming direct purchase proposals from verified commercial buyers will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredOffers.map(offer => (
            <div
              key={offer.id}
              className="agri-card p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-sm text-slate-900">
                    {offer.crop || 'Produce Lot'}
                  </h3>
                  <span className={`badge-status ${
                    offer.status === 'ACCEPTED' ? 'badge-green' :
                    offer.status === 'REJECTED' ? 'badge-red' : 'badge-amber'
                  }`}>
                    {offer.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    #OFF-{offer.id}
                  </span>
                </div>

                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>Buyer: <strong className="text-slate-800">{offer.buyer_name || 'Verified Institution'}</strong></span>
                  <span>Quantity: <strong className="text-slate-800">{offer.quantity} kg</strong></span>
                  <span>Offered Rate: <strong className="text-emerald-700 font-bold">{formatCurrency(offer.price_per_kg)}/kg</strong></span>
                  <span>Total Value: <strong className="text-slate-900 font-bold">{formatCurrency((offer.quantity || 0) * (offer.price_per_kg || 0))}</strong></span>
                </div>

                {offer.message && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 flex items-start gap-1.5 mt-1">
                    <MessageSquare size={13} className="text-slate-400 shrink-0 mt-0.5" />
                    <span>"{offer.message}"</span>
                  </p>
                )}
              </div>

              {offer.status === 'PENDING' && (
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleReject(offer.id)}
                    className="agri-btn-danger text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <X size={13} /> Decline
                  </button>
                  <button
                    onClick={() => handleAccept(offer.id)}
                    className="agri-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1"
                  >
                    <Check size={13} /> Accept Contract
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
