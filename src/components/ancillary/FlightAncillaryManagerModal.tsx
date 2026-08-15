import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { X, Plus, Package, Pencil, Check, Ban } from 'lucide-react';

import type { Flight, CatalogItem } from '../../types/api';
import { ancillaryApi } from '../../services/api-services';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';

interface FlightAncillaryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight | null;
}

/**
 * Manages the ancillary whitelist for one flight: which ancillaries are
 * sellable on it, and how many. Since the change that made this a
 * whitelist (an ancillary with no row here is now NOT purchasable, not
 * unlimited -- see PurchaseHandler.Handle server-side), every ancillary
 * a flight should sell needs a row, even ones you don't want to cap.
 *
 * There is no remove-from-whitelist endpoint server-side -- once added,
 * a row can only have its quantity changed, not be deleted. Setting
 * quantity to 0 is the closest thing to "turn it off": purchases will
 * be rejected for insufficient quantity rather than "not offered", but
 * the practical effect (nothing sells) is the same.
 */
const FlightAncillaryManagerModal: React.FC<FlightAncillaryManagerModalProps> = ({ isOpen, onClose, flight }) => {
  const [whitelisted, setWhitelisted] = useState<CatalogItem[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [addAncillaryId, setAddAncillaryId] = useState('');
  const [addQuantity, setAddQuantity] = useState('');
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    if (!flight) return;
    setLoading(true);
    try {
      const [flightItems, fullCatalog] = await Promise.all([
        ancillaryApi.getFlightCatalog(flight.id),
        ancillaryApi.listCatalog({ active_only: true, limit: 100 }),
      ]);
      setWhitelisted(flightItems);
      setCatalog(fullCatalog.items ?? []);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load ancillaries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      load();
      setAddAncillaryId('');
      setAddQuantity('');
      setEditingId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, flight]);

  // Ancillaries not yet whitelisted for this flight -- the add form only offers these.
  const availableToAdd = catalog.filter((c) => !whitelisted.some((w) => w.ID === c.ID));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flight || !addAncillaryId || !addQuantity) return;
    setAdding(true);
    try {
      await ancillaryApi.setInventory(Number(addAncillaryId), {
        flight_id: flight.id,
        available_quantity: Number(addQuantity),
      });
      showSuccessAlert('Ancillary added to this flight');
      setAddAncillaryId('');
      setAddQuantity('');
      load();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to add ancillary');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (item: CatalogItem) => {
    setEditingId(item.ID);
    setEditQuantity(String(item.AvailableQuantity ?? 0));
  };

  const saveEdit = async () => {
    if (!flight || editingId === null) return;
    setSavingEdit(true);
    try {
      await ancillaryApi.setInventory(editingId, {
        flight_id: flight.id,
        available_quantity: Number(editQuantity) || 0,
      });
      showSuccessAlert('Quantity updated');
      setEditingId(null);
      load();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to update quantity');
    } finally {
      setSavingEdit(false);
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
              <Dialog.Panel className="w-full max-w-xl rounded-md bg-white shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-slate-900">Manage Ancillaries</Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">Flight #{flight?.id}</p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div className="bg-amber-50/60 border border-amber-100 rounded p-3 text-[11px] text-amber-800">
                    Whitelist: only ancillaries listed here can be purchased for this flight. There's no remove
                    button -- once added, set quantity to 0 to effectively stop it selling.
                  </div>

                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
                    </div>
                  ) : whitelisted.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No ancillaries whitelisted for this flight yet -- nothing is sellable until you add some below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {whitelisted.map((item) => {
                        const isEditing = editingId === item.ID;
                        return (
                          <div key={item.ID} className="flex items-center gap-3 bg-slate-50/70 rounded px-4 py-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-800 text-sm">{item.Name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {item.CurrentPrice ? `${item.Currency} ${Number(item.CurrentPrice).toLocaleString()}` : 'No price set'}
                              </div>
                            </div>
                            {isEditing ? (
                              <div className="flex items-center gap-2 shrink-0">
                                <input
                                  type="number" min="0" autoFocus value={editQuantity}
                                  onChange={(e) => setEditQuantity(e.target.value)}
                                  className="w-20 bg-white border border-slate-200 rounded py-1.5 px-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                                />
                                <button onClick={saveEdit} disabled={savingEdit} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-white rounded transition-colors">
                                  <Ban className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => startEdit(item)} className="flex items-center gap-2 shrink-0 group">
                                <span className="flex items-center gap-1 text-sm font-bold text-slate-700">
                                  <Package className="w-3.5 h-3.5 text-slate-400" />
                                  {item.AvailableQuantity ?? 0}
                                </span>
                                <Pencil className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <form onSubmit={handleAdd} className="border-t border-slate-100 pt-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Add an ancillary</h3>
                    {availableToAdd.length === 0 && catalog.length > 0 ? (
                      <p className="text-xs text-slate-400">Every active ancillary is already whitelisted for this flight.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={addAncillaryId}
                          onChange={(e) => setAddAncillaryId(e.target.value)}
                          className="col-span-2 bg-slate-50 border-none rounded py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                        >
                          <option value="">Ancillary</option>
                          {availableToAdd.map((c) => (
                            <option key={c.ID} value={c.ID}>{c.Name}</option>
                          ))}
                        </select>
                        <input
                          type="number" min="0" placeholder="Quantity" value={addQuantity}
                          onChange={(e) => setAddQuantity(e.target.value)}
                          className="bg-slate-50 border-none rounded py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                        <button
                          type="submit"
                          disabled={adding || !addAncillaryId || !addQuantity}
                          className="col-span-3 premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          Add to flight
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FlightAncillaryManagerModal;
