import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { X, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';

import type { FlightSchedule, Aircraft, FareClass, Airport } from '../../types/api';
import { PASSENGER_TYPES } from '../../types/api';
import { flightsApi } from '../../services/api-services/flight';
import { showErrorAlert, showSuccessAlert } from '../../utils/alerts';

interface GenerateFlightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: FlightSchedule[];
  aircrafts: Aircraft[];
  fareClasses: FareClass[];
  airportById: Map<number, Airport>;
  initialScheduleId?: number | null;
  onGenerated?: () => void;
}

interface SegmentRow {
  start_date: string;
  end_date: string;
  aircraft_id: string;
}

interface FareRow {
  fare_class_id: string;
  passenger_type: string;
  price: string;
  currency: string;
}

const emptySegment: SegmentRow = { start_date: '', end_date: '', aircraft_id: '' };
// One row is one (fare_class, passenger_type) price -- the backend's
// `fares` array is flat now, not nested. To sell a fare class to
// ADT+CHD+INF, add three rows sharing the same fare class.
const emptyFare: FareRow = { fare_class_id: '', passenger_type: 'ADT', price: '', currency: 'IDR' };


const GenerateFlightsModal: React.FC<GenerateFlightsModalProps> = ({
  isOpen, onClose, schedules, aircrafts, fareClasses, airportById, initialScheduleId, onGenerated,
}) => {
  const [scheduleId, setScheduleId] = useState('');
  const [segments, setSegments] = useState<SegmentRow[]>([{ ...emptySegment }]);
  const [fares, setFares] = useState<FareRow[]>([{ ...emptyFare }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setScheduleId(initialScheduleId ? String(initialScheduleId) : '');
    setSegments([{ ...emptySegment }]);
    setFares([{ ...emptyFare }]);
  }, [isOpen, initialScheduleId]);

  const selectedSchedule = schedules.find((s) => s.id === Number(scheduleId));

  const updateSegment = (i: number, patch: Partial<SegmentRow>) => {
    setSegments((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };
  const updateFare = (i: number, patch: Partial<FareRow>) => {
    setFares((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  };

  // Duplicate (fare_class_id, passenger_type) pairs would just have the
  // second row silently win server-side -- catch it client-side instead.
  const hasDuplicateFareRow = fares.some(
    (f, i) =>
      f.fare_class_id &&
      fares.findIndex((o) => o.fare_class_id === f.fare_class_id && o.passenger_type === f.passenger_type) !== i,
  );

  const isValid =
    !!scheduleId &&
    segments.every((s) => s.start_date && s.end_date && s.aircraft_id) &&
    fares.every((f) => f.fare_class_id && f.passenger_type && f.price && f.currency.length === 3) &&
    !hasDuplicateFareRow;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      await flightsApi.generateFlightsData(Number(scheduleId), {
        segments: segments.map((s) => ({
          start_date: s.start_date,
          end_date: s.end_date,
          aircraft_id: Number(s.aircraft_id),
        })),
        fares: fares.map((f) => ({
          fare_class_id: Number(f.fare_class_id),
          passenger_type: f.passenger_type,
          price: f.price,
          currency: f.currency.toUpperCase(),
        })),
      });
      showSuccessAlert('Flights generated');
      onGenerated?.();
      onClose();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to generate flights');
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
              <Dialog.Panel className="w-full max-w-2xl rounded-md bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-slate-900">Generate Flights from Schedule</Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">Creates real, bookable flight instances with fares already attached.</p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Schedule</label>
                    <select
                      value={scheduleId}
                      onChange={(e) => setScheduleId(e.target.value)}
                      className="w-full mt-1.5 bg-slate-50 border-none rounded py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="">Select schedule</option>
                      {schedules.map((s) => {
                        const dep = airportById.get(s.departure_airport_id);
                        const arr = airportById.get(s.arrival_airport_id);
                        return (
                          <option key={s.id} value={s.id}>
                            {s.flight_number} · {dep?.code ?? s.departure_airport_id} → {arr?.code ?? s.arrival_airport_id} · {s.departure_time}
                          </option>
                        );
                      })}
                    </select>
                    {selectedSchedule && (
                      <p className="text-xs text-slate-400 mt-1.5 ml-1">
                        Operates: {selectedSchedule.operating_days_labels.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Segments */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Aircraft Segments
                      </label>
                      <button
                        type="button"
                        onClick={() => setSegments((rows) => [...rows, { ...emptySegment }])}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add segment
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      Multiple segments = the aircraft changes partway through the range.
                    </p>
                    <div className="space-y-2">
                      {segments.map((seg, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4 relative">
                            <CalendarIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="date"
                              value={seg.start_date}
                              onChange={(e) => updateSegment(i, { start_date: e.target.value })}
                              className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border-none rounded text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                            />
                          </div>
                          <div className="col-span-4 relative">
                            <CalendarIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="date"
                              value={seg.end_date}
                              min={seg.start_date || undefined}
                              onChange={(e) => updateSegment(i, { end_date: e.target.value })}
                              className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border-none rounded text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                            />
                          </div>
                          <select
                            value={seg.aircraft_id}
                            onChange={(e) => updateSegment(i, { aircraft_id: e.target.value })}
                            className="col-span-3 py-2.5 px-2 bg-slate-50 border-none rounded text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                          >
                            <option value="">Aircraft</option>
                            {aircrafts.map((a) => (
                              <option key={a.id} value={a.id}>{a.registration_number} · {a.model}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setSegments((rows) => rows.filter((_, idx) => idx !== i))}
                            disabled={segments.length === 1}
                            className="col-span-1 p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fares */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Fares
                      </label>
                      <button
                        type="button"
                        onClick={() => setFares((rows) => [...rows, { ...emptyFare }])}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add fare
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      Applied to every flight this generates. One row = one price for one passenger type -- to
                      sell a fare class to ADT, CHD and INF, add three rows with that same fare class.
                    </p>
                    <div className="space-y-2">
                      {fares.map((fare, i) => {
                        const isDuplicate =
                          fare.fare_class_id &&
                          fares.findIndex(
                            (o) => o.fare_class_id === fare.fare_class_id && o.passenger_type === fare.passenger_type,
                          ) !== i;
                        return (
                          <div key={i}>
                            <div className="grid grid-cols-12 gap-2 items-center">
                              <select
                                value={fare.fare_class_id}
                                onChange={(e) => updateFare(i, { fare_class_id: e.target.value })}
                                className="col-span-4 py-2.5 px-2 bg-slate-50 border-none rounded text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                              >
                                <option value="">Fare class</option>
                                {fareClasses.map((fc) => (
                                  <option key={fc.id} value={fc.id}>{fc.code} — {fc.name}</option>
                                ))}
                              </select>
                              <select
                                value={fare.passenger_type}
                                onChange={(e) => updateFare(i, { passenger_type: e.target.value })}
                                className="col-span-2 py-2.5 px-2 bg-slate-50 border-none rounded text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                              >
                                {PASSENGER_TYPES.map((pt) => (
                                  <option key={pt} value={pt}>{pt}</option>
                                ))}
                              </select>
                              <input
                                type="number" step="0.01" placeholder="Price"
                                value={fare.price}
                                onChange={(e) => updateFare(i, { price: e.target.value })}
                                className="col-span-3 py-2.5 px-3 bg-slate-50 border-none rounded text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                              />
                              <input
                                value={fare.currency}
                                onChange={(e) => updateFare(i, { currency: e.target.value.toUpperCase() })}
                                maxLength={3}
                                className="col-span-2 py-2.5 px-2 bg-slate-50 border-none rounded text-sm outline-none focus:ring-2 focus:ring-teal-500/20 uppercase text-center"
                              />
                              <button
                                type="button"
                                onClick={() => setFares((rows) => rows.filter((_, idx) => idx !== i))}
                                disabled={fares.length === 1}
                                className="col-span-1 p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            {isDuplicate && (
                              <p className="text-[11px] text-red-500 mt-1 ml-1">
                                Duplicate: this fare class + passenger type is already set in another row.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={submitting || !isValid} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                      {submitting ? 'Generating...' : 'Generate Flights'}
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

export default GenerateFlightsModal;
