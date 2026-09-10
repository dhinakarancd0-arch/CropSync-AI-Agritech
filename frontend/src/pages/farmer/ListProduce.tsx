import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { produceService } from '../../services/api';
import { Sprout, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const COMMON_CROPS = [
  'Tomato', 'Onion', 'Potato', 'Wheat', 'Basmati Rice', 'Cotton',
  'Soybean', 'Chili', 'Pomegranate', 'Banana', 'Grapes', 'Ginger', 'Turmeric'
];

export default function FarmerListProduce() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    crop: 'Tomato',
    quantity: 1000,
    unit: 'kg',
    quality_grade: 'Grade A',
    min_price: 25,
    location: 'Pollachi, Tamil Nadu',
    expected_harvest: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Fresh farm harvest, drip irrigated, sorted and packed in 25kg standard crates.',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    lat: 10.6609,
    lng: 77.0083
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await produceService.create({
        ...form,
        quantity: Number(form.quantity),
        min_price: Number(form.min_price),
        lat: Number(form.lat),
        lng: Number(form.lng),
      });
      toast.success('Produce lot published successfully to the National Marketplace!');
      navigate('/farmer/produce');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || 'Failed to publish produce lot');
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
            onClick={() => navigate('/farmer/produce')}
            className="agri-btn-secondary text-xs p-1.5"
            title="Back to produce"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sprout size={18} className="text-emerald-600" />
              List New Harvest Lot
            </h1>
            <p className="text-xs text-slate-500">
              Publish standing or harvested produce directly to verified commercial purchasers.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="agri-card p-5 space-y-5">
        {/* Section 1: Specifications */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-1.5">
            1. Crop & Quality Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Crop Commodity *</label>
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Quality Grade *</label>
              <select
                value={form.quality_grade}
                onChange={(e) => setForm({ ...form, quality_grade: e.target.value })}
                className="agri-select text-xs"
              >
                <option value="Grade A">Grade A (Premium Retail / Direct Export)</option>
                <option value="Grade B">Grade B (Standard Commercial)</option>
                <option value="Grade C">Grade C (Institutional / Processing)</option>
                <option value="Organic">Certified Organic (NPOP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Available Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Unit of Measure *</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="agri-select text-xs"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="quintal">Quintals (100 kg)</option>
                <option value="tonnes">Metric Tonnes (MT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Floor Price (₹/kg) *</label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={form.min_price}
                onChange={(e) => setForm({ ...form, min_price: Number(e.target.value) })}
                className="agri-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Logistics & Packhouse */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-1.5">
            2. Harvest Readiness & Farm Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Dispatch / Harvest Date</label>
              <input
                type="date"
                value={form.expected_harvest}
                onChange={(e) => setForm({ ...form, expected_harvest: e.target.value })}
                className="agri-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Packhouse / Pickup Location *</label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Pollachi Cluster, Coimbatore District, Tamil Nadu"
                className="agri-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Lot Notes & Post-Harvest Packaging</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detail grading criteria, moisture content, crate packaging..."
              className="agri-input text-xs py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Photo Reference URL</label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="agri-input text-xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => navigate('/farmer/produce')}
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
            <span>{submitting ? 'Publishing...' : 'Publish Produce Lot'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
