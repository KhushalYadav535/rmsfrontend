'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  Boxes,
  AlertTriangle,
  Trash2,
  Plus,
  ArrowDownRight,
  TrendingDown,
  X,
  CheckCircle,
  SlidersHorizontal,
  History,
  Edit2,
  RefreshCw,
  Search,
  ArrowUpDown,
  Truck,
  Sparkles,
  Send,
  Building2,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export default function InventoryPage() {
  const { currentOutlet } = useAuth();
  const [activeTab, setActiveTab] = useState<'stock' | 'transfers' | 'forecasting' | 'wastage'>('stock');
  const [stocks, setStocks] = useState<any[]>([]);
  const [wastageRecords, setWastageRecords] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [forecastingData, setForecastingData] = useState<any>(null);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [wastageModalOpen, setWastageModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<any | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Transfer Form
  const [transferToOutletId, setTransferToOutletId] = useState('');
  const [transferIngredientId, setTransferIngredientId] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Wastage Form
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [wastageQty, setWastageQty] = useState('');
  const [wastageReason, setWastageReason] = useState('Burnt in Kitchen');

  // Stock Adjustment Form
  const [adjustIngredientId, setAdjustIngredientId] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Physical Stock Audit Discrepancy');

  // New Ingredient Form
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    unit: 'KG',
    costPrice: '',
    minStockAlert: '5',
  });

  useEffect(() => {
    if (currentOutlet) {
      loadInventory();
    }
  }, [currentOutlet]);

  const loadInventory = async () => {
    setLoading(true);
    const [stockRes, wasteRes, moveRes, trfRes, foreRes, outRes] = await Promise.all([
      fetchApi(`/inventory/stocks?outletId=${currentOutlet?.id}`),
      fetchApi(`/inventory/wastage?outletId=${currentOutlet?.id}`),
      fetchApi(`/inventory/stock-movements?outletId=${currentOutlet?.id}`),
      fetchApi(`/inventory/transfers?outletId=${currentOutlet?.id}`),
      fetchApi(`/inventory/forecasting?outletId=${currentOutlet?.id}`),
      fetchApi('/outlets'),
    ]);

    if (stockRes.success && stockRes.stocks) {
      setStocks(stockRes.stocks);
      if (stockRes.stocks.length > 0) {
        if (!selectedIngredientId) setSelectedIngredientId(stockRes.stocks[0].ingredientId);
        if (!adjustIngredientId) setAdjustIngredientId(stockRes.stocks[0].ingredientId);
        if (!transferIngredientId) setTransferIngredientId(stockRes.stocks[0].ingredientId);
      }
    }
    if (wasteRes.success && wasteRes.wastageRecords) setWastageRecords(wasteRes.wastageRecords);
    if (moveRes.success && moveRes.movements) setMovements(moveRes.movements);
    if (trfRes.success && trfRes.transfers) setTransfers(trfRes.transfers);
    if (foreRes.success) setForecastingData(foreRes);
    if (outRes.success && outRes.outlets) {
      setOutlets(outRes.outlets);
      const other = outRes.outlets.find((o: any) => o.id !== currentOutlet?.id);
      if (other) setTransferToOutletId(other.id);
    }
    setLoading(false);
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOutlet || !transferToOutletId || !transferIngredientId || !transferQty) return;
    const ing = stocks.find((s) => s.ingredientId === transferIngredientId)?.ingredient;

    const res = await fetchApi('/inventory/transfers', {
      method: 'POST',
      body: {
        fromOutletId: currentOutlet.id,
        toOutletId: transferToOutletId,
        notes: transferNotes,
        items: [{
          ingredientId: transferIngredientId,
          ingredientName: ing?.name || 'Raw Material',
          unit: ing?.unit || 'KG',
          quantity: Number(transferQty),
        }],
      },
    });

    if (res.success) {
      setTransferModalOpen(false);
      setTransferQty('');
      setTransferNotes('');
      loadInventory();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleDispatchTransfer = async (id: string) => {
    const res = await fetchApi(`/inventory/transfers/${id}/dispatch`, { method: 'PATCH' });
    if (res.success) loadInventory();
    else alert(`Dispatch error: ${res.error}`);
  };

  const handleReceiveTransfer = async (id: string) => {
    const res = await fetchApi(`/inventory/transfers/${id}/receive`, { method: 'PATCH' });
    if (res.success) loadInventory();
    else alert(`Receive error: ${res.error}`);
  };

  const handleAutoPO = async () => {
    if (!forecastingData?.forecasts) return;
    const itemsToOrder = forecastingData.forecasts
      .filter((f: any) => f.riskLevel === 'CRITICAL' || f.riskLevel === 'WARNING')
      .map((f: any) => ({
        ingredientId: f.id,
        quantity: f.suggestedReorderQuantity || 10,
        unitPrice: f.costPerUnit || 100,
      }));

    if (itemsToOrder.length === 0) {
      alert('All raw materials are currently at healthy inventory levels!');
      return;
    }

    const suppliersRes = await fetchApi('/inventory/suppliers');
    const supplierId = suppliersRes.suppliers?.[0]?.id || 'sup-default';

    const res = await fetchApi('/inventory/forecasting/auto-po', {
      method: 'POST',
      body: { outletId: currentOutlet?.id, supplierId, items: itemsToOrder },
    });

    if (res.success) {
      alert(res.message);
      loadInventory();
    } else {
      alert(`Auto-PO error: ${res.error}`);
    }
  };

  const handleRecordWastage = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchApi('/inventory/wastage', {
      method: 'POST',
      body: JSON.stringify({
        outletId: currentOutlet?.id,
        ingredientId: selectedIngredientId,
        quantity: Number(wastageQty),
        reason: wastageReason,
      }),
    });

    if (res.success) {
      setWastageModalOpen(false);
      setWastageQty('');
      loadInventory();
    } else {
      alert(`Error logging wastage: ${res.error}`);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchApi('/inventory/stock-adjust', {
      method: 'POST',
      body: JSON.stringify({
        outletId: currentOutlet?.id,
        ingredientId: adjustIngredientId,
        quantity: Number(adjustQty),
        reason: adjustReason,
      }),
    });

    if (res.success) {
      setAdjustModalOpen(false);
      setAdjustQty('');
      loadInventory();
    } else {
      alert(`Error adjusting stock: ${res.error}`);
    }
  };

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingIngredient
      ? `/inventory/ingredients/${editingIngredient.ingredientId || editingIngredient.id}`
      : '/inventory/ingredients';
    const method = editingIngredient ? 'PUT' : 'POST';

    const res = await fetchApi(endpoint, {
      method,
      body: JSON.stringify({
        name: ingredientForm.name,
        unit: ingredientForm.unit,
        costPrice: Number(ingredientForm.costPrice),
        minStockAlert: Number(ingredientForm.minStockAlert),
      }),
    });

    if (res.success) {
      setIngredientModalOpen(false);
      setEditingIngredient(null);
      setIngredientForm({ name: '', unit: 'KG', costPrice: '', minStockAlert: '5' });
      loadInventory();
    } else {
      alert(`Error saving ingredient: ${res.error}`);
    }
  };

  const filteredStocks = stocks.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValuation = stocks.reduce((sum, s) => sum + (s.stockValuation || 0), 0);
  const lowStockCount = stocks.filter((s) => s.isLowStock).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-7 h-7 text-amber-500" />
              Raw Materials & Stock Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theoretical inventory, auto-deduction BOM, stock audit adjustments, and wastage records for {currentOutlet?.name}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block mr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Stock Valuation
              </span>
              <p className="text-base font-black text-slate-900">
                ₹{totalValuation.toLocaleString('en-IN')}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingIngredient(null);
                setIngredientForm({ name: '', unit: 'KG', costPrice: '', minStockAlert: '5' });
                setIngredientModalOpen(true);
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Ingredient</span>
            </button>

            <button
              onClick={() => setAdjustModalOpen(true)}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Adjust Stock</span>
            </button>

            <button
              onClick={() => setWastageModalOpen(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Record Wastage</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'stock'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Raw Materials & Stock</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-semibold">
              {stocks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'transfers'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Inter-Branch Stock Transfers</span>
            {transfers.filter((t) => t.status === 'REQUESTED' || t.status === 'DISPATCHED').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-semibold">
                {transfers.filter((t) => t.status === 'REQUESTED' || t.status === 'DISPATCHED').length} active
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('forecasting')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'forecasting'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Forecasting & Smart PO</span>
            {forecastingData?.criticalRiskCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-semibold animate-pulse">
                {forecastingData.criticalRiskCount} critical
              </span>
            )}
          </button>
        </div>

        {/* ─── TAB 1: RAW MATERIALS & STOCK ─── */}
        {activeTab === 'stock' && (
          <>
            {/* Quick KPI Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Total Tracked Items</p>
                  <p className="text-lg font-black text-slate-900">{stocks.length} Raw Materials</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Low Stock Alerts</p>
                  <p className="text-lg font-black text-rose-700">{lowStockCount} Items Below Threshold</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Stock In Stock Valuation</p>
                  <p className="text-lg font-black text-emerald-700">₹{totalValuation.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Stock Items Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="font-bold text-xs text-slate-800 flex items-center gap-2">
                  <span>Current Ingredients & Real-Time Balances</span>
                  <span className="text-slate-400">({filteredStocks.length})</span>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search raw material..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Ingredient Name</th>
                      <th className="p-4">Unit</th>
                      <th className="p-4">Cost Price</th>
                      <th className="p-4">Current Stock</th>
                      <th className="p-4">Min Reorder Alert</th>
                      <th className="p-4">Total Value</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStocks.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          {loading ? 'Loading inventory stocks...' : 'No ingredients found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredStocks.map((st) => (
                        <tr key={st.ingredientId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{st.name}</td>
                          <td className="p-4 font-mono text-slate-500">{st.unit}</td>
                          <td className="p-4 text-slate-600">₹{st.costPrice} / {st.unit}</td>
                          <td className="p-4 font-black text-slate-900 text-sm">
                            {st.currentStock} {st.unit}
                          </td>
                          <td className="p-4 text-slate-500">{st.minStockAlert} {st.unit}</td>
                          <td className="p-4 font-bold text-slate-900">₹{st.stockValuation}</td>
                          <td className="p-4">
                            {st.isLowStock ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Low Stock Reorder</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3" />
                                <span>Optimal</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                setAdjustIngredientId(st.ingredientId);
                                setAdjustModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 transition-colors"
                            >
                              Adjust
                            </button>
                            <button
                              onClick={() => {
                                setEditingIngredient(st);
                                setIngredientForm({
                                  name: st.name,
                                  unit: st.unit,
                                  costPrice: String(st.costPrice),
                                  minStockAlert: String(st.minStockAlert),
                                });
                                setIngredientModalOpen(true);
                              }}
                              className="px-2 py-1 text-slate-400 hover:text-slate-700"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dual Panels: Stock Movement Log & Wastage Log */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stock Movement Log */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-500" />
                    Audit Trail / Stock Movements
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Recent 20 movements</span>
                </div>

                {movements.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No stock movements logged yet.
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                        <tr>
                          <th className="p-3">Time</th>
                          <th className="p-3">Item</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Qty</th>
                          <th className="p-3">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {movements.map((mv) => (
                          <tr key={mv.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono text-[10px] text-slate-400">
                              {new Date(mv.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3 font-bold text-slate-800">{mv.ingredient?.name}</td>
                            <td className="p-3">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                                {mv.type}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-800">
                              {mv.quantity} {mv.ingredient?.unit}
                            </td>
                            <td className="p-3 text-slate-500 truncate max-w-[120px]">{mv.reason || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Wastage Log Section */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    Recent Kitchen Wastage Records
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Logged losses & spoilage</span>
                </div>

                {wastageRecords.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No wastage entries recorded yet
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="p-3">Time</th>
                          <th className="p-3">Ingredient</th>
                          <th className="p-3">Quantity</th>
                          <th className="p-3">Cost Loss</th>
                          <th className="p-3">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {wastageRecords.map((w) => (
                          <tr key={w.id} className="hover:bg-slate-50/50">
                            <td className="p-3 text-slate-500 font-mono text-[10px]">
                              {new Date(w.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3 font-bold text-slate-800">{w.ingredient?.name}</td>
                            <td className="p-3 text-rose-600 font-bold">
                              -{w.quantity} {w.ingredient?.unit}
                            </td>
                            <td className="p-3 font-bold text-rose-600">₹{w.costAmount}</td>
                            <td className="p-3 text-slate-600 truncate max-w-[120px]">{w.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ─── TAB 2: INTER-BRANCH STOCK TRANSFERS ─── */}
        {activeTab === 'transfers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-500" />
                  Inter-Branch Stock Transfer Logistics
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transfer raw materials between outlets or central warehouse. Automatically deducts source stock upon dispatch and adds to destination stock upon receive.
                </p>
              </div>
              <button
                onClick={() => setTransferModalOpen(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>New Transfer Request</span>
              </button>
            </div>

            {/* Transfers List */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
                <span>Consignment Transfer History</span>
                <span className="text-slate-400 font-normal">{transfers.length} records</span>
              </div>

              {transfers.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <Truck className="w-10 h-10 mx-auto mb-3 text-slate-300 stroke-1" />
                  <p className="font-bold text-slate-700">No stock transfers recorded yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click "New Transfer Request" to initiate stock movement to another branch.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">Transfer #</th>
                        <th className="p-4">From Outlet</th>
                        <th className="p-4">To Outlet</th>
                        <th className="p-4">Materials & Qty</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {transfers.map((trf) => (
                        <tr key={trf.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-900">{trf.transferNumber}</td>
                          <td className="p-4 font-semibold text-slate-700">
                            {trf.fromOutletName || trf.fromOutletId}
                            {trf.fromOutletId === currentOutlet?.id && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-amber-50 text-amber-700 font-bold">
                                Current
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-semibold text-slate-700">
                            {trf.toOutletName || trf.toOutletId}
                            {trf.toOutletId === currentOutlet?.id && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-blue-50 text-blue-700 font-bold">
                                Current
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {trf.items?.map((item: any, i: number) => (
                              <div key={i} className="font-bold text-slate-800">
                                {item.ingredientName}: {item.quantity} {item.unit}
                              </div>
                            ))}
                            {trf.notes && <div className="text-[10px] text-slate-400 mt-0.5">{trf.notes}</div>}
                          </td>
                          <td className="p-4">
                            {trf.status === 'REQUESTED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Requested
                              </span>
                            )}
                            {trf.status === 'DISPATCHED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                In Transit
                              </span>
                            )}
                            {trf.status === 'RECEIVED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Completed
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-[10px] text-slate-400">
                            {new Date(trf.requestedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-4 text-right">
                            {trf.status === 'REQUESTED' && trf.fromOutletId === currentOutlet?.id && (
                              <button
                                onClick={() => handleDispatchTransfer(trf.id)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                              >
                                Dispatch Consignment
                              </button>
                            )}
                            {trf.status === 'DISPATCHED' && trf.toOutletId === currentOutlet?.id && (
                              <button
                                onClick={() => handleReceiveTransfer(trf.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                              >
                                Mark Received
                              </button>
                            )}
                            {trf.status === 'RECEIVED' && (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-1">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Reconciled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: AI FORECASTING & SMART PO ─── */}
        {activeTab === 'forecasting' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 to-indigo-950 p-6 rounded-2xl text-white shadow-lg">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-purple-200 border border-white/20 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Predictive Inventory Intelligence
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  Days of Inventory Remaining (DOIR) & Smart PO
                </h2>
                <p className="text-xs text-purple-200 mt-1 max-w-xl">
                  AI tracks daily consumption run-rates from completed POS orders and recipe bills of materials (BOM) to forecast raw material exhaustion dates.
                </p>
              </div>

              <button
                onClick={handleAutoPO}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-400/20 flex items-center gap-2 transition-all self-start sm:self-auto"
              >
                <Sparkles className="w-4 h-4 text-purple-900" />
                <span>1-Click Auto-Draft Purchase Order</span>
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Analyzed Items
                </span>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {forecastingData?.totalIngredientsTracked || stocks.length}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Based on 14-day consumption rate</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                  Critical Depletion Risk (&lt;2 Days)
                </span>
                <p className="text-2xl font-black text-rose-600 mt-1">
                  {forecastingData?.criticalRiskCount || 0}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Immediate purchase order recommended</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  Warning Buffer (&lt;4 Days)
                </span>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  {forecastingData?.warningRiskCount || 0}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Approaching minimum reorder threshold</p>
              </div>
            </div>

            {/* Forecasts Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-800 flex items-center justify-between">
                <span>Material Consumption Run-Rates & Forecasted Depletion</span>
                <span className="text-slate-400 font-normal">{forecastingData?.forecasts?.length || 0} items</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Raw Material</th>
                      <th className="p-4">Current Stock</th>
                      <th className="p-4">Avg Daily Run-Rate</th>
                      <th className="p-4">Days Left (DOIR)</th>
                      <th className="p-4">Risk Status</th>
                      <th className="p-4">Suggested Reorder Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {!forecastingData?.forecasts || forecastingData.forecasts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          {loading ? 'Analyzing run rates...' : 'No inventory data available for forecasting.'}
                        </td>
                      </tr>
                    ) : (
                      forecastingData.forecasts.map((f: any) => (
                        <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{f.name}</td>
                          <td className="p-4 font-black text-slate-800">
                            {f.currentStock} {f.unit}
                          </td>
                          <td className="p-4 text-slate-600 font-mono">
                            {f.dailyRunRate} {f.unit} / day
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`font-black ${
                                f.riskLevel === 'CRITICAL'
                                  ? 'text-rose-600'
                                  : f.riskLevel === 'WARNING'
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              }`}>
                                {f.daysOfInventoryRemaining >= 999 ? '∞' : `${f.daysOfInventoryRemaining} Days`}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            {f.riskLevel === 'CRITICAL' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3 h-3" />
                                Critical Out of Stock Risk
                              </span>
                            )}
                            {f.riskLevel === 'WARNING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Warning: Low Buffer
                              </span>
                            )}
                            {f.riskLevel === 'HEALTHY' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3" />
                                Healthy
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-bold text-indigo-700 font-mono">
                            {f.suggestedReorderQuantity} {f.unit}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ────────────────────────────────────────── */}

      {/* Manual Stock Adjust Modal */}
      {adjustModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAdjustStock}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Manual Stock Adjustment</h3>
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Positive numbers add stock (e.g. +5), negative numbers reduce stock (e.g. -2.5). Every adjustment is recorded in the audit trail.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Ingredient *</label>
              <select
                value={adjustIngredientId}
                onChange={(e) => setAdjustIngredientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                required
              >
                {stocks.map((s) => (
                  <option key={s.ingredientId} value={s.ingredientId}>
                    {s.name} (Current: {s.currentStock} {s.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adjustment Quantity (+/-) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="e.g. 10 or -5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Audit Reason *</label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Physical inventory count correction"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20"
              >
                Confirm Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Record Wastage Modal */}
      {wastageModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleRecordWastage}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Record Kitchen Wastage</h3>
              <button
                type="button"
                onClick={() => setWastageModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Raw Material
              </label>
              <select
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
              >
                {stocks.map((s) => (
                  <option key={s.ingredientId} value={s.ingredientId}>
                    {s.name} (Current: {s.currentStock} {s.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quantity Wasted
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={wastageQty}
                onChange={(e) => setWastageQty(e.target.value)}
                placeholder="e.g. 0.5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Wastage
              </label>
              <select
                value={wastageReason}
                onChange={(e) => setWastageReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
              >
                <option value="Burnt in Kitchen">Burnt in Kitchen</option>
                <option value="Expired / Spoiled">Expired / Spoiled</option>
                <option value="Spilled / Dropped">Spilled / Dropped</option>
                <option value="Customer Return (Food Issue)">Customer Return (Food Issue)</option>
                <option value="Preparation Trimming Excess">Preparation Trimming Excess</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWastageModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Log Wastage
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ingredient Create / Edit Modal */}
      {ingredientModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveIngredient}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingIngredient ? 'Edit Ingredient' : 'Add Raw Material Ingredient'}
              </h3>
              <button
                type="button"
                onClick={() => setIngredientModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ingredient Name *</label>
              <input
                type="text"
                required
                value={ingredientForm.name}
                onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                placeholder="e.g. Basmati Rice / Paneer / Butter"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Measurement Unit</label>
                <select
                  value={ingredientForm.unit}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="KG">Kilograms (KG)</option>
                  <option value="GRAMS">Grams (G)</option>
                  <option value="LITRE">Litres (L)</option>
                  <option value="ML">Millilitres (ML)</option>
                  <option value="PIECES">Pieces (PCS)</option>
                  <option value="PACKS">Packs (PKT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit Cost Price ₹ *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={ingredientForm.costPrice}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, costPrice: e.target.value })}
                  placeholder="e.g. 80"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Reorder Alert Threshold</label>
              <input
                type="number"
                step="0.1"
                value={ingredientForm.minStockAlert}
                onChange={(e) => setIngredientForm({ ...ingredientForm, minStockAlert: e.target.value })}
                placeholder="e.g. 5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIngredientModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/20"
              >
                Save Ingredient
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Inter-Branch Transfer Modal */}
      {transferModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTransfer}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-500" />
                <span>Create Stock Transfer</span>
              </h3>
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-xs text-amber-800">
              <p className="font-bold">Source Outlet: {currentOutlet?.name}</p>
              <p className="text-[11px] text-amber-600 mt-0.5">Stock will be reserved and deducted once dispatched.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Destination Branch *</label>
              <select
                value={transferToOutletId}
                onChange={(e) => setTransferToOutletId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                required
              >
                {outlets
                  .filter((o) => o.id !== currentOutlet?.id)
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.city || 'Branch'})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Raw Material *</label>
              <select
                value={transferIngredientId}
                onChange={(e) => setTransferIngredientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                required
              >
                {stocks.map((s) => (
                  <option key={s.ingredientId} value={s.ingredientId}>
                    {s.name} (Available: {s.currentStock} {s.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transfer Quantity *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                placeholder="e.g. 10"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transfer Memo / Notes</label>
              <input
                type="text"
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="e.g. Urgent weekend restocking"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Initiate Transfer
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
