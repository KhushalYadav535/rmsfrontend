'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  Bike,
  Sparkles,
  CheckCircle2,
  Clock,
  Phone,
  Store,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Play,
  RotateCw,
  ShoppingBag,
} from 'lucide-react';

export default function AggregatorsPage() {
  const { currentOutlet } = useAuth();
  const [statusData, setStatusData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (currentOutlet) {
      loadAggregatorsData();
    }
  }, [currentOutlet]);

  const loadAggregatorsData = async () => {
    if (!currentOutlet) return;
    setLoading(true);
    const [statRes, ordRes] = await Promise.all([
      fetchApi(`/aggregators/status?outletId=${currentOutlet.id}`),
      fetchApi(`/aggregators/orders?outletId=${currentOutlet.id}`),
    ]);

    if (statRes.success) setStatusData(statRes);
    if (ordRes.success) setOrders(ordRes.orders || []);
    setLoading(false);
  };

  const handleToggleStore = async (platform: 'zomato' | 'swiggy', currentVal: boolean) => {
    const res = await fetchApi('/aggregators/status', {
      method: 'POST',
      body: { platform, isOnline: !currentVal },
    });
    if (res.success) {
      loadAggregatorsData();
    }
  };

  const handleSimulateOrder = async (platform: 'ZOMATO' | 'SWIGGY') => {
    if (!currentOutlet) return;
    setSimulating(true);

    const testCustomers = [
      { name: 'Kavita Menon', phone: '9819922334', address: 'B-14, Park View Apts' },
      { name: 'Sameer Sheikh', phone: '9871100223', address: 'Flat 402, Royal Residency' },
      { name: 'Priya Narang', phone: '9910022334', address: 'Plot 88, Gomti Greens' },
    ];
    const picked = testCustomers[Math.floor(Math.random() * testCustomers.length)];

    const res = await fetch(`http://localhost:5000/api/aggregators/webhook/${platform}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outletId: currentOutlet.id,
        customerName: picked.name,
        customerPhone: picked.phone,
        deliveryAddress: picked.address,
        specialInstructions: 'Please deliver hot, extra green chutney requested.',
      }),
    });

    const data = await res.json();
    if (data.success) {
      loadAggregatorsData();
    } else {
      alert(`Simulation error: ${data.error}`);
    }
    setSimulating(false);
  };

  const handleUpdateRider = async (orderId: string, nextStatus: string) => {
    const res = await fetchApi(`/aggregators/orders/${orderId}/rider`, {
      method: 'PATCH',
      body: { status: nextStatus },
    });
    if (res.success) {
      loadAggregatorsData();
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                Phase 4 — Aggregators
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Zomato & Swiggy Central Hub</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Bike className="w-6 h-6 text-red-500" /> Online Food Delivery Integrations
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSimulateOrder('ZOMATO')}
              disabled={simulating}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" /> Simulate Zomato Order
            </button>
            <button
              onClick={() => handleSimulateOrder('SWIGGY')}
              disabled={simulating}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" /> Simulate Swiggy Order
            </button>
            <button
              onClick={loadAggregatorsData}
              className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Channel Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zomato Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      Z
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Zomato Online Ordering</h2>
                      <p className="text-xs text-slate-500 font-medium">Merchant API Integration</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Store:</span>
                    <button
                      onClick={() => handleToggleStore('zomato', statusData?.channels?.zomato?.isOnline)}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                        statusData?.channels?.zomato?.isOnline
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {statusData?.channels?.zomato?.isOnline ? 'ONLINE' : 'PAUSED'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-400">Orders Today</p>
                    <p className="text-xl font-black text-slate-800 mt-0.5">
                      {statusData?.todaySummary?.zomato?.count || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-400">Gross Sales</p>
                    <p className="text-xl font-black text-red-600 mt-0.5">
                      ₹{statusData?.todaySummary?.zomato?.revenue?.toLocaleString('en-IN') || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-400">Commission (20%)</p>
                    <p className="text-xl font-black text-slate-600 mt-0.5">
                      ₹{statusData?.todaySummary?.zomato?.estCommission || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Rating: ★ 4.6 (1,420 reviews)</span>
                <span>Auto-Accept Orders: ON</span>
              </div>
            </div>

            {/* Swiggy Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      S
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Swiggy Delivery Partner</h2>
                      <p className="text-xs text-slate-500 font-medium">UrbanPiper Cloud Adapter</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Store:</span>
                    <button
                      onClick={() => handleToggleStore('swiggy', statusData?.channels?.swiggy?.isOnline)}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                        statusData?.channels?.swiggy?.isOnline
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {statusData?.channels?.swiggy?.isOnline ? 'ONLINE' : 'PAUSED'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-400">Orders Today</p>
                    <p className="text-xl font-black text-slate-800 mt-0.5">
                      {statusData?.todaySummary?.swiggy?.count || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-400">Gross Sales</p>
                    <p className="text-xl font-black text-orange-600 mt-0.5">
                      ₹{statusData?.todaySummary?.swiggy?.revenue?.toLocaleString('en-IN') || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-400">Commission (22%)</p>
                    <p className="text-xl font-black text-slate-600 mt-0.5">
                      ₹{statusData?.todaySummary?.swiggy?.estCommission || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Rating: ★ 4.7 (2,100 reviews)</span>
                <span>Auto-Accept Orders: ON</span>
              </div>
            </div>
          </div>

          {/* Live Aggregator Orders Feed */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">Live Delivery Orders & Rider Tracking</h3>
                <p className="text-xs text-slate-500">Orders automatically injected into POS and Kitchen KDS</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-xs rounded-xl">
                {orders.length} Active Feeds
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No aggregator orders active right now. Click "Simulate Zomato Order" or "Simulate Swiggy Order" above to fire a test!
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const isZomato = ord.notes?.includes('ZOMATO');
                  const rider = ord.rider;
                  return (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-black text-white ${
                              isZomato ? 'bg-red-600' : 'bg-orange-500'
                            }`}
                          >
                            {isZomato ? 'ZOMATO' : 'SWIGGY'} #{ord.orderNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{ord.customerName}</span>
                          <span className="text-xs text-slate-400">({ord.customerPhone})</span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium line-clamp-1">{ord.notes}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                          <span>Items: {ord.items?.map((i: any) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}</span>
                          <span>•</span>
                          <span className="font-extrabold text-slate-900">₹{ord.totalAmount}</span>
                        </div>
                      </div>

                      {/* Rider details & action stepper */}
                      <div className="flex items-center gap-4 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-xs">
                        <div className="text-xs">
                          <p className="font-extrabold text-slate-900 flex items-center gap-1">
                            <Bike className="w-3.5 h-3.5 text-amber-600" /> {rider.riderName}
                          </p>
                          <p className="text-[11px] text-slate-500">{rider.vehicleNumber} • {rider.riderPhone}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {rider.status === 'ASSIGNED' && (
                            <button
                              onClick={() => handleUpdateRider(ord.id, 'ARRIVED')}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200"
                            >
                              Mark Rider Arrived
                            </button>
                          )}
                          {rider.status === 'ARRIVED' && (
                            <button
                              onClick={() => handleUpdateRider(ord.id, 'PICKED_UP')}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200"
                            >
                              Dispatch Order
                            </button>
                          )}
                          {rider.status === 'PICKED_UP' && (
                            <button
                              onClick={() => handleUpdateRider(ord.id, 'DELIVERED')}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {rider.status === 'DELIVERED' && (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
