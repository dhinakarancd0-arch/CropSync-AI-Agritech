import React from 'react';
import type { Order } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CheckCircle2, Circle, Truck, MapPin, User, ShieldCheck, ChevronRight } from 'lucide-react';

interface OrderTrackingCardProps {
  order: Order;
  userRole?: 'FARMER' | 'BUYER' | 'CONSUMER' | 'ADMIN';
  onAdvanceStatus?: (orderId: number, currentStatus: string) => void;
  onConfirmDelivery?: (orderId: number) => void;
}

const STAGES = [
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'PICKUP', label: 'Pickup' },
  { id: 'COLLECTED', label: 'Collected' },
  { id: 'IN_TRANSIT', label: 'In Transit' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'PAYMENT', label: 'Payment' }
];

export default function OrderTrackingCard({
  order,
  userRole = 'FARMER',
  onAdvanceStatus,
  onConfirmDelivery
}: OrderTrackingCardProps) {
  // Normalize order status to stage index
  const getStageIndex = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'CREATED' || s === 'PENDING') return 0;
    if (s === 'CONFIRMED') return 0;
    if (s.includes('PICKUP')) return 1;
    if (s === 'COLLECTED') return 2;
    if (s === 'IN_TRANSIT') return 3;
    if (s === 'DELIVERED') return 4;
    if (s === 'PAYMENT_RELEASED' || s === 'PAID') return 5;
    return 3;
  };

  const currentIdx = getStageIndex(order.status);

  return (
    <div className="agri-card p-4 space-y-3.5 hover:border-slate-300 transition-colors">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-900">
            Order #ORD-{order.id}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold text-slate-800">
            {order.crop}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {order.quantity} kg
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-sm font-bold text-emerald-700">
            {formatCurrency(order.total || (order.price_per_kg * order.quantity))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`badge-status ${
            order.status === 'DELIVERED' || order.status === 'PAYMENT_RELEASED' ? 'badge-green' :
            order.status === 'IN_TRANSIT' ? 'badge-blue' : 'badge-amber'
          }`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Horizontal Timeline: Confirmed → Pickup → Collected → In Transit → Delivered → Payment */}
      <div className="py-2 px-1">
        <div className="flex items-center justify-between relative">
          {STAGES.map((stage, idx) => {
            const isDone = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center relative z-10 shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {isDone ? <CheckCircle2 size={13} /> : idx + 1}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                    isCurrent ? 'text-emerald-700 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {stage.label}
                  </span>
                </div>

                {idx < STAGES.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 -mt-4 transition-colors ${
                    idx < currentIdx ? 'bg-emerald-600' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 4 Compact Detail Cards Below (Uniform Height) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
        {/* Pickup Details */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 h-16 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Pickup Details
          </span>
          <div className="truncate">
            <p className="font-semibold text-slate-800 text-xs truncate leading-tight">
              {order.pickup_location || 'Pollachi Hub, TN'}
            </p>
            <p className="text-[11px] text-slate-500 truncate leading-tight">
              Packhouse Gate 2
            </p>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 h-16 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Delivery Details
          </span>
          <div className="truncate">
            <p className="font-semibold text-slate-800 text-xs truncate leading-tight">
              {order.delivery_location || 'Coimbatore Wholesale Hub'}
            </p>
            <p className="text-[11px] text-slate-500 truncate leading-tight">
              Cold storage berth
            </p>
          </div>
        </div>

        {/* Farmer Details */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 h-16 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Farmer Details
          </span>
          <div className="truncate">
            <p className="font-semibold text-slate-800 text-xs truncate leading-tight">
              {order.farmer_name || 'Naveen Kumar (FPO)'}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium truncate leading-tight">
              Aadhaar & FPO Verified
            </p>
          </div>
        </div>

        {/* Buyer Details */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 h-16 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
            Buyer Details
          </span>
          <div className="truncate">
            <p className="font-semibold text-slate-800 text-xs truncate leading-tight">
              {order.buyer_name || 'FreshMart Wholesale Ltd'}
            </p>
            <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 truncate leading-tight">
              <ShieldCheck size={11} className="shrink-0" /> {order.payment_status || 'Escrow Funded'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {(onAdvanceStatus || onConfirmDelivery) && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
          <span className="text-slate-400 text-[11px]">
            Created: {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Active'}
          </span>

          <div className="flex items-center gap-2">
            {userRole === 'FARMER' && onAdvanceStatus && currentIdx < STAGES.length - 1 && (
              <button
                onClick={() => onAdvanceStatus(order.id, order.status)}
                className="agri-btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <span>Advance to {STAGES[currentIdx + 1].label}</span>
                <ChevronRight size={13} />
              </button>
            )}

            {userRole === 'BUYER' && onConfirmDelivery && order.status === 'IN_TRANSIT' && (
              <button
                onClick={() => onConfirmDelivery(order.id)}
                className="agri-btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
              >
                <CheckCircle2 size={13} />
                <span>Verify Intake & Release Escrow</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
