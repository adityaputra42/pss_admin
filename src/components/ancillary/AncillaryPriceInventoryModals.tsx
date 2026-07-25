import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { X, DollarSign, Package } from 'lucide-react';

import type { CatalogItem } from '../../types/api';

/* ============================================================
   Set Price
   ============================================================ */

interface AncillaryPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  onSave: (payload: { amount: string; currency: string }) => Promise<void> | void;
}

/**
 * ⚠️ Setting a price CLOSES whatever price is currently open and starts
 * a new one effective now -- there is no "schedule a future price"
 * support server-side (see SetPriceHandler.Handle). Every submit here
 * is effectively "change the price starting right now".
 */
export const AncillaryPriceModal: React.FC<AncillaryPriceModalProps> = ({ isOpen, onClose, item, onSave }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setAmount(item?.CurrentPrice ?? '');
    setCurrency(item?.Currency || 'IDR');
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setSubmitting(true);
    try {
      await onSave({ amount, currency });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-95">
              <Dialog.Panel className="w-full max-w-sm rounded-md bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-slate-900">Set Price</Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">{item?.Name}</p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="bg-amber-50/60 border border-amber-100 rounded p-3 text-[11px] text-amber-800">
                    This closes the current price and starts a new one effective now. There's no way to schedule a future price change.
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="150000"
                          className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Currency</label>
                      <input
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                        maxLength={3}
                        className="w-full bg-slate-50 border-none rounded py-3 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-bold uppercase text-center"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting || !amount} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                      {submitting ? 'Saving...' : 'Set Price'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

/* ============================================================
   Set Inventory
   ============================================================ */

interface AncillaryInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  onSave: (payload: { flight_id: number; available_quantity: number }) => Promise<void> | void;
}

/**
 * ⚠️ Opt-in scarcity: an ancillary with NO inventory row for a flight is
 * treated as unlimited by the purchase flow. Only use this for
 * genuinely limited stock (e.g. a fixed extra-baggage allotment).
 */
export const AncillaryInventoryModal: React.FC<AncillaryInventoryModalProps> = ({ isOpen, onClose, item, onSave }) => {
  const [flightId, setFlightId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFlightId('');
    setQuantity('');
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightId) return;
    setSubmitting(true);
    try {
      await onSave({ flight_id: Number(flightId), available_quantity: Number(quantity) || 0 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-95">
              <Dialog.Panel className="w-full max-w-sm rounded-md bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-slate-900">Set Inventory</Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">{item?.Name}</p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="bg-amber-50/60 border border-amber-100 rounded p-3 text-[11px] text-amber-800">
                    Only set this for genuinely limited stock. An ancillary with no inventory row for a flight is unlimited by default.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Flight ID</label>
                    <input
                      type="number"
                      value={flightId}
                      onChange={(e) => setFlightId(e.target.value)}
                      placeholder="4821"
                      className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Available Quantity</label>
                    <div className="relative">
                      <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="12"
                        className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting || !flightId} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                      {submitting ? 'Saving...' : 'Set Inventory'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
