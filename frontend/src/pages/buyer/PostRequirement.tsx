import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requirementService } from '../../services/api';
import { FileText, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const COMMON_CROPS = [
  'Tomato', 'Onion', 'Potato', 'Wheat', 'Basmati Rice', 'Cotton',
  'Soybean', 'Chili', 'Pomegranate', 'Banana', 'Grapes', 'Ginger', 'Turmeric'
];

export default function BuyerPostRequirement() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    crop: 'Tomato',
    quantity: 2000,
    quality: 'Grade A',
    max_price: 32,
    location: 'Coimbatore Wholesale Hub, Tamil Nadu',
    delivery_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Require firm, undamaged harvest lots suitable for retail distribution. Clean crates preferred.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await requirementService.create({
        ...form,
        quantity: Number(form.quantity),
        max_price: Number(form.max_price),
      });
      toast.success('Procurement demand broadcasted successfully!');
      navigate('/buyer/requirements');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || 'Failed to post requirement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="agri-card p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/buyer/requirements')}
            className="agri-btn-secondary text-xs p-1.5"
            title="Back to requirements"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-emerald-600" />
              Post Bulk Sourcing Requirement
            </h1>
            <p className="text-xs text-slate-500">
              Publish institutional demand to instantly discover verified farm producers matching your specs.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="agri-card p-5 space-y-5">
        {/* Section 1: Specifications */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-1.5">
            1. Procurement Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Commodity / Crop *</label>
              <select
                value={form.crop}
                onChange={(e) => setForm({ ...form, crop: e.target.value })}
                className="agri-select text-xs"
              >
                {COMMON_CROPS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Quality Grade Expected *</label>
              <select
                value={form.quality}
                onChange={(e) => setForm({ ...form, quality: e.target.value })}
                className="agri-select text-xs"
              >
                <option value="Grade A">Grade A (Premium Retail)</option>
                <option value="Grade B">Grade B (Commercial / Processing)</option>
                <option value="Grade C">Grade C (Industrial / Bulk)</option>
                <option value="Organic">Certified Organic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Required Volume (kg) *</label>
              <input
                type="number"
                min="100"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Ceiling Price (₹/kg max) *</label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={form.max_price}
                onChange={(e) => setForm({ ...form, max_price: Number(e.target.value) })}
                className="agri-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Logistics */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-1.5">
            2. Logistics & Delivery Target
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Delivery Deadline *</label>
              <input
                type="date"
                required
                value={form.delivery_deadline}
                onChange={(e) => setForm({ ...form, delivery_deadline: e.target.value })}
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Warehouse / Destination *</label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Coimbatore Wholesale Hub, Tamil Nadu"
                className="agri-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Packaging & Testing Guidelines</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Specify acceptance moisture percentage, sorting standards, or pallet size..."
              className="agri-input text-xs py-2"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => navigate('/buyer/requirements')}
            className="agri-btn-secondary text-xs py-2 px-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="agri-btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
          >
            <Send size={14} />
            <span>{submitting ? 'Publishing...' : 'Broadcast Requirement & Run AI Matching'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
