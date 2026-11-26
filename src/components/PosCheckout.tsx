import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CreditCard,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Smartphone,
  Banknote,
  Trash2,
} from 'lucide-react';
import type {
  CartItem,
  DiscountType,
  Medicine,
  MedicineCategory,
  OrderTotals,
  PaymentMethod,
  UnitType,
} from '../types/pharmacy';
import {
  formatPHP,
  getDaysUntilExpiry,
  getUnitMultiplier,
  PHARMACY_INFO,
} from '../data/initialMedicines';

interface PosCheckoutProps {
  medicines: Medicine[];
  cart: CartItem[];
  discountType: DiscountType;
  paymentMethod: PaymentMethod;
  totals: OrderTotals;
  rxReference: string;
  customerName: string;
  customerId: string;
  cashTendered: string;
  onRxReferenceChange: (val: string) => void;
  onCustomerNameChange: (val: string) => void;
  onCustomerIdChange: (val: string) => void;
  onCashTenderedChange: (val: string) => void;
  onDiscountTypeChange: (type: DiscountType) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onAddToCart: (medId: string, unitType: UnitType) => void;
  onUpdateCartQty: (index: number, delta: number) => void;
  onRemoveCartItem: (index: number) => void;
  onClearCart: () => void;
  onOpenAddMedicine: (prefillBrand?: string) => void;
  onCompleteCheckout: () => void;
}

const CATEGORIES: { key: 'All' | MedicineCategory; label: string }[] = [
  { key: 'All', label: 'All Medicines' },
  { key: 'Analgesics', label: 'Analgesics & Fever' },
  { key: 'Antibiotics', label: 'Antibiotics (Rx)' },
  { key: 'Maintenance', label: 'Maintenance (Rx)' },
  { key: 'Vitamins', label: 'Vitamins & Supplements' },
  { key: 'OTC', label: 'OTC / Cold & Cough' },
];

