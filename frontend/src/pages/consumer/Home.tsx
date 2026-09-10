import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { produceService } from '../../services/api';
import type { ProduceListing } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  ShoppingCart,
  ShieldCheck,
  MapPin,
  Search,
  Check,
  Heart,
  SlidersHorizontal,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const categories = ['All Produce', 'Vegetables', 'Fruits', 'Organic Lots', 'Exotics & Roots'];

export default function ConsumerHome() {
  const [products, setProducts] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Produce');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadProducts();
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const saved = localStorage.getItem('agridirect_cart');
    if (saved) {
      try {
        const items = JSON.parse(saved);
        setCartCount(items.reduce((acc: number, item: any) => acc + item.quantity, 0));
      } catch (e) {}
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await produceService.list();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: ProduceListing) => {
    const saved = localStorage.getItem('agridirect_cart');
    let items = saved ? JSON.parse(saved) : [];
    const existingIndex = items.findIndex((i: any) => i.id === item.id);
    if (existingIndex > -1) {
      items[existingIndex].quantity += 1;
    } else {
      items.push({
        id: item.id,
        crop: item.crop,
        farmer_name: item.farmer_name,
        min_price: item.min_price,
        unit: 'kg',
        quantity: 1,
        image_url: item.image_url,
        farmer_id: item.farmer_id
      });
    }
    localStorage.setItem('agridirect_cart', JSON.stringify(items));
    toast.success(`Added 1 kg of ${item.crop} to your basket!`);
    updateCartCount();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          Boolean(p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory === 'All Produce') return matchesSearch;
    if (selectedCategory === 'Fruits') {
      return matchesSearch && ['Banana', 'Coconut', 'Apple', 'Mango'].some(c => p.crop.includes(c));
    }
    if (selectedCategory === 'Vegetables') {
      return matchesSearch && ['Tomato', 'Onion', 'Potato', 'Carrot', 'Cabbage'].some(c => p.crop.includes(c));
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ============================================================
          CONSUMER MARKETPLACE HERO & SEARCH
          ============================================================ */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
            <Sparkles size={13} /> Farm-to-Kitchen Direct Traceability
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Harvested yesterday, at your table today.
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            Zero middleman markups, zero cold-storage holding fees. 100% transparent prices paid directly to regional farmers.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex flex-col gap-3 min-w-[240px]">
          <div className="flex items-center justify-between text-xs text-emerald-100">
            <span>Your Farm Basket:</span>
            <span className="font-bold text-white">{cartCount} items</span>
          </div>
          <Link
            to="/consumer/cart"
            className="w-full bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-xs transition"
          >
            <ShoppingCart size={15} /> Checkout Basket ({cartCount})
          </Link>
        </div>
      </div>

      {/* ============================================================
          SEARCH & CATEGORIES BAR
          ============================================================ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search farm fresh produce (e.g. Tomatoes, Pollachi Bananas, Carrots)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Categories:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================
          FRESH TODAY PRODUCE GRID WITH LARGE PRODUCT IMAGERY
          ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Fresh Today From Regional Farms</h2>
            <p className="text-xs text-slate-500">Graded produce batches dispatched from verified farmer collectives</p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Showing {filteredProducts.length} lots
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-72 animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            No produce matched your search query. Try another term or reset categories.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map(item => (
              <div
                key={item.id}
                className="agri-card p-0 overflow-hidden flex flex-col justify-between h-[340px]"
              >
                <div>
                  {/* Fixed Aspect Ratio Image */}
                  <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'}
                      alt={item.crop}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-white/95 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs border border-slate-200">
                      {item.quality_grade}
                    </span>
                    {item.farmer_verified && (
                      <span className="absolute top-2 right-2 badge-status badge-green text-[10px] shadow-xs">
                        <Check size={10} /> Verified
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-3.5 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{item.crop}</h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                          <MapPin size={10} className="text-emerald-600 shrink-0" /> {item.location || 'Tamil Nadu'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-slate-900">{formatCurrency(item.min_price)}</span>
                        <span className="text-[10px] text-slate-500">/kg</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description || 'Direct harvest packaged in hygienic protective crates.'}
                    </p>

                    <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-100">
                      Grower: <strong className="text-slate-700 font-medium">{item.farmer_name || 'Kisan Collective'}</strong>
                    </div>
                  </div>
                </div>

                {/* Add to Basket Action */}
                <div className="p-3 pt-0">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full agri-btn-primary h-8 text-xs font-semibold"
                  >
                    <ShoppingCart size={13} /> Add to Basket
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
