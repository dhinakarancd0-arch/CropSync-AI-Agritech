import { useState, useEffect } from 'react';
import { requirementService, matchingService, offerService } from '../../services/api';
import type { BuyerRequirement, MatchResult } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { Sparkles, MapPin, ShieldCheck, Send, AlertCircle, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BuyerMatches() {
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<number | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Proposal modal state
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [proposalQty, setProposalQty] = useState<number>(1000);
  const [proposalPrice, setProposalPrice] = useState<number>(30);
  const [proposalMsg, setProposalMsg] = useState('');
  const [sendingProposal, setSendingProposal] = useState(false);

  useEffect(() => {
    loadRequirements();
  }, []);

  useEffect(() => {
    if (selectedReqId) {
      loadMatches(selectedReqId);
    }
  }, [selectedReqId]);

  const loadRequirements = async () => {
    try {
      const data = await requirementService.list();
      setRequirements(data);
      if (data.length > 0) {
        setSelectedReqId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load requirements');
    }
  };

  const loadMatches = async (reqId: number) => {
    try {
      setLoading(true);
      const res = await matchingService.getMatches(reqId);
      setMatches(res.matches || []);
    } catch (err) {
      console.error(err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProposal = (match: MatchResult) => {
    setSelectedMatch(match);
    setProposalQty(match.quantity);
    setProposalPrice(match.min_price);
    setProposalMsg(`Direct institutional contract proposal for ${match.crop} lot.`);
  };

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch || !selectedReqId) return;

    try {
      setSendingProposal(true);
      await offerService.create({
        requirement_id: selectedReqId,
        listing_id: selectedMatch.listing_id,
        farmer_id: selectedMatch.farmer_id,
        quantity: Number(proposalQty),
        price_per_kg: Number(proposalPrice),
        message: proposalMsg
      });
      toast.success('Direct contract proposal dispatched to farmer!');
      setSelectedMatch(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || 'Failed to dispatch proposal');
    } finally {
      setSendingProposal(false);
    }
  };

  const currentRequirement = requirements.find(r => r.id === selectedReqId);

  return (
    <div className="space-y-4 w-full">
      {/* Header Banner */}
      <div className="agri-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 mb-1.5">
            <Sparkles size={13} className="text-blue-600" />
            <span>Multi-Criteria Algorithmic Matchmaker</span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-tight">
            Smart Producer & Lot Matching
          </h1>
          <p className="text-[13.5px] text-slate-500 mt-1 leading-relaxed">
            Algorithmic scoring factoring proximity, grade specifications, price spread, and verified reliability.
          </p>
        </div>

        <span className="badge-status badge-blue text-xs self-start sm:self-auto py-1 px-2.5">
          {matches.length} Algorithmic Matches
        </span>
      </div>

      {/* TOP: Active Buyer Requirement Card */}
      <div className="agri-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Active Requirement:
            </label>
            <select
              value={selectedReqId || ''}
              onChange={(e) => setSelectedReqId(Number(e.target.value))}
              className="agri-select text-xs h-9 py-0"
            >
              {requirements.map(r => (
                <option key={r.id} value={r.id}>
                  Req #{r.id}: {r.crop} ({formatNumber(r.quantity)} kg • Max {formatCurrency(r.max_price)}/kg)
                </option>
              ))}
            </select>
          </div>

          {currentRequirement && (
            <div className="text-[13px] text-slate-500">
              Delivery Destination: <strong className="text-slate-800 font-semibold">{currentRequirement.location || 'Coimbatore Terminal Hub'}</strong>
            </div>
          )}
        </div>

        {currentRequirement && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 h-16 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Crop Requested</span>
              <strong className="text-sm text-slate-900 leading-tight">{currentRequirement.crop}</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 h-16 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Target Quantity</span>
              <strong className="text-sm text-slate-900 leading-tight">{formatNumber(currentRequirement.quantity)} kg</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 h-16 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Quality Grade</span>
              <strong className="text-sm text-slate-900 leading-tight">{currentRequirement.quality}</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 h-16 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-semibold uppercase block">Max Ceiling Price</span>
              <strong className="text-sm text-emerald-800 leading-tight">{formatCurrency(currentRequirement.max_price)} / kg</strong>
            </div>
          </div>
        )}
      </div>

      {/* BELOW: Ranked Best Matches in Compact Rows/Cards */}
      <div className="agri-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            Ranked Farmer Matches
          </h3>
          <span className="text-xs text-slate-500 font-medium">Ranked by SIH Match Score</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        ) : matches.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <AlertCircle className="mx-auto mb-1 text-slate-400" size={28} />
            <p className="font-bold text-slate-700 text-sm">No matching farmer lots found for this requirement</p>
            <p className="text-slate-400 mt-1 text-xs">Try adjusting maximum price ceiling or quality grade tolerances.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {matches.map(match => (
              <div
                key={match.listing_id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-500 transition-all duration-180 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                {/* Farmer & Location Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold flex flex-col items-center justify-center shrink-0">
                    <span className="text-sm leading-none font-black">{(match.match_score * 100).toFixed(0)}%</span>
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase mt-0.5">Match</span>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-semibold text-slate-900 truncate">{match.farmer_name}</h4>
                      <span className="badge-status badge-gray text-[11px] py-0.5 px-2">
                        {match.quality_grade}
                      </span>
                      {match.farmer_verified && (
                        <span className="badge-status badge-blue text-[11px] py-0.5 px-2 flex items-center gap-1">
                          <ShieldCheck size={11} /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 flex items-center gap-1.5 text-[12.5px] truncate">
                      <MapPin size={12} className="text-emerald-600 shrink-0" />
                      <span>{match.location}</span>
                      <span>•</span>
                      <span>{match.distance_km ? `${match.distance_km.toFixed(0)} km transit` : 'Local Hub'}</span>
                    </p>
                  </div>
                </div>

                {/* Lot Metrics & Action */}
                <div className="flex items-center gap-4 shrink-0 self-start md:self-auto justify-between w-full md:w-auto">
                  <div className="text-left md:text-right">
                    <span className="text-[14px] font-bold text-emerald-800 block">
                      {formatCurrency(match.min_price)} / kg
                    </span>
                    <span className="text-[12px] text-slate-500">
                      {formatNumber(match.quantity)} {match.unit} available
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenProposal(match)}
                    className="agri-btn-primary h-9 text-[13px] font-semibold px-3.5 gap-1.5"
                  >
                    <Send size={13} />
                    <span>Make Contract Offer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contract Proposal Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="agri-card max-w-md w-full p-5 shadow-xl space-y-4 border border-slate-200 modal-anim">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-[17px] font-bold text-slate-900">Direct Contract Proposal</h2>
                <p className="text-[13px] text-slate-500">{selectedMatch.crop} • Available: {formatNumber(selectedMatch.quantity)} {selectedMatch.unit}</p>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendProposal} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-slate-600 text-[12.5px]">
                <div className="flex justify-between">
                  <span>Producer:</span>
                  <strong className="text-slate-900">{selectedMatch.farmer_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Farmer Base Floor:</span>
                  <strong className="text-emerald-700">{formatCurrency(selectedMatch.min_price)}/kg</strong>
                </div>
                <div className="flex justify-between">
                  <span>Match Compatibility:</span>
                  <strong className="text-blue-700 font-bold">{(selectedMatch.match_score * 100).toFixed(0)}%</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">Contract Volume (kg)</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedMatch.quantity}
                    value={proposalQty}
                    onChange={(e) => setProposalQty(Number(e.target.value))}
                    required
                    className="agri-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">Offered Rate (₹/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={proposalPrice}
                    onChange={(e) => setProposalPrice(Number(e.target.value))}
                    required
                    className="agri-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1">Fulfillment Terms</label>
                <textarea
                  rows={2}
                  value={proposalMsg}
                  onChange={(e) => setProposalMsg(e.target.value)}
                  placeholder="Specify packaging requirements or delivery terms..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-[13px] text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center text-xs">
                <span className="text-emerald-900 font-medium text-[13px]">Total Contract Value:</span>
                <span className="text-emerald-800 font-black text-base">{formatCurrency(proposalQty * proposalPrice)}</span>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="flex-1 agri-btn-secondary h-10 text-[13px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingProposal}
                  className="flex-1 agri-btn-primary h-10 text-[13px] font-bold"
                >
                  {sendingProposal ? 'Dispatching...' : 'Dispatch Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
