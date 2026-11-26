import type { CartItem, DiscountType, Medicine, OrderTotals, UnitType } from '../types/pharmacy';

export const PHARMACY_INFO = {
  name: 'JDM PHARMACY',
  fdaLto: '3000008941254',
  address: 'Poblacion, Mambajao, Camiguin',
  region: 'Camiguin · Northern Mindanao',
  tin: '245-891-330-000',
  pharmacistOnDuty: 'ELSIE FE C. BUSLON, RPh',
  overridePin: '1234',
} as const;

export const STORAGE_KEYS = {
  medicines: 'jdm_pharmacy_meds_v1',
  transactions: 'jdm_pharmacy_tx_v1',
} as const;

export function getRelativeDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export function createInitialMedicines(): Medicine[] {
  return [
    {
      id: 'MED-001',
      sku: '4800011001',
      brand: 'Biogesic',
      generic: 'Paracetamol',
      dosage: '500mg Tablet',
      category: 'Analgesics',
      isRx: false,
      price: 4.75,
      blisterSize: 10,
      boxSize: 100,
      stock: 450,
      reorderLevel: 100,
      batch: 'BTH-26A01',
      expiry: getRelativeDate(420),
    },
    {
      id: 'MED-002',
      sku: '4800011002',
      brand: 'Amoxil',
      generic: 'Amoxicillin Trihydrate',
      dosage: '500mg Capsule',
      category: 'Antibiotics',
      isRx: true,
      price: 14.5,
      blisterSize: 10,
      boxSize: 100,
      stock: 220,
      reorderLevel: 80,
      batch: 'BTH-26B14',
      expiry: getRelativeDate(280),
    },
    {
      id: 'MED-003',
      sku: '4800011003',
      brand: 'Lifezar',
      generic: 'Losartan Potassium',
      dosage: '50mg Tablet',
      category: 'Maintenance',
      isRx: true,
      price: 12.0,
      blisterSize: 10,
      boxSize: 100,
      stock: 310,
      reorderLevel: 100,
      batch: 'BTH-25L09',
      expiry: getRelativeDate(22),
    },
    {
      id: 'MED-004',
      sku: '4800011004',
      brand: 'Alnix',
      generic: 'Cetirizine Dihydrochloride',
      dosage: '10mg Tablet',
      category: 'OTC',
      isRx: false,
      price: 18.25,
      blisterSize: 10,
      boxSize: 100,
      stock: 160,
      reorderLevel: 50,
      batch: 'BTH-26C03',
      expiry: getRelativeDate(365),
    },
    {
      id: 'MED-005',
      sku: '4800011005',
      brand: 'Enervon-C',
      generic: 'Multivitamins + Ascorbic Acid',
      dosage: '500mg Tablet',
      category: 'Vitamins',
      isRx: false,
      price: 9.5,
      blisterSize: 10,
      boxSize: 100,
      stock: 500,
      reorderLevel: 120,
      batch: 'BTH-26V11',
      expiry: getRelativeDate(510),
    },
    {
      id: 'MED-006',
      sku: '4800011006',
      brand: 'Neozep Forte',
      generic: 'Phenylephrine + Chlorphenamine + Paracetamol',
      dosage: 'Tablet',
      category: 'OTC',
      isRx: false,
      price: 7.0,
      blisterSize: 10,
      boxSize: 100,
      stock: 38,
      reorderLevel: 60,
      batch: 'BTH-26N04',
      expiry: getRelativeDate(195),
    },
    {
      id: 'MED-007',
      sku: '4800011007',
      brand: 'Kremil-S',
      generic: 'Aluminum Hydroxide + Magnesium + Simeticone',
      dosage: 'Chewable Tablet',
      category: 'OTC',
      isRx: false,
      price: 8.5,
      blisterSize: 10,
      boxSize: 100,
      stock: 240,
      reorderLevel: 60,
      batch: 'BTH-26K02',
      expiry: getRelativeDate(310),
    },
    {
      id: 'MED-008',
      sku: '4800011008',
      brand: 'Solmux',
      generic: 'Carbocisteine',
      dosage: '500mg Capsule',
      category: 'OTC',
      isRx: false,
      price: 13.75,
      blisterSize: 10,
      boxSize: 100,
      stock: 190,
      reorderLevel: 60,
      batch: 'BTH-26S08',
      expiry: getRelativeDate(260),
    },
    {
      id: 'MED-009',
      sku: '4800011009',
      brand: 'Glucophage',
      generic: 'Metformin Hydrochloride',
      dosage: '500mg Tablet',
      category: 'Maintenance',
      isRx: true,
      price: 8.25,
      blisterSize: 10,
      boxSize: 100,
      stock: 340,
      reorderLevel: 100,
      batch: 'BTH-25M12',
      expiry: getRelativeDate(68),
    },
    {
      id: 'MED-010',
      sku: '4800011010',
      brand: 'Norvasc',
      generic: 'Amlodipine Besilate',
      dosage: '5mg Tablet',
      category: 'Maintenance',
      isRx: true,
      price: 16.5,
      blisterSize: 10,
      boxSize: 100,
      stock: 210,
      reorderLevel: 80,
      batch: 'BTH-26A19',
      expiry: getRelativeDate(400),
    },
    {
      id: 'MED-011',
      sku: '4800011011',
      brand: 'Dolfenal',
      generic: 'Mefenamic Acid',
      dosage: '500mg Tablet',
      category: 'Analgesics',
      isRx: true,
      price: 24.0,
      blisterSize: 10,
      boxSize: 100,
      stock: 120,
      reorderLevel: 40,
      batch: 'BTH-26D05',
      expiry: getRelativeDate(330),
    },
    {
      id: 'MED-012',
      sku: '4800011012',
      brand: 'Zithromax',
      generic: 'Azithromycin',
      dosage: '500mg Tablet',
      category: 'Antibiotics',
      isRx: true,
      price: 89.0,
      blisterSize: 3,
      boxSize: 30,
      stock: 45,
      reorderLevel: 20,
      batch: 'BTH-26Z01',
      expiry: getRelativeDate(290),
    },
    {
      id: 'MED-013',
      sku: '4800011013',
      brand: 'ImmunPro',
      generic: 'Sodium Ascorbate + Zinc',
      dosage: '500mg/10mg Tablet',
      category: 'Vitamins',
      isRx: false,
      price: 11.25,
      blisterSize: 10,
      boxSize: 100,
      stock: 410,
      reorderLevel: 100,
      batch: 'BTH-26I07',
      expiry: getRelativeDate(480),
    },
    {
      id: 'MED-014',
      sku: '4800011014',
      brand: 'Advil',
      generic: 'Ibuprofen',
      dosage: '200mg Softgel',
      category: 'Analgesics',
      isRx: false,
      price: 10.5,
      blisterSize: 10,
      boxSize: 100,
      stock: 25,
      reorderLevel: 50,
      batch: 'BTH-26AD2',
      expiry: getRelativeDate(210),
    },
    {
      id: 'MED-015',
      sku: '4800011015',
      brand: 'Augmentin',
      generic: 'Co-Amoxiclav',
      dosage: '625mg Tablet',
      category: 'Antibiotics',
      isRx: true,
      price: 62.0,
      blisterSize: 7,
      boxSize: 14,
      stock: 84,
      reorderLevel: 30,
      batch: 'BTH-25AU8',
      expiry: getRelativeDate(55),
    },
    {
      id: 'MED-016',
      sku: '4800011016',
      brand: 'Diatabs',
      generic: 'Loperamide',
      dosage: '2mg Capsule',
      category: 'OTC',
      isRx: false,
      price: 9.0,
      blisterSize: 10,
      boxSize: 100,
      stock: 270,
      reorderLevel: 60,
      batch: 'BTH-26DT4',
      expiry: getRelativeDate(390),
    },
  ];
}

