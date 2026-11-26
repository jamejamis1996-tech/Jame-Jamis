import React, { useMemo } from 'react';
import { Printer, RotateCcw } from 'lucide-react';
import type { Transaction } from '../types/pharmacy';
import { formatPHP, PHARMACY_INFO } from '../data/initialMedicines';

interface SalesAuditViewProps {
  transactions: Transaction[];
  onReprintReceipt: (tx: Transaction) => void;
  onPromptVoid: (orNumber: string) => void;
}

export const SalesAuditView: React.FC<SalesAuditViewProps> = ({
  transactions,
  onReprintReceipt,
  onPromptVoid,
}) => {
  const kpis = useMemo(() => {
    const completed = transactions.filter((t) => t.status === 'COMPLETED');
    const totalRevenue = completed.reduce((sum, t) => sum + t.netTotal, 0);
    const totalDiscounts = completed.reduce((sum, t) => sum + t.totalDiscount, 0);

    const itemCounts: Record<string, number> = {};
    for (const tx of completed) {
      for (const item of tx.items) {
        itemCounts[item.brand] = (itemCounts[item.brand] || 0) + item.totalPieces;
      }
    }

    let topName = '—';
    let topQty = 0;
    for (const [brand, qty] of Object.entries(itemCounts)) {
      if (qty > topQty) {
        topName = brand;
        topQty = qty;
      }
    }

    return {
      totalRevenue,
      totalTransactions: completed.length,
      totalDiscounts,
      topName,
      topQty,
    };
  }, [transactions]);

  return (
    <div className="space-y-4">
      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Total Net Revenue</div>
          <div className="text-2xl font-display font-bold text-emerald-700 mt-1 tabular-nums">
            {formatPHP(kpis.totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Completed non-voided sales</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Total Transactions</div>
          <div className="text-2xl font-display font-bold text-slate-900 mt-1 tabular-nums">
            {kpis.totalTransactions}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Official receipts issued</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">SC / PWD Discounts</div>
          <div className="text-2xl font-display font-bold text-amber-700 mt-1 tabular-nums">
            {formatPHP(kpis.totalDiscounts)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">20% Discount + VAT Exempt</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Top-Selling Medicine</div>
          <div className="text-lg font-display font-bold text-slate-900 mt-1 truncate">
            {kpis.topName}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
            {kpis.topQty} pcs dispensed
          </div>
        </div>
      </div>

      {/* Transaction History & Pharmacist Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">
              Transaction History & Pharmacist Audit Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reprint official receipts or void transactions (Pharmacist Override PIN:{' '}
              <span className="font-mono font-semibold text-slate-800">
                {PHARMACY_INFO.overridePin}
              </span>
              )
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4">OR / Receipt #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Pharmacist on Duty</th>
                <th className="py-3 px-4">Customer / Type</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Total Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs tabular-nums">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                    No transactions recorded yet. Complete a sale in POS Checkout.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isVoid = tx.status === 'VOIDED';
                  const itemSummary = tx.items
                    .map((i) => `${i.brand} (${i.qty} ${i.unitType})`)
                    .join(', ');

                  return (
                    <tr
                      key={tx.orNumber}
                      className={
                        isVoid
                          ? 'bg-rose-50/40 text-slate-400'
                          : 'hover:bg-slate-50/80 transition-colors'
                      }
                    >
                      <td
                        className={`py-3 px-4 font-mono font-bold ${
                          isVoid ? 'line-through' : 'text-slate-900'
                        }`}
                      >
                        {tx.orNumber}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {new Date(tx.timestamp).toLocaleString('en-PH')}
                      </td>
                      <td className="py-3 px-4 font-medium">{tx.cashier}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{tx.customerName}</div>
                        <div className="text-[11px] text-slate-500 uppercase">
                          {tx.discountType} · {tx.paymentMethod}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[220px] truncate" title={itemSummary}>
                        {itemSummary}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          isVoid ? 'line-through' : 'text-emerald-700'
                        }`}
                      >
                        {formatPHP(tx.netTotal)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-bold ${
                            isVoid ? 'text-rose-700' : 'text-emerald-700'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onReprintReceipt(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Reprint</span>
                        </button>
                        {!isVoid && (
                          <button
                            type="button"
                            onClick={() => onPromptVoid(tx.orNumber)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-md transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Void</span>
                          </button>
                        )}
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
