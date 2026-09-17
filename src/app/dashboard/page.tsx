'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Users,
  AlertTriangle,
  Receipt,
  ChefHat,
  Grid,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentOutlet } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOutlet) {
      loadDashboard();
    }
  }, [currentOutlet]);

  const loadDashboard = async () => {
    setLoading(true);
    const res = await fetchApi(`/reports/dashboard?outletId=${currentOutlet?.id}`);
    if (res.success) {
      setData(res.data);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live operational metrics for {currentOutlet?.name}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push('/pos')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>Punch New Order</span>
            </button>
            <button
              onClick={() => router.push('/kds')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
            >
              <ChefHat className="w-4 h-4 text-slate-600" />
              <span>Kitchen Display</span>
            </button>
          </div>
        </div>

        {/* 1. KEY KPI STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Sales */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Today's Sales
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              ₹{data?.todaySales ? Number(data.todaySales).toLocaleString('en-IN') : '0'}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Live Gross Billed Sales</span>
            </div>
          </div>

          {/* Orders Count */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Orders
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {data?.totalOrders || 0}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
              <span className="text-emerald-600 font-bold">{data?.completedOrders || 0} Settled</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{data?.activeOrders || 0} In-Kitchen</span>
            </div>
          </div>

          {/* Table Occupancy */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Table Occupancy
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Grid className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {data?.tables?.occupancyRate || 0}%
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
              <span className="text-emerald-600 font-bold">{data?.tables?.free || 0} Free</span>
              <span>•</span>
              <span className="text-amber-600 font-bold">{data?.tables?.occupied || 0} Busy</span>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Stock Warnings
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {data?.lowStockCount || 0}{' '}
              <span className="text-xs font-medium text-slate-400">Items</span>
            </div>
            <div className="text-[11px] font-medium text-rose-600 mt-2">
              {data?.lowStockCount > 0
                ? 'Action Required: Reorder threshold reached'
                : 'All ingredients stock optimal'}
            </div>
          </div>
        </div>

        {/* 2. MIDDLE ROW: COLLECTIONS BREAKDOWN & SALES BY CHANNEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Payment Collections */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>Collection Modes</span>
              <span className="text-[11px] font-semibold text-slate-400">Today</span>
            </h2>

            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    UPI
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">UPI / QR Codes</p>
                    <p className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</p>
                  </div>
                </div>
                <div className="text-sm font-black text-slate-900">
                  ₹{data?.collections?.upi ? Number(data.collections.upi).toLocaleString('en-IN') : '0'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                    CASH
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Cash Drawer</p>
                    <p className="text-[10px] text-slate-400">Physical tender</p>
                  </div>
                </div>
                <div className="text-sm font-black text-slate-900">
                  ₹{data?.collections?.cash ? Number(data.collections.cash).toLocaleString('en-IN') : '0'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                    CARD
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Debit / Credit Cards</p>
                    <p className="text-[10px] text-slate-400">POS EDC Terminals</p>
                  </div>
                </div>
                <div className="text-sm font-black text-slate-900">
                  ₹{data?.collections?.card ? Number(data.collections.card).toLocaleString('en-IN') : '0'}
                </div>
              </div>
            </div>
          </div>

          {/* Sales by Channel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4">
              Sales by Channel
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Dine-In Restaurant</span>
                  <span>₹{data?.salesByOrderType?.dineIn || 0}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full w-[70%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Takeaway / Parcel</span>
                  <span>₹{data?.salesByOrderType?.takeaway || 0}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full w-[20%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Home Delivery</span>
                  <span>₹{data?.salesByOrderType?.delivery || 0}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[10%]" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">GST Collected Today:</span>
              <span className="font-bold text-slate-900">
                ₹{Number(((data?.todaySales || 0) * 0.05).toFixed(2))}
              </span>
            </div>
          </div>

          {/* Top Selling Dishes */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 mb-4">
              Top Selling Dishes
            </h2>

            {data?.topItems && data.topItems.length > 0 ? (
              <div className="space-y-3">
                {data.topItems.map((it: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs pb-2 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{it.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{it.count} sold</span>
                      <p className="text-[10px] text-slate-400">₹{it.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No dish sales recorded yet today
              </div>
            )}
          </div>
        </div>

        {/* 3. QUICK NAVIGATION TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/tables')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Grid className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-800 text-xs">Live Floor Plan</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tables & Waiter Sessions</p>
          </button>

          <button
            onClick={() => router.push('/inventory')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-800 text-xs">Inventory & Stock</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Raw materials & BOM</p>
          </button>

          <button
            onClick={() => router.push('/shifts')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-800 text-xs">Cashier Shift</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Register & Variance</p>
          </button>

          <button
            onClick={() => router.push('/audit')}
            className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-800 text-xs">Audit Trail</p>
            <p className="text-[11px] text-slate-400 mt-0.5">GST Compliance Logs</p>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
