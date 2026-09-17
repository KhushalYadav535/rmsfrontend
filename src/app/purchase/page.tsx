'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Building2,
  Phone,
  Mail,
  Receipt,
  ArrowUpRight,
  Package,
  Layers,
  History,
  X,
  AlertCircle,
  Calendar,
  ChevronRight,
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstin?: string;
  paymentTerms?: string;
  createdAt: string;
  _count?: { purchaseOrders: number };
}

interface PurchaseOrderItem {
  id: string;
  ingredientId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  ingredient: {
    id: string;
    name: string;
    unit: string;
  };
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: Supplier;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  orderedAt: string;
  receivedAt?: string;
  notes?: string;
  items: PurchaseOrderItem[];
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPrice: number;
}

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  costAmount?: number;
  reason?: string;
  createdAt: string;
  ingredient: { name: string; unit: string };
  outlet?: { name: string };
}

export default function PurchasePage() {
  const { currentOutlet } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers' | 'movements'>('orders');

  // Data states
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createPoModalOpen, setCreatePoModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [viewPoModalOpen, setViewPoModalOpen] = useState(false);
  const [receiveModalPo, setReceiveModalPo] = useState<PurchaseOrder | null>(null);

  // New PO Form state
  const [newPoSupplierId, setNewPoSupplierId] = useState('');
  const [newPoItems, setNewPoItems] = useState<{ ingredientId: string; quantity: number; unitPrice: number }[]>([
    { ingredientId: '', quantity: 1, unitPrice: 0 },
  ]);

  // New Supplier Form state
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '',
    paymentTerms: 'NET30',
  });

  useEffect(() => {
    loadAllData();
  }, [currentOutlet]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadOrders(), loadSuppliers(), loadIngredients(), loadMovements()]);
    setLoading(false);
  };

  const loadOrders = async () => {
    const res = await fetchApi('/purchase/purchase-orders');
    if (res.success && res.purchaseOrders) {
      setOrders(res.purchaseOrders);
    }
  };

  const loadSuppliers = async () => {
    const res = await fetchApi('/purchase/suppliers');
    if (res.success && res.suppliers) {
      setSuppliers(res.suppliers);
    }
  };

  const loadIngredients = async () => {
    const res = await fetchApi('/inventory/ingredients');
    if (res.success && res.ingredients) {
      setIngredients(res.ingredients);
    }
  };

  const loadMovements = async () => {
    const res = await fetchApi('/purchase/stock-movements');
    if (res.success && res.movements) {
      setMovements(res.movements);
    }
  };

  // PO Creation handlers
  const handleAddItemRow = () => {
    setNewPoItems([...newPoItems, { ingredientId: ingredients[0]?.id || '', quantity: 1, unitPrice: ingredients[0]?.costPrice || 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (newPoItems.length > 1) {
      setNewPoItems(newPoItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...newPoItems];
    if (field === 'ingredientId') {
      const ing = ingredients.find((i) => i.id === value);
      updated[index] = {
        ...updated[index],
        ingredientId: value,
        unitPrice: ing ? Number(ing.costPrice) : 0,
      };
    } else {
      updated[index] = { ...updated[index], [field]: Number(value) };
    }
    setNewPoItems(updated);
  };

  const calculatePoTotal = () => {
    return newPoItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoSupplierId) {
      alert('Please select a supplier');
      return;
    }
    const validItems = newPoItems.filter((i) => i.ingredientId && i.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one valid item');
      return;
    }

    const res = await fetchApi('/purchase/purchase-orders', {
      method: 'POST',
      body: JSON.stringify({
        supplierId: newPoSupplierId,
        items: validItems,
      }),
    });

    if (res.success) {
      setCreatePoModalOpen(false);
      setNewPoItems([{ ingredientId: '', quantity: 1, unitPrice: 0 }]);
      loadOrders();
    } else {
      alert(`Error creating PO: ${res.error}`);
    }
  };

  // PO Status & Receive handlers
  const handleUpdatePoStatus = async (id: string, status: string) => {
    const res = await fetchApi(`/purchase/purchase-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      loadOrders();
    } else {
      alert(`Error updating status: ${res.error}`);
    }
  };

  const handleConfirmReceive = async () => {
    if (!receiveModalPo || !currentOutlet) return;
    const res = await fetchApi(`/purchase/purchase-orders/${receiveModalPo.id}/receive`, {
      method: 'POST',
      body: JSON.stringify({ outletId: currentOutlet.id }),
    });

    if (res.success) {
      setReceiveModalPo(null);
      loadOrders();
      loadMovements();
    } else {
      alert(`Error receiving PO: ${res.error}`);
    }
  };

  // Supplier Form handlers
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingSupplier ? `/purchase/suppliers/${editingSupplier.id}` : '/purchase/suppliers';
    const method = editingSupplier ? 'PUT' : 'POST';

    const res = await fetchApi(endpoint, {
      method,
      body: JSON.stringify(supplierForm),
    });

    if (res.success) {
      setSupplierModalOpen(false);
      setEditingSupplier(null);
      setSupplierForm({ name: '', contactPerson: '', phone: '', email: '', gstin: '', paymentTerms: 'NET30' });
      loadSuppliers();
    } else {
      alert(`Error saving supplier: ${res.error}`);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((po) => {
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // KPI Calculations
  const totalSpend = orders
    .filter((po) => po.status === 'RECEIVED')
    .reduce((sum, po) => sum + Number(po.totalAmount), 0);
  const pendingOrders = orders.filter((po) => po.status === 'ORDERED' || po.status === 'DRAFT').length;
  const receivedOrders = orders.filter((po) => po.status === 'RECEIVED').length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="w-7 h-7 text-amber-500" />
              Procurement & Purchase Orders
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage vendor supply chains, purchase orders, goods receiving, and ingredient stock inflows
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === 'orders' && (
              <button
                onClick={() => {
                  if (suppliers.length === 0) {
                    alert('Please add a supplier first before creating a purchase order.');
                    setActiveTab('suppliers');
                    return;
                  }
                  if (ingredients.length === 0) {
                    alert('No ingredients found. Please create ingredients in Inventory first.');
                    return;
                  }
                  setNewPoSupplierId(suppliers[0].id);
                  setNewPoItems([{ ingredientId: ingredients[0].id, quantity: 1, unitPrice: Number(ingredients[0].costPrice) }]);
                  setCreatePoModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-amber-500/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Purchase Order
              </button>
            )}
            {activeTab === 'suppliers' && (
              <button
                onClick={() => {
                  setEditingSupplier(null);
                  setSupplierForm({ name: '', contactPerson: '', phone: '', email: '', gstin: '', paymentTerms: 'NET30' });
                  setSupplierModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-amber-500/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Supplier
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total POs</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{orders.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Delivery</p>
              <p className="text-xl font-black text-blue-700 mt-0.5">{pendingOrders}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Received & Stocked</p>
              <p className="text-xl font-black text-emerald-700 mt-0.5">{receivedOrders}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Procurement Spend</p>
              <p className="text-xl font-black text-violet-700 mt-0.5">₹{totalSpend.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs font-bold tracking-wide transition-colors relative flex items-center gap-2 ${
              activeTab === 'orders' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            Purchase Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`pb-3 text-xs font-bold tracking-wide transition-colors relative flex items-center gap-2 ${
              activeTab === 'suppliers' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Vendors & Suppliers ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`pb-3 text-xs font-bold tracking-wide transition-colors relative flex items-center gap-2 ${
              activeTab === 'movements' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Stock Inflow Movement Log
          </button>
        </div>

        {/* 1. PURCHASE ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search PO number or vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Status:
                </span>
                {['ALL', 'DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      statusFilter === st
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* PO List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">PO Number</th>
                      <th className="px-5 py-3.5">Supplier</th>
                      <th className="px-5 py-3.5">Date Ordered</th>
                      <th className="px-5 py-3.5">Items</th>
                      <th className="px-5 py-3.5">Total Amount</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                          {loading ? 'Loading purchase orders...' : 'No purchase orders found matching the filter.'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((po) => {
                        const statusColors: Record<string, string> = {
                          DRAFT: 'bg-slate-100 text-slate-700 border-slate-300',
                          ORDERED: 'bg-blue-50 text-blue-700 border-blue-200',
                          RECEIVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
                        };

                        return (
                          <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-4 font-bold text-slate-900">
                              <button
                                onClick={() => {
                                  setSelectedPo(po);
                                  setViewPoModalOpen(true);
                                }}
                                className="hover:text-amber-600 underline decoration-dotted"
                              >
                                {po.poNumber}
                              </button>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800">{po.supplier?.name}</p>
                              <p className="text-[11px] text-slate-400">{po.supplier?.phone}</p>
                            </td>
                            <td className="px-5 py-4 text-slate-500">
                              {new Date(po.orderedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="px-5 py-4 font-medium text-slate-600">
                              {po.items?.length || 0} line items
                            </td>
                            <td className="px-5 py-4 font-black text-slate-900">
                              ₹{Number(po.totalAmount).toLocaleString('en-IN')}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  statusColors[po.status] || 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {po.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right space-x-1.5">
                              {po.status === 'DRAFT' && (
                                <button
                                  onClick={() => handleUpdatePoStatus(po.id, 'ORDERED')}
                                  className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg border border-blue-200 transition-colors"
                                >
                                  Submit Order
                                </button>
                              )}
                              {po.status === 'ORDERED' && (
                                <button
                                  onClick={() => setReceiveModalPo(po)}
                                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-sm transition-colors"
                                >
                                  Receive Goods
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedPo(po);
                                  setViewPoModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                              >
                                View
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
        )}

        {/* 2. SUPPLIERS TAB */}
        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suppliers.map((sup) => (
                <div key={sup.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{sup.name}</h3>
                      {sup.contactPerson && (
                        <p className="text-xs text-slate-500">Contact: {sup.contactPerson}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {sup.paymentTerms || 'NET30'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sup.phone}</span>
                    </div>
                    {sup.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{sup.email}</span>
                      </div>
                    )}
                    {sup.gstin && (
                      <div className="flex items-center gap-2">
                        <Receipt className="w-3.5 h-3.5 text-slate-400" />
                        <span>GSTIN: {sup.gstin}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <span className="text-slate-400 font-medium">
                      {sup._count?.purchaseOrders || 0} Purchase Orders
                    </span>
                    <button
                      onClick={() => {
                        setEditingSupplier(sup);
                        setSupplierForm({
                          name: sup.name,
                          contactPerson: sup.contactPerson || '',
                          phone: sup.phone,
                          email: sup.email || '',
                          gstin: sup.gstin || '',
                          paymentTerms: sup.paymentTerms || 'NET30',
                        });
                        setSupplierModalOpen(true);
                      }}
                      className="text-amber-600 hover:text-amber-700 font-bold"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. STOCK MOVEMENTS TAB */}
        {activeTab === 'movements' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Raw Material</th>
                    <th className="px-5 py-3.5">Movement Type</th>
                    <th className="px-5 py-3.5">Quantity</th>
                    <th className="px-5 py-3.5">Cost Valuation</th>
                    <th className="px-5 py-3.5">Reason / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                        No stock movement records found.
                      </td>
                    </tr>
                  ) : (
                    movements.map((mv) => {
                      const typeBadgeColors: Record<string, string> = {
                        PURCHASE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        MANUAL_ADJUSTMENT: 'bg-blue-50 text-blue-700 border-blue-200',
                        WASTAGE: 'bg-rose-50 text-rose-700 border-rose-200',
                        USAGE_ORDER: 'bg-slate-100 text-slate-700 border-slate-200',
                      };

                      return (
                        <tr key={mv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5 text-slate-500 font-mono">
                            {new Date(mv.createdAt).toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900">
                            {mv.ingredient?.name}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                typeBadgeColors[mv.type] || 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {mv.type}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-black text-slate-800">
                            +{Number(mv.quantity)} {mv.ingredient?.unit}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-slate-700">
                            {mv.costAmount ? `₹${Number(mv.costAmount).toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 truncate max-w-xs">
                            {mv.reason || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── MODALS ────────────────────────────────────────── */}

        {/* CREATE PO MODAL */}
        {createPoModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Create Purchase Order</h2>
                  <p className="text-xs text-slate-500">Order raw materials and ingredients from registered vendors</p>
                </div>
                <button
                  onClick={() => setCreatePoModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Supplier *
                  </label>
                  <select
                    value={newPoSupplierId}
                    onChange={(e) => setNewPoSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500"
                    required
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Order Items *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {newPoItems.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <select
                          value={row.ingredientId}
                          onChange={(e) => handleItemChange(idx, 'ingredientId', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          required
                        >
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({ing.unit})
                            </option>
                          ))}
                        </select>

                        <div className="w-24">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Qty"
                            value={row.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center"
                            required
                          />
                        </div>

                        <div className="w-28">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="Unit Price ₹"
                            value={row.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center"
                            required
                          />
                        </div>

                        <div className="w-24 text-right font-black text-slate-800 text-xs">
                          ₹{(row.quantity * row.unitPrice).toFixed(2)}
                        </div>

                        {newPoItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Total Estimated Amount:
                  </span>
                  <span className="text-lg font-black text-amber-900">
                    ₹{calculatePoTotal().toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreatePoModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
                  >
                    Save & Create PO
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RECEIVE GOODS MODAL */}
        {receiveModalPo && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-2xl p-6 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Receive Goods: {receiveModalPo.poNumber}</h2>
                  <p className="text-xs text-slate-500">Confirm stock receipt at {currentOutlet?.name}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Confirming receipt will automatically increment physical ingredient inventory counts in <strong>{currentOutlet?.name}</strong> and create an audited stock inflow movement.
                </p>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 divide-y divide-slate-100 text-xs">
                  {receiveModalPo.items.map((it) => (
                    <div key={it.id} className="py-2 flex justify-between">
                      <span className="font-semibold text-slate-800">{it.ingredient.name}</span>
                      <span className="font-mono text-slate-600 font-bold">
                        +{it.quantity} {it.ingredient.unit} (₹{it.totalPrice})
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 font-bold text-slate-700">
                  <span>Total Order Value:</span>
                  <span className="text-sm font-black text-slate-900">₹{Number(receiveModalPo.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReceiveModalPo(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReceive}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all"
                >
                  Confirm & Update Stock
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW PO MODAL */}
        {viewPoModalOpen && selectedPo && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-xl border border-slate-200 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-black text-slate-900">{selectedPo.poNumber}</h2>
                  <p className="text-xs text-slate-500">Ordered from {selectedPo.supplier.name}</p>
                </div>
                <button
                  onClick={() => setViewPoModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold">Supplier Contact:</span>
                    <p className="font-semibold text-slate-800">{selectedPo.supplier.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Status:</span>
                    <p className="font-bold text-amber-600">{selectedPo.status}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Date Ordered:</span>
                    <p className="font-semibold text-slate-800">{new Date(selectedPo.orderedAt).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Date Received:</span>
                    <p className="font-semibold text-slate-800">{selectedPo.receivedAt ? new Date(selectedPo.receivedAt).toLocaleString('en-IN') : 'Pending'}</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2">Qty</th>
                        <th className="px-3 py-2">Unit Price</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPo.items.map((it) => (
                        <tr key={it.id}>
                          <td className="px-3 py-2 font-semibold text-slate-800">{it.ingredient.name}</td>
                          <td className="px-3 py-2">{it.quantity} {it.ingredient.unit}</td>
                          <td className="px-3 py-2">₹{Number(it.unitPrice)}</td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900">₹{Number(it.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-200 font-bold text-amber-950">
                  <span>Grand Total:</span>
                  <span className="text-base font-black">₹{Number(selectedPo.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUPPLIER CREATE / EDIT MODAL */}
        {supplierModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-black text-slate-900">
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                <button
                  onClick={() => setSupplierModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Metro Wholesale / Lucknow Dairy"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supplierForm.contactPerson}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                      placeholder="9876543210"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Payment Terms</label>
                    <select
                      value={supplierForm.paymentTerms}
                      onChange={(e) => setSupplierForm({ ...supplierForm, paymentTerms: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    >
                      <option value="COD">Cash on Delivery (COD)</option>
                      <option value="NET7">Net 7 Days</option>
                      <option value="NET15">Net 15 Days</option>
                      <option value="NET30">Net 30 Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    placeholder="orders@vendor.com"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={supplierForm.gstin}
                    onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                    placeholder="09AAAAA0000A1Z5"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSupplierModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
                  >
                    Save Supplier
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
