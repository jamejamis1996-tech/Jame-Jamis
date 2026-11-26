import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Package, ShoppingCart } from 'lucide-react';
import {
  computeOrderTotals,
  createInitialMedicines,
  formatPHP,
  getDaysUntilExpiry,
  getUnitMultiplier,
  PHARMACY_INFO,
  STORAGE_KEYS,
} from './data/initialMedicines';
import type {
  CartItem,
  DiscountType,
  Medicine,
  PaymentMethod,
  TabKey,
  ToastMessage,
  ToastTone,
  Transaction,
  UnitType,
} from './types/pharmacy';
import { PosCheckout } from './components/PosCheckout';
import { InventoryView } from './components/InventoryView';
import { SalesAuditView } from './components/SalesAuditView';
import { MedicineModal } from './components/modals/MedicineModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { VoidModal } from './components/modals/VoidModal';

function loadInitialMedicines(): Medicine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.medicines);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Fallback to initial seed
  }
  return createInitialMedicines();
}

function loadInitialTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.transactions);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fallback to empty log
  }
  return [];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('pos');
  const [medicines, setMedicines] = useState<Medicine[]>(loadInitialMedicines);
  const [transactions, setTransactions] = useState<Transaction[]>(loadInitialTransactions);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout state
  const [discountType, setDiscountType] = useState<DiscountType>('regular');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [rxReference, setRxReference] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [cashTendered, setCashTendered] = useState('');

  // Live clock
  const [clockText, setClockText] = useState(() =>
    new Date().toLocaleString('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  // Modals & Toasts
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [prefillBrand, setPrefillBrand] = useState('');
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [voidTargetOr, setVoidTargetOr] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, tone: ToastTone = 'emerald') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.medicines, JSON.stringify(medicines));
    } catch {
      // Ignore storage quota errors
    }
  }, [medicines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    } catch {
      // Ignore storage quota errors
    }
  }, [transactions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockText(
        new Date().toLocaleString('en-PH', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const alertCount = useMemo(
    () =>
      medicines.filter(
        (m) => getDaysUntilExpiry(m.expiry) <= 90 || m.stock <= m.reorderLevel
      ).length,
    [medicines]
  );

  const totals = useMemo(
    () => computeOrderTotals(cart, medicines, discountType),
    [cart, medicines, discountType]
  );

  const handleAddToCart = useCallback(
    (medId: string, unitType: UnitType, customCatalog?: Medicine[]) => {
      const source = customCatalog || medicines;
      const med = source.find((m) => m.id === medId);
      if (!med) return;

      const multiplier = getUnitMultiplier(med, unitType);

      setCart((prevCart) => {
        const existingPiecesInCart = prevCart
          .filter((item) => item.medId === medId)
          .reduce((sum, item) => sum + item.qty * getUnitMultiplier(med, item.unitType), 0);

        if (existingPiecesInCart + multiplier > med.stock) {
          showToast(
            `Insufficient stock for ${med.brand}. Available: ${med.stock} pcs`,
            'rose'
          );
          return prevCart;
        }

        const idx = prevCart.findIndex(
          (item) => item.medId === medId && item.unitType === unitType
        );
        if (idx !== -1) {
          return prevCart.map((item, i) =>
            i === idx ? { ...item, qty: item.qty + 1 } : item
          );
        }
        return [...prevCart, { medId, unitType, qty: 1 }];
      });
    },
    [medicines, showToast]
  );

  const handleUpdateCartQty = useCallback(
    (index: number, delta: number) => {
      setCart((prevCart) => {
        const target = prevCart[index];
        if (!target) return prevCart;
        const med = medicines.find((m) => m.id === target.medId);
        if (!med) return prevCart;

        if (delta > 0) {
          const multiplier = getUnitMultiplier(med, target.unitType);
          const existingPiecesInCart = prevCart
            .filter((item) => item.medId === target.medId)
            .reduce(
              (sum, item) => sum + item.qty * getUnitMultiplier(med, item.unitType),
              0
            );
          if (existingPiecesInCart + multiplier > med.stock) {
            showToast(`Maximum available stock reached for ${med.brand}.`, 'amber');
            return prevCart;
          }
          return prevCart.map((item, i) =>
            i === index ? { ...item, qty: item.qty + 1 } : item
          );
        }

        const nextQty = target.qty - 1;
        if (nextQty <= 0) {
          return prevCart.filter((_, i) => i !== index);
        }
        return prevCart.map((item, i) => (i === index ? { ...item, qty: nextQty } : item));
      });
    },
    [medicines, showToast]
  );

  const handleRemoveCartItem = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
    setCashTendered('');
    setRxReference('');
  }, []);

  const handleCompleteCheckout = useCallback(() => {
    if (cart.length === 0) {
      showToast('Cart is empty. Add medicines before checking out.', 'amber');
      return;
    }

    const hasRx = cart.some(
      (item) => medicines.find((m) => m.id === item.medId)?.isRx
    );
    if (hasRx && !rxReference.trim()) {
      showToast(
        'Please enter Doctor Name / PRC # or Rx Reference for prescription items.',
        'rose'
      );
      return;
    }

    if (
      (discountType === 'senior' || discountType === 'pwd') &&
      (!customerName.trim() || !customerId.trim())
    ) {
      showToast(
        'Customer Name and OSCA/PWD ID Number are required for 20% discount.',
        'rose'
      );
      return;
    }

    let finalTendered = totals.netTotal;
    let changeDue = 0;

    if (paymentMethod === 'Cash') {
      finalTendered = parseFloat(cashTendered) || 0;
      if (finalTendered < totals.netTotal - 0.009) {
        showToast(
          `Insufficient cash tendered. Total due is ${formatPHP(totals.netTotal)}.`,
          'rose'
        );
        return;
      }
      changeDue = Math.max(0, finalTendered - totals.netTotal);
    }

    const pieceDeductions: Record<string, number> = {};
    const lineItems = cart.map((item) => {
      const med = medicines.find((m) => m.id === item.medId)!;
      const mult = getUnitMultiplier(med, item.unitType);
      const totalPieces = item.qty * mult;
      pieceDeductions[med.id] = (pieceDeductions[med.id] || 0) + totalPieces;

      return {
        medId: med.id,
        brand: med.brand,
        generic: med.generic,
        dosage: med.dosage,
        isRx: med.isRx,
        unitType: item.unitType,
        qty: item.qty,
        totalPieces,
        unitPrice: med.price * mult,
        lineTotal: med.price * mult * item.qty,
      };
    });

    const txRecord: Transaction = {
      orNumber: `OR-${String(100001 + transactions.length)}`,
      timestamp: new Date().toISOString(),
      cashier: PHARMACY_INFO.pharmacistOnDuty,
      discountType,
      customerName: discountType === 'regular' ? 'Walk-in Customer' : customerName.trim(),
      customerId: discountType === 'regular' ? '' : customerId.trim(),
      rxReference: hasRx ? rxReference.trim() : '',
      paymentMethod,
      cashTendered: finalTendered,
      changeDue,
      ...totals,
      items: lineItems,
      status: 'COMPLETED',
    };

    setMedicines((prev) =>
      prev.map((m) =>
        pieceDeductions[m.id] ? { ...m, stock: m.stock - pieceDeductions[m.id] } : m
      )
    );
    setTransactions((prev) => [txRecord, ...prev]);

    // Reset cart & checkout fields
    setCart([]);
    setCashTendered('');
    setRxReference('');
    setCustomerName('');
    setCustomerId('');
    setDiscountType('regular');

    setActiveReceipt(txRecord);
    showToast(`Transaction ${txRecord.orNumber} completed.`, 'emerald');
  }, [
    cart,
    cashTendered,
    customerId,
    customerName,
    discountType,
    medicines,
    paymentMethod,
    rxReference,
    showToast,
    totals,
    transactions.length,
  ]);

  const handleSaveMedicine = useCallback(
    (
      data: Omit<Medicine, 'id' | 'sku'>,
      editId: string | null,
      autoAddToCart: boolean
    ) => {
      if (editId) {
        setMedicines((prev) =>
          prev.map((m) => (m.id === editId ? { ...m, ...data } : m))
        );
        showToast(`${data.brand} updated successfully.`, 'emerald');
      } else {
        const newMed: Medicine = {
          id: `MED-${String(Date.now()).slice(-4)}`,
          sku: `48000${String(Math.floor(10000 + Math.random() * 90000))}`,
          ...data,
        };
        const updatedMeds = [newMed, ...medicines];
        setMedicines(updatedMeds);
        showToast(`${data.brand} added to ${PHARMACY_INFO.name} inventory.`, 'emerald');

        if (autoAddToCart && newMed.stock > 0) {
          handleAddToCart(newMed.id, 'piece', updatedMeds);
        }
      }

      setMedicineModalOpen(false);
      setEditingMedicine(null);
      setPrefillBrand('');
    },
    [handleAddToCart, medicines, showToast]
  );

  const handleResetDemoData = useCallback(() => {
    setMedicines(createInitialMedicines());
    setTransactions([]);
    setCart([]);
    setCashTendered('');
    setRxReference('');
    setCustomerName('');
    setCustomerId('');
    setDiscountType('regular');
    showToast('Demo data has been reset to defaults.', 'emerald');
  }, [showToast]);

  const handleConfirmVoid = useCallback(
    (pin: string) => {
      if (pin !== PHARMACY_INFO.overridePin) {
        showToast(`Invalid Pharmacist PIN. Demo PIN: ${PHARMACY_INFO.overridePin}`, 'rose');
        return;
      }

      const targetTx = transactions.find((t) => t.orNumber === voidTargetOr);
      if (targetTx && targetTx.status === 'COMPLETED') {
        const restores: Record<string, number> = {};
        for (const item of targetTx.items) {
          restores[item.medId] = (restores[item.medId] || 0) + item.totalPieces;
        }

        setMedicines((prev) =>
          prev.map((m) => (restores[m.id] ? { ...m, stock: m.stock + restores[m.id] } : m))
        );
        setTransactions((prev) =>
          prev.map((t) =>
            t.orNumber === targetTx.orNumber ? { ...t, status: 'VOIDED' } : t
          )
        );
        showToast(
          `Transaction ${targetTx.orNumber} voided and stock restored.`,
          'amber'
        );
      }

      setVoidTargetOr(null);
    },
    [showToast, transactions, voidTargetOr]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8] text-slate-900">
      {/* Top Navigation Bar — 3-Zone Contract */}
      <header className="bg-emerald-900 text-white sticky top-0 z-30 border-b border-emerald-950/40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white text-emerald-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
            </div>
            <span className="font-display text-base sm:text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
              {PHARMACY_INFO.name}
            </span>
          </div>

          {/* Zone 2: Navigation Tabs */}
          <nav
            className="flex items-center gap-1 bg-emerald-950/40 p-1 rounded-lg border border-emerald-700/50 overflow-x-auto"
            aria-label="Primary Workspace Navigation"
          >
            <button
              type="button"
              onClick={() => setActiveTab('pos')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'pos'
                  ? 'bg-white text-emerald-950'
                  : 'text-emerald-100 hover:bg-emerald-800/70'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>POS Checkout</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'inventory'
                  ? 'bg-white text-emerald-950'
                  : 'text-emerald-100 hover:bg-emerald-800/70'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>
                Inventory & Expiry{' '}
                <span
                  className={`tabular-nums ${
                    activeTab === 'inventory' ? 'text-amber-700' : 'text-amber-300'
                  }`}
                >
                  ({alertCount})
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'sales'
                  ? 'bg-white text-emerald-950'
                  : 'text-emerald-100 hover:bg-emerald-800/70'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Sales & Audit Log</span>
            </button>
          </nav>

          {/* Zone 3: Pharmacist on Duty & Timestamp */}
          <div className="hidden md:flex items-center gap-4 text-right whitespace-nowrap shrink-0">
            <div className="leading-tight">
              <div className="text-[11px] text-emerald-200 tabular-nums">{clockText}</div>
              <div className="text-xs font-semibold text-white">
                {PHARMACY_INFO.pharmacistOnDuty}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6">
        {activeTab === 'pos' && (
          <PosCheckout
            medicines={medicines}
            cart={cart}
            discountType={discountType}
            paymentMethod={paymentMethod}
            totals={totals}
            rxReference={rxReference}
            customerName={customerName}
            customerId={customerId}
            cashTendered={cashTendered}
            onRxReferenceChange={setRxReference}
            onCustomerNameChange={setCustomerName}
            onCustomerIdChange={setCustomerId}
            onCashTenderedChange={setCashTendered}
            onDiscountTypeChange={setDiscountType}
            onPaymentMethodChange={setPaymentMethod}
            onAddToCart={(medId, unit) => handleAddToCart(medId, unit)}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveCartItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onOpenAddMedicine={(prefill = '') => {
              setEditingMedicine(null);
              setPrefillBrand(prefill);
              setMedicineModalOpen(true);
            }}
            onCompleteCheckout={handleCompleteCheckout}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            medicines={medicines}
            onOpenAddMedicine={() => {
              setEditingMedicine(null);
              setPrefillBrand('');
              setMedicineModalOpen(true);
            }}
            onOpenEditMedicine={(med) => {
              setEditingMedicine(med);
              setPrefillBrand('');
              setMedicineModalOpen(true);
            }}
            onResetDemoData={handleResetDemoData}
          />
        )}

        {activeTab === 'sales' && (
          <SalesAuditView
            transactions={transactions}
            onReprintReceipt={(tx) => setActiveReceipt(tx)}
            onPromptVoid={(orNum) => setVoidTargetOr(orNum)}
          />
        )}
      </main>

      {/* Quiet Compliance Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-4 sm:px-6 text-[11px] text-slate-500">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>
            {PHARMACY_INFO.name} · FDA Licensed Retail Drugstore (LTO No.{' '}
            <span className="font-mono">{PHARMACY_INFO.fdaLto}</span>) ·{' '}
            {PHARMACY_INFO.region}
          </span>
          <span className="tabular-nums">
            Pharmacist on Duty: {PHARMACY_INFO.pharmacistOnDuty} · TIN:{' '}
            <span className="font-mono">{PHARMACY_INFO.tin}</span>
          </span>
        </div>
      </footer>

      {/* Modals */}
      <MedicineModal
        isOpen={medicineModalOpen}
        editingMedicine={editingMedicine}
        prefillBrand={prefillBrand}
        onClose={() => {
          setMedicineModalOpen(false);
          setEditingMedicine(null);
          setPrefillBrand('');
        }}
        onSave={handleSaveMedicine}
      />

      <ReceiptModal
        transaction={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      <VoidModal
        orNumber={voidTargetOr}
        onClose={() => setVoidTargetOr(null)}
        onConfirm={handleConfirmVoid}
      />

      {/* Toast Stack */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const styleMap: Record<ToastTone, string> = {
            emerald: 'bg-emerald-900 text-white border-emerald-700',
            amber: 'bg-amber-700 text-white border-amber-500',
            rose: 'bg-rose-700 text-white border-rose-500',
          };
          return (
            <div
              key={toast.id}
              className={`px-4 py-2.5 rounded-lg shadow-lg border text-xs font-semibold ${styleMap[toast.tone]}`}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </div>
  );
}
