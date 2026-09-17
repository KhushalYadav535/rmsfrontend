'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, getDefaultRouteForRole } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  LayoutDashboard,
  Receipt,
  Grid,
  ChefHat,
  ShoppingBag,
  UtensilsCrossed,
  Boxes,
  ScrollText,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  BarChart3,
  LogOut,
  Building2,
  ChevronDown,
  Clock,
  Sparkles,
  Wifi,
  Users,
  Tag,
  Calendar,
  Star,
  Bot,
  Truck,
  Factory,
  Landmark,
  Code2,
  Globe,
  Bike,
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, currentOutlet, setCurrentOutlet, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [outletDropdownOpen, setOutletDropdownOpen] = useState(false);
  const [activeShift, setActiveShift] = useState<any>(null);

  useEffect(() => {
    if (currentOutlet) {
      loadShift();
    }
  }, [currentOutlet]);

  const loadShift = async () => {
    if (!currentOutlet) return;
    const res = await fetchApi(`/shifts/active?outletId=${currentOutlet.id}`);
    if (res.success) {
      setActiveShift(res.shift);
    }
  };

  const allNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'] },
    { label: 'POS Billing', href: '/pos', icon: Receipt, badge: 'Counter', roles: ['OWNER', 'MANAGER', 'CASHIER', 'SUPER_ADMIN'] },
    { label: 'Floor & Tables', href: '/tables', icon: Grid, roles: ['OWNER', 'MANAGER', 'CASHIER', 'CAPTAIN', 'SUPER_ADMIN'] },
    { label: 'Kitchen KDS', href: '/kds', icon: ChefHat, badge: 'Live', roles: ['OWNER', 'MANAGER', 'CHEF', 'CAPTAIN', 'SUPER_ADMIN'] },
    { label: 'Orders', href: '/orders', icon: ShoppingBag, roles: ['OWNER', 'MANAGER', 'CASHIER', 'CAPTAIN', 'SUPER_ADMIN'] },
    { label: 'Swiggy & Zomato', href: '/aggregators', icon: Bike, badge: 'Online', roles: ['OWNER', 'MANAGER', 'CASHIER', 'SUPER_ADMIN'] },
    { label: 'Customer CRM', href: '/customers', icon: Users, roles: ['OWNER', 'MANAGER', 'CASHIER', 'SUPER_ADMIN'] },
    { label: 'Menu Catalog', href: '/menu', icon: UtensilsCrossed, roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'] },
    { label: 'Inventory & Stock', href: '/inventory', icon: Boxes, roles: ['OWNER', 'MANAGER', 'INVENTORY_MANAGER', 'CHEF', 'SUPER_ADMIN'] },
    { label: 'Purchase Orders', href: '/purchase', icon: Truck, roles: ['OWNER', 'MANAGER', 'INVENTORY_MANAGER', 'SUPER_ADMIN'] },
    { label: 'Central Kitchen', href: '/central-kitchen', icon: Factory, badge: 'CK', roles: ['OWNER', 'MANAGER', 'CHEF', 'INVENTORY_MANAGER', 'SUPER_ADMIN'] },
    { label: 'Recipes (BOM)', href: '/recipes', icon: ScrollText, roles: ['OWNER', 'MANAGER', 'CHEF', 'INVENTORY_MANAGER', 'SUPER_ADMIN'] },
    { label: 'Reservations & Queue', href: '/reservations', icon: Calendar, roles: ['OWNER', 'MANAGER', 'CASHIER', 'CAPTAIN', 'SUPER_ADMIN'] },
    { label: 'Outlets & Branches', href: '/outlets', icon: Building2, roles: ['OWNER', 'SUPER_ADMIN'] },
    { label: 'Accounting & P&L', href: '/accounting', icon: Landmark, badge: 'Finance', roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'] },
    { label: 'Cash Shift', href: '/shifts', icon: DollarSign, roles: ['OWNER', 'MANAGER', 'CASHIER', 'SUPER_ADMIN'] },
    { label: 'Promo Coupons', href: '/coupons', icon: Tag, roles: ['OWNER', 'MANAGER', 'CASHIER', 'SUPER_ADMIN'] },
    { label: 'AI Assistant', href: '/ai-assistant', icon: Bot, badge: 'Smart', roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'] },
    { label: 'Developer Hub', href: '/developers', icon: Code2, badge: 'API', roles: ['OWNER', 'SUPER_ADMIN'] },
    { label: 'Guest Feedback', href: '/feedback', icon: Star, roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'] },
    { label: 'Audit Trail', href: '/audit', icon: ShieldCheck, badge: 'GST', roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'] },
    { label: 'Reports & Analytics', href: '/reports', icon: BarChart3, roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'] },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/25">
            <Sparkles className="w-6 h-6 text-amber-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-slate-700">Verifying session & permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  const userRole = user?.role || '';
  const navItems = allNavItems.filter((item) => !item.roles || item.roles.includes(userRole));

  // Central Route Authorization Guard
  const currentNavItem = allNavItems.find(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'))
  );
  const isAuthorized = !currentNavItem || !currentNavItem.roles || currentNavItem.roles.includes(userRole);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm z-20">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-amber-100" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-slate-800 text-base leading-tight truncate">
              Royal Feast OS
            </h1>
            <p className="text-[11px] font-medium text-amber-600 truncate">
              Restaurant Operating System
            </p>
          </div>
        </div>

        {/* Outlet Switcher Banner in Sidebar */}
        <div className="px-4 pt-3 pb-1">
          <div className="relative">
            <button
              onClick={() => setOutletDropdownOpen(!outletDropdownOpen)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Current Branch
                  </p>
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {currentOutlet?.name || 'Select Outlet'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {outletDropdownOpen && user?.outlets && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Branch
                </div>
                {user.outlets.map((outlet: any) => (
                  <button
                    key={outlet.id}
                    onClick={() => {
                      setCurrentOutlet(outlet);
                      setOutletDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-amber-50 transition-colors ${
                      currentOutlet?.id === outlet.id
                        ? 'font-bold text-amber-700 bg-amber-50/60'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{outlet.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {outlet.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white font-semibold shadow-sm shadow-amber-500/25'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Live'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-2.5">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.name || 'Staff User'}
              </p>
              <p className="text-[10px] font-medium text-slate-500 capitalize">
                {user?.role?.toLowerCase() || 'Cashier'}
              </p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">
                {currentOutlet?.name}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {currentOutlet?.code}
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            {/* Shift Indicator */}
            {activeShift ? (
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Shift Open (₹{Number(activeShift.openingCash)})</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <span>No Active Shift</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Socket status indicator */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden md:inline">Live Sync Connected</span>
            </div>

            {/* Quick POS Shortcut Button - Only for roles with POS access */}
            {pathname !== '/pos' && ['OWNER', 'MANAGER', 'CASHIER', 'SUPER_ADMIN'].includes(userRole) && (
              <button
                onClick={() => router.push('/pos')}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all active:scale-95"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Open POS</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Page Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/70">
          {!isAuthorized ? (
            <div className="h-full flex items-center justify-center min-h-[450px]">
              <div className="max-w-md w-full bg-white border border-rose-100 rounded-3xl p-8 text-center shadow-xl shadow-rose-500/5">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center mb-5 shadow-sm">
                  <ShieldAlert className="w-8 h-8 text-rose-500" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200/60">
                  <span>Role: {userRole || 'Unauthorized'}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">
                  Access Restricted
                </h2>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Aapka account ({user?.email}) is module (<span className="font-mono font-semibold text-slate-700">{pathname}</span>) ko access karne ke liye authorized nahi hai. Sirf permitted staff roles hi yeh feature dekh sakte hain.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push(getDefaultRouteForRole(userRole))}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <span>Go to My Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={logout}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all"
                  >
                    Switch Account / Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
