'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  BarChart3,
  IndianRupee,
  Receipt,
  Download,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  Users,
  CreditCard,
  Clock,
  ShieldCheck,
  Filter,
  PieChart,
  ArrowUpRight,
  Printer,
  Building2,
  Star,
  Sparkles,
} from 'lucide-react';

export default function ReportsPage() {
  const { currentOutlet } = useAuth();
  const [activeTab, setActiveTab] = useState<'sales' | 'items' | 'staff' | 'payments' | 'hourly' | 'gst' | 'menu-engineering' | 'enterprise'>('sales');

  // Date filters
  const [dateRangePreset, setDateRangePreset] = useState<'TODAY' | 'YESTERDAY' | '7DAYS' | '30DAYS'>('TODAY');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // Report data states
  const [loading, setLoading] = useState(true);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [itemsReport, setItemsReport] = useState<any[]>([]);
  const [staffReport, setStaffReport] = useState<any[]>([]);
  const [paymentsReport, setPaymentsReport] = useState<any[]>([]);
  const [hourlyReport, setHourlyReport] = useState<any[]>([]);
  const [gstData, setGstData] = useState<any>(null);
  const [menuEngData, setMenuEngData] = useState<any>(null);
  const [enterpriseData, setEnterpriseData] = useState<any>(null);

  useEffect(() => {
    updateDateRangePreset(dateRangePreset);
  }, []);

  useEffect(() => {
    if (currentOutlet) {
      loadActiveReport();
    }
  }, [currentOutlet, startDate, endDate, activeTab]);

  const updateDateRangePreset = (preset: 'TODAY' | 'YESTERDAY' | '7DAYS' | '30DAYS') => {
    setDateRangePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (preset === 'TODAY') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'YESTERDAY') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().slice(0, 10);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === '7DAYS') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      setStartDate(past.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === '30DAYS') {
      const past = new Date(now);
      past.setDate(past.getDate() - 30);
      setStartDate(past.toISOString().slice(0, 10));
      setEndDate(todayStr);
    }
  };

  const loadActiveReport = async () => {
    if (!currentOutlet) return;
    setLoading(true);

    const query = `outletId=${currentOutlet.id}&startDate=${startDate}&endDate=${endDate}`;

    if (activeTab === 'sales') {
      const res = await fetchApi(`/reports/sales?${query}`);
      if (res.success) setSalesReport(res.sales);
    } else if (activeTab === 'items') {
      const res = await fetchApi(`/reports/items?${query}`);
      if (res.success) setItemsReport(res.items || []);
    } else if (activeTab === 'staff') {
      const res = await fetchApi(`/reports/staff?${query}`);
      if (res.success) setStaffReport(res.staff || []);
    } else if (activeTab === 'payments') {
      const res = await fetchApi(`/reports/payment-modes?${query}`);
      if (res.success) setPaymentsReport(res.paymentModes || []);
    } else if (activeTab === 'hourly') {
      const res = await fetchApi(`/reports/hourly?outletId=${currentOutlet.id}&date=${startDate}`);
      if (res.success) setHourlyReport(res.hourly || []);
    } else if (activeTab === 'gst') {
      const res = await fetchApi(`/reports/gst?${query}`);
      if (res.success) setGstData(res.gstSummary);
    } else if (activeTab === 'menu-engineering') {
      const res = await fetchApi(`/reports/menu-engineering?outletId=${currentOutlet.id}`);
      if (res.success) setMenuEngData(res.menuEngineering);
    } else if (activeTab === 'enterprise') {
      const res = await fetchApi(`/reports/enterprise-summary`);
      if (res.success) setEnterpriseData(res.enterpriseSummary);
    }

    setLoading(false);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'sales' && salesReport) {
      csvContent += 'Metric,Value\r\n';
      csvContent += `Gross Sales,${salesReport.grossSales || 0}\r\n`;
      csvContent += `Net Sales,${salesReport.netSales || 0}\r\n`;
      csvContent += `Discounts,${salesReport.discounts || 0}\r\n`;
      csvContent += `Taxes,${salesReport.taxAmount || 0}\r\n`;
      csvContent += `Total Invoices,${salesReport.totalInvoices || 0}\r\n`;
    } else if (activeTab === 'items') {
      csvContent += 'Item Name,Category,Quantity Sold,Revenue,Food Cost %,Margin %\r\n';
      itemsReport.forEach((i) => {
        csvContent += `"${i.name}","${i.categoryName}",${i.quantitySold},${i.revenue},${i.foodCostPercent || 0}%,${i.marginPercent || 0}%\r\n`;
      });
    } else if (activeTab === 'staff') {
      csvContent += 'Staff Name,Role,Orders Handled,Sales Volume\r\n';
      staffReport.forEach((s) => {
        csvContent += `"${s.name}","${s.role}",${s.orderCount},${s.totalSales}\r\n`;
      });
    } else if (activeTab === 'payments') {
      csvContent += 'Payment Mode,Transactions,Total Collected\r\n';
      paymentsReport.forEach((p) => {
        csvContent += `"${p.mode}",${p.count},${p.amount}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `report-${activeTab}-${startDate}-to-${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-amber-500" />
              <span>Advanced Analytics & GST Intelligence</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Financial registers, item profitability, staff performance, payment breakdowns, and GST compliance for {currentOutlet?.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Date:
            </span>
            {[
              { id: 'TODAY', label: 'Today' },
              { id: 'YESTERDAY', label: 'Yesterday' },
              { id: '7DAYS', label: 'Last 7 Days' },
              { id: '30DAYS', label: 'Last 30 Days' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => updateDateRangePreset(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  dateRangePreset === p.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateRangePreset('' as any);
              }}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <span className="text-slate-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateRangePreset('' as any);
              }}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto">
          {[
            { id: 'sales', label: 'Sales Summary', icon: IndianRupee },
            { id: 'items', label: 'Item Profitability (BOM)', icon: TrendingUp },
            { id: 'menu-engineering', label: 'Menu BCG Matrix', icon: PieChart },
            { id: 'enterprise', label: 'Multi-Outlet Consolidation', icon: Building2 },
            { id: 'staff', label: 'Staff & Captain Analytics', icon: Users },
            { id: 'payments', label: 'Payment Modes', icon: CreditCard },
            { id: 'hourly', label: 'Hourly Peak Hours', icon: Clock },
            { id: 'gst', label: 'GST Tax Compliance', icon: ShieldCheck },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-3 text-xs font-bold tracking-wide transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === t.id
                    ? 'text-amber-600 border-b-2 border-amber-500'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* 1. SALES SUMMARY TAB */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Net Realized Sales
                </span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  ₹{Number(salesReport?.netSales || 0).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                  {salesReport?.totalInvoices || 0} Settled Bills
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Gross Sales (Pre-Discount)
                </span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  ₹{Number(salesReport?.grossSales || 0).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                  Menu item value punched
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Discounts / Promo Waived
                </span>
                <p className="text-2xl font-black text-rose-700 mt-1">
                  -₹{Number(salesReport?.discounts || 0).toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                  Coupon & manual discounts
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Average Ticket Size (AOV)
                </span>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  ₹{salesReport?.totalInvoices > 0 ? Math.round(salesReport.netSales / salesReport.totalInvoices) : 0}
                </p>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                  Per completed invoice
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-800">Financial Tax & Surcharge Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold">Total GST (5%) Collected</span>
                  <p className="text-lg font-black text-slate-900 mt-1">
                    ₹{Number(salesReport?.taxAmount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold">Round Off Adjustments</span>
                  <p className="text-lg font-black text-slate-900 mt-1">
                    ₹{Number(salesReport?.roundOff || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold">Average Items Per Order</span>
                  <p className="text-lg font-black text-slate-900 mt-1">
                    {salesReport?.avgItemsPerOrder || '2.8'} items
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ITEM PROFITABILITY TAB */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Menu Item Name</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5 text-center">Portions Sold</th>
                    <th className="px-5 py-3.5">Total Revenue</th>
                    <th className="px-5 py-3.5">Food Cost %</th>
                    <th className="px-5 py-3.5 text-right">Gross Profit Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {itemsReport.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                        {loading ? 'Loading item analytics...' : 'No sales records found for this period.'}
                      </td>
                    </tr>
                  ) : (
                    itemsReport.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-bold text-slate-900">{item.name}</td>
                        <td className="px-5 py-3.5 text-slate-500">{item.categoryName}</td>
                        <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-800">
                          {item.quantitySold}
                        </td>
                        <td className="px-5 py-3.5 font-black text-slate-900">
                          ₹{Number(item.revenue).toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              (item.foodCostPercent || 30) <= 35
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {item.foodCostPercent || 32}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-black text-emerald-700">
                          {100 - (item.foodCostPercent || 32)}% (₹{Math.round(item.revenue * (1 - (item.foodCostPercent || 32) / 100))})
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. STAFF PERFORMANCE TAB */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Staff Name</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5 text-center">Orders Handled</th>
                    <th className="px-5 py-3.5">Total Revenue Generated</th>
                    <th className="px-5 py-3.5 text-right">Avg Order Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {staffReport.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                        {loading ? 'Loading staff performance...' : 'No staff order data found.'}
                      </td>
                    </tr>
                  ) : (
                    staffReport.map((staff, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-bold text-slate-900">{staff.name}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {staff.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono font-bold">{staff.orderCount}</td>
                        <td className="px-5 py-3.5 font-black text-slate-900">
                          ₹{Number(staff.totalSales).toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-slate-600">
                          ₹{staff.orderCount > 0 ? Math.round(staff.totalSales / staff.orderCount) : 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PAYMENT MODES TAB */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {paymentsReport.map((p, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{p.mode}</span>
                    <CreditCard className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    ₹{Number(p.amount).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.count} Transactions</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. HOURLY HEATMAP TAB */}
        {activeTab === 'hourly' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Hourly Rush & Peak Analysis for {startDate}</h3>
                <p className="text-xs text-slate-400">Order traffic volume distribution by hour of day</p>
              </div>
            </div>

            <div className="space-y-2">
              {hourlyReport.map((h) => {
                const maxCount = Math.max(...hourlyReport.map((x) => x.orderCount || 1));
                const pct = Math.round(((h.orderCount || 0) / (maxCount || 1)) * 100);

                return (
                  <div key={h.hour} className="flex items-center gap-3 text-xs">
                    <span className="w-20 font-mono text-slate-500 font-semibold">{h.hour}:00</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden flex items-center px-2">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-bold text-slate-800">{h.orderCount || 0} orders</span>
                    <span className="w-24 text-right font-black text-slate-900">₹{Number(h.revenue || 0).toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. GST TAX COMPLIANCE TAB */}
        {activeTab === 'gst' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    GSTR-1 & 3B Ready Filing Summary
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-0.5">
                    GST Tax Collected (CGST 2.5% + SGST 2.5%)
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                  GSTIN: {currentOutlet?.gstin || '09AAAAA0000A1Z5'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Invoices</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{gstData?.totalInvoices || 0}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Taxable Turnover</span>
                  <p className="text-xl font-black text-slate-900 mt-1">₹{Number(gstData?.taxableValue || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">CGST (2.5%)</span>
                  <p className="text-xl font-black text-amber-900 mt-1">₹{Number(gstData?.cgst || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">SGST (2.5%)</span>
                  <p className="text-xl font-black text-amber-900 mt-1">₹{Number(gstData?.sgst || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. MENU ENGINEERING (BCG MATRIX) TAB */}
        {activeTab === 'menu-engineering' && (
          <div className="space-y-6">
            {/* Benchmarks Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Menu Optimization Framework
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-0.5 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-amber-500" /> Boston Consulting Group (BCG) Dish Matrix
                  </h2>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  Overall Food Cost: {menuEngData?.benchmarks?.overallFoodCostPercent || 29.5}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-center">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Volume Sold</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{menuEngData?.benchmarks?.avgUnitsSold || 12} units</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Contribution Margin</span>
                  <p className="text-xl font-black text-slate-900 mt-1">₹{menuEngData?.benchmarks?.avgMargin || 145}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tracked F&B Turnover</span>
                  <p className="text-xl font-black text-amber-600 mt-1">₹{menuEngData?.benchmarks?.totalRevenueTracked?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Healthy Food Cost Target</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">&lt; 32%</p>
                </div>
              </div>
            </div>

            {/* 4 Quadrants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. STARS */}
              <div className="bg-emerald-50/60 border-2 border-emerald-400 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <h3 className="text-base font-black text-emerald-950">STARS (High Volume, High Margin)</h3>
                      <p className="text-xs text-emerald-700 font-semibold">Your champion dishes. Protect recipe quality & prime menu positioning.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500 text-white font-black text-xs rounded-xl">
                    {menuEngData?.quadrants?.stars?.count || 0}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {menuEngData?.quadrants?.stars?.items?.map((item: any) => (
                    <div key={item.id} className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">Sold: {item.quantitySold} | Raw Cost: ₹{item.unitCost} ({item.marginPercent}% margin)</p>
                      </div>
                      <span className="text-sm font-black text-emerald-700">+₹{item.margin} margin</span>
                    </div>
                  ))}
                  {(!menuEngData?.quadrants?.stars?.items || menuEngData?.quadrants?.stars?.items.length === 0) && (
                    <p className="text-xs text-emerald-800 italic py-2">No items currently in this quadrant.</p>
                  )}
                </div>
              </div>

              {/* 2. PLOWHORSES */}
              <div className="bg-blue-50/60 border-2 border-blue-400 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐎</span>
                    <div>
                      <h3 className="text-base font-black text-blue-950">PLOWHORSES (High Volume, Low Margin)</h3>
                      <p className="text-xs text-blue-700 font-semibold">Crowd favorites with thin margins. Increase price by 5-10% or reduce portion costs.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-500 text-white font-black text-xs rounded-xl">
                    {menuEngData?.quadrants?.plowhorses?.count || 0}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {menuEngData?.quadrants?.plowhorses?.items?.map((item: any) => (
                    <div key={item.id} className="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">Sold: {item.quantitySold} | Raw Cost: ₹{item.unitCost} ({item.marginPercent}% margin)</p>
                      </div>
                      <span className="text-sm font-black text-blue-700">+₹{item.margin} margin</span>
                    </div>
                  ))}
                  {(!menuEngData?.quadrants?.plowhorses?.items || menuEngData?.quadrants?.plowhorses?.items.length === 0) && (
                    <p className="text-xs text-blue-800 italic py-2">No items currently in this quadrant.</p>
                  )}
                </div>
              </div>

              {/* 3. PUZZLES */}
              <div className="bg-purple-50/60 border-2 border-purple-400 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-purple-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧩</span>
                    <div>
                      <h3 className="text-base font-black text-purple-950">PUZZLES (Low Volume, High Margin)</h3>
                      <p className="text-xs text-purple-700 font-semibold">High profit but low sales. Train captains to recommend, bundle into combos.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-500 text-white font-black text-xs rounded-xl">
                    {menuEngData?.quadrants?.puzzles?.count || 0}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {menuEngData?.quadrants?.puzzles?.items?.map((item: any) => (
                    <div key={item.id} className="p-3 bg-white rounded-xl border border-purple-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">Sold: {item.quantitySold} | Raw Cost: ₹{item.unitCost} ({item.marginPercent}% margin)</p>
                      </div>
                      <span className="text-sm font-black text-purple-700">+₹{item.margin} margin</span>
                    </div>
                  ))}
                  {(!menuEngData?.quadrants?.puzzles?.items || menuEngData?.quadrants?.puzzles?.items.length === 0) && (
                    <p className="text-xs text-purple-800 italic py-2">No items currently in this quadrant.</p>
                  )}
                </div>
              </div>

              {/* 4. DOGS */}
              <div className="bg-slate-100 border-2 border-slate-300 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐕</span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">DOGS (Low Volume, Low Margin)</h3>
                      <p className="text-xs text-slate-600 font-semibold">Underperforming items. Consider removing from menu or reinventing.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-500 text-white font-black text-xs rounded-xl">
                    {menuEngData?.quadrants?.dogs?.count || 0}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {menuEngData?.quadrants?.dogs?.items?.map((item: any) => (
                    <div key={item.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500">Sold: {item.quantitySold} | Raw Cost: ₹{item.unitCost} ({item.marginPercent}% margin)</p>
                      </div>
                      <span className="text-sm font-black text-slate-600">+₹{item.margin} margin</span>
                    </div>
                  ))}
                  {(!menuEngData?.quadrants?.dogs?.items || menuEngData?.quadrants?.dogs?.items.length === 0) && (
                    <p className="text-xs text-slate-600 italic py-2">No items currently in this quadrant.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. CONSOLIDATED ENTERPRISE MULTI-BRANCH TAB */}
        {activeTab === 'enterprise' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Brand Outlets</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{enterpriseData?.totalOutlets || 0}</p>
                <span className="text-xs font-medium text-slate-500 mt-1 block">Live operational branches</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Brand Gross Revenue</span>
                <p className="text-2xl font-black text-amber-600 mt-1">₹{enterpriseData?.brandRevenue?.toLocaleString('en-IN') || 0}</p>
                <span className="text-xs font-medium text-slate-500 mt-1 block">Consolidated across brand</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Brand Orders</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{enterpriseData?.brandOrders || 0}</p>
                <span className="text-xs font-medium text-slate-500 mt-1 block">All branches combined</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Brand Avg Order Value</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">₹{enterpriseData?.brandAOV || 0}</p>
                <span className="text-xs font-medium text-slate-500 mt-1 block">Cross-branch average</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900">Branch Performance Ranking</h3>
              <div className="divide-y divide-slate-100">
                {enterpriseData?.branches?.map((b: any, idx: number) => (
                  <div key={b.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {b.name}
                          {b.isCentralKitchen && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                              Central Kitchen
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400">{b.code} • {b.city} • Occupancy: {b.occupancyRate}%</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Orders</span>
                        <span className="text-sm font-bold text-slate-800">{b.totalOrders}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Revenue</span>
                        <span className="text-sm font-black text-amber-600">₹{b.revenue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
