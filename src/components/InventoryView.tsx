import React, { useMemo, useState } from 'react';
import { Plus, RotateCcw, Search } from 'lucide-react';
import type { InventoryFilter, Medicine } from '../types/pharmacy';
import { formatPHP, getDaysUntilExpiry } from '../data/initialMedicines';

interface InventoryViewProps {
  medicines: Medicine[];
  onOpenAddMedicine: () => void;
  onOpenEditMedicine: (medicine: Medicine) => void;
  onResetDemoData: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  medicines,
  onOpenAddMedicine,
  onOpenEditMedicine,
  onResetDemoData,
}) => {
  const [filter, setFilter] = useState<InventoryFilter>('all');
  const [search, setSearch] = useState('');
  const [confirmingReset, setConfirmingReset] = useState(false);

  const summary = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let lowStock = 0;
    for (const m of medicines) {
      const days = getDaysUntilExpiry(m.expiry);
      if (days <= 30) critical++;
      else if (days <= 90) warning++;
      if (m.stock <= m.reorderLevel) lowStock++;
    }
    return { total: medicines.length, critical, warning, lowStock };
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...medicines]
      .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())
      .filter((m) => {
        const days = getDaysUntilExpiry(m.expiry);
        if (filter === 'expiring30' && days > 30) return false;
        if (filter === 'expiring90' && days > 90) return false;
        if (filter === 'lowstock' && m.stock > m.reorderLevel) return false;
        if (
          q &&
          !m.brand.toLowerCase().includes(q) &&
          !m.generic.toLowerCase().includes(q) &&
          !m.batch.toLowerCase().includes(q) &&
          !m.sku.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      });
  }, [medicines, filter, search]);

  return (
    <div className="space-y-4">
      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Active SKUs / Batches</div>
          <div className="text-2xl font-display font-bold text-slate-900 mt-1 tabular-nums">
            {summary.total}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Critical Expiry (&lt; 30 Days)</div>
          <div className="text-2xl font-display font-bold text-rose-700 mt-1 tabular-nums">
            {summary.critical}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Warning Expiry (31–90 Days)</div>
          <div className="text-2xl font-display font-bold text-amber-700 mt-1 tabular-nums">
            {summary.warning}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Low Stock Alerts</div>
          <div className="text-2xl font-display font-bold text-amber-700 mt-1 tabular-nums">
            {summary.lowStock}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-base text-slate-900">
            Inventory & Batch Expiry Management (FEFO)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            First-Expired, First-Out tracking · Monitor near-expiry batches and low-stock thresholds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter SKU, brand, lot..."
              className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
            />
          </div>

          <select
            aria-label="Filter inventory batches"
            value={filter}
            onChange={(e) => setFilter(e.target.value as InventoryFilter)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">All Batches</option>
            <option value="expiring30">Critical Expiry (&lt; 30 Days)</option>
            <option value="expiring90">Warning Expiry (&lt; 90 Days)</option>
            <option value="lowstock">Low Stock Items</option>
          </select>

          <button
            type="button"
            onClick={onOpenAddMedicine}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Restock Medicine</span>
          </button>

          {confirmingReset ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setConfirmingReset(false);
                }}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">SKU / Medicine</th>
                <th className="py-3 px-4">Category & Class</th>
                <th className="py-3 px-4">Batch / Lot #</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4 text-right">Stock (Pcs)</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs tabular-nums">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No inventory batches match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((m) => {
                  const days = getDaysUntilExpiry(m.expiry);
                  const isLowStock = m.stock <= m.reorderLevel;

                  let expiryText = `Good (${days}d)`;
                  let expiryColor = 'text-emerald-700';
                  if (days <= 0) {
                    expiryText = 'Expired';
                    expiryColor = 'text-rose-700 font-bold';
                  } else if (days <= 30) {
                    expiryText = `Expires in ${days}d`;
                    expiryColor = 'text-rose-700 font-bold';
                  } else if (days <= 90) {
                    expiryText = `Expires in ${days}d`;
                    expiryColor = 'text-amber-700 font-semibold';
                  }

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {m.brand}{' '}
                          <span className="text-slate-500 font-normal">({m.dosage})</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {m.generic} · <span className="font-mono">{m.sku}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-700 font-medium">{m.category}</span>
                        <span
                          className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            m.isRx
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {m.isRx ? 'Rx' : 'OTC'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {m.batch}
                      </td>
                      <td
                        className={`py-3 px-4 font-medium ${
                          days <= 30
                            ? 'text-rose-700'
                            : days <= 90
                            ? 'text-amber-700'
                            : 'text-slate-700'
                        }`}
                      >
                        {m.expiry}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          isLowStock ? 'text-amber-700' : 'text-slate-900'
                        }`}
                      >
                        {m.stock} pcs
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                        {formatPHP(m.price)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-x-1.5 text-[11px]">
                          <span className={expiryColor}>{expiryText}</span>
                          {isLowStock && (
                            <>
                              <span aria-hidden="true" className="text-slate-300">
                                ·
                              </span>
                              <span className="text-amber-700 font-semibold">Low Stock</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenEditMedicine(m)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-semibold rounded-md transition-colors whitespace-nowrap"
                        >
                          Edit / Restock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
