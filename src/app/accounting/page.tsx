'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  Landmark,
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  Receipt,
  PieChart,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';

export default function AccountingPage() {
  const { currentOutlet } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [pnlData, setPnlData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'pnl'>('pnl');
  const [loading, setLoading] = useState(true);

  // Expense modal state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [category, setCategory] = useState('RAW_MATERIAL');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [vendorName, setVendorName] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentOutlet) {
      loadAccountingData();
    }
  }, [currentOutlet]);

  const loadAccountingData = async () => {
    if (!currentOutlet) return;
    setLoading(true);
    const [expRes, pnlRes] = await Promise.all([
      fetchApi(`/accounting/expenses?outletId=${currentOutlet.id}`),
      fetchApi(`/accounting/pnl?outletId=${currentOutlet.id}`),
    ]);

    if (expRes.success) setExpenses(expRes.expenses || []);
    if (pnlRes.success) setPnlData(pnlRes.pnl);
    setLoading(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOutlet) return;
    setSubmitting(true);

    const res = await fetchApi('/accounting/expenses', {
      method: 'POST',
      body: {
        outletId: currentOutlet.id,
        category,
        title,
        amount: Number(amount),
        paymentMethod,
        vendorName,
        receiptNumber,
        date,
        notes,
      },
    });

    if (res.success) {
      setExpenseModalOpen(false);
      setTitle('');
      setAmount('');
      setVendorName('');
      setReceiptNumber('');
      setNotes('');
      loadAccountingData();
    } else {
      alert(`Error: ${res.error}`);
    }
    setSubmitting(false);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    const res = await fetchApi(`/accounting/expenses/${id}`, { method: 'DELETE' });
    if (res.success) {
      loadAccountingData();
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Phase 5 — Accounting & P&L
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Financial Health & Expense Ledger</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Landmark className="w-6 h-6 text-emerald-600" /> Restaurant Accounting & P&L Statement
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpenseModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Record Daily Expense
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                ₹{pnlData?.revenue?.grossSales?.toLocaleString('en-IN') || '0'}
              </p>
              <span className="text-xs font-medium text-emerald-600 mt-1 block">Net: ₹{pnlData?.revenue?.netSales?.toLocaleString('en-IN') || '0'}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost of Goods (COGS)</p>
              <p className="text-2xl font-black text-amber-600 mt-1">
                ₹{pnlData?.cogs?.amount?.toLocaleString('en-IN') || '0'}
              </p>
              <span className="text-xs font-medium text-slate-500 mt-1 block">{pnlData?.cogs?.cogsPercent || 31.5}% of net sales</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Expenses (OPEX)</p>
              <p className="text-2xl font-black text-red-600 mt-1">
                ₹{pnlData?.operatingExpenses?.total?.toLocaleString('en-IN') || totalExpenseAmount.toLocaleString('en-IN')}
              </p>
              <span className="text-xs font-medium text-slate-500 mt-1 block">{expenses.length} entries recorded</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Operating Profit (EBITDA)</p>
              <p className={`text-2xl font-black mt-1 ${
                (pnlData?.netProfit?.netOperatingProfit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                ₹{pnlData?.netProfit?.netOperatingProfit?.toLocaleString('en-IN') || '0'}
              </p>
              <span className="text-xs font-extrabold text-emerald-600 mt-1 block">
                {pnlData?.netProfit?.netProfitMarginPercent || 0}% Profit Margin
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('pnl')}
              className={`px-4 py-2 font-bold text-sm rounded-xl transition-all ${
                activeTab === 'pnl'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Profit & Loss Statement (P&L)
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 font-bold text-sm rounded-xl transition-all ${
                activeTab === 'expenses'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Daily Expense Ledger ({expenses.length})
            </button>
          </div>

          {/* Tab 1: P&L Statement View */}
          {activeTab === 'pnl' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Petpooja-Style Income & Expense Statement</h3>
                  <p className="text-xs text-slate-500">Period: {pnlData?.period?.start} to {pnlData?.period?.end}</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Print / Export P&L
                </button>
              </div>

              {/* P&L Statement Breakdown Table */}
              <div className="space-y-4 max-w-4xl">
                {/* 1. Revenue Section */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="flex justify-between items-center text-sm font-black text-slate-900 border-b border-slate-200 pb-2">
                    <span>1. TOTAL REVENUE</span>
                    <span>₹{pnlData?.revenue?.grossSales?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>• Gross F&B Sales</span>
                      <span>₹{pnlData?.revenue?.grossSales?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between text-red-500 font-semibold">
                      <span>• Less: Promo Discounts Allowed</span>
                      <span>-₹{pnlData?.revenue?.discountsGiven?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                      <span>Net Sales (Turnover)</span>
                      <span>₹{pnlData?.revenue?.netSales?.toLocaleString('en-IN') || 0}</span>
                    </div>
                  </div>
                </div>

                {/* 2. COGS Section */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="flex justify-between items-center text-sm font-black text-slate-900 border-b border-slate-200 pb-2">
                    <span>2. COST OF GOODS SOLD (COGS)</span>
                    <span className="text-amber-700">-₹{pnlData?.cogs?.amount?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>• Raw Materials & Recipe Ingredients Consumed</span>
                      <span>₹{pnlData?.cogs?.amount?.toLocaleString('en-IN') || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Food Cost % of Revenue</span>
                      <span className="font-bold text-amber-600">{pnlData?.cogs?.cogsPercent || 31.5}%</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-700 pt-1 border-t border-slate-200">
                      <span>GROSS PROFIT</span>
                      <span>₹{pnlData?.cogs?.grossProfit?.toLocaleString('en-IN') || 0} ({pnlData?.cogs?.grossMarginPercent || 0}%)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Operating Expenses Section */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="flex justify-between items-center text-sm font-black text-slate-900 border-b border-slate-200 pb-2">
                    <span>3. OPERATING EXPENSES (OPEX)</span>
                    <span className="text-red-600">-₹{pnlData?.operatingExpenses?.total?.toLocaleString('en-IN') || 0}</span>
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                    {Object.entries(pnlData?.operatingExpenses?.breakdown || {}).map(([cat, amt]: any) => (
                      <div key={cat} className="flex justify-between">
                        <span>• {cat.replace('_', ' ')}</span>
                        <span>₹{Number(amt).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    {Object.keys(pnlData?.operatingExpenses?.breakdown || {}).length === 0 && (
                      <div className="text-slate-400 italic">No operating expenses recorded this period.</div>
                    )}
                  </div>
                </div>

                {/* 4. Net Operating Profit Final */}
                <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-md flex justify-between items-center">
                  <div>
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Final Financial Result</span>
                    <h4 className="text-xl font-black">NET OPERATING PROFIT (EBITDA)</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Operating Profit Margin: {pnlData?.netProfit?.netProfitMarginPercent || 0}%</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-emerald-400">
                      ₹{pnlData?.netProfit?.netOperatingProfit?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Expense Ledger */}
          {activeTab === 'expenses' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Recorded Expenses</h3>
                  <p className="text-xs text-slate-500">Track petty cash, vendor bills, rent, and utility disbursements</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <div key={exp.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                          {exp.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Paid via: <strong className="text-slate-700">{exp.paymentMethod}</strong></span>
                        {exp.vendorName && <span>• Vendor: {exp.vendorName}</span>}
                        {exp.receiptNumber && <span>• Receipt: #{exp.receiptNumber}</span>}
                        <span>• Date: {exp.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-black text-red-600">-₹{exp.amount.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal: Record Daily Expense */}
        {expenseModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" /> Record Daily Expense
              </h2>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="RAW_MATERIAL">Raw Material Purchase</option>
                      <option value="RENT">Store Rent / Lease</option>
                      <option value="UTILITIES">Electricity / Gas / Water</option>
                      <option value="SALARIES">Staff Salaries & Tips</option>
                      <option value="MAINTENANCE">Equipment Repairs</option>
                      <option value="MARKETING">Marketing & Ads</option>
                      <option value="PACKAGING">Takeaway Packaging</option>
                      <option value="OTHER">Miscellaneous</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 2500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Title / Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dairy Milk & Curd replenishment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="CASH">Cash (Petty Cash)</option>
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="BANK_TRANSFER">Net Banking / NEFT</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Vendor / Payee</label>
                    <input
                      type="text"
                      placeholder="e.g. Parag Milk Booth"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Receipt / Bill #</label>
                    <input
                      type="text"
                      placeholder="Optional receipt #"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setExpenseModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
