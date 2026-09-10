import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { requirementService } from '../../services/api';
import type { BuyerRequirement } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Sparkles, MapPin, Calendar, ClipboardList, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuyerRequirements() {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      const data = await requirementService.list();
      setRequirements(data.filter(r => r.buyer_id === user?.id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load requirements');
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
            <ClipboardList size={20} className="text-emerald-600" />
            My Sourcing Requirements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast institutional procurement contracts and review AI-ranked farmer matches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRequirements}
            className="agri-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            to="/buyer/post-requirement"
            className="agri-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>+ Post Requirement</span>
          </Link>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 agri-card animate-pulse" />)}
        </div>
      ) : requirements.length === 0 ? (
        <div className="agri-card p-10 text-center text-slate-500 space-y-3">
          <AlertCircle className="mx-auto text-slate-400" size={36} />
          <div>
            <h3 className="text-sm font-bold text-slate-800">No active procurement requirements</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Publish your commodity specs, price ceiling, and delivery window to match with verified FPOs.
            </p>
          </div>
          <Link
            to="/buyer/post-requirement"
            className="agri-btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Post First Requirement
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requirements.map(req => (
            <div
              key={req.id}
              className="agri-card p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-bold text-slate-900">{req.crop}</h3>
                  <span className="badge-green text-[10px] px-2 py-0.5 rounded font-semibold">
                    {req.quality}
                  </span>
                  <span className="badge-status badge-blue text-[10px] px-2 py-0.5 rounded">
                    {req.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>Required: <strong className="text-slate-800">{req.quantity} kg</strong></span>
                  <span>Ceiling: <strong className="text-emerald-700 font-bold">{formatCurrency(req.max_price)}/kg</strong></span>
                  {req.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-emerald-600" /> {req.location}
                    </span>
                  )}
                  {req.delivery_deadline && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar size={12} /> By {new Date(req.delivery_deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {req.description && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-1">
                    {req.description}
                  </p>
                )}
              </div>

              <div className="shrink-0 self-end md:self-center">
                <Link
                  to={`/buyer/matches`}
                  className="agri-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
                >
                  <Sparkles size={13} /> Find Smart Matches
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
