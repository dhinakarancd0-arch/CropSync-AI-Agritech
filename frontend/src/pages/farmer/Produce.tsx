import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { produceService } from '../../services/api';
import type { ProduceListing } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Plus, MapPin, Trash2, Sprout, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerProduce() {
  const { user } = useAuth();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await produceService.list();
      setListings(data.filter(l => l.farmer_id === user?.id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your produce lots');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this produce listing?')) return;
    try {
      await produceService.delete(id);
      toast.success('Produce listing removed');
      loadListings();
    } catch (err) {
      toast.error('Failed to delete listing');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="agri-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sprout size={20} className="text-emerald-600" />
            My Active Produce Listings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your standing harvest lots, pricing floors, and stock availability across mandis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadListings}
            className="agri-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            to="/farmer/list-produce"
            className="agri-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>+ List Harvest Lot</span>
          </Link>
        </div>
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="agri-card h-[340px] animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="agri-card p-10 text-center text-slate-500 space-y-3">
          <AlertCircle className="mx-auto text-slate-400" size={36} />
          <div>
            <h3 className="text-sm font-bold text-slate-800">No active produce listings</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Start publishing your harvest lots to receive direct proposals from verified buyers.
            </p>
          </div>
          <Link
            to="/farmer/list-produce"
            className="agri-btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Create First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {listings.map(item => (
            <div
              key={item.id}
              className="agri-card h-[340px] flex flex-col justify-between overflow-hidden hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                    alt={item.crop}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 badge-green text-[10px] px-2 py-0.5 rounded shadow-sm font-semibold">
                    {item.quality_grade}
                  </span>
                  <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
                    {item.quantity} {item.unit}
                  </span>
                </div>

                <div className="p-3 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.crop}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-emerald-600" /> {item.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-700">
                        {formatCurrency(item.min_price)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/kg floor</span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                <span className="badge-green text-[10px] px-2 py-0.5 rounded">
                  {item.status}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="agri-btn-danger text-[11px] py-1 px-2.5 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