export const PosCheckout: React.FC<PosCheckoutProps> = ({
  medicines,
  cart,
  discountType,
  paymentMethod,
  totals,
  rxReference,
  customerName,
  customerId,
  cashTendered,
  onRxReferenceChange,
  onCustomerNameChange,
  onCustomerIdChange,
  onCashTenderedChange,
  onDiscountTypeChange,
  onPaymentMethodChange,
  onAddToCart,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  onOpenAddMedicine,
  onCompleteCheckout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | MedicineCategory>('All');
  const [selectedUnitByMed, setSelectedUnitByMed] = useState<Record<string, UnitType>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredMedicines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...medicines]
      .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())
      .filter((m) => {
        const matchesCat = activeCategory === 'All' || m.category === activeCategory;
        const matchesQuery =
          !q ||
          m.brand.toLowerCase().includes(q) ||
          m.generic.toLowerCase().includes(q) ||
          m.sku.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
      });
  }, [medicines, searchQuery, activeCategory]);

  const hasRxInCart = useMemo(
    () => cart.some((item) => medicines.find((m) => m.id === item.medId)?.isRx),
    [cart, medicines]
  );

  const totalCartItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const numericCashTendered = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, numericCashTendered - totals.netTotal);
  const hasSufficientCash = numericCashTendered >= totals.netTotal && totals.netTotal > 0;

  const handleQuickCash = (val: 'exact' | number) => {
    if (val === 'exact') {
      onCashTenderedChange(totals.netTotal.toFixed(2));
    } else {
      onCashTenderedChange(String(val));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* Left Panel: Search, Category Filters, and FEFO Medicine Catalog */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && searchQuery) {
                    setSearchQuery('');
                  }
                }}
                placeholder="Search Brand Name, Generic Name, or SKU / Barcode..."
                className="w-full pl-10 pr-14 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded bg-slate-200/80 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenAddMedicine()}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Medicine</span>
            </button>
          </div>

          <div
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto"
            role="tablist"
            aria-label="Medicine Categories"
          >
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {filteredMedicines.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
            <div>
              <p className="font-display font-bold text-sm text-slate-800">
                Wala pa sa system ang &ldquo;{searchQuery.trim() || 'gipangita nga tambal'}&rdquo;
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Pwede nimo i-add karon dayon sa {PHARMACY_INFO.name} system apil ang presyo ug stock.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenAddMedicine(searchQuery.trim())}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add &ldquo;{searchQuery.trim() || 'New Medicine'}&rdquo; to System</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredMedicines.map((med) => {
              const unit = selectedUnitByMed[med.id] || 'piece';
              const multiplier = getUnitMultiplier(med, unit);
              const unitPrice = med.price * multiplier;
              const outOfStock = med.stock < multiplier;
              const isLowStock = med.stock <= med.reorderLevel;
              const daysToExp = getDaysUntilExpiry(med.expiry);

              return (
                <div
                  key={med.id}
                  className={`bg-white rounded-xl border p-4 flex flex-col justify-between gap-3 transition-colors ${
                    outOfStock
                      ? 'border-slate-200 opacity-60'
                      : 'border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          className="font-display font-bold text-slate-900 text-sm truncate"
                          title={med.brand}
                        >
                          {med.brand}
                        </h3>
                        <p
                          className="text-xs text-slate-500 truncate"
                          title={med.generic}
                        >
                          {med.generic}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border ${
                          med.isRx
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {med.isRx ? 'Rx' : 'OTC'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-600 tabular-nums">
                      <span>{med.dosage}</span>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span
                        className={
                          isLowStock ? 'text-amber-700 font-semibold' : 'text-slate-600'
                        }
                      >
                        Stock: {med.stock} pcs{isLowStock ? ' (Low)' : ''}
                      </span>
                      {daysToExp <= 90 && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <span
                            className={
                              daysToExp <= 30
                                ? 'text-rose-700 font-semibold'
                                : 'text-amber-700 font-semibold'
                            }
                          >
                            {daysToExp <= 0 ? 'Expired' : `Exp: ${daysToExp}d`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-end justify-between gap-2">
                    <div>
                      <select
                        aria-label={`Select unit for ${med.brand}`}
                        value={unit}
                        onChange={(e) =>
                          setSelectedUnitByMed((prev) => ({
                            ...prev,
                            [med.id]: e.target.value as UnitType,
                          }))
                        }
                        className="text-[11px] font-semibold bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:border-emerald-700"
                      >
                        <option value="piece">Piece (1)</option>
                        <option value="blister">Blister ({med.blisterSize})</option>
                        <option value="box">Box ({med.boxSize})</option>
                      </select>
                      <div className="text-base font-display font-bold text-emerald-700 mt-1 tabular-nums">
                        {formatPHP(unitPrice)}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => onAddToCart(med.id, unit)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                        outOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Panel: Sticky Active Cart & Checkout Billing */}
      <aside className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-slate-200 flex flex-col lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-92px)]">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/60 rounded-t-xl">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-slate-900 text-sm">Current Order</h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {totalCartItems} {totalCartItems === 1 ? 'item' : 'items'}
            </span>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2 min-h-[160px]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8 text-slate-400">
              <ShoppingBag className="w-9 h-9 mb-2 text-slate-300" strokeWidth={1.5} />
              <p className="text-xs font-semibold text-slate-600">Cart is currently empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Select medicines from the catalog to begin checkout.
              </p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const med = medicines.find((m) => m.id === item.medId);
              if (!med) return null;
              const mult = getUnitMultiplier(med, item.unitType);
              const unitPrice = med.price * mult;
              const lineTotal = unitPrice * item.qty;
              const unitLabel =
                item.unitType === 'box'
                  ? `Box (${med.boxSize}s)`
                  : item.unitType === 'blister'
                  ? `Blister (${med.blisterSize}s)`
                  : 'Piece';

              return (
                <div
                  key={`${item.medId}-${item.unitType}`}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 text-xs truncate">
                        {med.brand}
                      </span>
                      {med.isRx && (
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 rounded">
                          Rx
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 tabular-nums truncate">
                      {med.dosage} · {unitLabel} @ {formatPHP(unitPrice)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${med.brand}`}
                      onClick={() => onUpdateCartQty(idx, -1)}
                      className="w-7 h-7 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-900 tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${med.brand}`}
                      onClick={() => onUpdateCartQty(idx, 1)}
                      className="w-7 h-7 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[72px] shrink-0">
                    <div className="text-xs font-bold text-slate-900 tabular-nums">
                      {formatPHP(lineTotal)}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveCartItem(idx)}
                      className="inline-flex items-center gap-0.5 text-[10px] text-rose-700 hover:underline font-medium"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Conditional Prescription (Rx) Verification Box */}
        {hasRxInCart && (
          <div className="mx-3.5 mb-3 p-3 bg-amber-50 border border-amber-300 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2 text-amber-900 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Rx Prescription Required</span>
              </div>
              <span className="text-[10px] font-medium text-amber-800 truncate">
                Verified by: {PHARMACY_INFO.pharmacistOnDuty}
              </span>
            </div>
            <input
              type="text"
              value={rxReference}
              onChange={(e) => onRxReferenceChange(e.target.value)}
              placeholder="Enter Doctor's Name / PRC # or Rx Ref..."
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Customer Discount Classification */}
        <div className="px-3.5 py-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
          <span className="block text-[11px] font-semibold text-slate-600">
            Customer Discount Classification (BIR RA 9994 / RA 10754)
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { key: 'regular', label: 'Regular' },
                { key: 'senior', label: 'Senior (20%)' },
                { key: 'pwd', label: 'PWD (20%)' },
              ] as const
            ).map((opt) => {
              const active = discountType === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onDiscountTypeChange(opt.key)}
                  className={`py-1.5 px-2 rounded-md text-xs font-semibold border transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {(discountType === 'senior' || discountType === 'pwd') && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <input
                type="text"
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
                placeholder="Customer Full Name *"
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <input
                type="text"
                value={customerId}
                onChange={(e) => onCustomerIdChange(e.target.value)}
                placeholder="OSCA / PWD ID No. *"
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          )}
        </div>

        {/* Totals & Payment Section */}
        <div className="p-3.5 border-t border-slate-200 bg-white rounded-b-xl space-y-3">
          <div className="space-y-1 text-xs tabular-nums">
            <div className="flex justify-between text-slate-600">
              <span>Gross Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatPHP(totals.grossSubtotal)}
              </span>
            </div>

            {discountType === 'senior' || discountType === 'pwd' ? (
              <>
                <div className="flex justify-between text-emerald-700">
                  <span>Less 12% VAT Exemption</span>
                  <span className="font-semibold">
                    -{formatPHP(totals.vatExemptAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Less 20% SC/PWD Discount</span>
                  <span className="font-semibold">
                    -{formatPHP(totals.scPwdDiscount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>VAT-Exempt Sales</span>
                  <span>{formatPHP(totals.grossSubtotal / 1.12)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>VATable Sales / 12% VAT Incl.</span>
                <span>
                  {formatPHP(totals.vatableSales)} / {formatPHP(totals.vatAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-900">Total Amount Due</span>
              <span className="text-2xl font-display font-extrabold text-emerald-700">
                {formatPHP(totals.netTotal)}
              </span>
            </div>
          </div>

          {/* Payment Method & Cash Input */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { key: 'Cash', label: 'Cash', icon: Banknote },
                  { key: 'GCash', label: 'GCash', icon: Smartphone },
                  { key: 'Card', label: 'Card', icon: CreditCard },
                ] as const
              ).map(({ key, label, icon: Icon }) => {
                const active = paymentMethod === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onPaymentMethodChange(key)}
                    className={`py-1.5 px-2 rounded-md text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'Cash' && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                      ₱
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={cashTendered}
                      onChange={(e) => onCashTenderedChange(e.target.value)}
                      placeholder="Cash Tendered"
                      className="w-full pl-7 pr-3 py-2 text-sm font-bold tabular-nums bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    />
                  </div>
                  <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-right min-w-[115px] tabular-nums">
                    <span className="block text-[10px] font-semibold text-slate-500">
                      Change
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        hasSufficientCash ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {formatPHP(changeDue)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickCash('exact')}
                    className="flex-1 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors"
                  >
                    Exact
                  </button>
                  {[100, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickCash(amt)}
                      className="flex-1 py-1 text-[11px] font-semibold tabular-nums bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors"
                    >
                      ₱{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onCompleteCheckout}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            <span>Complete Checkout & Print Receipt</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
