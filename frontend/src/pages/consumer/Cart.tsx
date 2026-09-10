import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/api';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { ShoppingCart, Trash2, Plus, Minus, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface CartItem {
  id: number;
  crop: string;
  farmer_name?: string;
  farmer_id: number;
  min_price: number;
  quantity: number;
  image_url?: string;
}

export default function ConsumerCart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState('Flat 402, Green Meadows Apt, Coimbatore - 641001');
  const [paymentMethod, setPaymentMethod] = useState('UPI_ESCROW');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const saved = localStorage.getItem('agridirect_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {}
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    const updated = items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setItems(updated);
    localStorage.setItem('agridirect_cart', JSON.stringify(updated));
  };

  const removeItem = (id: number) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    localStorage.setItem('agridirect_cart', JSON.stringify(updated));
    toast.success('Item removed from basket');
  };

  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.min_price || 0) * curr.quantity), 0);
  const deliveryFee = items.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in as a consumer to complete purchase');
      navigate('/login');
      return;
    }
    if (items.length === 0) return;

    try {
      setSubmitting(true);
      for (const item of items) {
        await orderService.create({
          farmer_id: item.farmer_id,
          crop: item.crop,
          quantity: item.quantity,
          price_per_kg: item.min_price,
          delivery_location: address,
        });
      }
      localStorage.removeItem('agridirect_cart');
      setItems([]);
      toast.success('Order confirmed directly with farmer collective!');
      navigate('/consumer/orders');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="agri-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/consumer" className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Your Fresh Farm Basket</h1>
            <p className="text-xs text-slate-500">Review farm-direct produce and confirm order delivery</p>
          </div>
        </div>
        <span className="badge-status badge-green text-xs">
          {items.length} unique items
        </span>
      </div>

      {items.length === 0 ? (
        <div className="agri-card p-12 text-center text-slate-500 space-y-3">
          <ShoppingCart className="mx-auto text-slate-300" size={44} />
          <div>
            <h3 className="font-bold text-base text-slate-800">Your basket is empty</h3>
            <p className="text-xs text-slate-400 mt-0.5">Explore fresh harvest lots listed directly by farmers</p>
          </div>
          <Link to="/consumer" className="agri-btn-primary inline-flex">
            Browse Products <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* LEFT 65%: Cart Items List (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-2.5">
            {items.map(item => (
              <div
                key={item.id}
                className="agri-card flex items-center justify-between gap-3 h-20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                    alt={item.crop}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{item.crop}</h3>
                    <p className="text-[11px] text-slate-500 truncate">Producer: {item.farmer_name || 'Farmer Partner'}</p>
                    <span className="text-xs font-bold text-emerald-700">{formatCurrency(item.min_price)} / kg</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 text-xs">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-2 py-1 hover:bg-slate-200 text-slate-600 transition"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="px-2 font-bold text-slate-800 text-xs">{item.quantity} kg</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-2 py-1 hover:bg-slate-200 text-slate-600 transition"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  <span className="font-bold text-slate-900 text-xs sm:text-sm w-16 text-right">
                    {formatCurrency(Number(item.min_price || 0) * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 transition p-1"
                    title="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT 35%: Order Summary & Checkout (lg:col-span-4) */}
          <div className="lg:col-span-4 agri-card space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
              Order Summary
            </h3>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Farm Produce Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cold-Chain Delivery:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Middleman Intermediation Fee:</span>
                <span>₹0 (Direct Model)</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-emerald-800 font-extrabold text-base">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Delivery Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Payment Mode */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Payment Gateway</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="agri-select w-full text-xs"
              >
                <option value="UPI_ESCROW">UPI (Google Pay / PhonePe Escrow)</option>
                <option value="NETBANKING">Direct Net Banking</option>
                <option value="COD">Cash on Verified Delivery</option>
              </select>
            </div>

            <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5 text-[11px]">
              <ShieldCheck size={13} className="shrink-0 text-emerald-600" />
              <span>Escrow locked: released to farmer upon door delivery</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full agri-btn-primary h-10 text-xs font-bold shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Confirming Order...' : `Place Direct Order (${formatCurrency(total)})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
