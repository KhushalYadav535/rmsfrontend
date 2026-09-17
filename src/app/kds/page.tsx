'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  Flame,
  Volume2,
} from 'lucide-react';

export default function KDSPage() {
  const { currentOutlet } = useAuth();
  const [kots, setKots] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOutlet) {
      loadKots();
    }
  }, [currentOutlet]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewKot = (data: any) => {
      loadKots();
    };

    const handleKotStatus = (data: any) => {
      loadKots();
    };

    socket.on('kot:created', handleNewKot);
    socket.on('kot:status_updated', handleKotStatus);

    return () => {
      socket.off('kot:created', handleNewKot);
      socket.off('kot:status_updated', handleKotStatus);
    };
  }, []);

  const loadKots = async () => {
    if (!currentOutlet) return;
    setLoading(false);
    const res = await fetchApi(`/kot?outletId=${currentOutlet.id}`);
    if (res.success && res.kots) {
      setKots(res.kots);
    }
  };

  const handleUpdateStatus = async (kotId: string, status: string) => {
    const res = await fetchApi(`/kot/${kotId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      loadKots();
    }
  };

  const filteredKots = kots.filter((k) => {
    if (selectedStation === 'ALL') return true;
    return k.stationId === selectedStation;
  });

  const getElapsedTime = (createdAt: string) => {
    const elapsedMinutes = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / 60000
    );
    return Math.max(1, elapsedMinutes);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-amber-500" />
              <span>Kitchen Display System (KDS)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live prep orders & SLA tracking for {currentOutlet?.name}
            </p>
          </div>

          {/* Kitchen Station Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto bg-slate-100 p-1 rounded-xl">
            {['ALL', 'PENDING', 'PREPARING', 'READY'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStation(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedStation === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'ALL'
                  ? 'All Stations'
                  : st === 'PENDING'
                  ? '⏳ New Orders'
                  : st === 'PREPARING'
                  ? '🔥 Cooking'
                  : '✅ Ready to Serve'}
              </button>
            ))}
          </div>
        </div>

        {/* KDS Cards Grid */}
        {filteredKots.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
            <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Kitchen is Clear!</h3>
            <p className="text-xs text-slate-400 mt-1">
              No pending food orders at this station. New tickets will chime automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredKots.map((kot) => {
              const elapsed = getElapsedTime(kot.createdAt);
              const isUrgent = elapsed > 15;

              return (
                <div
                  key={kot.id}
                  className={`bg-white border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all ${
                    kot.status === 'READY'
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : isUrgent
                      ? 'border-rose-300 bg-rose-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Header: Table, Order # and Elapsed Timer */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-base font-black text-slate-900">
                          {kot.order?.table
                            ? `Table ${kot.order.table.tableNumber}`
                            : kot.order?.orderType}
                        </span>
                        <div className="text-[11px] font-semibold text-slate-400">
                          Order #{kot.order?.orderNumber} • KOT #{kot.kotNumber}
                        </div>
                      </div>

                      {/* Timer Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                          isUrgent
                            ? 'bg-rose-100 text-rose-700 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsed}m ago</span>
                      </span>
                    </div>

                    {/* Order Items List */}
                    <div className="py-3 space-y-2">
                      {kot.items.map((item: any) => (
                        <div key={item.id} className="text-xs">
                          <div className="flex items-baseline justify-between font-bold text-slate-800">
                            <span className="truncate pr-2">
                              {item.orderItem?.menuItem?.name || 'Dish'}
                            </span>
                            <span className="text-amber-600 font-mono text-sm shrink-0">
                              x {item.quantity}
                            </span>
                          </div>

                          {item.orderItem?.modifiers &&
                            item.orderItem.modifiers.length > 0 && (
                              <p className="text-[10px] text-slate-400">
                                {item.orderItem.modifiers
                                  .map((m: any) => m.name)
                                  .join(', ')}
                              </p>
                            )}
                        </div>
                      ))}

                      {kot.notes && (
                        <div className="p-2 bg-amber-50 rounded-xl text-[11px] font-medium text-amber-900 border border-amber-200 mt-2">
                          Note: {kot.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons based on KOT status */}
                  <div className="pt-3 border-t border-slate-100">
                    {kot.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(kot.id, 'PREPARING')}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {kot.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(kot.id, 'READY')}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Food Ready</span>
                      </button>
                    )}

                    {kot.status === 'READY' && (
                      <button
                        onClick={() => handleUpdateStatus(kot.id, 'SERVED')}
                        className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mark Served</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
