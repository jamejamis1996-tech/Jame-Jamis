import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface VoidModalProps {
  orNumber: string | null;
  onClose: () => void;
  onConfirm: (pin: string) => void;
}

export const VoidModal: React.FC<VoidModalProps> = ({ orNumber, onClose, onConfirm }) => {
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (!orNumber) return;
    setPin('');
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [orNumber, onClose]);

  if (!orNumber) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(pin);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="void-modal-title"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 id="void-modal-title" className="font-display font-bold text-slate-900 text-base">
              Pharmacist Void Override
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Enter Pharmacist PIN to void{' '}
              <span className="font-mono font-bold text-slate-900">{orNumber}</span> and restore
              stock.
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="void-pin-field"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Pharmacist Security PIN (Demo: 1234)
          </label>
          <input
            id="void-pin-field"
            type="password"
            maxLength={6}
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            className="w-full px-3 py-2.5 text-center tracking-[0.35em] font-mono text-lg border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-rose-600"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
          >
            Confirm Void
          </button>
        </div>
      </form>
    </div>
  );
};
