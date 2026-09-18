'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Sparkles, KeyRound, Mail, ArrowRight, UserCheck, ShieldCheck, Crown, ChefHat, Boxes, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('cashier@royalfeast.com');
  const [password, setPassword] = useState('cashier123');
  const [pinCode, setPinCode] = useState('');
  const [usePin, setUsePin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = usePin ? { pinCode } : { email, password };
    const res = await login(payload);
    if (!res.success) {
      setError(res.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  // Quick 1-Click Demo Logins
  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setUsePin(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 mb-4">
            <Sparkles className="w-8 h-8 text-amber-100" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Royal Feast Restaurant OS
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Unified Portal for Super Admin, Owners, Managers & Staff
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-7 shadow-xl shadow-slate-200/50">
          {/* Tabs: Email vs PIN */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setUsePin(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !usePin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setUsePin(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                usePin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Quick POS PIN
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!usePin ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@restaurant.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-center">
                  Enter 4-Digit Staff PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Quick Demo Switcher - All Roles Unified */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Role Switcher (Demo)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin@rms.com', 'admin123')}
                className="col-span-2 p-2.5 border border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 rounded-xl text-left transition-all text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span>Super Admin</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">PLATFORM OWNER</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Manage All Restaurants & Plans</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('owner@royalfeast.com', 'admin123')}
                className="p-2 border border-slate-200 hover:border-amber-400 rounded-xl text-left hover:bg-amber-50/50 transition-all text-xs"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Owner</span>
                </div>
                <div className="text-[10px] text-slate-400">All Outlets & BI</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager@royalfeast.com', 'manager123')}
                className="p-2 border border-slate-200 hover:border-amber-400 rounded-xl text-left hover:bg-amber-50/50 transition-all text-xs"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>Manager</span>
                </div>
                <div className="text-[10px] text-slate-400">Ops, Reports & Menu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('cashier@royalfeast.com', 'cashier123')}
                className="p-2 border border-slate-200 hover:border-amber-400 rounded-xl text-left hover:bg-amber-50/50 transition-all text-xs"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cashier (POS)</span>
                </div>
                <div className="text-[10px] text-slate-400">Billing Counter</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('captain@royalfeast.com', 'captain123')}
                className="p-2 border border-slate-200 hover:border-amber-400 rounded-xl text-left hover:bg-amber-50/50 transition-all text-xs"
              >
                <div className="font-bold text-slate-800">Captain / Waiter</div>
                <div className="text-[10px] text-slate-400">Table & KOTs</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('chef@royalfeast.com', 'chef123')}
                className="p-2 border border-slate-200 hover:border-amber-400 rounded-xl text-left hover:bg-amber-50/50 transition-all text-xs"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <ChefHat className="w-3.5 h-3.5 text-rose-500" />
                  <span>Kitchen Chef</span>
                </div>
                <div className="text-[10px] text-slate-400">KDS Orders</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('inventory@royalfeast.com', 'inventory123')}
                className="p-2 border border-slate-200 hover:border-amber-400 rounded-xl text-left hover:bg-amber-50/50 transition-all text-xs"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-purple-600" />
                  <span>Store Manager</span>
                </div>
                <div className="text-[10px] text-slate-400">Stock & Purchase</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
