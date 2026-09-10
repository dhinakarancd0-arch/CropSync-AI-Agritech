import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { offerService } from '../../services/api';
import type { Offer } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Handshake, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuyerOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await offerService.list();
      setOffers(data.filter(o => o.buyer_id === user?.id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sent offers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="agri-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Handshake size={20} className="text-emerald-600" />
            My Sourcing Proposals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track acceptance, negotiation, and contract execution status for proposals sent to farmers.
          </p>
        </div>

        <button
          onClick={loadOffers}
          className="agri-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Offers List */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map(i => <div key={i} className="h-24 agri-card animate-pulse" />)}
        </div>
      ) : offers.length === 0 ? (
        <div className="agri-card p-10 text-center text-slate-500">
          <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
          <h3 className="font-semibold text-slate-800 text-sm">No proposals submitted yet</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse the marketplace or smart matches to send direct contract purchase offers.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {offers.map(offer => (
            <div
              key={offer.id}
              className="agri-card p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-sm text-slate-900">{offer.crop || 'Produce Contract'}</h3>
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
                  <span>Producer: <strong className="text-slate-800">{offer.farmer_name || 'Farmer Partner'}</strong></span>
                  <span>Quantity: <strong className="text-slate-800">{offer.quantity} kg</strong></span>
                  <span>Offered Rate: <strong className="text-emerald-700 font-bold">{formatCurrency(offer.price_per_kg)}/kg</strong></span>
                  <span>Commitment: <strong className="text-slate-900 font-bold">{formatCurrency((offer.quantity || 0) * (offer.price_per_kg || 0))}</strong></span>
                </div>

                {offer.message && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic mt-1">
                    "{offer.message}"
                  </p>
                )}
              </div>

              <div className="text-right text-xs text-slate-400 shrink-0">
                <span>Submitted</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
