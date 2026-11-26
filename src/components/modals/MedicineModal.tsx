import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Medicine, MedicineCategory } from '../../types/pharmacy';
import { getRelativeDate } from '../../data/initialMedicines';

interface MedicineModalProps {
  isOpen: boolean;
  editingMedicine: Medicine | null;
  prefillBrand?: string;
  onClose: () => void;
  onSave: (
    data: Omit<Medicine, 'id' | 'sku'>,
    editId: string | null,
    autoAddToCart: boolean
  ) => void;
}

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  editingMedicine,
  prefillBrand = '',
  onClose,
  onSave,
}) => {
  const [brand, setBrand] = useState('');
  const [generic, setGeneric] = useState('');
  const [dosage, setDosage] = useState('');
  const [category, setCategory] = useState<MedicineCategory>('Analgesics');
  const [isRx, setIsRx] = useState(false);
  const [batch, setBatch] = useState('');
  const [expiry, setExpiry] = useState('');
  const [price, setPrice] = useState('');
  const [blisterSize, setBlisterSize] = useState('10');
  const [boxSize, setBoxSize] = useState('100');
  const [stock, setStock] = useState('');
  const [reorderLevel, setReorderLevel] = useState('50');
  const [autoAddToCart, setAutoAddToCart] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    if (editingMedicine) {
      setBrand(editingMedicine.brand);
      setGeneric(editingMedicine.generic);
      setDosage(editingMedicine.dosage);
      setCategory(editingMedicine.category);
      setIsRx(editingMedicine.isRx);
      setBatch(editingMedicine.batch);
      setExpiry(editingMedicine.expiry);
      setPrice(String(editingMedicine.price));
      setBlisterSize(String(editingMedicine.blisterSize));
      setBoxSize(String(editingMedicine.boxSize));
      setStock(String(editingMedicine.stock));
      setReorderLevel(String(editingMedicine.reorderLevel));
      setAutoAddToCart(false);
    } else {
      setBrand(prefillBrand);
      setGeneric('');
      setDosage('');
      setCategory('Analgesics');
      setIsRx(false);
      setBatch(
        `BTH-${new Date().getFullYear()}-${String(Math.floor(10 + Math.random() * 89))}`
      );
      setExpiry(getRelativeDate(365));
      setPrice('');
      setBlisterSize('10');
      setBoxSize('100');
      setStock('');
      setReorderLevel('50');
      setAutoAddToCart(true);
    }
  }, [isOpen, editingMedicine, prefillBrand]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        brand: brand.trim(),
        generic: generic.trim(),
        dosage: dosage.trim(),
        category,
        isRx,
        batch: batch.trim(),
        expiry,
        price: parseFloat(price) || 0,
        blisterSize: Math.max(1, parseInt(blisterSize, 10) || 10),
        boxSize: Math.max(1, parseInt(boxSize, 10) || 100),
        stock: Math.max(0, parseInt(stock, 10) || 0),
        reorderLevel: Math.max(1, parseInt(reorderLevel, 10) || 50),
      },
      editingMedicine ? editingMedicine.id : null,
      !editingMedicine && autoAddToCart
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medicine-modal-heading"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
          <h3 id="medicine-modal-heading" className="font-display font-bold text-base">
            {editingMedicine ? `Edit / Restock: ${editingMedicine.brand}` : 'Add New Medicine / Batch'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close medicine dialog"
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                autoFocus
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Biogesic"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Generic Name *</label>
              <input
                type="text"
                required
                value={generic}
                onChange={(e) => setGeneric(e.target.value)}
                placeholder="e.g. Paracetamol"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dosage & Form *</label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500mg Tablet"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MedicineCategory)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              >
                <option value="Analgesics">Analgesics</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Vitamins">Vitamins</option>
                <option value="OTC">OTC</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Classification *</label>
              <select
                value={String(isRx)}
                onChange={(e) => setIsRx(e.target.value === 'true')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              >
                <option value="false">OTC (Over-the-Counter)</option>
                <option value="true">Rx (Prescription Required)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batch / Lot Number *</label>
              <input
                type="text"
                required
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. BTH-2026-09"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiration Date *</label>
              <input
                type="date"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm tabular-nums focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Price (₱/pc) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="5.50"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm tabular-nums focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pcs / Blister</label>
              <input
                type="number"
                min="1"
                value={blisterSize}
                onChange={(e) => setBlisterSize(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm tabular-nums focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pcs / Box</label>
              <input
                type="number"
                min="1"
                value={boxSize}
                onChange={(e) => setBoxSize(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm tabular-nums focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Stock Quantity (Pieces) *</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="200"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm tabular-nums focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reorder Alert Level</label>
              <input
                type="number"
                min="1"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm tabular-nums focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {!editingMedicine && (
            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoAddToCart}
                onChange={(e) => setAutoAddToCart(e.target.checked)}
                className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-700">
                I-add dayon sa current POS cart inig save (1 pc)
              </span>
            </label>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Save Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
