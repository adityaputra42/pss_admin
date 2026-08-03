import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { X, Plus, Trash2, Pencil, Check, Ban } from 'lucide-react';

import type { Flight, FlightFare, FareClass } from '../../types/api';
import { flightsApi } from '../../services/api-services/flight';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../utils/alerts';

interface FlightFareManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight | null;
  fareClasses: FareClass[];
}

/**
 * Fares (price per fare_class_id) for ONE flight instance. Backend:
 * POST/GET /flights/instances/{id}/fares, PUT/DELETE /flights/fares/{fareId}
 * (internal/flight/interfaces/http/flight_generation_handler.go).
 *
 * This is the standalone path for a flight that didn't get fares from
 * generate-flights -- most importantly, any flight created through
 * the "Add Flight Instance" manual create modal, which deliberately
 * creates none. Without at least one fare here, that flight can never
 * be booked (search/booking both require a matching flight_fares row).
 */
const FlightFareManagerModal: React.FC<FlightFareManagerModalProps> = ({ isOpen, onClose, flight, fareClasses }) => {
  const [fares, setFares] = useState<FlightFare[]>([]);
  const [loading, setLoading] = useState(false);

  const [fareClassId, setFareClassId] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [availableSeats, setAvailableSeats] = useState('');
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editSeats, setEditSeats] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fareClassById = new Map(fareClasses.map((f) => [f.id, f]));

  const load = async () => {
    if (!flight) return;
    setLoading(true);
    try {
      const result = await flightsApi.listFares(flight.id);
      setFares(result);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load fares');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      load();
      setFareClassId('');
      setPrice('');
      setCurrency('IDR');
      setAvailableSeats('');
      setEditingId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, flight]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flight || !fareClassId || !price || !availableSeats) return;
    setAdding(true);
    try {
      await flightsApi.addFare(flight.id, {
        fare_class_id: Number(fareClassId),
        price,
        currency,
        available_seats: Number(availableSeats),
      });
      showSuccessAlert('Fare added');
      setFareClassId('');
      setPrice('');
      setAvailableSeats('');
      load();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to add fare');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (fare: FlightFare) => {
    setEditingId(fare.id);
    setEditPrice(fare.price);
    setEditSeats(String(fare.available_seats));
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    setSavingEdit(true);
    try {
      await flightsApi.updateFare(editingId, {
        price: editPrice,
        available_seats: Number(editSeats),
      });
      showSuccessAlert('Fare updated');
      setEditingId(null);
      load();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to update fare');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (fare: FlightFare) => {
    const ok = await showConfirmAlert('Remove this fare?', 'This fare class will no longer be sellable on this flight.');
    if (!ok) return;
    try {
      await flightsApi.deleteFare(fare.id);
      showSuccessAlert('Fare removed');
      load();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to remove fare');
    }
  };

  // Fare classes not yet attached to this flight -- the add form only
  // offers these, since adding a duplicate fare_class_id 409s server-side.
  const availableFareClasses = fareClasses.filter((fc) => !fares.some((f) => f.fare_class_id === fc.id));

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-95">
              <Dialog.Panel className="w-full max-w-2xl rounded-md bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-slate-900">Manage Fares</Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">
                      Flight #{flight?.id} — {flight ? new Date(flight.departure_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  {loading ? (
                    <p className="text-sm text-slate-400 text-center py-6">Loading fares...</p>
                  ) : fares.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">
                      No fares yet -- this flight can't be booked until at least one is added below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {fares.map((fare) => {
                        const fc = fareClassById.get(fare.fare_class_id);
                        const isEditing = editingId === fare.id;
                        return (
                          <div key={fare.id} className="flex items-center gap-3 bg-slate-50/70 rounded px-4 py-3">
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-800 text-sm">
                                {fc ? `${fc.code} — ${fc.name}` : `Fare class #${fare.fare_class_id}`}
                              </div>
                              {isEditing ? (
                                <div className="flex items-center gap-2 mt-1.5">
                                  <input
                                    type="number" step="0.01" value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="w-32 bg-white border border-slate-200 rounded py-1.5 px-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                                  />
                                  <input
                                    type="number" value={editSeats}
                                    onChange={(e) => setEditSeats(e.target.value)}
                                    className="w-20 bg-white border border-slate-200 rounded py-1.5 px-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                                  />
                                  <span className="text-xs text-slate-400">seats</span>
                                </div>
                              ) : (
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {fare.currency} {Number(fare.price).toLocaleString()} · {fare.available_seats} seats
                                </div>
                              )}
                            </div>
                            {isEditing ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={saveEdit} disabled={savingEdit} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50" title="Save">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-white rounded transition-colors" title="Cancel">
                                  <Ban className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => startEdit(fare)} className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded transition-colors" title="Edit">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(fare)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded transition-colors" title="Remove">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <form onSubmit={handleAdd} className="border-t border-slate-100 pt-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Add a fare</h3>
                    {availableFareClasses.length === 0 && fareClasses.length > 0 ? (
                      <p className="text-xs text-slate-400">Every fare class is already attached to this flight.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <select
                          value={fareClassId}
                          onChange={(e) => setFareClassId(e.target.value)}
                          className="col-span-2 md:col-span-1 bg-slate-50 border-none rounded py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                        >
                          <option value="">Fare class</option>
                          {availableFareClasses.map((fc) => (
                            <option key={fc.id} value={fc.id}>{fc.code} — {fc.name}</option>
                          ))}
                        </select>
                        <input
                          type="number" step="0.01" placeholder="Price" value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="bg-slate-50 border-none rounded py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                        <input
                          type="number" placeholder="Seats" value={availableSeats}
                          onChange={(e) => setAvailableSeats(e.target.value)}
                          className="bg-slate-50 border-none rounded py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                        <button
                          type="submit"
                          disabled={adding || !fareClassId || !price || !availableSeats}
                          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          Add
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

export default FlightFareManagerModal;
