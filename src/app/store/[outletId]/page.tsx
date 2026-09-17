'use client';

import React, { useState, useEffect, use } from 'react';
import {
  Utensils,
  ShoppingBag,
  Plus,
  Minus,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  Truck,
  Bike,
  Sparkles,
  Search,
  Tag,
  ArrowRight,
  X,
  Phone,
  User,
} from 'lucide-react';

export default function CustomerStorefrontPage({
  params,
}: {
  params: Promise<{ outletId: string }>;
}) {
  const resolvedParams = use(params);
  const { outletId } = resolvedParams;

  const [outlet, setOutlet] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState<'DELIVERY' | 'TAKEAWAY'>('DELIVERY');
  const [cart, setCart] = useState<any[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Customer Checkout Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<any>(null);

  useEffect(() => {
    loadStorefront();
  }, [outletId]);

  const loadStorefront = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/menu/public/${outletId}`);
      const data = await res.json();
      if (data.success) {
        setOutlet(data.outlet);
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
          unitPrice: Number(item.price || item.basePrice),
          foodType: item.foodType,
          imageUrl: item.imageUrl,
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

  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const deliveryFee = orderType === 'DELIVERY' ? 40 : 0;
  const taxableAmount = Math.max(0, subtotal - couponDiscount + deliveryFee);
  const gstAmount = Number((taxableAmount * 0.05).toFixed(2));
  const grandTotal = Number((taxableAmount + gstAmount).toFixed(2));
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    try {
      const res = await fetch('http://localhost:5000/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponDiscount(data.coupon.discountAmount);
      } else {
        setCouponError(data.error || 'Invalid coupon');
        setCouponDiscount(0);
      }
    } catch (e: any) {
      setCouponError(e.message);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch('http://localhost:5000/api/orders/storefront', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletId,
          orderType,
          customerName,
          customerPhone,
          deliveryAddress,
          notes,
          items: cart,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderPlaced(data.order);
        setCart([]);
        setCartDrawerOpen(false);
      } else {
        alert(`Order error: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    }
    setSubmitting(false);
  };

  const filteredItems = menuItems.filter((it) => {
    const matchCat = selectedCategory === 'ALL' || it.categoryId === selectedCategory;
    const matchSearch = it.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* 1. HERO BRANDING HEADER */}
      <header className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-tight">
                {outlet?.name || 'Royal Feast Restaurant'}
              </h1>
              <p className="text-xs text-amber-200 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3" /> {outlet?.address || 'Hazratganj'}, {outlet?.city || 'Lucknow'}
              </p>
            </div>
          </div>

          {/* Cart trigger button */}
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="relative px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold rounded-2xl flex items-center gap-2 shadow-lg transition-all"
          >
            <ShoppingBag className="w-5 h-5 text-slate-900" />
            <span className="text-sm">Bag</span>
            {cartItemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-950 text-white text-xs flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Order Mode Toggle & Delivery Info */}
        <div className="bg-black/20 border-t border-white/10 px-4 py-2 text-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl">
              <button
                onClick={() => setOrderType('DELIVERY')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  orderType === 'DELIVERY' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" /> Delivery (35-45m)
              </button>
              <button
                onClick={() => setOrderType('TAKEAWAY')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  orderType === 'TAKEAWAY' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" /> Takeaway / Pickup (15-20m)
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-amber-200">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> 100% Hygienic</span>
              <span>•</span>
              <span>FSSAI: {outlet?.fssaiNumber || '10022099000123'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN STORE CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* Order Confirmed Banner if Placed */}
        {orderPlaced && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Order Punch Confirmed
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  Order #{orderPlaced.orderNumber} Received!
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Our royal chefs are cooking your meal fresh. Total: ₹{orderPlaced.totalAmount}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOrderPlaced(null)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              Order More
            </button>
          </div>
        )}

        {/* Search & Category Pills */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search Royal Butter Chicken, Paneer Tikka, Biryani, Naan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dish Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((dish) => {
            const inCart = cart.find((i) => i.menuItemId === dish.id);
            return (
              <div
                key={dish.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                        dish.foodType === 'VEG'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dish.foodType === 'VEG' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      {dish.foodType}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{dish.preparationTime || 15} mins</span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mt-2.5 group-hover:text-amber-600 transition-colors">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {dish.description || 'Authentic royal recipe crafted with handpicked spices and ghee.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">
                      ₹{dish.price || dish.basePrice}
                    </span>
                  </div>

                  {inCart ? (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-2 py-1">
                      <button
                        onClick={() => updateQuantity(dish.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-800 flex items-center justify-center font-bold shadow-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-extrabold text-sm text-amber-900 px-1">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQuantity(dish.id, 1)}
                        className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(dish)}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> ADD
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 3. CHECKOUT CART DRAWER */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900">Your Feast Bag</h2>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Your bag is currently empty</p>
                  <p className="text-xs text-slate-400">Add delicious dishes from our royal catalog to begin</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            ₹{item.unitPrice} × {item.quantity} = ₹{item.unitPrice * item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.menuItemId, -1)}
                            className="text-slate-600 font-bold hover:text-red-500"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black text-slate-900 px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.menuItemId, 1)}
                            className="text-slate-600 font-bold hover:text-amber-500"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Promo Coupon Form */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Promo code (e.g. WELCOME10)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
                      >
                        Apply
                      </button>
                    </div>
                    {couponDiscount > 0 && (
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        🎉 Coupon applied! Saved ₹{couponDiscount}
                      </p>
                    )}
                    {couponError && <p className="text-xs font-semibold text-red-500 mt-1">{couponError}</p>}
                  </div>

                  {/* Customer Information Form */}
                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      {orderType === 'DELIVERY' ? 'Delivery Details' : 'Contact Details'}
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rohit Sharma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile Phone (for updates) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    {orderType === 'DELIVERY' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Delivery Address *</label>
                        <textarea
                          required
                          rows={2}
                          placeholder="Flat / House no, Landmark, Area..."
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Chef Cooking Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Less spicy, send cutlery"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Drawer Footer with Bill Summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promo Discount:</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {orderType === 'DELIVERY' && (
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span className="font-semibold text-slate-800">₹{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span className="font-semibold text-slate-800">₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="text-amber-600">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? 'Placing Order...' : `Place ${orderType === 'DELIVERY' ? 'Delivery' : 'Takeaway'} Order • ₹${grandTotal}`}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
