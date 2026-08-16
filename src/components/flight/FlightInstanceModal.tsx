import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';

import type { Flight, FlightSchedule, Aircraft } from '../../types/api';
import { FLIGHT_STATUSES } from '../../types/api';

const schema = z
  .object({
    schedule_id: z.coerce.number({ error: 'Schedule is required' }).min(1, 'Schedule is required'),
    aircraft_id: z.coerce.number({ error: 'Aircraft is required' }).min(1, 'Aircraft is required'),
    departure_time: z.string().min(1, 'Departure time is required'),
    arrival_time: z.string().min(1, 'Arrival time is required'),
    status: z.string().min(1, 'Status is required'),
  })
  .refine((data) => new Date(data.arrival_time) > new Date(data.departure_time), {
    message: 'Arrival must be after departure',
    path: ['arrival_time'],
  });

type FormInputs = z.infer<typeof schema>;

interface FlightInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight | null;
  schedules: FlightSchedule[];
  aircrafts: Aircraft[];
  onSave: (
    data: { schedule_id: number; aircraft_id: number; departure_time: string; arrival_time: string; status: string },
    id: number | null,
  ) => Promise<void> | void;
}

/**
 * Datetime-local inputs have no timezone -- browser treats the typed
 * value as local wall-clock time. `new Date(str).toISOString()` turns
 * that into a UTC "...Z" string, which IS valid RFC3339 (what the
 * backend's UpdateFlight/CreateFlight expect for departure_time/
 * arrival_time). Converting back for editing does the reverse: parse
 * the stored RFC3339 value and format it into the "YYYY-MM-DDTHH:mm"
 * shape <input type="datetime-local"> wants, in the browser's local tz.
 */
function toDatetimeLocal(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toRFC3339(local: string): string {
  return new Date(local).toISOString();
}

/**
 * Manual create/edit for ONE flights row -- schedule_id is locked once
 * editing (backend's UpdateFlight deliberately doesn't accept it, see
 * FlightUpdateInput's Omit in types/api.ts). This does NOT create
 * flight_seats/flight_fares -- use "Generate Flights" on the Flight
 * Schedules page for a new sellable flight; use this to fix up or
 * remove a bad instance.
 */
const FlightInstanceModal: React.FC<FlightInstanceModalProps> = ({
  isOpen,
  onClose,
  flight,
  schedules,
  aircrafts,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
   
    resolver: zodResolver(schema) as Resolver<FormInputs>,
    defaultValues: {
      schedule_id: 0,
      aircraft_id: 0,
      departure_time: '',
      arrival_time: '',
      status: 'SCHEDULED',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      schedule_id: flight?.schedule_id ?? 0,
      aircraft_id: flight?.aircraft_id ?? 0,
      departure_time: toDatetimeLocal(flight?.departure_time),
      arrival_time: toDatetimeLocal(flight?.arrival_time),
      status: flight?.status ?? 'SCHEDULED',
    });
  }, [isOpen, flight, reset]);

  const onSubmit = async (data: FormInputs) => {
    await onSave(
      {
        schedule_id: data.schedule_id,
        aircraft_id: data.aircraft_id,
        departure_time: toRFC3339(data.departure_time),
        arrival_time: toRFC3339(data.arrival_time),
        status: data.status,
      },
      flight ? flight.id : null,
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-md bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-slate-900">
                      {flight ? 'Edit Flight Instance' : 'New Flight Instance'}
                    </Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">
                      Manual single instance -- no seats/fares are created here.
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Schedule</label>
                    <select
                      {...register('schedule_id')}
                      disabled={!!flight}
                      className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium disabled:opacity-50"
                    >
                      <option value={0}>Select schedule</option>
                      {schedules.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.flight_number} (#{s.id})
                        </option>
                      ))}
                    </select>
                    {flight && <p className="text-[10px] text-slate-400 ml-1">Schedule can't be changed after creation.</p>}
                    {errors.schedule_id && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.schedule_id.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Aircraft</label>
                    <select
                      {...register('aircraft_id')}
                      className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                    >
                      <option value={0}>Select aircraft</option>
                      {aircrafts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.registration_number} — {a.manufacturer} {a.model}
                        </option>
                      ))}
                    </select>
                    {errors.aircraft_id && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.aircraft_id.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Departure</label>
                      <input
                        type="datetime-local"
                        {...register('departure_time')}
                        className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                      />
                      {errors.departure_time && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.departure_time.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Arrival</label>
                      <input
                        type="datetime-local"
                        {...register('arrival_time')}
                        className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                      />
                      {errors.arrival_time && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.arrival_time.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                        >
                          {FLIGHT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                      {isSubmitting ? 'Saving...' : flight ? 'Save Changes' : 'Create Flight'}
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

export default FlightInstanceModal;
