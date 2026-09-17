'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Phone,
  CheckCircle,
  XCircle,
  X,
  UserCheck,
  BellRing,
  Send,
  ArrowRight,
  Armchair,
} from 'lucide-react';

export default function ReservationsPage() {
  const { currentOutlet } = useAuth();
  const [activeTab, setActiveTab] = useState<'reservations' | 'waitlist'>('reservations');
  const [reservations, setReservations] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reservation Form
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [guestCount, setGuestCount] = useState('4');
  const [tableId, setTableId] = useState('');
  const [reservedDate, setReservedDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState('08:00 PM');
  const [notes, setNotes] = useState('');

  // Waitlist Form
  const [waitlistModalOpen, setWaitlistModalOpen] = useState(false);
  const [wlCustomerName, setWlCustomerName] = useState('');
  const [wlCustomerPhone, setWlCustomerPhone] = useState('');
  const [wlPartySize, setWlPartySize] = useState('2');
  const [wlEstimatedWait, setWlEstimatedWait] = useState('15');
  const [wlNotes, setWlNotes] = useState('');

  // Seat Party Modal
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [selectedWaitlistEntry, setSelectedWaitlistEntry] = useState<any>(null);
  const [seatTableId, setSeatTableId] = useState('');

  useEffect(() => {
    if (currentOutlet) {
      loadAllData();
    }
  }, [currentOutlet]);

  const loadAllData = async () => {
    setLoading(true);
    const [resRes, wlRes, flRes] = await Promise.all([
      fetchApi(`/reservations?outletId=${currentOutlet?.id}`),
      fetchApi(`/waitlist?outletId=${currentOutlet?.id}`),
      fetchApi(`/outlets/${currentOutlet?.id}/floors`),
    ]);

    if (resRes.success) setReservations(resRes.reservations || []);
    if (wlRes.success) setWaitlist(wlRes.waitlist || []);
    if (flRes.success && flRes.floors) {
      const allT: any[] = [];
      flRes.floors.forEach((f: any) => allT.push(...f.tables));
      setTables(allT);
      if (allT.length > 0) {
        setTableId(allT[0].id);
        setSeatTableId(allT[0].id);
      }
    }
    setLoading(false);
  };

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchApi('/reservations', {
      method: 'POST',
      body: {
        outletId: currentOutlet?.id,
        tableId: tableId || null,
        customerName,
        customerPhone,
        guestCount: Number(guestCount),
        reservedDate,
        timeSlot,
        notes,
      },
    });

    if (res.success) {
      setAddModalOpen(false);
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');
      loadAllData();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await fetchApi(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
    if (res.success) {
      loadAllData();
    }
  };

  // Waitlist Handlers
  const handleAddWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchApi('/waitlist', {
      method: 'POST',
      body: {
        outletId: currentOutlet?.id,
        customerName: wlCustomerName,
        customerPhone: wlCustomerPhone,
        partySize: Number(wlPartySize),
        estimatedWaitMinutes: Number(wlEstimatedWait),
        notes: wlNotes,
      },
    });

    if (res.success) {
      setWaitlistModalOpen(false);
      setWlCustomerName('');
      setWlCustomerPhone('');
      setWlNotes('');
      loadAllData();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleNotifyCustomer = async (id: string) => {
    const res = await fetchApi(`/waitlist/${id}/notify`, { method: 'PATCH' });
    if (res.success) {
      alert(res.message);
      loadAllData();
    }
  };

  const openSeatModal = (entry: any) => {
    setSelectedWaitlistEntry(entry);
    const availableTable = tables.find((t) => t.status === 'AVAILABLE') || tables[0];
    if (availableTable) setSeatTableId(availableTable.id);
    setSeatModalOpen(true);
  };

  const handleSeatParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWaitlistEntry || !seatTableId) return;

    const res = await fetchApi(`/waitlist/${selectedWaitlistEntry.id}/seat`, {
      method: 'POST',
      body: { tableId: seatTableId },
    });

    if (res.success) {
      setSeatModalOpen(false);
      loadAllData();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleCancelWaitlist = async (id: string) => {
    const res = await fetchApi(`/waitlist/${id}/cancel`, { method: 'PATCH' });
    if (res.success) loadAllData();
  };

  const availableTables = tables.filter((t) => t.status === 'AVAILABLE');

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                Phase 4 — Guest Management
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Table Reservations & Live Queue</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-500" /> Reservations & Live Waitlist
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'reservations' ? (
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Book Table
              </button>
            ) : (
              <button
                onClick={() => setWaitlistModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Add Walk-in to Queue
              </button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Bookings</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{reservations.length}</p>
              <span className="text-xs font-medium text-emerald-600 mt-1 block">Scheduled advance diners</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Waitlist Queue</p>
              <p className="text-2xl font-black text-amber-600 mt-1">
                {waitlist.filter((w) => w.status === 'WAITING' || w.status === 'NOTIFIED').length} Parties
              </p>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Waiting in lobby</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Tables Ready</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{availableTables.length}</p>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Ready for immediate seating</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Wait Time</p>
              <p className="text-2xl font-black text-slate-900 mt-1">12 Mins</p>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Optimal turnover rate</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-4 py-2 font-bold text-sm rounded-xl transition-all ${
                activeTab === 'reservations'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Advance Table Reservations ({reservations.length})
            </button>
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`px-4 py-2 font-bold text-sm rounded-xl transition-all ${
                activeTab === 'waitlist'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Live Walk-in Waitlist Queue ({waitlist.filter((w) => w.status !== 'CANCELLED').length})
            </button>
          </div>

          {/* Tab 1: Advance Bookings */}
          {activeTab === 'reservations' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Confirmed & Pending Bookings</h3>
                  <p className="text-xs text-slate-500">Advance guest bookings with assigned tables and arrival slots</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {reservations.map((res) => (
                  <div key={res.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{res.customerName}</span>
                        <span className="text-xs text-slate-400">({res.customerPhone})</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            res.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : res.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> {res.guestCount} Guests
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(res.reservedDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold text-amber-700">
                          <Clock className="w-3.5 h-3.5" /> {res.timeSlot}
                        </span>
                        {res.table && <span>• Table {res.table.tableNumber}</span>}
                      </div>
                      {res.notes && <p className="text-xs text-slate-500 italic mt-0.5">"{res.notes}"</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      {res.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'CONFIRMED')}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200"
                        >
                          Confirm
                        </button>
                      )}
                      {res.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'SEATED')}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200"
                        >
                          Mark Seated
                        </button>
                      )}
                      {res.status !== 'CANCELLED' && res.status !== 'SEATED' && (
                        <button
                          onClick={() => handleUpdateStatus(res.id, 'CANCELLED')}
                          className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Live Walk-in Waitlist */}
          {activeTab === 'waitlist' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Walk-in Lobby Queue</h3>
                  <p className="text-xs text-slate-500">Live queue management for diners waiting at the host desk</p>
                </div>
              </div>

              <div className="space-y-3">
                {waitlist.filter((w) => w.status !== 'CANCELLED').map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black text-base flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">{entry.customerName}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              entry.status === 'NOTIFIED'
                                ? 'bg-purple-100 text-purple-800 animate-pulse'
                                : entry.status === 'SEATED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {entry.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-bold text-slate-700">
                            <Users className="w-3.5 h-3.5 text-slate-400" /> Party of {entry.partySize}
                          </span>
                          <span>•</span>
                          <span>Phone: {entry.customerPhone}</span>
                          <span>•</span>
                          <span className="text-amber-700 font-bold">~{entry.estimatedWaitMinutes}m wait</span>
                        </div>
                        {entry.notes && <p className="text-xs text-slate-500 italic">"{entry.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {entry.status === 'WAITING' && (
                        <button
                          onClick={() => handleNotifyCustomer(entry.id)}
                          className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" /> Notify via SMS
                        </button>
                      )}

                      {entry.status !== 'SEATED' && (
                        <button
                          onClick={() => openSeatModal(entry)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all"
                        >
                          <Armchair className="w-4 h-4" /> Seat Now
                        </button>
                      )}

                      {entry.status !== 'SEATED' && (
                        <button
                          onClick={() => handleCancelWaitlist(entry.id)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal: Add Reservation */}
        {addModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" /> Book Table Reservation
              </h2>

              <form onSubmit={handleCreateReservation} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Guest Count</label>
                    <input
                      type="number"
                      min="1"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Table</label>
                    <select
                      value={tableId}
                      onChange={(e) => setTableId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="">Auto assign table</option>
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          Table {t.tableNumber} ({t.capacity} seats) - {t.status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                    <input
                      type="date"
                      value={reservedDate}
                      onChange={(e) => setReservedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Time Slot</label>
                    <input
                      type="text"
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Special Notes / Occasion</label>
                  <input
                    type="text"
                    placeholder="e.g. Birthday anniversary, quiet corner"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add to Waitlist */}
        {waitlistModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" /> Add Walk-in Guest to Queue
              </h2>

              <form onSubmit={handleAddWaitlist} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Mishra"
                      value={wlCustomerName}
                      onChange={(e) => setWlCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="For SMS notification"
                      value={wlCustomerPhone}
                      onChange={(e) => setWlCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Party Size (Diners)</label>
                    <input
                      type="number"
                      min="1"
                      value={wlPartySize}
                      onChange={(e) => setWlPartySize(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Estimated Wait (Minutes)</label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={wlEstimatedWait}
                      onChange={(e) => setWlEstimatedWait(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Preferences / Seating Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Window view, high chair needed"
                    value={wlNotes}
                    onChange={(e) => setWlNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWaitlistModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                  >
                    Add to Queue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Seat Customer at Table */}
        {seatModalOpen && selectedWaitlistEntry && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Armchair className="w-5 h-5 text-emerald-600" /> Seat Party at Table
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Seating <strong>{selectedWaitlistEntry.customerName}</strong> (Party of {selectedWaitlistEntry.partySize}).
              </p>

              <form onSubmit={handleSeatParty} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Select Available Table *</label>
                  <select
                    value={seatTableId}
                    onChange={(e) => setSeatTableId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.tableNumber} • Capacity: {t.capacity} seats ({t.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                  <p className="font-bold">Automatic Workflow:</p>
                  <p>1. Table status changes to RUNNING in real time.</p>
                  <p>2. Active table session opens for order punching.</p>
                  <p>3. Waitlist status updates to SEATED.</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSeatModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                  >
                    Confirm & Seat Party
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
