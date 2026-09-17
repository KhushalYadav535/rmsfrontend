'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  Building2,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Factory,
  Search,
  ArrowRight,
  Store,
} from 'lucide-react';

export default function OutletsPage() {
  const { currentOutlet, setCurrentOutlet } = useAuth();
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [isCentralKitchen, setIsCentralKitchen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOutlets();
  }, []);

  const loadOutlets = async () => {
    setLoading(true);
    const res = await fetchApi('/outlets');
    if (res.success) {
      setOutlets(res.outlets || []);
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingOutlet(null);
    setName('');
    setCode(`BR-${Math.floor(10 + Math.random() * 90)}`);
    setAddress('');
    setCity('');
    setStateName('Uttar Pradesh');
    setPincode('');
    setPhone('');
    setEmail('');
    setGstin('');
    setFssaiNumber('');
    setIsCentralKitchen(false);
    setModalOpen(true);
  };

  const openEditModal = (o: any) => {
    setEditingOutlet(o);
    setName(o.name);
    setCode(o.code);
    setAddress(o.address);
    setCity(o.city);
    setStateName(o.state);
    setPincode(o.pincode || '');
    setPhone(o.phone);
    setEmail(o.email || '');
    setGstin(o.gstin || '');
    setFssaiNumber(o.fssaiNumber || '');
    setIsCentralKitchen(o.isCentralKitchen || false);
    setModalOpen(true);
  };

  const handleSaveOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name,
      code,
      address,
      city,
      state: stateName,
      pincode,
      phone,
      email,
      gstin,
      fssaiNumber,
      isCentralKitchen,
    };

    let res;
    if (editingOutlet) {
      res = await fetchApi(`/outlets/${editingOutlet.id}`, { method: 'PUT', body: payload });
    } else {
      res = await fetchApi('/outlets', { method: 'POST', body: payload });
    }

    if (res.success) {
      setModalOpen(false);
      loadOutlets();
    } else {
      alert(`Error: ${res.error}`);
    }
    setSubmitting(false);
  };

  const filteredOutlets = outlets.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.code.toLowerCase().includes(search.toLowerCase()) ||
    o.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Phase 1 & 5 — Multi-Branch
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Enterprise Management</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Store className="w-6 h-6 text-amber-500" /> Outlets & Restaurant Branches
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Branch
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Outlets</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{outlets.length}</p>
              <span className="text-xs font-medium text-emerald-600 mt-1 block">Active across India</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Central Kitchens</p>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {outlets.filter((o) => o.isCentralKitchen).length}
              </p>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Bulk prep & distribution</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Branch</p>
              <p className="text-xl font-bold text-slate-900 mt-1 truncate">
                {currentOutlet?.name || 'None Selected'}
              </p>
              <span className="text-xs font-semibold text-amber-600 mt-1 block">Current session</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">GST Compliance</p>
              <p className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5" /> 100% Verified
              </p>
              <span className="text-xs font-medium text-slate-500 mt-1 block">CGST/SGST registered</span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search branches by name, city, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Outlets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutlets.map((outlet) => {
              const isCurrent = currentOutlet?.id === outlet.id;
              return (
                <div
                  key={outlet.id}
                  className={`bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all shadow-sm hover:shadow-md ${
                    isCurrent ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                            {outlet.code}
                          </span>
                          {outlet.isCentralKitchen && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                              <Factory className="w-3 h-3" /> Central Kitchen
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-2">{outlet.name}</h3>
                      </div>
                      <button
                        onClick={() => openEditModal(outlet)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{outlet.address}, {outlet.city}, {outlet.state} {outlet.pincode ? `- ${outlet.pincode}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{outlet.phone}</span>
                      </div>
                      {outlet.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{outlet.email}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block font-medium">GSTIN:</span>
                          <span className="font-semibold text-slate-700">{outlet.gstin || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">FSSAI:</span>
                          <span className="font-semibold text-slate-700">{outlet.fssaiNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle className="w-4 h-4" /> Operational
                    </span>

                    {isCurrent ? (
                      <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                        Current Branch
                      </span>
                    ) : (
                      <button
                        onClick={() => setCurrentOutlet(outlet)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                      >
                        Switch To <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal: Create or Edit Outlet */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                {editingOutlet ? 'Edit Branch Details' : 'Register New Restaurant Branch'}
              </h2>

              <form onSubmit={handleSaveOutlet} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Branch Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Feast Gomti Nagar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Branch Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LKO-02"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shop 12, Ground Floor, Riverside Mall"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="branch@royalfeast.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">GSTIN</label>
                    <input
                      type="text"
                      placeholder="09AAAAA0000A1Z5"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">FSSAI License</label>
                    <input
                      type="text"
                      placeholder="14-digit FSSAI"
                      value={fssaiNumber}
                      onChange={(e) => setFssaiNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCentralKitchen}
                      onChange={(e) => setIsCentralKitchen(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Factory className="w-3.5 h-3.5 text-purple-600" /> Designate as Central Kitchen (CK)
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-400 ml-6">Central kitchens can receive bulk indents and run production batches.</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingOutlet ? 'Update Branch' : 'Create Branch'}
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
