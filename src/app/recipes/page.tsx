'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  ScrollText,
  Utensils,
  Boxes,
  Percent,
  CheckCircle,
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowRight,
  TrendingDown,
  Calculator,
} from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPrice: number;
}

export default function RecipesPage() {
  const { currentOutlet } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CONFIGURED' | 'UNCONFIGURED'>('ALL');

  // Recipe Modal
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<any | null>(null);
  const [yieldCount, setYieldCount] = useState('1');
  const [recipeIngredients, setRecipeIngredients] = useState<{ ingredientId: string; quantity: number }[]>([
    { ingredientId: '', quantity: 0.1 },
  ]);

  useEffect(() => {
    if (currentOutlet) {
      loadData();
    }
  }, [currentOutlet]);

  const loadData = async () => {
    setLoading(true);
    const [itemRes, ingRes] = await Promise.all([
      fetchApi(`/menu/items?outletId=${currentOutlet?.id}`),
      fetchApi('/inventory/ingredients'),
    ]);

    if (itemRes.success && itemRes.items) {
      setItems(itemRes.items);
    }
    if (ingRes.success && ingRes.ingredients) {
      setIngredients(ingRes.ingredients);
    }
    setLoading(false);
  };

  const handleOpenRecipeModal = (dish?: any) => {
    const targetDish = dish || items[0];
    setSelectedMenuItem(targetDish);
    if (targetDish?.recipe && targetDish.recipe.items?.length > 0) {
      setYieldCount(String(targetDish.recipe.yieldCount || 1));
      setRecipeIngredients(
        targetDish.recipe.items.map((it: any) => ({
          ingredientId: it.ingredientId,
          quantity: Number(it.quantity),
        }))
      );
    } else {
      setYieldCount('1');
      setRecipeIngredients(
        ingredients.length > 0 ? [{ ingredientId: ingredients[0].id, quantity: 0.1 }] : []
      );
    }
    setRecipeModalOpen(true);
  };

  const handleAddIngredientRow = () => {
    if (ingredients.length === 0) return;
    setRecipeIngredients([...recipeIngredients, { ingredientId: ingredients[0].id, quantity: 0.1 }]);
  };

  const handleRemoveIngredientRow = (idx: number) => {
    if (recipeIngredients.length > 1) {
      setRecipeIngredients(recipeIngredients.filter((_, i) => i !== idx));
    }
  };

  const handleIngredientChange = (idx: number, field: string, value: any) => {
    const updated = [...recipeIngredients];
    updated[idx] = { ...updated[idx], [field]: field === 'quantity' ? Number(value) : value };
    setRecipeIngredients(updated);
  };

  const calculateCurrentRecipeCost = () => {
    return recipeIngredients.reduce((sum, item) => {
      const ing = ingredients.find((i) => i.id === item.ingredientId);
      return sum + (ing ? Number(ing.costPrice) * Number(item.quantity) : 0);
    }, 0);
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenuItem) return;

    const validIngredients = recipeIngredients.filter((ri) => ri.ingredientId && ri.quantity > 0);
    if (validIngredients.length === 0) {
      alert('Please add at least one ingredient with a quantity greater than 0');
      return;
    }

    const res = await fetchApi(`/menu/items/${selectedMenuItem.id}/recipe`, {
      method: 'POST',
      body: JSON.stringify({
        yieldCount: Number(yieldCount) || 1,
        ingredients: validIngredients,
      }),
    });

    if (res.success) {
      setRecipeModalOpen(false);
      loadData();
    } else {
      alert(`Error saving recipe: ${res.error}`);
    }
  };

  const configuredCount = items.filter((it) => it.recipe).length;
  const unconfiguredCount = items.length - configuredCount;

  const filteredItems = items.filter((it) => {
    if (activeFilter === 'CONFIGURED') return !!it.recipe;
    if (activeFilter === 'UNCONFIGURED') return !it.recipe;
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ScrollText className="w-6 h-6 text-amber-500" />
              <span>Recipe Management & Bill of Materials (BOM)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automate theoretical raw material consumption, portion control, and real-time food cost % calculations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenRecipeModal()}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-amber-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Recipe</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Filters */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'ALL' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Dishes ({items.length})
          </button>
          <button
            onClick={() => setActiveFilter('CONFIGURED')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'CONFIGURED' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Configured BOM ({configuredCount})
          </button>
          <button
            onClick={() => setActiveFilter('UNCONFIGURED')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'UNCONFIGURED' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Needs Recipe ({unconfiguredCount})
          </button>
        </div>

        {/* Recipe Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((dish) => {
            const hasRecipe = !!dish.recipe && dish.recipe.items?.length > 0;
            let estimatedCost = 0;

            if (hasRecipe) {
              dish.recipe.items.forEach((ri: any) => {
                const cost = Number(ri.ingredient?.costPrice || 0) * Number(ri.quantity);
                estimatedCost += cost;
              });
            }

            const foodCostPercent =
              hasRecipe && dish.basePrice > 0 ? Math.round((estimatedCost / dish.basePrice) * 100) : 0;

            return (
              <div
                key={dish.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{dish.name}</h3>
                      <p className="text-[11px] text-slate-400">{dish.categoryName}</p>
                    </div>

                    {hasRecipe ? (
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl ${
                            foodCostPercent < 28
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : foodCostPercent <= 35
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {foodCostPercent}% Food Cost
                        </span>
                        <p className={`text-[10px] font-bold mt-0.5 ${
                          foodCostPercent < 28
                            ? 'text-emerald-600'
                            : foodCostPercent <= 35
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}>
                          {foodCostPercent < 28
                            ? 'Optimal (<28%)'
                            : foodCostPercent <= 35
                            ? 'Acceptable (28-35%)'
                            : 'High Cost Alert (>35%)'}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500">
                        No BOM
                      </span>
                    )}
                  </div>

                  {/* Financial Overview */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Selling Price
                      </span>
                      <p className="font-black text-slate-900">₹{dish.basePrice}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Recipe Cost
                      </span>
                      <p className="font-black text-slate-900">
                        {hasRecipe ? `₹${estimatedCost.toFixed(2)}` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Ingredients Breakdown */}
                  <div className="space-y-1.5 my-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ingredients Deducted:
                    </span>
                    {hasRecipe ? (
                      <div className="space-y-1">
                        {dish.recipe.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-50"
                          >
                            <span className="text-slate-700 font-medium">
                              {item.ingredient?.name}
                            </span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              {item.quantity} {item.ingredient?.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">
                        No recipe linked yet. Auto inventory deduction disabled for this item.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Yield: {dish.recipe?.yieldCount || 1} Portion
                  </span>
                  <button
                    onClick={() => handleOpenRecipeModal(dish)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{hasRecipe ? 'Edit Recipe' : 'Add Recipe'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recipe Configuration Modal */}
        {recipeModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Recipe & BOM: {selectedMenuItem?.name}
                  </h3>
                  <p className="text-xs text-slate-500">Configure ingredient proportions deducted per portion</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRecipeModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Menu Item *</label>
                    <select
                      value={selectedMenuItem?.id}
                      onChange={(e) => {
                        const target = items.find((i) => i.id === e.target.value);
                        setSelectedMenuItem(target);
                        if (target?.recipe && target.recipe.items?.length > 0) {
                          setYieldCount(String(target.recipe.yieldCount || 1));
                          setRecipeIngredients(
                            target.recipe.items.map((it: any) => ({
                              ingredientId: it.ingredientId,
                              quantity: Number(it.quantity),
                            }))
                          );
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name} (₹{it.basePrice})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Portion Yield Count</label>
                    <input
                      type="number"
                      min="1"
                      value={yieldCount}
                      onChange={(e) => setYieldCount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">
                      Ingredients & Consumption *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddIngredientRow}
                      className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Ingredient
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {recipeIngredients.map((row, idx) => {
                      const ing = ingredients.find((i) => i.id === row.ingredientId);
                      const cost = ing ? (Number(ing.costPrice) * Number(row.quantity)).toFixed(2) : '0';

                      return (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <select
                            value={row.ingredientId}
                            onChange={(e) => handleIngredientChange(idx, 'ingredientId', e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            required
                          >
                            {ingredients.map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.name} (₹{i.costPrice}/{i.unit})
                              </option>
                            ))}
                          </select>

                          <div className="w-24">
                            <input
                              type="number"
                              step="0.001"
                              min="0.001"
                              value={row.quantity}
                              onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold"
                              placeholder="Qty"
                              required
                            />
                          </div>

                          <div className="w-20 text-slate-500 font-mono text-[11px]">
                            {ing?.unit || ''} (₹{cost})
                          </div>

                          {recipeIngredients.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredientRow(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recipe Costing Summary */}
                {(() => {
                  const currentCost = calculateCurrentRecipeCost();
                  const price = selectedMenuItem?.basePrice || 0;
                  const costPct = price > 0 ? Math.round((currentCost / price) * 100) : 0;
                  const profit = Math.max(0, price - currentCost);

                  return (
                    <div className="space-y-3">
                      <div className={`border rounded-2xl p-4 transition-colors ${
                        costPct < 28
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : costPct <= 35
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-rose-50/70 border-rose-200'
                      }`}>
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Raw Material Cost
                            </span>
                            <span className="text-base font-black text-slate-900">
                              ₹{currentCost.toFixed(2)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Gross Margin ₹
                            </span>
                            <span className="text-base font-black text-emerald-700">
                              ₹{profit.toFixed(2)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Food Cost %
                            </span>
                            <span className={`text-base font-black ${
                              costPct < 28
                                ? 'text-emerald-700'
                                : costPct <= 35
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}>
                              {price > 0 ? `${costPct}%` : '-'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Benchmark Rating:</span>
                          {costPct < 28 ? (
                            <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              Optimal Cost Tier (&lt;28%)
                            </span>
                          ) : costPct <= 35 ? (
                            <span className="text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                              Standard Target Tier (28% – 35%)
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full animate-pulse">
                              High Cost Warning (&gt;35%)
                            </span>
                          )}
                        </div>
                      </div>

                      {costPct > 35 && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 font-medium">
                          ⚠️ <strong>High Food Cost Alert</strong>: Raw materials consume {costPct}% of dish price. Industry standard recommendation is under 32% for sustainable restaurant profitability.
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRecipeModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md shadow-amber-500/20"
                  >
                    Save Recipe BOM
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
