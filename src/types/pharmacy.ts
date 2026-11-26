export type MedicineCategory =
  | 'Analgesics'
  | 'Antibiotics'
  | 'Maintenance'
  | 'Vitamins'
  | 'OTC';

export type UnitType = 'piece' | 'blister' | 'box';

export type DiscountType = 'regular' | 'senior' | 'pwd';

export type PaymentMethod = 'Cash' | 'GCash' | 'Card';

export type TabKey = 'pos' | 'inventory' | 'sales';

export type InventoryFilter = 'all' | 'expiring30' | 'expiring90' | 'lowstock';

export interface Medicine {
  id: string;
  sku: string;
  brand: string;
  generic: string;
  dosage: string;
  category: MedicineCategory;
  isRx: boolean;
  price: number;
  blisterSize: number;
  boxSize: number;
  stock: number;
  reorderLevel: number;
  batch: string;
  expiry: string;
}

export interface CartItem {
  medId: string;
  unitType: UnitType;
  qty: number;
}

export interface OrderTotals {
  grossSubtotal: number;
  vatExemptAmount: number;
  scPwdDiscount: number;
  totalDiscount: number;
  netTotal: number;
  vatableSales: number;
  vatAmount: number;
}

export interface TransactionLineItem {
  medId: string;
  brand: string;
  generic: string;
  dosage: string;
  isRx: boolean;
  unitType: UnitType;
  qty: number;
  totalPieces: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Transaction extends OrderTotals {
  orNumber: string;
  timestamp: string;
  cashier: string;
  discountType: DiscountType;
  customerName: string;
  customerId: string;
  rxReference: string;
  paymentMethod: PaymentMethod;
  cashTendered: number;
  changeDue: number;
  items: TransactionLineItem[];
  status: 'COMPLETED' | 'VOIDED';
}

export type ToastTone = 'emerald' | 'amber' | 'rose';

export interface ToastMessage {
  id: string;
  message: string;
  tone: ToastTone;
}
