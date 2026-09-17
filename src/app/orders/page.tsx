'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  ShoppingBag,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  X,
  ChefHat,
  Bell,
  CheckCheck,
  MoveRight,
  Receipt,
  User,
  Filter,
} from 'lucide-react';

export default function OrdersPage() {
  const { currentOutlet } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('Customer changed mind');

  const [transferModalOrder, setTransferModalOrder] = useState<any>(null);
  const [targetTableId, setTargetTableId] = useState('');
  const [availableTables, setAvailableTables] = useState<any[]>([]);

  useEffect(() => {
    if (currentOutlet) {
      loadOrders();
      loadTables();
    }
  }, [currentOutlet]);

  const loadOrders = async () => {
    setLoading(true);
    const res = await fetchApi(`/orders?outletId=${currentOutlet?.id}`);
    if (res.success && res.orders) {
      setOrders(res.orders);
    }
    setLoading(false);
  };

  const loadTables = async () => {
    if (!currentOutlet) return;
    const res = await fetchApi(`/outlets/${currentOutlet.id}/floors`);
    if (res.success && res.floors) {
      const allT = res.floors.flatMap((f: any) => f.tables || []);
      setAvailableTables(allT);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const res = await fetchApi(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (res.success) {
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status }));
      }
    } else {
      alert(`Error updating order status: ${res.error}`);
    }
  };

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOrder) return;

    const res = await fetchApi(`/orders/${cancelModalOrder.id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason: cancelReason }),
    });

    if (res.success) {
      setCancelModalOrder(null);
      if (selectedOrder && selectedOrder.id === cancelModalOrder.id) {
        setSelectedOrder(null);
      }
      loadOrders();
    } else {
      alert(`Error cancelling order: ${res.error}`);
    }
  };

  const handleTransferTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferModalOrder || !targetTableId) return;

    const res = await fetchApi(`/orders/${transferModalOrder.id}/transfer-table`, {
      method: 'POST',
      body: JSON.stringify({ targetTableId }),
    });

    if (res.success) {
      setTransferModalOrder(null);
      setTargetTableId('');
      loadOrders();
      if (selectedOrder && selectedOrder.id === transferModalOrder.id) {
        setSelectedOrder(null);
      }
    } else {
      alert(`Error transferring table: ${res.error}`);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;
    const matchesSearch =
      ord.orderNumber.toString().includes(search) ||
      (ord.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (ord.customerPhone || '').includes(search) ||
      (ord.table?.tableNumber || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
      case 'VOIDED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'PREPARING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'READY':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SERVED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-amber-500" />
            <span>Orders Lifecycle & Service Status</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time table order tracking, kitchen status progression, table reassignments, and billing reconciliation for {currentOutlet?.name}
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, table, customer..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {['ALL', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Type / Location</th>
                  <th className="p-4">Guest Details</th>
                  <th className="p-4">Items Ordered</th>
                  <th className="p-4">Bill Amount</th>
                  <th className="p-4">Live Status</th>
                  <th className="p-4 text-right">Quick Lifecycle Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      {loading ? 'Loading orders...' : 'No orders found matching the filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-black text-slate-900">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="hover:text-amber-600 underline decoration-dotted"
                        >
                          #{ord.orderNumber}
                        </button>
                        <p className="text-[10px] font-mono font-normal text-slate-400">
                          {new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">
                          {ord.table ? `Table ${ord.table.tableNumber}` : ord.orderType}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">{ord.orderType}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{ord.customerName || 'Walk-in Guest'}</p>
                        {ord.customerPhone && <p className="text-[10px] text-slate-400 font-mono">{ord.customerPhone}</p>}
                      </td>
                      <td className="p-4 text-slate-600 max-w-xs truncate">
                        {ord.items?.map((it: any) => `${it.quantity}x ${it.menuItem?.name}`).join(', ') || 'No items'}
                      </td>
                      <td className="p-4 font-black text-slate-900">
                        ₹{ord.totalAmount}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        {/* Progressive status actions */}
                        {ord.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'PREPARING')}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs"
                          >
                            Mark Preparing
                          </button>
                        )}
                        {ord.status === 'PREPARING' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'READY')}
                            className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-xs"
                          >
                            Mark Ready
                          </button>
                        )}
                        {ord.status === 'READY' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'SERVED')}
                            className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg text-xs"
                          >
                            Mark Served
                          </button>
                        )}
                        {ord.status === 'SERVED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(ord.id, 'COMPLETED')}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs"
                          >
                            Complete
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── MODALS ────────────────────────────────────────── */}

      {/* Order Detail Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Order #{selectedOrder.orderNumber} ({selectedOrder.orderType})
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedOrder.table ? `Table ${selectedOrder.table.tableNumber} • ` : ''}
                  {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status progression bar */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">Current Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadge(selectedOrder.status)}`}>
                {selectedOrder.status}
              </span>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((it: any) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2 font-bold text-slate-800">
                        {it.menuItem?.name}
                        {it.variant && <span className="text-[10px] text-slate-400 block font-normal">({it.variant.name})</span>}
                        {it.notes && <span className="text-[10px] text-amber-600 block">Note: {it.notes}</span>}
                      </td>
                      <td className="px-3 py-2 font-mono">{it.quantity}</td>
                      <td className="px-3 py-2">₹{it.unitPrice}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-900">₹{it.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center bg-amber-50 p-3 rounded-2xl border border-amber-200 text-amber-950 font-black">
              <span>Total Bill:</span>
              <span className="text-base">₹{selectedOrder.totalAmount}</span>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              {selectedOrder.status !== 'CANCELLED' && selectedOrder.status !== 'COMPLETED' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCancelModalOrder(selectedOrder);
                    }}
                    className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel Order
                  </button>
                  {selectedOrder.table && (
                    <button
                      onClick={() => {
                        setTransferModalOrder(selectedOrder);
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <MoveRight className="w-3.5 h-3.5" /> Transfer Table
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCancelOrder}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Cancel Order #{cancelModalOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Cancellation (Audited)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
              >
                <option value="Customer changed mind">Customer changed mind</option>
                <option value="Long wait time">Long wait time</option>
                <option value="Item not available (86ed)">Item not available (86ed)</option>
                <option value="Wrong punching error">Wrong punching error</option>
                <option value="Customer walked out">Customer walked out</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfer Table Modal */}
      {transferModalOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleTransferTable}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Transfer Order #{transferModalOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setTransferModalOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Destination Table *
              </label>
              <select
                required
                value={targetTableId}
                onChange={(e) => setTargetTableId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-bold"
              >
                <option value="">-- Choose destination table --</option>
                {availableTables
                  .filter((t) => t.id !== transferModalOrder.tableId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      Table {t.tableNumber} ({t.capacity} seats - {t.status})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTransferModalOrder(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Transfer
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