export function formatPHP(amount: number): string {
  return (
    '₱' +
    Number(amount || 0).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function getDaysUntilExpiry(expiryStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryStr);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getUnitMultiplier(med: Medicine, unitType: UnitType): number {
  if (unitType === 'box') return med.boxSize;
  if (unitType === 'blister') return med.blisterSize;
  return 1;
}

export function computeOrderTotals(
  cart: CartItem[],
  medicines: Medicine[],
  discountType: DiscountType
): OrderTotals {
  let grossSubtotal = 0;
  for (const item of cart) {
    const med = medicines.find((m) => m.id === item.medId);
    if (med) {
      const mult = getUnitMultiplier(med, item.unitType);
      grossSubtotal += med.price * mult * item.qty;
    }
  }

  let vatExemptAmount = 0;
  let scPwdDiscount = 0;
  let netTotal = grossSubtotal;
  let vatableSales = grossSubtotal / 1.12;
  let vatAmount = grossSubtotal - vatableSales;

  if ((discountType === 'senior' || discountType === 'pwd') && grossSubtotal > 0) {
    // Philippine RA 9994 / RA 10754: Remove 12% VAT first, then apply 20% discount
    const vatExclusive = grossSubtotal / 1.12;
    vatExemptAmount = grossSubtotal - vatExclusive;
    scPwdDiscount = vatExclusive * 0.2;
    netTotal = vatExclusive - scPwdDiscount;
    vatableSales = 0;
    vatAmount = 0;
  }

  return {
    grossSubtotal,
    vatExemptAmount,
    scPwdDiscount,
    totalDiscount: vatExemptAmount + scPwdDiscount,
    netTotal,
    vatableSales,
    vatAmount,
  };
}
