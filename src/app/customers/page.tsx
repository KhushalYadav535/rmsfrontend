'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  Users,
  Search,
  Plus,
  Award,
  Phone,
  Mail,
  IndianRupee,
  ShoppingBag,
  Gift,
  X,
  Star,
  Clock,
  ArrowRight,
  TrendingUp,
  Receipt,
  MinusCircle,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export default function CustomersPage() {
  const { currentOutlet } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [segmentFilter, setSegmentFilter] = useState<string>('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Loyalty adjustment
  const [loyaltyActionModalOpen, setLoyaltyActionModalOpen] = useState(false);
  const [loyaltyActionType, setLoyaltyActionType] = useState<'earn' | 'redeem'>('earn');
  const [pointsInput, setPointsInput] = useState('');
  const [pointsReason, setPointsReason] = useState('');

  // Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadCustomers();
  }, [segmentFilter]);

  const loadCustomers = async () => {
    setLoading(true);
    const query = segmentFilter !== 'all' ? `?segment=${segmentFilter}` : '';
    const res = await fetchApi(`/customers${query}`);
    if (res.success && res.customers) {
      setCustomers(res.customers);
    }
    setLoading(false);
  };

  const handleOpenCustomerDetail = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setDetailLoading(true);
    const res = await fetchApi(`/customers/${customerId}`);
    if (res.success) {
      setCustomerDetail(res);
    }
    setDetailLoading(false);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchApi('/customers', {
      method: 'POST',
      body: JSON.stringify({ name, phone, email }),
    });

    if (res.success) {
      setAddModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      loadCustomers();
    } else {
      alert(`Error creating customer: ${res.error}`);
    }
  };

  const handleLoyaltySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerDetail?.customer?.id || !pointsInput) return;

    const endpoint = `/customers/${customerDetail.customer.id}/loyalty/${loyaltyActionType}`;
    const res = await fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        points: Number(pointsInput),
        description: pointsReason || `Manual ${loyaltyActionType} by manager`,
      }),
    });

    if (res.success) {
      setLoyaltyActionModalOpen(false);
      setPointsInput('');
      setPointsReason('');
      handleOpenCustomerDetail(customerDetail.customer.id);
      loadCustomers();
    } else {
      alert(`Loyalty error: ${res.error}`);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7 text-amber-500" />
              <span>Customer CRM & Loyalty Program</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Guest profiles, segmentation (New/Regular/VIP), lifetime spend, and reward points balances
            </p>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>

        {/* Filter Bar with Segmentation Pills */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone or email..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Segments:
            </span>
            {[
              { id: 'all', label: 'All Guests' },
              { id: 'new', label: 'New (0 Orders)' },
              { id: 'regular', label: 'Regular (2-9)' },
              { id: 'vip', label: 'VIP (10+ Orders)' },
              { id: 'inactive', label: 'Inactive (30d+)' },
            ].map((seg) => (
              <button
                key={seg.id}
                onClick={() => setSegmentFilter(seg.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  segmentFilter === seg.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {seg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Segment</th>
                  <th className="p-4 text-center">Lifetime Orders</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">Loyalty Balance</th>
                  <th className="p-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      {loading ? 'Loading customer records...' : 'No customers found.'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => {
                    let segmentBadge = { label: 'New', bg: 'bg-slate-100', text: 'text-slate-700' };
                    if (c.totalOrders >= 10) {
                      segmentBadge = { label: 'VIP Club', bg: 'bg-amber-50', text: 'text-amber-700 border border-amber-200' };
                    } else if (c.totalOrders >= 2) {
                      segmentBadge = { label: 'Regular', bg: 'bg-blue-50', text: 'text-blue-700 border border-blue-200' };
                    }

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">
                          <button
                            onClick={() => handleOpenCustomerDetail(c.id)}
                            className="hover:text-amber-600 underline decoration-dotted text-left"
                          >
                            {c.name}
                          </button>
                        </td>
                        <td className="p-4">
                          <p className="font-mono text-slate-700">{c.phone}</p>
                          {c.email && <p className="text-[11px] text-slate-400">{c.email}</p>}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${segmentBadge.bg} ${segmentBadge.text}`}
                          >
                            {segmentBadge.label}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-800">
                          {c.totalOrders}
                        </td>
                        <td className="p-4 font-black text-slate-900">
                          ₹{Number(c.totalSpent || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{c.loyaltyPoints || 0} pts</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenCustomerDetail(c.id)}
                            className="px-3 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                          >
                            View History
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── MODALS ────────────────────────────────────────── */}

      {/* Add Customer Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomer}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Add New Guest Profile</h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vikram Sharma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. vikram@gmail.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Save Guest
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer Detail Drawer Modal */}
      {selectedCustomerId && customerDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">{customerDetail.customer.name}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customerDetail.customer.phone}</span>
                  {customerDetail.customer.email && (
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customerDetail.customer.email}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Spent</span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  ₹{Number(customerDetail.customer.totalSpent || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Orders Visited</span>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  {customerDetail.customer.totalOrders || 0} visits
                </p>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">Loyalty Points</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setLoyaltyActionType('earn');
                        setLoyaltyActionModalOpen(true);
                      }}
                      className="text-amber-800 hover:text-amber-950 p-0.5"
                      title="Add points"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setLoyaltyActionType('redeem');
                        setLoyaltyActionModalOpen(true);
                      }}
                      className="text-amber-800 hover:text-amber-950 p-0.5"
                      title="Redeem points"
                    >
                      <MinusCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-base font-black text-amber-900 mt-0.5">
                  {customerDetail.customer.loyaltyPoints || 0} pts
                </p>
              </div>
            </div>

            {/* Loyalty Transactions Log */}
            <div>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Loyalty Point History
              </h3>
              {(!customerDetail.customer.loyaltyTransactions || customerDetail.customer.loyaltyTransactions.length === 0) ? (
                <p className="text-xs text-slate-400 italic py-2">No loyalty transactions recorded yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {customerDetail.customer.loyaltyTransactions.map((tx: any) => (
                    <div key={tx.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{tx.description}</span>
                        <p className="text-[10px] text-slate-400 font-mono">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                      <span className={`font-mono font-bold ${tx.action === 'EARN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.action === 'EARN' ? `+${tx.points}` : `-${tx.points}`} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Log */}
            <div>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-500" />
                Completed Orders ({customerDetail.orders?.length || 0})
              </h3>
              {(!customerDetail.orders || customerDetail.orders.length === 0) ? (
                <p className="text-xs text-slate-400 italic py-2">No completed orders found for this phone number.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customerDetail.orders.map((o: any) => (
                    <div key={o.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-900">Order #{o.orderNumber} ({o.orderType})</span>
                        <span className="text-slate-900">₹{o.totalAmount}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {o.items?.map((it: any) => `${it.quantity}x ${it.menuItem?.name}`).join(', ')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {new Date(o.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Earn / Redeem Points Modal */}
      {loyaltyActionModalOpen && customerDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLoyaltySubmit} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {loyaltyActionType === 'earn' ? 'Add Reward Points' : 'Redeem Points'}
              </h3>
              <button
                type="button"
                onClick={() => setLoyaltyActionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Points Amount *</label>
              <input
                type="number"
                min="1"
                required
                value={pointsInput}
                onChange={(e) => setPointsInput(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Note</label>
              <input
                type="text"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="e.g. Birthday gift / Complaint compensation"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLoyaltyActionModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Confirm {loyaltyActionType === 'earn' ? 'Credit' : 'Redeem'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
