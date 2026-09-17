'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Utensils,
  ChefHat,
  CreditCard,
  QrCode,
  DollarSign,
  Printer,
  X,
  CheckCircle,
  Tag,
  Percent,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CartItem {
  menuItemId: string;
  name: string;
  foodType: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  modifiers: { modifierId: string; name: string; price: number }[];
}

export default function POSPage() {
  const { currentOutlet, user } = useAuth();

  // Data states
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [foodTypeFilter, setFoodTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart / Order states
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'>('DINE_IN');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Modal states
  const [activeModifierItem, setActiveModifierItem] = useState<any>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<any[]>([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [settledInvoice, setSettledInvoice] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD' | 'SPLIT'>('UPI');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [upiTendered, setUpiTendered] = useState<number>(0);
  const [cardTendered, setCardTendered] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentOutlet) {
      loadData();
    }
  }, [currentOutlet]);

  const loadData = async () => {
    setLoading(true);
    const [catRes, itemRes, floorRes] = await Promise.all([
      fetchApi('/menu/categories'),
      fetchApi(`/menu/items?outletId=${currentOutlet?.id}`),
      fetchApi(`/outlets/${currentOutlet?.id}/floors`),
    ]);

    if (catRes.success) setCategories(catRes.categories || []);
    if (itemRes.success) setMenuItems(itemRes.items || []);

    if (floorRes.success && floorRes.floors) {
      const allTables: any[] = [];
      floorRes.floors.forEach((f: any) => {
        if (f.tables) allTables.push(...f.tables);
      });
      setTables(allTables);
      if (allTables.length > 0 && !selectedTableId) {
        setSelectedTableId(allTables[0].id);
      }
    }
    setLoading(false);
  };

  // Filtered Menu Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((it) => {
      const matchesCat = selectedCategory === 'ALL' || it.categoryId === selectedCategory;
      const matchesFood = foodTypeFilter === 'ALL' || it.foodType === foodTypeFilter;
      const matchesSearch = it.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesFood && matchesSearch;
    });
  }, [menuItems, selectedCategory, foodTypeFilter, searchQuery]);

  // Add Item to Cart
  const handleItemClick = (item: any) => {
    if (!item.isAvailable) return;

    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setActiveModifierItem(item);
      // Auto-select default modifiers
      const defaults: any[] = [];
      item.modifierGroups.forEach((group: any) => {
        const def = group.modifiers.find((m: any) => m.isDefault);
        if (def) defaults.push(def);
      });
      setSelectedModifiers(defaults);
    } else {
      addToCartDirect(item, []);
    }
  };

  const addToCartDirect = (item: any, modifiers: any[]) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.menuItemId === item.id &&
          JSON.stringify(ci.modifiers) === JSON.stringify(modifiers)
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [
          ...prev,
          {
            menuItemId: item.id,
            name: item.name,
            foodType: item.foodType,
            unitPrice: item.basePrice,
            quantity: 1,
            modifiers: modifiers.map((m) => ({
              modifierId: m.id,
              name: m.name,
              price: Number(m.price),
            })),
          },
        ];
      }
    });
  };

  const updateQuantity = (idx: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[idx].quantity += delta;
      if (updated[idx].quantity <= 0) {
        updated.splice(idx, 1);
      }
      return updated;
    });
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemTotal = item.unitPrice * item.quantity;
      const modTotal = item.modifiers.reduce((mSum, m) => mSum + m.price * item.quantity, 0);
      return sum + itemTotal + modTotal;
    }, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return Number(((subtotal * discountPercent) / 100).toFixed(2));
  }, [subtotal, discountPercent]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const cgst = Number((taxableAmount * 0.025).toFixed(2));
  const sgst = Number((taxableAmount * 0.025).toFixed(2));
  const grandTotal = Math.round(taxableAmount + cgst + sgst);
  const roundOff = Number((grandTotal - (taxableAmount + cgst + sgst)).toFixed(2));

  // Punch Order & Fire KOT
  const handleFireKOT = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    const payload = {
      outletId: currentOutlet?.id,
      tableId: orderType === 'DINE_IN' ? selectedTableId : null,
      orderType,
      customerName,
      customerPhone,
      guestCount,
      notes: orderNotes,
      items: cart,
    };

    const res = await fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.success) {
      alert(`✅ Order #${res.order.orderNumber} placed & KOT #1 fired to Kitchen!`);
      setCart([]);
      setOrderNotes('');
      loadData(); // reload table statuses
    } else {
      alert(`Error placing order: ${res.error}`);
    }
    setSubmitting(false);
  };

  // Open Payment Settle Modal
  const handleOpenSettle = () => {
    if (cart.length === 0) return;
    setCashTendered(grandTotal);
    setUpiTendered(grandTotal);
    setCardTendered(grandTotal);
    setPaymentModalOpen(true);
  };

  // Execute Instant Bill & Payment Settlement
  const handleConfirmPayment = async () => {
    setSubmitting(true);

    // 1. Create Order
    const orderRes = await fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify({
        outletId: currentOutlet?.id,
        tableId: orderType === 'DINE_IN' ? selectedTableId : null,
        orderType,
        customerName,
        customerPhone,
        guestCount,
        notes: orderNotes,
        items: cart,
      }),
    });

    if (!orderRes.success) {
      alert(`Order creation failed: ${orderRes.error}`);
      setSubmitting(false);
      return;
    }

    const orderId = orderRes.order.id;

    // 2. Generate Invoice
    const invRes = await fetchApi('/billing/invoices', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        discount: discountAmount,
        discountReason,
      }),
    });

    if (!invRes.success) {
      alert(`Invoice generation failed: ${invRes.error}`);
      setSubmitting(false);
      return;
    }

    const invoiceId = invRes.invoice.id;

    // 3. Prepare Payments
    let paymentsPayload = [];
    if (paymentMode === 'CASH') {
      paymentsPayload.push({ paymentMode: 'CASH', amount: grandTotal });
    } else if (paymentMode === 'UPI') {
      paymentsPayload.push({ paymentMode: 'UPI', amount: grandTotal });
    } else if (paymentMode === 'CARD') {
      paymentsPayload.push({ paymentMode: 'CARD', amount: grandTotal });
    } else {
      // Split
      paymentsPayload.push({ paymentMode: 'CASH', amount: cashTendered });
      paymentsPayload.push({ paymentMode: 'UPI', amount: grandTotal - cashTendered });
    }

    // 4. Pay & Settle (triggers BOM stock deduction)
    const payRes = await fetchApi(`/billing/invoices/${invoiceId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ payments: paymentsPayload }),
    });

    if (payRes.success) {
      setSettledInvoice({
        ...payRes.invoice,
        order: orderRes.order,
        items: cart,
      });
      setPaymentModalOpen(false);
      setCart([]);
      loadData();
    } else {
      alert(`Payment settlement error: ${payRes.error}`);
    }
    setSubmitting(false);
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-5.5rem)] gap-5 overflow-hidden">
        {/* ==================================================== */}
        {/* LEFT COLUMN: MENU & CATEGORY BROWSER */}
        {/* ==================================================== */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {/* 1. Top Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, beverages, combos..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Food Type Badges */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
              {['ALL', 'VEG', 'NON_VEG', 'BEVERAGE'].map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFoodTypeFilter(ft)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    foodTypeFilter === ft
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {ft === 'ALL'
                    ? 'All'
                    : ft === 'VEG'
                    ? '🟢 Veg'
                    : ft === 'NON_VEG'
                    ? '🔴 Non-Veg'
                    : '🥤 Drinks'}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Category Carousel Pills */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0 bg-slate-50/50">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 3. Menu Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                Loading menu items...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <Utensils className="w-8 h-8 mb-2 stroke-1" />
                <span>No dishes match your filter</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredItems.map((item) => {
                  const isVeg = item.foodType === 'VEG';
                  const isBeverage = item.foodType === 'BEVERAGE';

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`relative bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:border-amber-400 hover:shadow-md transition-all active:scale-[0.98] group ${
                        !item.isAvailable ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <div>
                        {/* Food Type Badge */}
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isVeg
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isBeverage
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isVeg
                                  ? 'bg-emerald-500'
                                  : isBeverage
                                  ? 'bg-blue-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {item.foodType}
                          </span>

                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.preparationTime}m
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-slate-800 text-xs leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                          {item.name}
                        </h3>

                        {item.description && (
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom Price & Add CTA */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">
                          ₹{item.basePrice}
                        </span>

                        <div className="w-6 h-6 rounded-lg bg-amber-50 group-hover:bg-amber-500 text-amber-600 group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: CURRENT CART & BILLING PANEL */}
        {/* ==================================================== */}
        <div className="w-96 flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden shrink-0">
          {/* Order Header / Mode Selector */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['DINE_IN', 'TAKEAWAY', 'DELIVERY'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    orderType === type
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type === 'DINE_IN'
                    ? 'Dine-In'
                    : type === 'TAKEAWAY'
                    ? 'Takeaway'
                    : 'Delivery'}
                </button>
              ))}
            </div>

            {/* Table & Guest Selector (if Dine-in) */}
            {orderType === 'DINE_IN' && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select Table
                  </label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tableNumber} ({t.capacity} seats) - {t.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-20">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Guests
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <Receipt className="w-8 h-8 mb-2 stroke-1" />
                <span>Cart is empty. Click items on the left to add.</span>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {item.name}
                      </p>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <p className="text-[10px] text-amber-600 font-medium truncate">
                          + {item.modifiers.map((m) => m.name).join(', ')}
                        </p>
                      )}
                      <p className="text-xs font-black text-slate-900 mt-1">
                        ₹{item.unitPrice * item.quantity}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shrink-0 shadow-sm">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Calculation Summary */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/30 space-y-2">
            {/* Quick Discount Pill */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-500">
                <Percent className="w-3.5 h-3.5" />
                <span>Discount:</span>
              </div>
              <div className="flex items-center gap-1">
                {[0, 5, 10, 15].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDiscountPercent(d);
                      if (d > 0) setDiscountReason('Special Chef Discount');
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      discountPercent === d
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-medium">
                <span>Discount ({discountPercent}%)</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-slate-500">
              <span>GST (CGST 2.5% + SGST 2.5%)</span>
              <span>₹{(cgst + sgst).toFixed(2)}</span>
            </div>

            {roundOff !== 0 && (
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Round Off</span>
                <span>₹{roundOff.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Grand Total</span>
              <span className="text-xl font-black text-slate-900">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* CTAs: Send KOT & Settle */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleFireKOT}
                disabled={cart.length === 0 || submitting}
                className="py-3 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <ChefHat className="w-4 h-4 text-amber-700" />
                <span>Send KOT</span>
              </button>

              <button
                onClick={handleOpenSettle}
                disabled={cart.length === 0 || submitting}
                className="py-3 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Receipt className="w-4 h-4" />
                <span>Settle & Bill</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: MODIFIER / VARIANT SELECTION */}
      {/* ==================================================== */}
      {activeModifierItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {activeModifierItem.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Select custom preparation options
                </p>
              </div>
              <button
                onClick={() => setActiveModifierItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto">
              {activeModifierItem.modifierGroups.map((group: any) => (
                <div key={group.id} className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {group.name}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {group.modifiers.map((mod: any) => {
                      const isSelected = selectedModifiers.some((m) => m.id === mod.id);
                      return (
                        <button
                          key={mod.id}
                          onClick={() => {
                            if (group.maxSelection === 1) {
                              // Replace within group
                              const other = selectedModifiers.filter(
                                (m) =>
                                  !group.modifiers.some((gm: any) => gm.id === m.id)
                              );
                              setSelectedModifiers([...other, mod]);
                            } else {
                              if (isSelected) {
                                setSelectedModifiers(
                                  selectedModifiers.filter((m) => m.id !== mod.id)
                                );
                              } else {
                                setSelectedModifiers([...selectedModifiers, mod]);
                              }
                            }
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 text-amber-900'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{mod.name}</span>
                          <span>{mod.price > 0 ? `+₹${mod.price}` : 'Free'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                addToCartDirect(activeModifierItem, selectedModifiers);
                setActiveModifierItem(null);
              }}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
            >
              Add to Order
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: PAYMENT & SETTLEMENT MODAL */}
      {/* ==================================================== */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Settle Bill — ₹{grandTotal.toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-slate-400">
                  Select payment tender mode
                </p>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Mode Selector */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { mode: 'UPI', label: 'UPI / QR', icon: QrCode },
                { mode: 'CASH', label: 'Cash Tender', icon: DollarSign },
                { mode: 'CARD', label: 'Credit/Debit', icon: CreditCard },
                { mode: 'SPLIT', label: 'Split Pay', icon: Receipt },
              ].map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMode === pm.mode;
                return (
                  <button
                    key={pm.mode}
                    onClick={() => setPaymentMode(pm.mode as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-bold">{pm.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Cash Buttons if Cash mode */}
            {paymentMode === 'CASH' && (
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Cash Tendered
                </p>
                <div className="flex gap-2">
                  {[grandTotal, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCashTendered(amt)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold ${
                        cashTendered === amt
                          ? 'border-amber-500 bg-amber-100 text-amber-900'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                {cashTendered > grandTotal && (
                  <p className="text-xs font-bold text-emerald-600 pt-1">
                    Return Change: ₹{cashTendered - grandTotal}
                  </p>
                )}
              </div>
            )}

            {/* UPI QR Demo if UPI mode */}
            {paymentMode === 'UPI' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Scan & Pay via UPI</p>
                  <p className="text-[10px] text-slate-400">Accepted: GPay, PhonePe, Paytm</p>
                  <p className="text-xs font-black text-amber-600 mt-1">₹{grandTotal}</p>
                </div>
                <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-slate-700" />
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmPayment}
              disabled={submitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm & Print Bill</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: PRINTABLE THERMAL RECEIPT MODAL */}
      {/* ==================================================== */}
      {settledInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Payment Complete</span>
              </span>
              <button
                onClick={() => setSettledInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal Receipt Paper Layout */}
            <div
              id="thermal-receipt"
              className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl font-mono text-xs space-y-2"
            >
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-black text-sm uppercase">
                  {currentOutlet?.name || 'Royal Feast'}
                </p>
                <p className="text-[10px] text-slate-500">{currentOutlet?.address}</p>
                <p className="text-[10px] text-slate-500">GSTIN: {currentOutlet?.gstin || '07AAACR9821L1Z8'}</p>
                <p className="text-[10px] text-slate-500">FSSAI: {currentOutlet?.fssaiNumber || '10018011003421'}</p>
              </div>

              <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Bill No:</span>
                  <span className="font-bold">{settledInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{user?.name?.split(' ')[0]}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1 py-1 border-b border-dashed border-slate-300">
                {settledInvoice.items?.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="truncate pr-2">
                      {it.name} x {it.quantity}
                    </span>
                    <span className="font-bold">₹{it.unitPrice * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-0.5 text-[11px] pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{settledInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (2.5%):</span>
                  <span>₹{settledInvoice.cgst}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (2.5%):</span>
                  <span>₹{settledInvoice.sgst}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-dashed border-slate-300">
                  <span>GRAND TOTAL:</span>
                  <span>₹{settledInvoice.grandTotal}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-400">
                Thank you for dining with us!
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Receipt</span>
              </button>
              <button
                onClick={() => setSettledInvoice(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
