'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  Factory,
  ChefHat,
  Plus,
  CheckCircle,
  Clock,
  Boxes,
  Truck,
  ArrowRight,
  Flame,
  Calendar,
} from 'lucide-react';

export default function CentralKitchenPage() {
  const { currentOutlet } = useAuth();
  const [indents, setIndents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'indents' | 'batches'>('indents');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [targetQuantity, setTargetQuantity] = useState(50);
  const [unit, setUnit] = useState('L');
  const [headChef, setHeadChef] = useState('Chef Sanjeev');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCKData();
  }, []);

  const loadCKData = async () => {
    setLoading(true);
    const [indRes, batRes] = await Promise.all([
      fetchApi('/central-kitchen/indents'),
      fetchApi('/central-kitchen/batches'),
    ]);

    if (indRes.success) setIndents(indRes.indents || []);
    if (batRes.success) setBatches(batRes.batches || []);
    setLoading(false);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetchApi('/central-kitchen/batches', {
      method: 'POST',
      body: {
        itemName,
        targetQuantity: Number(targetQuantity),
        unit,
        headChef,
        rawMaterialsConsumed: [
          { name: 'Tomatoes & Puree', quantity: targetQuantity * 0.8, unit: 'KG' },
          { name: 'Dairy & Butter', quantity: targetQuantity * 0.2, unit: 'KG' },
          { name: 'Spice Mix Blend', quantity: targetQuantity * 0.05, unit: 'KG' },
        ],
      },
    });

    if (res.success) {
      setBatchModalOpen(false);
      setItemName('');
      loadCKData();
    } else {
      alert(`Error: ${res.error}`);
    }
    setSubmitting(false);
  };

  const handleCompleteBatch = async (batchId: string) => {
    const res = await fetchApi(`/central-kitchen/batches/${batchId}/complete`, {
      method: 'PATCH',
      body: { outletId: currentOutlet?.id },
    });
    if (res.success) {
      loadCKData();
    }
  };

  const handleUpdateIndentStatus = async (indentId: string, nextStatus: string) => {
    const res = await fetchApi(`/central-kitchen/indents/${indentId}/status`, {
      method: 'PATCH',
      body: { status: nextStatus },
    });
    if (res.success) {
      loadCKData();
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                Phase 5 — Central Kitchen (CK)
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Commissary & Batch Cooking</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Factory className="w-6 h-6 text-purple-600" /> Central Production Kitchen
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setBatchModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Plan Production Batch
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Indents</p>
              <p className="text-2xl font-black text-slate-800 mt-1">
                {indents.filter((i) => i.status === 'SUBMITTED' || i.status === 'PREPARING').length}
              </p>
              <span className="text-xs font-medium text-amber-600 mt-1 block">Requires dispatch to branches</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Batches</p>
              <p className="text-2xl font-black text-purple-600 mt-1">
                {batches.filter((b) => b.status !== 'COMPLETED').length}
              </p>
              <span className="text-xs font-medium text-slate-500 mt-1 block">In cooking kettle</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Batches Completed Today</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {batches.filter((b) => b.status === 'COMPLETED').length}
              </p>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Semi-finished inventory added</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost Standardization</p>
              <p className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <ChefHat className="w-5 h-5 text-purple-500" /> 100% Consistent
              </p>
              <span className="text-xs font-medium text-slate-500 mt-1 block">BOM Recipe scaled</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('indents')}
              className={`px-4 py-2 font-bold text-sm rounded-xl transition-all ${
                activeTab === 'indents'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Outlet Indents & Requisitions ({indents.length})
            </button>
            <button
              onClick={() => setActiveTab('batches')}
              className={`px-4 py-2 font-bold text-sm rounded-xl transition-all ${
                activeTab === 'batches'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Commissary Production Batches ({batches.length})
            </button>
          </div>

          {/* Tab 1: Indents & Requisitions */}
          {activeTab === 'indents' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Branch Requisitions</h3>
                  <p className="text-xs text-slate-500">Daily indents sent by outlets for Central Kitchen replenishment</p>
                </div>
              </div>

              <div className="space-y-3">
                {indents.map((indent) => (
                  <div
                    key={indent.id}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-purple-100 text-purple-800">
                          {indent.indentNumber}
                        </span>
                        <span className="text-sm font-black text-slate-900">{indent.outletName}</span>
                        <span className="text-xs text-slate-400">• Needed by: {indent.requiredByDate}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {indent.items.map((it: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs"
                          >
                            {it.quantity} {it.unit} • {it.name}
                          </span>
                        ))}
                      </div>
                      {indent.notes && <p className="text-xs text-slate-500 italic mt-1">"{indent.notes}"</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {indent.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleUpdateIndentStatus(indent.id, 'PREPARING')}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                        >
                          Accept & Start Prep
                        </button>
                      )}
                      {indent.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateIndentStatus(indent.id, 'DISPATCHED')}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" /> Dispatch to Branch
                        </button>
                      )}
                      {indent.status === 'DISPATCHED' && (
                        <button
                          onClick={() => handleUpdateIndentStatus(indent.id, 'DELIVERED')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Confirm Delivery
                        </button>
                      )}
                      {indent.status === 'DELIVERED' && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Fulfilled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Production Batches */}
          {activeTab === 'batches' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Commercial Production Batches</h3>
                  <p className="text-xs text-slate-500">Bulk cooking runs with automatic raw material stock deduction</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-purple-100 text-purple-800">
                          {batch.batchNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold ${
                            batch.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : batch.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {batch.status}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 mt-2.5 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-purple-600" /> {batch.itemName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Target Yield: {batch.targetQuantity} {batch.unit} • Chef: {batch.headChef}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Raw Materials Consumed:
                        </p>
                        <div className="space-y-1 text-xs text-slate-600">
                          {batch.rawMaterialsConsumed.map((mat: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                              <span>• {mat.name}</span>
                              <span className="font-bold text-slate-800">{mat.quantity} {mat.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Date: {batch.plannedDate}</span>
                      {batch.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCompleteBatch(batch.id)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                        >
                          Complete & Add to Stock
                        </button>
                      )}
                      {batch.status === 'COMPLETED' && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Stock Updated
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal: Plan Production Batch */}
        {batchModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-purple-600" /> Plan New Production Batch
              </h2>

              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Batch Dish / Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Makhani Gravy Base"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Target Quantity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={targetQuantity}
                      onChange={(e) => setTargetQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Unit of Measure</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="L">Liters (L)</option>
                      <option value="KG">Kilograms (KG)</option>
                      <option value="PORTION">Portions</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Head Chef in Charge</label>
                  <input
                    type="text"
                    value={headChef}
                    onChange={(e) => setHeadChef(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-800 space-y-1">
                  <p className="font-bold">Automated BOM Consumption:</p>
                  <p>When completed, ingredients (Tomatoes, Butter, Spices) will automatically be deducted from Central Kitchen inventory.</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBatchModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Planning...' : 'Start Production'}
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
