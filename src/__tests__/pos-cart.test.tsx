import { describe, it, expect } from 'vitest';

interface CartItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  modifiers: { modifierId: string; name: string; price: number }[];
}

function calculateOrderTotals(cart: CartItem[], discountPercent: number = 0) {
  const subtotal = cart.reduce((sum, item) => {
    const itemTotal = item.unitPrice * item.quantity;
    const modTotal = item.modifiers.reduce((mSum, m) => mSum + m.price * item.quantity, 0);
    return sum + itemTotal + modTotal;
  }, 0);

  const discountAmount = Number(((subtotal * discountPercent) / 100).toFixed(2));
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const cgst = Number((taxableAmount * 0.025).toFixed(2));
  const sgst = Number((taxableAmount * 0.025).toFixed(2));
  const rawTotal = taxableAmount + cgst + sgst;
  const grandTotal = Math.round(rawTotal);
  const roundOff = Number((grandTotal - rawTotal).toFixed(2));

  return { subtotal, discountAmount, taxableAmount, cgst, sgst, grandTotal, roundOff };
}

describe('POS Cart Billing Logic & Tax Calculations', () => {
  it('correctly calculates subtotal without modifiers or discounts', () => {
    const cart: CartItem[] = [
      { menuItemId: 'item-1', name: 'Butter Chicken', unitPrice: 350, quantity: 2, modifiers: [] },
      { menuItemId: 'item-2', name: 'Garlic Naan', unitPrice: 60, quantity: 3, modifiers: [] },
    ];

    const result = calculateOrderTotals(cart, 0);

    // subtotal = (350 * 2) + (60 * 3) = 700 + 180 = 880
    expect(result.subtotal).toBe(880);
    expect(result.discountAmount).toBe(0);
    expect(result.taxableAmount).toBe(880);

    // CGST 2.5% = 22, SGST 2.5% = 22, Total = 880 + 44 = 924
    expect(result.cgst).toBe(22);
    expect(result.sgst).toBe(22);
    expect(result.grandTotal).toBe(924);
    expect(result.roundOff).toBe(0);
  });

  it('correctly accounts for modifiers on cart items', () => {
    const cart: CartItem[] = [
      {
        menuItemId: 'item-1',
        name: 'Cold Coffee',
        unitPrice: 150,
        quantity: 2,
        modifiers: [{ modifierId: 'mod-1', name: 'Extra Ice Cream', price: 40 }],
      },
    ];

    const result = calculateOrderTotals(cart, 0);

    // (150 * 2) + (40 * 2) = 300 + 80 = 380
    expect(result.subtotal).toBe(380);
    // CGST 2.5% = 9.5, SGST 2.5% = 9.5, Total = 380 + 19 = 399
    expect(result.cgst).toBe(9.5);
    expect(result.sgst).toBe(9.5);
    expect(result.grandTotal).toBe(399);
  });

  it('correctly deducts percentage discounts and recalculates GST and round-off', () => {
    const cart: CartItem[] = [
      { menuItemId: 'item-1', name: 'Veg Biryani', unitPrice: 250, quantity: 1, modifiers: [] },
    ];

    // 10% discount on 250 = 25 -> taxable = 225
    // CGST 2.5% of 225 = 5.625 -> 5.63, SGST 2.5% = 5.63
    // raw total = 225 + 5.63 + 5.63 = 236.26 -> grandTotal = 236
    const result = calculateOrderTotals(cart, 10);

    expect(result.subtotal).toBe(250);
    expect(result.discountAmount).toBe(25);
    expect(result.taxableAmount).toBe(225);
    expect(result.cgst).toBe(5.63);
    expect(result.sgst).toBe(5.63);
    expect(result.grandTotal).toBe(236);
    expect(result.roundOff).toBeCloseTo(-0.26, 2);
  });
});
