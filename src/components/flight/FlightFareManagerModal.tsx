import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { X, Plus, Trash2, Pencil, Check, Ban } from 'lucide-react';

import type { Flight, FlightFare, FlightFarePrice, FareClass } from '../../types/api';
import { PASSENGER_TYPES, PASSENGER_TYPE_LABELS } from '../../types/api';
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

  // -- Add fare (new fare_class_id) form. Needs at least one price to submit. --
  const [fareClassId, setFareClassId] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [newPassengerType, setNewPassengerType] = useState<string>('ADT');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [adding, setAdding] = useState(false);

  // -- Edit available_seats on an existing fare. --
  const [editingSeatsId, setEditingSeatsId] = useState<number | null>(null);
  const [editSeats, setEditSeats] = useState('');
  const [savingSeats, setSavingSeats] = useState(false);

  // -- Add/correct one passenger-type price on an existing fare (upsert). --
  const [priceRowFareId, setPriceRowFareId] = useState<number | null>(null);
  const [priceRowType, setPriceRowType] = useState<string>('ADT');
  const [priceRowValue, setPriceRowValue] = useState('');
  const [priceRowCurrency, setPriceRowCurrency] = useState('IDR');
  const [savingPrice, setSavingPrice] = useState(false);

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
      setAvailableSeats('');
      setNewPassengerType('ADT');
      setPrice('');
      setCurrency('IDR');
      setEditingSeatsId(null);
      setPriceRowFareId(null);
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
        available_seats: Number(availableSeats),
        prices: [{ passenger_type: newPassengerType, price, currency }],
      });
      showSuccessAlert('Fare added -- add CHD/INF prices below if this fare should sell to them too');
      setFareClassId('');
      setAvailableSeats('');
      setPrice('');
      load();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to add fare');
    } finally {
      setAdding(false);
    }
  };

  const startEditSeats = (fare: FlightFare) => {
    setEditingSeatsId(fare.id);
    setEditSeats(String(fare.available_seats));
  };

  const saveSeats = async () => {
    if (editingSeatsId === null) return;
    setSavingSeats(true);
    try {
      await flightsApi.updateFare(editingSeatsId, { available_seats: Number(editSeats) });
      showSuccessAlert('Seat inventory updated');
      setEditingSeatsId(null);
      load();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to update seat inventory');
    } finally {
      setSavingSeats(false);
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

  const startAddPrice = (fare: FlightFare) => {
    setPriceRowFareId(fare.id);
    // Default to the first passenger type this fare doesn't have priced yet.
    const missing = PASSENGER_TYPES.find((pt) => !fare.prices.some((p) => p.passenger_type === pt));
    setPriceRowType(missing ?? 'ADT');
    setPriceRowValue('');
    setPriceRowCurrency('IDR');
  };

  const startEditPrice = (fare: FlightFare, p: FlightFarePrice) => {
    setPriceRowFareId(fare.id);
    setPriceRowType(p.passenger_type);
    setPriceRowValue(p.price);
    setPriceRowCurrency(p.currency);
  };

  const saveFarePrice = async () => {
    if (priceRowFareId === null || !priceRowValue) return;
    setSavingPrice(true);
    try {
      await flightsApi.setFarePrice(priceRowFareId, {
        passenger_type: priceRowType,
        price: priceRowValue,
        currency: priceRowCurrency,
      });
      showSuccessAlert('Price saved');
      setPriceRowFareId(null);
      load();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to save price');
    } finally {
      setSavingPrice(false);
    }
  };

  const handleDeletePrice = async (p: FlightFarePrice) => {
    const ok = await showConfirmAlert(
      `Remove ${PASSENGER_TYPE_LABELS[p.passenger_type as keyof typeof PASSENGER_TYPE_LABELS] ?? p.passenger_type} price?`,
      'That passenger type will no longer be bookable on this fare.',
    );
    if (!ok) return;
    try {
      await flightsApi.deleteFarePrice(p.id);
      showSuccessAlert('Price removed');
      load();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to remove price');
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
                    <div className="space-y-3">
                      {fares.map((fare) => {
                        const fc = fareClassById.get(fare.fare_class_id);
                        const isEditingSeats = editingSeatsId === fare.id;
                        const pricedTypes = new Set(fare.prices.map((p) => p.passenger_type));
                        const missingTypes = PASSENGER_TYPES.filter((pt) => !pricedTypes.has(pt));
                        return (
                          <div key={fare.id} className="bg-slate-50/70 rounded px-4 py-3 space-y-2.5">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-800 text-sm">
                                  {fc ? `${fc.code} — ${fc.name}` : `Fare class #${fare.fare_class_id}`}
                                </div>
                                {isEditingSeats ? (
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <input
                                      type="number" value={editSeats}
                                      onChange={(e) => setEditSeats(e.target.value)}
                                      className="w-20 bg-white border border-slate-200 rounded py-1.5 px-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                                    />
                                    <span className="text-xs text-slate-400">seats</span>
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-500 mt-0.5">{fare.available_seats} seats</div>
                                )}
                              </div>
                              {isEditingSeats ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button onClick={saveSeats} disabled={savingSeats} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50" title="Save">
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setEditingSeatsId(null)} className="p-2 text-slate-400 hover:bg-white rounded transition-colors" title="Cancel">
                                    <Ban className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button onClick={() => startEditSeats(fare)} className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded transition-colors" title="Edit seat inventory">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(fare)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded transition-colors" title="Remove fare">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Per-passenger-type prices */}
                            <div className="flex flex-wrap gap-1.5 pl-0.5">
                              {fare.prices.map((p) => {
                                const isEditingPrice = priceRowFareId === fare.id && priceRowType === p.passenger_type;
                                return isEditingPrice ? (
                                  <div key={p.id} className="flex items-center gap-1 bg-white border border-primary/30 rounded px-2 py-1">
                                    <span className="text-[10px] font-bold text-slate-500">{p.passenger_type}</span>
                                    <input
                                      type="number" step="0.01" autoFocus value={priceRowValue}
                                      onChange={(e) => setPriceRowValue(e.target.value)}
                                      className="w-20 text-xs outline-none"
                                    />
                                    <input
                                      value={priceRowCurrency}
                                      onChange={(e) => setPriceRowCurrency(e.target.value.toUpperCase())}
                                      maxLength={3}
                                      className="w-10 text-xs text-center uppercase outline-none"
                                    />
                                    <button onClick={saveFarePrice} disabled={savingPrice} className="text-emerald-600 disabled:opacity-50"><Check className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setPriceRowFareId(null)} className="text-slate-400"><Ban className="w-3.5 h-3.5" /></button>
                                  </div>
                                ) : (
                                  <button
                                    key={p.id}
                                    onClick={() => startEditPrice(fare, p)}
                                    className="group flex items-center gap-1.5 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs hover:border-primary/50"
                                    title="Click to edit"
                                  >
                                    <span className="font-bold text-slate-500">{p.passenger_type}</span>
                                    <span className="text-slate-700">{p.currency} {Number(p.price).toLocaleString()}</span>
                                    <Trash2
                                      className="w-3 h-3 text-slate-300 group-hover:text-red-500"
                                      onClick={(e) => { e.stopPropagation(); handleDeletePrice(p); }}
                                    />
                                  </button>
                                );
                              })}

                              {/* Add a missing passenger-type price */}
                              {priceRowFareId === fare.id && !pricedTypes.has(priceRowType) ? (
                                <div className="flex items-center gap-1 bg-white border border-primary/30 rounded px-2 py-1">
                                  <select
                                    value={priceRowType}
                                    onChange={(e) => setPriceRowType(e.target.value)}
                                    className="text-[10px] font-bold text-slate-500 outline-none"
                                  >
                                    {missingTypes.map((pt) => (
                                      <option key={pt} value={pt}>{pt}</option>
                                    ))}
                                  </select>
                                  <input
                                    type="number" step="0.01" autoFocus placeholder="Price" value={priceRowValue}
                                    onChange={(e) => setPriceRowValue(e.target.value)}
                                    className="w-20 text-xs outline-none"
                                  />
                                  <input
                                    value={priceRowCurrency}
                                    onChange={(e) => setPriceRowCurrency(e.target.value.toUpperCase())}
                                    maxLength={3}
                                    className="w-10 text-xs text-center uppercase outline-none"
                                  />
                                  <button onClick={saveFarePrice} disabled={savingPrice || !priceRowValue} className="text-emerald-600 disabled:opacity-50"><Check className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => setPriceRowFareId(null)} className="text-slate-400"><Ban className="w-3.5 h-3.5" /></button>
                                </div>
                              ) : missingTypes.length > 0 ? (
                                <button
                                  onClick={() => startAddPrice(fare)}
                                  className="flex items-center gap-1 border border-dashed border-slate-300 rounded px-2.5 py-1 text-xs text-slate-400 hover:text-primary hover:border-primary/50"
                                >
                                  <Plus className="w-3 h-3" /> Add price
                                </button>
                              ) : null}
                            </div>
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
                      <>
                        <p className="text-xs text-slate-400">
                          Needs at least one passenger-type price to create -- add CHD/INF afterwards from the fare's price chips above.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                          <select
                            value={fareClassId}
                            onChange={(e) => setFareClassId(e.target.value)}
                            className="col-span-2 bg-slate-50 border-none rounded py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                          >
                            <option value="">Fare class</option>
                            {availableFareClasses.map((fc) => (
                              <option key={fc.id} value={fc.id}>{fc.code} — {fc.name}</option>
                            ))}
                          </select>
                          <select
                            value={newPassengerType}
                            onChange={(e) => setNewPassengerType(e.target.value)}
                            className="bg-slate-50 border-none rounded py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                          >
                            {PASSENGER_TYPES.map((pt) => (
                              <option key={pt} value={pt}>{pt}</option>
                            ))}
                          </select>
                          <input
                            type="number" step="0.01" placeholder="Price" value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="bg-slate-50 border-none rounded py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                          />
                          <input
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                            maxLength={3}
                            className="bg-slate-50 border-none rounded py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 uppercase text-center"
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
                      </>
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
