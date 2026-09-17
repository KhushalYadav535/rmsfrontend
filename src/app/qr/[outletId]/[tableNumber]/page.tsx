'use client';

import React, { useState, useEffect, use } from 'react';
import {
  Utensils,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';

export default function QRTableOrderPage({
  params,
}: {
  params: Promise<{ outletId: string; tableNumber: string }>;
}) {
  const resolvedParams = use(params);
  const { outletId, tableNumber } = resolvedParams;

  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [orderPlaced, setOrderPlaced] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    loadPublicMenu();
  }, [outletId]);

  const loadPublicMenu = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/menu/public/${outletId}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setMenuItems(data.items || []);
      }
    } catch (e) {}
  };

  const handleAddToCart = (item: any) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.menuItemId === item.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          unitPrice: item.basePrice,
          foodType: item.foodType,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.menuItemId === itemId) {
            return { ...i, quantity: i.quantity + delta };
          }
          return i;
        })
        .filter((i) => i.quantity > 0);
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      // Find table by tableNumber
      const flRes = await fetch(`http://localhost:5000/api/outlets/${outletId}/floors`);
      const flData = await flRes.json();
      let foundTableId: string | null = null;
      if (flData.success && flData.floors) {
        for (const f of flData.floors) {
          const match = f.tables.find(
            (t: any) => t.tableNumber.toLowerCase() === tableNumber.toLowerCase()
          );
          if (match) {
            foundTableId = match.id;
            break;
          }
        }
      }

      const res = await fetch(`http://localhost:5000/api/orders/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId,
          tableId: foundTableId,
          customerName: customerName || 'Diner Table ' + tableNumber,
          customerPhone: customerPhone || '9810000000',
          notes,
          items: cart,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderPlaced(data.order);
        setCart([]);
        setCartOpen(false);
      } else {
        alert(`Order error: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    }
    setSubmitting(false);
  };

  const filteredItems = menuItems.filter((it) => {
    if (selectedCategory === 'ALL') return true;
    return it.categoryId === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm">
            RF
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-tight">
              Royal Feast Table Menu
            </h1>
            <span className="text-[11px] font-bold text-amber-600">
              Table {tableNumber.toUpperCase()}
            </span>
          </div>
        </div>

        {cartCount > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{cartCount} Items (₹{cartTotal})</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto sticky top-14 z-20">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          All Items
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Food Items List */}
      <div className="p-4 space-y-3">
        {orderPlaced ? (
          <div className="p-6 bg-white border border-emerald-200 rounded-2xl text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-black text-slate-900">
              Order #{orderPlaced.orderNumber} Placed!
            </h2>
            <p className="text-xs text-slate-500">
              Your order has been sent directly to the kitchen display. The chef is preparing your dishes.
            </p>
            <button
              onClick={() => setOrderPlaced(null)}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold"
            >
              Order More Items
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const cartItem = cart.find((i) => i.menuItemId === item.id);
            const isVeg = item.foodType === 'VEG';

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        isVeg
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.preparationTime}m prep
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-slate-900">{item.name}</h3>
                  {item.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs font-black text-slate-900 mt-2">
                    ₹{item.basePrice}
                  </p>
                </div>

                {cartItem ? (
                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-sm"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-black text-amber-900">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold shrink-0 transition-colors"
                  >
                    + Add
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cart Modal */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Your Table Cart</h3>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {cart.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-slate-400">₹{item.unitPrice} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      ₹{item.unitPrice * item.quantity}
                    </span>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, -1)}
                        className="w-4 h-4 text-xs font-bold text-slate-600"
                      >
                        -
                      </button>
                      <span className="text-[11px] font-bold px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, 1)}
                        className="w-4 h-4 text-xs font-bold text-slate-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cooking request (e.g. Less spicy, Jain)..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-slate-700">Subtotal:</span>
                <span className="text-lg font-black text-slate-900">₹{cartTotal}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <span>Send to Kitchen & Punch KOT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
