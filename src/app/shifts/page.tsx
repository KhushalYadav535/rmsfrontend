'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  IndianRupee,
  Receipt,
  UserCheck,
} from 'lucide-react';

export default function ShiftsPage() {
  const { currentOutlet, user } = useAuth();
  const [shift, setShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Open Shift Form
  const [openingCash, setOpeningCash] = useState('5000');
  const [openNotes, setOpenNotes] = useState('');

  // Close Shift Form
  const [actualCash, setActualCash] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (currentOutlet) {
      loadShift();
    }
  }, [currentOutlet]);

  const loadShift = async () => {
    setLoading(true);
    const res = await fetchApi(`/shifts/active?outletId=${currentOutlet?.id}`);
    if (res.success) {
      setShift(res.shift);
    }
    setLoading(false);
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchApi('/shifts/open', {
      method: 'POST',
      body: JSON.stringify({
        outletId: currentOutlet?.id,
        openingCash: Number(openingCash),
        notes: openNotes,
      }),
    });

    if (res.success) {
      loadShift();
    } else {
      alert(`Error opening shift: ${res.error}`);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setClosing(true);
    const res = await fetchApi('/shifts/close', {
      method: 'POST',
      body: JSON.stringify({
        shiftId: shift.id,
        actualCash: Number(actualCash),
        notes: closeNotes,
      }),
    });

    if (res.success) {
      alert('✅ Shift successfully closed and reconciled!');
      setShift(null);
      setActualCash('');
    } else {
      alert(`Error closing shift: ${res.error}`);
    }
    setClosing(false);
  };

  const expectedCash = shift ? Number(shift.expectedCash) : 0;
  const countedCash = Number(actualCash || 0);
  const difference = countedCash - expectedCash;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-500" />
            <span>Cash Register Shift & Drawer Reconciliation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage cashier shifts, tender balances, and day-end cash mismatch audits
          </p>
        </div>

        {shift ? (
          /* ACTIVE SHIFT VIEW */
          <div className="space-y-5">
            {/* Active Shift Card */}
            <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Unlock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Register Open
                    </span>
                    <h2 className="text-base font-black text-slate-900 mt-0.5">
                      Cashier: {shift.user?.name}
                    </h2>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500 font-mono">
                  Opened: {new Date(shift.openedAt).toLocaleTimeString('en-IN')}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Opening Float
                  </span>
                  <p className="text-lg font-black text-slate-900">
                    ₹{Number(shift.openingCash).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    Cash Sales
                  </span>
                  <p className="text-lg font-black text-amber-900">
                    ₹{Number(shift.cashSales).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    UPI Collections
                  </span>
                  <p className="text-lg font-black text-blue-900">
                    ₹{Number(shift.upiSales).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 text-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Expected Drawer Cash
                  </span>
                  <p className="text-lg font-black text-emerald-400">
                    ₹{expectedCash.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* CLOSE SHIFT FORM */}
            <form
              onSubmit={handleCloseShift}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>End Shift & Count Physical Tender</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physically Counted Cash in Drawer (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                    placeholder="Enter physical total count..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Closing Handover Notes
                  </label>
                  <input
                    type="text"
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                    placeholder="e.g. All denomination counted, handover to Evening Shift"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {actualCash && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    difference === 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : difference < 0
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <span>
                    {difference === 0
                      ? '✅ Cash Drawer Perfectly Balanced'
                      : difference < 0
                      ? `⚠️ Shortage Mismatch of ₹${Math.abs(difference)}`
                      : `ℹ️ Excess Cash of ₹${difference}`}
                  </span>
                  <span className="font-mono text-sm">
                    {difference >= 0 ? `+₹${difference}` : `-₹${Math.abs(difference)}`}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={closing || !actualCash}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>Close Shift & Save Reconciliation</span>
              </button>
            </form>
          </div>
        ) : (
          /* NO ACTIVE SHIFT — OPEN SHIFT VIEW */
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm max-w-lg">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <Unlock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Open Cash Register Shift
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Start your shift by entering the opening float cash placed in the register drawer.
            </p>

            <form onSubmit={handleOpenShift} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Opening Float Tender (₹)
                </label>
                <input
                  type="number"
                  required
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  placeholder="5000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Shift Notes
                </label>
                <input
                  type="text"
                  value={openNotes}
                  onChange={(e) => setOpenNotes(e.target.value)}
                  placeholder="e.g. Morning Opening Shift"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Start Register Shift</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
