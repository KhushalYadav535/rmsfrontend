'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { useRouter } from 'next/navigation';
import {
  Grid,
  Users,
  Clock,
  Receipt,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  MoveRight,
  Layers,
  FolderPlus,
} from 'lucide-react';

export default function TablesPage() {
  const { currentOutlet } = useAuth();
  const router = useRouter();
  const [floors, setFloors] = useState<any[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [createTableModalOpen, setCreateTableModalOpen] = useState(false);
  const [editTableModalOpen, setEditTableModalOpen] = useState(false);
  const [createFloorModalOpen, setCreateFloorModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Form states
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');
  const [newTableShape, setNewTableShape] = useState('SQUARE');
  const [targetFloorId, setTargetFloorId] = useState('');

  const [editTableNumber, setEditTableNumber] = useState('');
  const [editTableCapacity, setEditTableCapacity] = useState('4');

  const [newFloorName, setNewFloorName] = useState('');
  const [newFloorLevel, setNewFloorLevel] = useState('1');

  const [targetTransferTableId, setTargetTransferTableId] = useState('');

  useEffect(() => {
    if (currentOutlet) {
      loadFloors();
    }
  }, [currentOutlet]);

  useEffect(() => {
    const socket = getSocket();
    const handleTableUpdate = () => {
      loadFloors();
    };

    socket.on('table:status_updated', handleTableUpdate);
    socket.on('table:order_placed', handleTableUpdate);
    return () => {
      socket.off('table:status_updated', handleTableUpdate);
      socket.off('table:order_placed', handleTableUpdate);
    };
  }, []);

  const loadFloors = async () => {
    if (!currentOutlet) return;
    const res = await fetchApi(`/outlets/${currentOutlet.id}/floors`);
    if (res.success && res.floors) {
      setFloors(res.floors);
      if (!selectedFloorId && res.floors.length > 0) {
        setSelectedFloorId(res.floors[0].id);
        setTargetFloorId(res.floors[0].id);
      }
    }
    setLoading(false);
  };

  const currentFloor = floors.find((f) => f.id === selectedFloorId) || floors[0];

  const handleUpdateStatus = async (tableId: string, status: string) => {
    const res = await fetchApi(`/outlets/${currentOutlet?.id}/tables/${tableId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (res.success) {
      setSelectedTable(null);
      loadFloors();
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOutlet || !targetFloorId || !newTableNumber) return;

    const res = await fetchApi(`/outlets/${currentOutlet.id}/floors/${targetFloorId}/tables`, {
      method: 'POST',
      body: JSON.stringify({
        tableNumber: newTableNumber,
        capacity: Number(newTableCapacity),
        shape: newTableShape,
      }),
    });

    if (res.success) {
      setCreateTableModalOpen(false);
      setNewTableNumber('');
      setNewTableCapacity('4');
      loadFloors();
    } else {
      alert(`Error creating table: ${res.error}`);
    }
  };

  const handleEditTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOutlet || !selectedTable) return;

    const res = await fetchApi(`/outlets/${currentOutlet.id}/tables/${selectedTable.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        tableNumber: editTableNumber,
        capacity: Number(editTableCapacity),
      }),
    });

    if (res.success) {
      setEditTableModalOpen(false);
      setSelectedTable(null);
      loadFloors();
    } else {
      alert(`Error updating table: ${res.error}`);
    }
  };

  const handleDeleteTable = async (tableId: string, tableNumber: string) => {
    if (!confirm(`Are you sure you want to remove Table ${tableNumber}?`)) return;
    if (!currentOutlet) return;

    const res = await fetchApi(`/outlets/${currentOutlet.id}/tables/${tableId}`, {
      method: 'DELETE',
    });

    if (res.success) {
      setSelectedTable(null);
      loadFloors();
    } else {
      alert(`Error deleting table: ${res.error}`);
    }
  };

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOutlet || !newFloorName) return;

    const res = await fetchApi(`/outlets/${currentOutlet.id}/floors`, {
      method: 'POST',
      body: JSON.stringify({
        name: newFloorName,
        level: Number(newFloorLevel) || 1,
      }),
    });

    if (res.success) {
      setCreateFloorModalOpen(false);
      setNewFloorName('');
      loadFloors();
    } else {
      alert(`Error creating floor: ${res.error}`);
    }
  };

  const handleTransferTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOutlet || !selectedTable || !targetTransferTableId) return;

    const res = await fetchApi(`/outlets/${currentOutlet.id}/tables/${selectedTable.id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({
        targetTableId: targetTransferTableId,
      }),
    });

    if (res.success) {
      setTransferModalOpen(false);
      setSelectedTable(null);
      loadFloors();
    } else {
      alert(`Error transferring table: ${res.error}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Available' };
      case 'OCCUPIED':
      case 'RUNNING':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'In Service' };
      case 'BILLING':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Billing Due' };
      case 'RESERVED':
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', label: 'Reserved' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500', label: status };
    }
  };

  const allOtherTables = floors
    .flatMap((f) => f.tables || [])
    .filter((t) => t.id !== selectedTable?.id && t.status === 'AVAILABLE');

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Grid className="w-7 h-7 text-amber-500" />
              Interactive Floor Plan & Tables
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live visual table status, floor management, and table operations for {currentOutlet?.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateFloorModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4 text-slate-500" />
              <span>Add Floor</span>
            </button>

            <button
              onClick={() => {
                if (floors.length === 0) {
                  alert('Please add a floor first before creating tables.');
                  setCreateFloorModalOpen(true);
                  return;
                }
                setTargetFloorId(currentFloor?.id || floors[0].id);
                setCreateTableModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Table</span>
            </button>
          </div>
        </div>

        {/* Status Legend Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          {/* Floor Selection Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {floors.map((fl) => (
              <button
                key={fl.id}
                onClick={() => setSelectedFloorId(fl.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  currentFloor?.id === fl.id
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {fl.name} ({fl.tables?.length || 0} Tables)
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold shrink-0">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Free
            </span>
            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> In Service
            </span>
            <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Billing
            </span>
            <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Reserved
            </span>
          </div>
        </div>

        {/* Visual Floor Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(!currentFloor?.tables || currentFloor.tables.length === 0) ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <Grid className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-sm text-slate-700">No tables on this floor yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add Table" above to create your seating layout</p>
            </div>
          ) : (
            currentFloor.tables.map((table: any) => {
              const badge = getStatusBadge(table.status);
              const activeOrder = table.orders && table.orders.length > 0 ? table.orders[0] : null;

              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`bg-white border ${badge.border} rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between h-48 group relative overflow-hidden`}
                >
                  {/* Header: Table Number & Status Pill */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                        {table.tableNumber}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Users className="w-3 h-3" />
                        <span>{table.capacity} Seater</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>

                  {/* Active Order Preview if running */}
                  {activeOrder ? (
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                      <div className="flex justify-between items-center text-amber-900 font-bold text-[11px]">
                        <span>#{activeOrder.orderNumber}</span>
                        <span>₹{activeOrder.totalAmount}</span>
                      </div>
                      <p className="text-[10px] font-medium text-amber-700 truncate mt-0.5">
                        {activeOrder.items?.length || 0} items ordered
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-[11px] text-slate-300 font-medium">
                      Ready for Guests
                    </div>
                  )}

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-amber-600 transition-colors">
                    <span>Manage Table</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── MODALS ────────────────────────────────────────── */}

      {/* Table Detail & Actions Drawer Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Table {selectedTable.tableNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedTable.capacity} Seats • {selectedTable.status}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditTableNumber(selectedTable.tableNumber);
                    setEditTableCapacity(String(selectedTable.capacity));
                    setEditTableModalOpen(true);
                  }}
                  className="p-1 text-slate-400 hover:text-amber-600 rounded-lg"
                  title="Edit table details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTable(selectedTable.id, selectedTable.tableNumber)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                  title="Delete table"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Changers */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Change Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { status: 'AVAILABLE', label: 'Mark Available' },
                  { status: 'RUNNING', label: 'Mark In Service' },
                  { status: 'BILLING', label: 'Mark Billing' },
                  { status: 'RESERVED', label: 'Mark Reserved' },
                ].map((st) => (
                  <button
                    key={st.status}
                    onClick={() => handleUpdateStatus(selectedTable.id, st.status)}
                    className="p-2 rounded-xl border border-slate-200 hover:border-amber-400 text-xs font-bold hover:bg-amber-50 text-slate-700 transition-all text-left"
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transfer Table Action */}
            {selectedTable.status !== 'AVAILABLE' && (
              <button
                onClick={() => setTransferModalOpen(true)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MoveRight className="w-4 h-4 text-slate-500" />
                <span>Transfer to Another Table</span>
              </button>
            )}

            {/* Jump to POS for this table */}
            <button
              onClick={() => {
                router.push(`/pos?tableId=${selectedTable.id}`);
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>Punch Order at POS</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Table Modal */}
      {createTableModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateTable} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Add New Dining Table</h3>
              <button
                type="button"
                onClick={() => setCreateTableModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Floor</label>
              <select
                value={targetFloorId}
                onChange={(e) => setTargetFloorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                {floors.map((fl) => (
                  <option key={fl.id} value={fl.id}>
                    {fl.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Table Number / Label *</label>
              <input
                type="text"
                required
                placeholder="e.g. T-1, Outdoor 4"
                value={newTableNumber}
                onChange={(e) => setNewTableNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Table Shape</label>
                <select
                  value={newTableShape}
                  onChange={(e) => setNewTableShape(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="SQUARE">Square</option>
                  <option value="RECTANGLE">Rectangle</option>
                  <option value="ROUND">Round</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateTableModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Create Table
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Table Modal */}
      {editTableModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditTable} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Edit Table</h3>
              <button
                type="button"
                onClick={() => setEditTableModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Table Number *</label>
              <input
                type="text"
                required
                value={editTableNumber}
                onChange={(e) => setEditTableNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Seating Capacity</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={editTableCapacity}
                onChange={(e) => setEditTableCapacity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditTableModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Floor Modal */}
      {createFloorModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateFloor} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Add Dining Section / Floor</h3>
              <button
                type="button"
                onClick={() => setCreateFloorModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Floor / Section Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ground Floor, Rooftop Lounge"
                value={newFloorName}
                onChange={(e) => setNewFloorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Floor Level Number</label>
              <input
                type="number"
                value={newFloorLevel}
                onChange={(e) => setNewFloorLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateFloorModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
              >
                Create Floor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfer Table Modal */}
      {transferModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleTransferTable} className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                Transfer from Table {selectedTable.tableNumber}
              </h3>
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              This will reassign all active running orders, KOT items, and guest tabs from Table {selectedTable.tableNumber} to the selected destination table.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Available Destination Table *</label>
              <select
                value={targetTransferTableId}
                onChange={(e) => setTargetTransferTableId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="">-- Choose destination table --</option>
                {allOtherTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    Table {t.tableNumber} ({t.capacity} seats)
                  </option>
                ))}
              </select>
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
                Transfer Order
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
