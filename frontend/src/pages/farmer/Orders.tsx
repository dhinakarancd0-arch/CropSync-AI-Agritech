import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/api';
import type { Order } from '../../types';
import OrderTrackingCard from '../../components/OrderTrackingCard';
import { ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ORDER_STAGES = [
  'CONFIRMED',
  'PICKUP_SCHEDULED',
  'COLLECTED',
  'IN_TRANSIT',
  'DELIVERED',
  'PAYMENT_RELEASED'
];

export default function FarmerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.list();
      setOrders(data.filter(o => o.farmer_id === user?.id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (orderId: number, currentStatus: string) => {
    const s = currentStatus.toUpperCase();
    let nextStatus = 'IN_TRANSIT';
    if (s.includes('CONFIRM')) nextStatus = 'PICKUP_SCHEDULED';
    else if (s.includes('PICKUP')) nextStatus = 'COLLECTED';
    else if (s.includes('COLLECT')) nextStatus = 'IN_TRANSIT';
    else if (s.includes('TRANSIT')) nextStatus = 'DELIVERED';
    else if (s.includes('DELIVER')) nextStatus = 'PAYMENT_RELEASED';

    try {
      await orderService.updateStatus(orderId, nextStatus);
      toast.success(`Order #${orderId} progressed to ${nextStatus.replace('_', ' ')}`);
      loadOrders();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="agri-card p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag size={20} className="text-emerald-600" />
            Direct Contract Orders & Dispatches
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stage tracking across farm pickup, cold-chain transit, and escrow disbursement.
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
          {[1, 2, 3].map(i => <div key={i} className="h-40 agri-card animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="agri-card p-10 text-center text-slate-500">
          <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
          <h3 className="font-semibold text-slate-800 text-sm">No contract orders active</h3>
          <p className="text-xs text-slate-400 mt-1">
            Orders generated from accepted buyer offers will appear here with full lifecycle tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderTrackingCard
              key={order.id}
              order={order}
              userRole="FARMER"
              onAdvanceStatus={handleAdvanceStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
