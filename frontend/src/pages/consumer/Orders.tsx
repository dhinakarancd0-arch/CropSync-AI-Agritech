import { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import type { Order } from '../../types';
import OrderTrackingCard from '../../components/OrderTrackingCard';
import { Package, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConsumerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.list();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="agri-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package size={20} className="text-emerald-600" />
            My Farm-Direct Deliveries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track fresh harvest dispatches from local Tamil Nadu growers directly to your doorstep.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="agri-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-40 agri-card animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="agri-card p-10 text-center text-slate-500">
          <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
          <h3 className="font-semibold text-slate-800 text-sm">No farm-direct orders placed yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Browse fresh local harvest produce in Consumer Market to place direct orders.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderTrackingCard
              key={order.id}
              order={order}
              userRole="CONSUMER"
            />
          ))}
        </div>
      )}
    </div>
  );
}
