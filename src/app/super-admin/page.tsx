'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '../../lib/api';
import {
  Crown,
  Building2,
  Store,
  Users,
  ShoppingBag,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Key,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  X,
  ArrowRight,
  TrendingUp,
  IndianRupee,
  Sliders,
  LogOut,
  Calendar,
} from 'lucide-react';

export default function SuperAdminPage() {
  const router = useRouter();

  // Authentication State
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('superadmin@rms.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Platform Data
  const [stats, setStats] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('ALL');

  // Modals
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<any | null>(null);

  // Form States
  const [onboardForm, setOnboardForm] = useState({
    restaurantName: '',
    slug: '',
    subscriptionPlan: 'PRO',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPhone: '',
    firstOutletName: '',
    outletCode: '',
    outletCity: 'Lucknow',
    outletAddress: 'Hazratganj Main Market',
    outletPhone: '',
  });

  const [newPlan, setNewPlan] = useState('PRO');
  const [newPassword, setNewPassword] = useState('');

  // Check initial token
  useEffect(() => {
    const savedToken = localStorage.getItem('rms_superadmin_token') || localStorage.getItem('rms_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsSuperAdmin(true);
      loadDashboard(savedToken);
    }
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('http://localhost:5000/api/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('rms_superadmin_token', data.token);
        setAdminToken(data.token);
        setIsSuperAdmin(true);
        loadDashboard(data.token);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rms_superadmin_token');
    localStorage.removeItem('rms_token');
    localStorage.removeItem('rms_outlet_id');
    setAdminToken(null);
    setIsSuperAdmin(false);
    setStats(null);
    setOrganizations([]);
  };

  const loadDashboard = async (tokenToUse?: string) => {
    const token = tokenToUse || adminToken;
    if (!token) return;

    setLoadingData(true);
    try {
      const [statsRes, orgsRes] = await Promise.all([
        fetch('http://localhost:5000/api/super-admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch('http://localhost:5000/api/super-admin/organizations', {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (orgsRes.success) setOrganizations(orgsRes.organizations);
    } catch (err) {
      console.error('Failed to load super admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // 1. Onboard Restaurant
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    try {
      const res = await fetch('http://localhost:5000/api/super-admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(onboardForm),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setOnboardModalOpen(false);
        setOnboardForm({
          restaurantName: '',
          slug: '',
          subscriptionPlan: 'PRO',
          ownerName: '',
          ownerEmail: '',
          ownerPassword: '',
          ownerPhone: '',
          firstOutletName: '',
          outletCode: '',
          outletCity: 'Lucknow',
          outletAddress: 'Hazratganj Main Market',
          outletPhone: '',
        });
        loadDashboard();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // 2. Toggle Status (Suspend / Reactivate)
  const handleToggleStatus = async (org: any) => {
    if (!adminToken) return;
    const targetStatus = org.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const confirmAction = confirm(
      `Are you sure you want to ${targetStatus === 'SUSPENDED' ? 'SUSPEND' : 'REACTIVATE'} '${org.name}'?`
    );
    if (!confirmAction) return;

    try {
      const res = await fetch(`http://localhost:5000/api/super-admin/organizations/${org.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      const data = await res.json();
      if (data.success) {
        loadDashboard();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // 3. Update Plan
  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !selectedOrg) return;

    try {
      const res = await fetch(`http://localhost:5000/api/super-admin/organizations/${selectedOrg.id}/plan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ subscriptionPlan: newPlan, validUntilDays: 365 }),
      });

      const data = await res.json();
      if (data.success) {
        setPlanModalOpen(false);
        setSelectedOrg(null);
        loadDashboard();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // 4. Reset Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !selectedOrg) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/super-admin/organizations/${selectedOrg.id}/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setPasswordModalOpen(false);
        setSelectedOrg(null);
        setNewPassword('');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // 5. Impersonate / Open Restaurant Dashboard
  const handleImpersonate = async (org: any) => {
    if (!adminToken) return;

    try {
      const res = await fetch(`http://localhost:5000/api/super-admin/organizations/${org.id}/impersonate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('rms_token', data.token);
        localStorage.setItem('rms_user', JSON.stringify(data.user));
        if (data.user.outlets && data.user.outlets.length > 0) {
          localStorage.setItem('rms_current_outlet', JSON.stringify(data.user.outlets[0]));
        }
        window.open('/dashboard', '_blank');
      } else {
        alert(`Impersonate error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Filtered organizations
  const filteredOrgs = organizations.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.owner?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlan = selectedPlanFilter === 'ALL' || o.subscriptionPlan === selectedPlanFilter;
    return matchSearch && matchPlan;
  });

  // ─────────────────────────────────────────────────────────────
  // 1. SUPER ADMIN LOGIN SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Crown className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl font-black text-center tracking-tight">RMS Platform Super Admin</h1>
          <p className="text-xs text-slate-400 text-center mt-1 mb-6">
            Closed B2B SaaS Provisioning & Restaurant Control Room
          </p>

          {loginError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold mb-4 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Platform Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Master Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loginLoading ? 'Authenticating...' : 'Access Control Room'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setLoginEmail('superadmin@rms.com');
                setLoginPassword('admin123');
              }}
              className="block w-full text-[11px] text-amber-400 hover:text-amber-300 font-bold"
            >
              ⚡ Fill Default Super Admin Credentials
            </button>
            <Link
              href="/login"
              className="inline-block text-[11px] text-slate-400 hover:text-white underline underline-offset-2 pt-1"
            >
              ← Go to Single Unified Login (/login)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. MAIN SUPER ADMIN CONSOLE
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white">RMS Cloud Super Admin</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SaaS Control Center
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-tenant Restaurant Provisioning & Subscription Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => setOnboardModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Restaurant</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPI Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Restaurant Brands</span>
              <Building2 className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-black text-white">{stats?.totalRestaurants || 0}</p>
            <span className="text-[11px] text-emerald-400 mt-1 block">
              {stats?.activeSubscriptions || 0} Active Subscriptions
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Live Outlets</span>
              <Store className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-black text-white">{stats?.totalOutlets || 0}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Multi-branch operational units</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Platform GMV</span>
              <IndianRupee className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-emerald-400">
              ₹{(stats?.totalPlatformGMV || 0).toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block">System-wide billed volume</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-black text-white">{stats?.totalOrdersProcessed || 0}</p>
            <span className="text-[11px] text-slate-400 mt-1 block">Dine-in, Takeaway & Aggregators</span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['ALL', 'STARTER', 'GROWTH', 'PRO', 'ENTERPRISE'].map((plan) => (
              <button
                key={plan}
                onClick={() => setSelectedPlanFilter(plan)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedPlanFilter === plan
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {plan} {stats?.planBreakdown?.[plan] ? `(${stats.planBreakdown[plan]})` : ''}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by brand name, owner or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="font-bold text-xs text-slate-300 flex items-center gap-2">
              <span>Onboarded Restaurant Organizations</span>
              <span className="text-slate-500">({filteredOrgs.length})</span>
            </div>
            <span className="text-xs text-slate-500 font-normal">Closed Provisioning System</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Brand / Organization</th>
                  <th className="p-4">Owner Credentials</th>
                  <th className="p-4">Outlets</th>
                  <th className="p-4">Subscription Plan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Onboarded</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-600 stroke-1" />
                      <p className="font-bold text-slate-400">No restaurants found matching filters</p>
                      <p className="text-[11px] text-slate-600 mt-1">Click "Onboard New Restaurant" to provision one.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Brand Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-white text-sm">{org.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">slug: {org.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Owner Info */}
                      <td className="p-4">
                        {org.owner ? (
                          <div>
                            <p className="font-bold text-slate-200">{org.owner.name}</p>
                            <p className="text-[11px] text-slate-400">{org.owner.email}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{org.owner.phone}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No owner assigned</span>
                        )}
                      </td>

                      {/* Outlets Count */}
                      <td className="p-4">
                        <span className="font-bold text-slate-200">{org.outletsCount} Branch</span>
                        {org.outlets?.length > 0 && (
                          <p className="text-[10px] text-slate-500">
                            {org.outlets.map((o: any) => o.city).join(', ')}
                          </p>
                        )}
                      </td>

                      {/* Plan Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                            org.subscriptionPlan === 'ENTERPRISE'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : org.subscriptionPlan === 'PRO'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : org.subscriptionPlan === 'GROWTH'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-slate-700/30 text-slate-400 border-slate-700'
                          }`}
                        >
                          {org.subscriptionPlan}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {org.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 font-mono text-[10px] text-slate-400">
                        {new Date(org.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Impersonate */}
                          <button
                            onClick={() => handleImpersonate(org)}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-colors"
                            title="Open Restaurant Dashboard (Impersonate)"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Change Plan */}
                          <button
                            onClick={() => {
                              setSelectedOrg(org);
                              setNewPlan(org.subscriptionPlan);
                              setPlanModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                            title="Upgrade Subscription Plan"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setSelectedOrg(org);
                              setNewPassword('');
                              setPasswordModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                            title="Reset Owner Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Reactivate */}
                          <button
                            onClick={() => handleToggleStatus(org)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              org.status === 'ACTIVE'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                            title={org.status === 'ACTIVE' ? 'Suspend Restaurant' : 'Reactivate Restaurant'}
                          >
                            {org.status === 'ACTIVE' ? (
                              <PauseCircle className="w-3.5 h-3.5" />
                            ) : (
                              <PlayCircle className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ─── MODAL 1: ONBOARD RESTAURANT ───────────────────── */}
      {onboardModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleOnboardSubmit}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Onboard New Restaurant Organization</h3>
              </div>
              <button
                type="button"
                onClick={() => setOnboardModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Creates a brand-new tenant organization, initial main branch, dining tables, starter menu categories, and the restaurant owner account with secure credentials.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Restaurant Brand Info */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  1. Brand Details
                </span>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Restaurant Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bikanervala Express"
                    value={onboardForm.restaurantName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, restaurantName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Brand URL Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. bikanervala-express"
                    value={onboardForm.slug}
                    onChange={(e) => setOnboardForm({ ...onboardForm, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Subscription Plan</label>
                  <select
                    value={onboardForm.subscriptionPlan}
                    onChange={(e) => setOnboardForm({ ...onboardForm, subscriptionPlan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="STARTER">STARTER Tier (1 Outlet)</option>
                    <option value="GROWTH">GROWTH Tier (Up to 3 Outlets)</option>
                    <option value="PRO">PRO Tier (Unlimited Multi-branch)</option>
                    <option value="ENTERPRISE">ENTERPRISE Tier (Full CK & API)</option>
                  </select>
                </div>
              </div>

              {/* Owner Credentials */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  2. Restaurant Owner Account
                </span>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Agarwal"
                    value={onboardForm.ownerName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Owner Login Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@brand.com"
                    value={onboardForm.ownerEmail}
                    onChange={(e) => setOnboardForm({ ...onboardForm, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Owner Initial Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={onboardForm.ownerPassword}
                    onChange={(e) => setOnboardForm({ ...onboardForm, ownerPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Owner Phone</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={onboardForm.ownerPhone}
                    onChange={(e) => setOnboardForm({ ...onboardForm, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Initial Outlet Details */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                3. First Main Branch
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Branch Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Hazratganj Flagship"
                    value={onboardForm.firstOutletName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, firstOutletName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Outlet Code</label>
                  <input
                    type="text"
                    placeholder="e.g. BIK-01"
                    value={onboardForm.outletCode}
                    onChange={(e) => setOnboardForm({ ...onboardForm, outletCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Lucknow"
                    value={onboardForm.outletCity}
                    onChange={(e) => setOnboardForm({ ...onboardForm, outletCity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOnboardModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-amber-500/20"
              >
                Provision & Activate Restaurant
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL 2: UPDATE PLAN ──────────────────────────── */}
      {planModalOpen && selectedOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handlePlanSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm text-white">Change Plan: {selectedOrg.name}</h3>
              <button
                type="button"
                onClick={() => setPlanModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Select Subscription Tier</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
              >
                <option value="STARTER">STARTER Tier</option>
                <option value="GROWTH">GROWTH Tier</option>
                <option value="PRO">PRO Tier</option>
                <option value="ENTERPRISE">ENTERPRISE Tier</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlanModalOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black"
              >
                Save Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL 3: RESET OWNER PASSWORD ────────────────── */}
      {passwordModalOpen && selectedOrg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm text-white">Reset Owner Password</h3>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-400">
              Setting new credentials for owner of <strong>{selectedOrg.name}</strong> ({selectedOrg.owner?.email}).
            </p>

            <div>
              <label className="block font-bold text-slate-300 mb-1">New Master Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
