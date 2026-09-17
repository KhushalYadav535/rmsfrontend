'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Check,
  X,
  Clock,
  IndianRupee,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  FolderPlus,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function MenuPage() {
  const { currentOutlet } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [variantsModalOpen, setVariantsModalOpen] = useState(false);

  // Dish Form state (for create & edit)
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [foodType, setFoodType] = useState('VEG');
  const [basePrice, setBasePrice] = useState('');
  const [taxRate, setTaxRate] = useState('5');
  const [prepTime, setPrepTime] = useState('15');
  const [description, setDescription] = useState('');

  // Category Form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Variant Form state
  const [variantName, setVariantName] = useState('');
  const [variantPrice, setVariantPrice] = useState('');

  useEffect(() => {
    if (currentOutlet) {
      loadMenu();
    }
  }, [currentOutlet]);

  const loadMenu = async () => {
    setLoading(true);
    const [itemRes, catRes] = await Promise.all([
      fetchApi(`/menu/items?outletId=${currentOutlet?.id}`),
      fetchApi('/menu/categories'),
    ]);

    if (itemRes.success) setItems(itemRes.items || []);
    if (catRes.success) {
      setCategories(catRes.categories || []);
      if (catRes.categories.length > 0 && !categoryId) {
        setCategoryId(catRes.categories[0].id);
      }
    }
    setLoading(false);
  };

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    const res = await fetchApi(`/menu/items/${itemId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({
        outletId: currentOutlet?.id,
        isAvailable: !currentStatus,
      }),
    });

    if (res.success) {
      loadMenu();
    }
  };

  const handleOpenAddModal = () => {
    setSelectedItem(null);
    setName('');
    setBasePrice('');
    setTaxRate('5');
    setPrepTime('15');
    setDescription('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setSelectedItem(item);
    setName(item.name);
    setCategoryId(item.categoryId);
    setFoodType(item.foodType);
    setBasePrice(String(item.basePrice));
    setTaxRate(String(item.taxRate || 5));
    setPrepTime(String(item.preparationTime || 15));
    setDescription(item.description || '');
    setEditModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = selectedItem ? `/menu/items/${selectedItem.id}` : '/menu/items';
    const method = selectedItem ? 'PUT' : 'POST';

    const res = await fetchApi(endpoint, {
      method,
      body: JSON.stringify({
        categoryId,
        name,
        foodType,
        basePrice: Number(basePrice),
        taxRate: Number(taxRate),
        preparationTime: Number(prepTime),
        description,
      }),
    });

    if (res.success) {
      setAddModalOpen(false);
      setEditModalOpen(false);
      loadMenu();
    } else {
      alert(`Error saving menu item: ${res.error}`);
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to deactivate "${itemName}"?`)) return;
    const res = await fetchApi(`/menu/items/${itemId}`, { method: 'DELETE' });
    if (res.success) {
      loadMenu();
    } else {
      alert(`Error deleting item: ${res.error}`);
    }
  };

  // Category management
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const res = await fetchApi('/menu/categories', {
      method: 'POST',
      body: JSON.stringify({ name: newCatName, description: newCatDesc }),
    });
    if (res.success) {
      setNewCatName('');
      setNewCatDesc('');
      loadMenu();
    } else {
      alert(`Error adding category: ${res.error}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this category?')) return;
    const res = await fetchApi(`/menu/categories/${id}`, { method: 'DELETE' });
    if (res.success) {
      loadMenu();
    } else {
      alert(`Error deleting category: ${res.error}`);
    }
  };

  // Variant management
  const handleOpenVariantsModal = (item: any) => {
    setSelectedItem(item);
    setVariantName('');
    setVariantPrice('');
    setVariantsModalOpen(true);
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !variantName || !variantPrice) return;
    const res = await fetchApi(`/menu/items/${selectedItem.id}/variants`, {
      method: 'POST',
      body: JSON.stringify({
        name: variantName,
        price: Number(variantPrice),
      }),
    });
    if (res.success) {
      setVariantName('');
      setVariantPrice('');
      loadMenu();
      setSelectedItem((prev: any) => ({
        ...prev,
        variants: [...(prev.variants || []), res.variant],
      }));
    } else {
      alert(`Error adding variant: ${res.error}`);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    const res = await fetchApi(`/menu/variants/${variantId}`, { method: 'DELETE' });
    if (res.success) {
      loadMenu();
      setSelectedItem((prev: any) => ({
        ...prev,
        variants: (prev.variants || []).filter((v: any) => v.id !== variantId),
      }));
    } else {
      alert(`Error deleting variant: ${res.error}`);
    }
  };

  const filteredItems = items.filter((it) => {
    const matchesCat = selectedCat === 'ALL' || it.categoryId === selectedCat;
    const matchesSearch = it.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-7 h-7 text-amber-500" />
              Menu & Catalog Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage dishes, categories, portions/variants, and live 86-ing availability for {currentOutlet?.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4 text-slate-500" />
              <span>Categories</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dish by name..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedCat('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                selectedCat === 'ALL'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Categories ({items.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                  selectedCat === c.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Dish Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Food Type</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Prep Time</th>
                  <th className="p-4">Variants</th>
                  <th className="p-4">Recipe (BOM)</th>
                  <th className="p-4 text-center">Live Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      {loading ? 'Loading menu dishes...' : 'No dishes found.'}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        {item.name}
                        {item.description && (
                          <p className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{item.description}</p>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 font-semibold">{item.categoryName}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.foodType === 'VEG'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.foodType === 'BEVERAGE'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {item.foodType}
                        </span>
                      </td>
                      <td className="p-4 font-black text-slate-900">₹{item.basePrice}</td>
                      <td className="p-4 text-slate-500 font-mono">{item.preparationTime}m</td>
                      <td className="p-4 text-slate-600">
                        <button
                          onClick={() => handleOpenVariantsModal(item)}
                          className="text-amber-600 hover:text-amber-700 font-bold underline decoration-dotted"
                        >
                          {item.variants?.length || 0} variants
                        </button>
                      </td>
                      <td className="p-4 text-slate-500">
                        {item.recipe ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> {item.recipe.items?.length || 0} ingredients
                          </span>
                        ) : (
                          <span className="text-slate-400">No BOM</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            item.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          {item.isAvailable ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>86'd</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                          title="Edit dish"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete dish"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Dish Modal */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveItem} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {selectedItem ? 'Edit Dish Details' : 'Add New Dish'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dish Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paneer Butter Masala"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Type</label>
                <select
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="VEG">VEG</option>
                  <option value="NON_VEG">NON_VEG</option>
                  <option value="EGG">EGG</option>
                  <option value="BEVERAGE">BEVERAGE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price ₹ *</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="280"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GST Tax %</label>
                <input
                  type="number"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prep Time (m)</label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  placeholder="15"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional dish ingredients or special note..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20"
              >
                {selectedItem ? 'Update Dish' : 'Create Dish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Management Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Manage Menu Categories</h3>
                <p className="text-xs text-slate-500">Organize dishes into sections</p>
              </div>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add Category</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. Starters)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Create Category
              </button>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Existing Categories</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {categories.map((c) => (
                  <div key={c.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{c.name}</p>
                      {c.description && <p className="text-[11px] text-slate-400">{c.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variants Management Modal */}
      {variantsModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Variants: {selectedItem.name}
                </h3>
                <p className="text-xs text-slate-500">Portion sizes and pricing (e.g. Half, Full, Large)</p>
              </div>
              <button
                type="button"
                onClick={() => setVariantsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Variant Form */}
            <form onSubmit={handleAddVariant} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Size / Name (e.g. Full)"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                required
                placeholder="Price ₹"
                value={variantPrice}
                onChange={(e) => setVariantPrice(e.target.value)}
                className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold"
              >
                Add
              </button>
            </form>

            {/* List Existing Variants */}
            <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-200 rounded-2xl p-2">
              {(!selectedItem.variants || selectedItem.variants.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-4">No custom variants created yet.</p>
              ) : (
                selectedItem.variants.map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                    <span className="font-bold text-slate-800">{v.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900">₹{v.price}</span>
                      <button
                        onClick={() => handleDeleteVariant(v.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
