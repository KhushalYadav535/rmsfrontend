'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  UtensilsCrossed,
  ChefHat,
  Boxes,
  Truck,
  Bot,
  QrCode,
  Store,
  CheckCircle2,
  Crown,
  MonitorSmartphone,
  Clock,
  ExternalLink,
  Lock,
  Flame,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pos' | 'kds' | 'inventory' | 'aggregators' | 'ai'>('pos');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans antialiased">
      {/* ─── 1. Top Enterprise Ribbon ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 text-xs font-semibold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-xs">
        <span className="bg-black/15 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
          Enterprise SaaS 2.0
        </span>
        <span className="font-medium">The Complete Petpooja OS Alternative for Multi-Outlet Restaurant Chains</span>
        <Link
          href="/super-admin"
          className="hidden sm:inline-flex items-center gap-1 underline underline-offset-2 hover:text-black font-extrabold ml-1"
        >
          Super Admin Console <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ─── 2. Sticky Glass Navbar (Light Mode) ─────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                  ROYAL FEAST
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 tracking-wider">
                  OS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Petpooja Alternative Suite</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-amber-600 transition-colors">Capabilities</a>
            <a href="#demo" className="hover:text-amber-600 transition-colors">Interactive Tour</a>
            <a href="#modules" className="hover:text-amber-600 transition-colors">6-Phase Suite</a>
            <a href="#pricing" className="hover:text-amber-600 transition-colors">Subscriptions</a>
            <a href="#architecture" className="hover:text-amber-600 transition-colors">Architecture</a>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all shadow-xs"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Dashboard ({user.name})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
              >
                <span>Staff Login</span>
              </Link>
            )}

            <Link
              href="/super-admin"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-extrabold shadow-md shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Platform Owner</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 3. Hero Section (Light Luxury) ──────────────────────────────── */}
      <section className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-slate-50">
        {/* Soft Ambient Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-200/30 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-yellow-200/30 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-800 font-bold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>COMMISSION-FREE RESTAURANT OPERATING SYSTEM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 font-medium">All 6 Enterprise Phases 100% Live</span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.12] mb-6">
            Run Your Entire Restaurant Empire On{' '}
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              One Unified OS
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed mb-10">
            From <strong>3-second POS billing</strong> and <strong>offline Captain waiter ordering</strong> to{' '}
            <strong>Central Kitchen batch cooking</strong>, <strong>BOM Recipe Food Cost %</strong>, Swiggy/Zomato
            integrations, and a <strong>Bilingual AI Copilot</strong>.
          </p>

          {/* CTA Button Group */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="/login"
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Launch POS Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/super-admin"
              className="px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 hover:border-amber-400 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Super Admin Portal</span>
            </Link>

            <Link
              href="/store/lko-01"
              target="_blank"
              className="px-5 py-4 rounded-2xl bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 font-semibold text-sm border border-slate-200 flex items-center gap-2 transition-all shadow-xs"
            >
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Customer Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* ─── Hero UI Preview (Crisp White Card Frame) ────────────────── */}
          <div className="relative mx-auto max-w-5xl rounded-3xl p-2.5 bg-gradient-to-b from-amber-200/50 via-white to-slate-100 border border-slate-200 shadow-2xl shadow-slate-300/60 backdrop-blur-xl group">
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[520px]">
                <Image
                  src="/hero-dashboard.jpg"
                  alt="Royal Feast Restaurant Operating System UI Terminal"
                  fill
                  priority
                  className="object-cover object-top hover:scale-[1.01] transition-transform duration-700"
                />
              </div>

              {/* Floating Live Indicator Badges */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-emerald-200 text-emerald-800 text-xs font-bold shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Dining POS & KDS Connected</span>
              </div>

              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-amber-200 text-amber-800 text-xs font-bold shadow-lg">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>3.2s Average Billing Speed</span>
              </div>

              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 text-xs font-semibold shadow-lg">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Zero Public Signup • Super Admin Provisioned</span>
              </div>
            </div>
          </div>

          {/* Social Proof Stats Bar (Light Mode) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-12 pt-8 border-t border-slate-200">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">100%</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Petpooja Feature Parity</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">28.5%</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Target Recipe Food Cost</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">0%</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Storefront Commissions</div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-mono">99.99%</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Cloud & Offline Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Interactive Product Tour (Tabs - Light Mode) ─────────────── */}
      <section id="demo" className="py-20 bg-white border-y border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-xs font-extrabold uppercase text-amber-600 tracking-wider mb-2">
              Interactive Product Tour
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered Specifically For Kitchens & Counters
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3">
              Explore how Royal Feast synchronizes orders between dining tables, kitchen line cooks, and multi-branch
              commissaries.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              { id: 'pos', label: '1. Dine-In POS', icon: MonitorSmartphone },
              { id: 'kds', label: '2. Kitchen KDS', icon: ChefHat },
              { id: 'inventory', label: '3. Recipe BOM & CK', icon: Boxes },
              { id: 'aggregators', label: '4. Swiggy/Zomato', icon: Truck },
              { id: 'ai', label: '5. AI Voice Copilot', icon: Bot },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display (Crisp Light Cards) */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
            {activeTab === 'pos' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    High-Density POS Engine
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">Punch Orders in 3 Taps, Bill in 3 Seconds</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Designed for peak rush hours. Supports interactive floor table visual maps, quick cash/card/UPI split
                    billing, thermal KOT printing, and automatic customer loyalty lookups.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Visual table layouts (`Available`, `Occupied`, `Billing`, `Cleaning`)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Split payments (Cash + UPI + Card) with exact change calculator</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Cash shift register reconciliation with opening/closing floats</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Link
                      href="/pos"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                    >
                      <span>Open Live POS Terminal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm font-mono text-xs text-slate-800">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-[11px] text-slate-500 font-sans">
                    <span className="font-bold text-slate-900">POS LIVE BILLING PREVIEW</span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Table T-02 • 4 Guests
                    </span>
                  </div>
                  <div className="py-4 space-y-2">
                    <div className="flex justify-between text-slate-700">
                      <span>2x Paneer Tikka Angara (Less Spicy)</span>
                      <span className="font-bold text-slate-900">₹ 640.00</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>1x Dal Makhani Royal Dum</span>
                      <span className="font-bold text-slate-900">₹ 380.00</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>4x Butter Garlic Naan</span>
                      <span className="font-bold text-slate-900">₹ 240.00</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-200 space-y-1 text-slate-500">
                    <div className="flex justify-between text-[11px]">
                      <span>Subtotal</span>
                      <span>₹ 1,260.00</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>CGST (2.5%) + SGST (2.5%)</span>
                      <span>₹ 63.00</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-amber-600 pt-2 border-t border-slate-200">
                      <span>Grand Total</span>
                      <span>₹ 1,323.00</span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center text-[10px] font-bold">
                      UPI / GPay
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-center text-[10px] font-bold">
                      Cash Received
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-center text-[10px] font-bold">
                      Card Swipe
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kds' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded bg-red-100 text-red-800 border border-red-200">
                    Kitchen Display System
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">Paperless Kitchen Kanban with Live Timers</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Say goodbye to lost paper KOT slips. Every dish is routed to its designated kitchen station (Tandoor,
                    Curry, Chinese, Pantry) with color-coded preparation countdowns.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Color alerts: Green (&lt;10m), Amber (10-15m), Blinking Red (&gt;15m)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Item-level preparation checkboxes and 1-tap "Mark Ready"</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Special cooking notes display (Jain prep, Extra spicy, Gluten-free)</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Link
                      href="/kds"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                    >
                      <span>Launch KDS Screen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="lg:col-span-7 grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-amber-300 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-800">KOT #104 • Table T-03</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-bold">
                        12:45 min
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span>2x Murgh Malai Tikka</span>
                        <span className="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded">READY</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>1x Garlic Naan</span>
                        <span className="text-amber-800 text-[10px] font-bold bg-amber-50 px-1.5 py-0.5 rounded">PREP</span>
                      </div>
                    </div>
                    <button className="w-full py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold transition-colors">
                      Mark Ready for Dispatch
                    </button>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">KOT #105 • Swiggy Delivery</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                        04:12 min
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span>1x Dal Tadka Box</span>
                        <span className="text-amber-800 text-[10px] font-bold bg-amber-50 px-1.5 py-0.5 rounded">PREP</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>2x Jeera Rice</span>
                        <span className="text-amber-800 text-[10px] font-bold bg-amber-50 px-1.5 py-0.5 rounded">PREP</span>
                      </div>
                    </div>
                    <button className="w-full py-1.5 rounded-xl bg-slate-100 text-slate-400 text-[11px] font-bold cursor-not-allowed">
                      Cooking in Progress...
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Cost Control & Supply Chain
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">Recipe BOM, Food Cost % & Central Kitchen</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Automatically subtract raw materials (chicken, paneer, oil, spices) whenever a bill is printed. Manage
                    inter-branch transfers and commissary bulk batch production indents.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Live Food Cost % benchmark badge: 🟢 Optimal (&lt;28%), 🟡 Standard, 🔴 Warning</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Stock variance audits with kitchen wastage logs & loss valuation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Central Kitchen production batches with automated recipe consumption</span>
                    </li>
                  </ul>
                  <div className="pt-4 flex gap-3">
                    <Link
                      href="/recipes"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                    >
                      <span>Explore Recipe BOM</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/central-kitchen"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Central Kitchen</span>
                    </Link>
                  </div>
                </div>
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Butter Chicken (Single Portion)</div>
                      <div className="text-[11px] text-slate-500">Selling Price: ₹ 420.00</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
                        27.8% Food Cost (OPTIMAL)
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-slate-700">
                      <span>Raw Chicken Breast (220g)</span>
                      <span className="font-mono font-bold text-slate-900">₹ 55.00</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-slate-700">
                      <span>Butter & Dairy Cream (60g)</span>
                      <span className="font-mono font-bold text-slate-900">₹ 28.00</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-slate-700">
                      <span>Makhani Gravy Base & Spices</span>
                      <span className="font-mono font-bold text-slate-900">₹ 33.80</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-800">Gross Margin Per Plate</span>
                    <span className="font-mono font-bold text-slate-900">₹ 303.20 (72.2% Margin)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'aggregators' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded bg-orange-100 text-orange-800 border border-orange-200">
                    Aggregators Hub
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">Swiggy & Zomato Integrated on One Screen</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    No need to keep 5 tablets running on the front counter. Manage Swiggy and Zomato store opening
                    statuses, accept delivery orders, and track rider arrival status right inside Royal Feast.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>1-Tap Store Toggle (Turn Swiggy & Zomato Online / Offline instantly)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Live Delivery Rider Tracker (`ASSIGNED`, `ARRIVED`, `PICKED_UP`, `DELIVERED`)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Universal menu and inventory auto-sync</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Link
                      href="/aggregators"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                    >
                      <span>Manage Aggregators</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="font-bold text-slate-900 text-xs">Swiggy Live Webhook Feed</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold font-mono">
                      ONLINE
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Order #SW-9021 • Rahul Sharma</div>
                      <div className="text-[11px] text-slate-500">Rider: Amit Kumar (Arrived at outlet)</div>
                    </div>
                    <div className="text-right font-mono font-bold text-amber-600">₹ 820.00</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">Order #ZM-4412 • Priya Verma</div>
                      <div className="text-[11px] text-slate-500">Rider: Deepak (On the way to customer)</div>
                    </div>
                    <div className="text-right font-mono font-bold text-amber-600">₹ 1,140.00</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded bg-purple-100 text-purple-800 border border-purple-200">
                    AI Intelligence Suite
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">Bilingual AI Voice Copilot & Smart POs</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Ask questions in Hindi or English: <em>"आज का सेल कितना हुआ?"</em> or <em>"Which ingredients are
                    running low?"</em> Royal Feast AI calculates Days of Inventory Remaining (DOIR) and auto-drafts
                    purchase orders in 1 click.
                  </p>
                  <ul className="space-y-2.5 pt-2 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Natural Hindi & English voice query understanding with text-to-speech audio</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Predictive DOIR consumption run-rate calculations from real order tickets</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>1-Click Auto-Draft Purchase Order generator to prevent kitchen stockouts</span>
                    </li>
                  </ul>
                  <div className="pt-4">
                    <Link
                      href="/ai-assistant"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                    >
                      <span>Talk to AI Assistant</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 font-sans">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="text-[11px] text-amber-700 font-bold mb-1">Restaurant Owner Query:</div>
                    <p className="text-slate-800">"आज की कुल बिक्री और टॉप सेलिंग आइटम बताओ।"</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-2">
                    <div className="text-[11px] text-purple-800 font-bold flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      <span>AI Copilot Response:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      "आज कुल बिक्री <strong>₹ 48,250</strong> रही (38 ऑर्डर्स)। सबसे ज्यादा बिकने वाला आइटम{' '}
                      <strong>Butter Chicken</strong> (19 प्लेट्स) और <strong>Garlic Naan</strong> (42 पीस) रहे। पनीर का
                      स्टॉक अगले 1.8 दिन में खत्म हो जाएगा — क्या मैं ऑटोमैटिक PO ड्राफ्ट कर दूँ?"
                    </p>
                    <div className="pt-1">
                      <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[10px]">
                        1-Click PO Draft Available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 5. Complete 6-Phase Capabilities Grid (Light Mode) ─────────── */}
      <section id="modules" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-extrabold uppercase text-amber-600 tracking-wider mb-2">
            Enterprise Architecture
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            All 6 Phases. Zero Compromises.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-4">
            A battle-tested technology stack powering every single touchpoint of front-of-house hospitality and
            back-of-house operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Phase 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-amber-600 mb-1">PHASE 1</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Dine-in POS, Outlets & Billing</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Multi-branch master configuration, table session tracking, item modifier sets, split billing, and GSTR-1
              compliant tax reports.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
              <Link href="/pos" className="hover:underline flex items-center gap-1">
                Open POS <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-emerald-600 mb-1">PHASE 2</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Recipe BOM & Food Cost %</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Dish Bill-of-Materials with live food cost benchmarks (&lt;28% green, 28-35% yellow, &gt;35% warning banner),
              wastage loss audits, and vendor PO workflows.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
              <Link href="/recipes" className="hover:underline flex items-center gap-1">
                View BOM Recipes <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-blue-600 mb-1">PHASE 3</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">QR Menu & Online Storefront</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Contactless dining table QR ordering + commission-free customer delivery & takeaway storefront with promo
              coupons and loyalty points redemption.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
              <Link href="/store/lko-01" className="hover:underline flex items-center gap-1">
                Preview Storefront <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-orange-600 mb-1">PHASE 4</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Aggregators & BCG Matrix</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Swiggy & Zomato webhook ingestion, live delivery rider tracker, walk-in waitlist table management, and BCG
              4-Quadrant Menu Engineering.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600">
              <Link href="/aggregators" className="hover:underline flex items-center gap-1">
                Aggregator Hub <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Phase 5 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-purple-600 mb-1">PHASE 5</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Central Kitchen & Accounting</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Inter-branch transfer requests, commissary production batch planner, daily operating expense ledgers, and
              automated P&L net margin statements.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600">
              <Link href="/central-kitchen" className="hover:underline flex items-center gap-1">
                Central Kitchen <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Phase 6 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-pink-400 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-pink-600 mb-1">PHASE 6</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Bilingual AI & Smart PO</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Voice-enabled bilingual restaurant intelligence assistant with speech-to-text, DOIR inventory depletion
              velocity, and 1-click vendor PO generation.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-pink-600">
              <Link href="/ai-assistant" className="hover:underline flex items-center gap-1">
                AI Copilot <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Super Admin Governance Notice (Light Warm Box) ──────────── */}
      <section id="architecture" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border border-amber-300 shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>RESTRICTED B2B ARCHITECTURE</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Zero Direct Signups. Super Admin Governed.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  To protect brand isolation and ensure commercial compliance, restaurants cannot directly self-register.
                  The <strong>Platform Owner (Super Admin)</strong> provisions every restaurant organization, default
                  outlet, owner credentials, floor tables, and subscription plan atomically.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>6-Step Atomic Provisioning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>1-Click Owner Impersonation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Instant Tenant Suspension</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Live Platform GMV Analytics</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Link
                  href="/super-admin"
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm text-center shadow-md shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Enter Super Admin Console
                </Link>
                <span className="text-[11px] text-center text-slate-500 font-medium">Credentials: superadmin@rms.com / admin123</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Subscription Pricing Matrix (Light Mode) ────────────────── */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-extrabold uppercase text-amber-600 tracking-wider mb-2">
            Commercial SaaS Plans
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Transparent Pricing for Growing Food Brands
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-4">
            Select a plan tailored to your restaurant format. All subscriptions are provisioned and managed directly
            via the Super Admin Platform Owner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Starter */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-2">Starter</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono mb-1">₹ 1,499</div>
              <div className="text-[11px] text-slate-500 mb-6">per outlet / month</div>
              <p className="text-xs text-slate-600 mb-6">Ideal for quick-service kiosks, cafes & dessert parlours.</p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dine-In & Takeaway POS</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Unlimited KOTs & Invoices</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Basic Inventory & Daily P&L</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/super-admin"
                className="w-full block text-center py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
              >
                Provision via Admin
              </Link>
            </div>
          </div>

          {/* Growth */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-2">Growth</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono mb-1">₹ 2,999</div>
              <div className="text-[11px] text-slate-500 mb-6">per outlet / month</div>
              <p className="text-xs text-slate-600 mb-6">Full service dining with captain order pads & KDS screens.</p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Paperless Kitchen KDS Kanban</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Captain Handheld Waiter App</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Contactless Table QR Ordering</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/super-admin"
                className="w-full block text-center py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
              >
                Provision via Admin
              </Link>
            </div>
          </div>

          {/* Pro (Popular) */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-50 via-white to-white border-2 border-amber-500 shadow-xl shadow-amber-500/10 flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              Most Popular
            </div>
            <div>
              <div className="text-xs font-bold text-amber-700 uppercase mb-2">Pro</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono mb-1">₹ 4,999</div>
              <div className="text-[11px] text-slate-500 mb-6">per outlet / month</div>
              <p className="text-xs text-slate-600 mb-6">Multi-outlet brands needing Recipe BOM & Swiggy/Zomato.</p>
              <ul className="space-y-2.5 text-xs text-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Everything in Growth</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Recipe BOM & Live Food Cost %</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Swiggy & Zomato Webhook Hub</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Online Storefront (0 Commission)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bilingual AI Copilot Assistant</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/super-admin"
                className="w-full block text-center py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold transition-all shadow-md shadow-amber-500/25"
              >
                Provision Pro Brand
              </Link>
            </div>
          </div>

          {/* Enterprise */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-2">Enterprise</div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono mb-1">₹ 9,999</div>
              <div className="text-[11px] text-slate-500 mb-6">unlimited outlets</div>
              <p className="text-xs text-slate-600 mb-6">Large culinary franchises, commissaries & cloud kitchens.</p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Central Kitchen Commissary</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Inter-Branch Stock Transfers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Developer API & Custom Webhooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dedicated Account Manager</span>
                </li>
              </ul>
            </div>
            <div className="pt-8">
              <Link
                href="/super-admin"
                className="w-full block text-center py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all"
              >
                Provision via Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. Comprehensive Footer (Grounding Dark Slate) ──────────────── */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <Flame className="w-4 h-4 fill-slate-950" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">ROYAL FEAST OS</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The modern Petpooja OS alternative built for high-volume restaurants, QSR chains, bars, and cloud
              kitchens across India.
            </p>
            <div className="text-[11px] text-slate-500">
              Tech Stack: Next.js 14 • Node.js • Prisma ORM • PostgreSQL • Socket.io
            </div>
          </div>

          <div>
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Core Operations</div>
            <ul className="space-y-2">
              <li><Link href="/pos" className="hover:text-amber-400">Dine-In POS</Link></li>
              <li><Link href="/kds" className="hover:text-amber-400">Kitchen KDS</Link></li>
              <li><Link href="/menu" className="hover:text-amber-400">Menu & Catalog</Link></li>
              <li><Link href="/reservations" className="hover:text-amber-400">Waitlist & Tables</Link></li>
              <li><Link href="/reports" className="hover:text-amber-400">BCG Matrix Reports</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Supply & AI</div>
            <ul className="space-y-2">
              <li><Link href="/recipes" className="hover:text-amber-400">Recipe BOM</Link></li>
              <li><Link href="/inventory" className="hover:text-amber-400">Stock & POs</Link></li>
              <li><Link href="/central-kitchen" className="hover:text-amber-400">Central Kitchen</Link></li>
              <li><Link href="/aggregators" className="hover:text-amber-400">Aggregators Hub</Link></li>
              <li><Link href="/ai-assistant" className="hover:text-amber-400">AI Voice Assistant</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Platform & Auth</div>
            <ul className="space-y-2">
              <li><Link href="/login" className="hover:text-amber-400">Staff Sign In</Link></li>
              <li><Link href="/super-admin" className="text-amber-400 font-semibold hover:underline">Super Admin Portal</Link></li>
              <li><Link href="/developers" className="hover:text-amber-400">Developer APIs</Link></li>
              <li><Link href="/accounting" className="hover:text-amber-400">Accounting P&L</Link></li>
              <li><Link href="/store/lko-01" className="hover:text-amber-400">Customer Storefront</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} Royal Feast Operating System. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>All Systems Operational</span>
            </span>
            <span>•</span>
            <span>Commercial B2B SaaS Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
