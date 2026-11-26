import React, { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import type { Transaction } from '../../types/pharmacy';
import { formatPHP, PHARMACY_INFO } from '../../data/initialMedicines';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  useEffect(() => {
    if (!transaction) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [transaction, onClose]);

  if (!transaction) return null;

  const dateStr = new Date(transaction.timestamp).toLocaleString('en-PH');

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <span id="receipt-modal-title" className="text-xs font-bold text-slate-800">
            Official Pharmacy Receipt
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close receipt dialog"
            className="p-1 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          id="receipt-printable"
          className="p-5 overflow-y-auto font-mono-receipt text-[11px] leading-relaxed text-slate-800 bg-white tabular-nums"
        >
          <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
            <div className="font-bold text-sm tracking-wider text-slate-950">
              {PHARMACY_INFO.name}
            </div>
            <div className="text-[10px] text-slate-600">
              FDA LTO No. {PHARMACY_INFO.fdaLto}
            </div>
            <div className="text-[10px] text-slate-600">{PHARMACY_INFO.address}</div>
            <div className="text-[10px] text-slate-600">
              VAT Reg TIN: {PHARMACY_INFO.tin}
            </div>
            <div className="mt-2 font-bold text-xs">OFFICIAL RECEIPT</div>
            <div className="font-bold text-slate-950">{transaction.orNumber}</div>
          </div>

          <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-400 pb-2.5 mb-2.5">
            <div>Date: {dateStr}</div>
            <div>Pharmacist on Duty: {transaction.cashier}</div>
            <div>Customer: {transaction.customerName}</div>
            {transaction.customerId && (
              <div>
                {transaction.discountType.toUpperCase()} ID: {transaction.customerId}
              </div>
            )}
            {transaction.rxReference && (
              <div>
                Rx Ref/MD: {transaction.rxReference} (Verified by {transaction.cashier})
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-slate-400 pb-2.5 mb-2.5">
            {transaction.items.map((item, idx) => (
              <div key={`${item.medId}-${item.unitType}-${idx}`} className="mb-1.5 last:mb-0">
                <div className="flex justify-between font-bold gap-2">
                  <span>
                    {item.brand} ({item.dosage}) {item.isRx ? '[Rx]' : ''}
                  </span>
                  <span className="shrink-0">{formatPHP(item.lineTotal)}</span>
                </div>
                <div className="text-slate-500 text-[10px] pl-2">
                  {item.qty} x {item.unitType.toUpperCase()} @ {formatPHP(item.unitPrice)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-2.5 mb-2.5">
            <div className="flex justify-between">
              <span>Gross Subtotal:</span>
              <span>{formatPHP(transaction.grossSubtotal)}</span>
            </div>
            {transaction.vatExemptAmount > 0 ? (
              <>
                <div className="flex justify-between">
                  <span>Less 12% VAT Exempt:</span>
                  <span>-{formatPHP(transaction.vatExemptAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less 20% SC/PWD Disc:</span>
                  <span>-{formatPHP(transaction.scPwdDiscount)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>VATable Sales:</span>
                  <span>{formatPHP(transaction.vatableSales)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>12% VAT Amount:</span>
                  <span>{formatPHP(transaction.vatAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300 text-slate-950">
              <span>TOTAL DUE:</span>
              <span>{formatPHP(transaction.netTotal)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Payment ({transaction.paymentMethod}):</span>
              <span>{formatPHP(transaction.cashTendered)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>CHANGE:</span>
              <span>{formatPHP(transaction.changeDue)}</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 space-y-1">
            {transaction.status === 'VOIDED' && (
              <div className="text-rose-700 font-bold text-xs border border-rose-600 py-1 my-1">
                *** VOIDED TRANSACTION ***
              </div>
            )}
            <div>Thank you for trusting {PHARMACY_INFO.name}!</div>
            <div>For your health & wellness needs.</div>
            <div className="pt-1 font-semibold text-slate-700">
              THIS SERVES AS YOUR OFFICIAL RECEIPT
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
