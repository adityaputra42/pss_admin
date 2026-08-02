import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plane, MapPin, Clock } from 'lucide-react';

import type { Airport, FlightSchedule } from '../../types/api';

/**
 * Bitmask bit order, matches command.OperatingMonday..OperatingSunday
 * exactly (internal/flight/application/command/flight_schedule.go):
 * MON=1, TUE=2, WED=4, THU=8, FRI=16, SAT=32, SUN=64. Don't reorder this
 * array -- its index is the bit shift.
 */
const WEEKDAYS = [
  { label: 'MON', bit: 1 << 0 },
  { label: 'TUE', bit: 1 << 1 },
  { label: 'WED', bit: 1 << 2 },
  { label: 'THU', bit: 1 << 3 },
  { label: 'FRI', bit: 1 << 4 },
  { label: 'SAT', bit: 1 << 5 },
  { label: 'SUN', bit: 1 << 6 },
] as const;

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const schema = z
  .object({
    flight_number: z.string().min(1, 'Flight number is required').max(20, 'Max 20 characters'),
    departure_airport_id: z.coerce.number({ required_error: 'Departure airport is required' }).min(1, 'Departure airport is required'),
    arrival_airport_id: z.coerce.number({ required_error: 'Arrival airport is required' }).min(1, 'Arrival airport is required'),
    departure_time: z.string().regex(timeRegex, 'Use HH:MM (24h)'),
    arrival_time: z.string().regex(timeRegex, 'Use HH:MM (24h)'),
    operating_days: z.number().min(1, 'Select at least one operating day'),
  })
  .refine((data) => data.departure_airport_id !== data.arrival_airport_id, {
    message: 'Departure and arrival airport must be different',
    path: ['arrival_airport_id'],
  });

type FormInputs = z.infer<typeof schema>;

interface FlightScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: FlightSchedule | null;
  airports: Airport[];
  onSave: (
    data: {
      flight_number?: string;
      departure_airport_id?: number;
      arrival_airport_id?: number;
      departure_time: string;
      arrival_time: string;
      operating_days: number;
    },
    id: number | null,
  ) => Promise<void> | void;
}

/**
 * flight_number and both airport ids are only sent on create -- PUT
 * /flights/schedules/{id} only accepts departure_time/arrival_time/
 * operating_days (see flightSchedulesApi.updateSchedule's comment).
 * Create a new schedule instead if the route itself is wrong.
 */
const FlightScheduleFormModal: React.FC<FlightScheduleFormModalProps> = ({
  isOpen,
  onClose,
  schedule,
  airports,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      flight_number: '',
      departure_airport_id: 0,
      arrival_airport_id: 0,
      departure_time: '',
      arrival_time: '',
      operating_days: 0,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      flight_number: schedule?.flight_number ?? '',
      departure_airport_id: schedule?.departure_airport_id ?? 0,
      arrival_airport_id: schedule?.arrival_airport_id ?? 0,
      departure_time: schedule?.departure_time ?? '',
      arrival_time: schedule?.arrival_time ?? '',
      operating_days: schedule?.operating_days ?? 0,
    });
  }, [isOpen, schedule, reset]);

  const onSubmit = async (data: FormInputs) => {
    const payload = schedule
      ? {
          departure_time: data.departure_time,
          arrival_time: data.arrival_time,
          operating_days: data.operating_days,
        }
      : {
          flight_number: data.flight_number,
          departure_airport_id: data.departure_airport_id,
          arrival_airport_id: data.arrival_airport_id,
          departure_time: data.departure_time,
          arrival_time: data.arrival_time,
          operating_days: data.operating_days,
        };
    await onSave(payload, schedule ? schedule.id : null);
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
                      {schedule ? 'Edit Flight Schedule' : 'New Flight Schedule'}
                    </Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">
                      A recurring route -- individual flight instances are generated from this later.
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Flight Number</label>
                    <div className="relative">
                      <Plane className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('flight_number')}
                        disabled={!!schedule}
                        placeholder="QG123"
                        className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-semibold uppercase disabled:opacity-50"
                      />
                    </div>
                    {schedule && <p className="text-[10px] text-slate-400 ml-1">Flight number can't be changed after creation.</p>}
                    {errors.flight_number && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.flight_number.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Departure Airport</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                        <select
                          {...register('departure_airport_id')}
                          disabled={!!schedule}
                          className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium disabled:opacity-50"
                        >
                          <option value={0}>Select</option>
                          {airports.map((a) => (
                            <option key={a.id} value={a.id}>{a.code} — {a.city}</option>
                          ))}
                        </select>
                      </div>
                      {errors.departure_airport_id && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.departure_airport_id.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Arrival Airport</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                        <select
                          {...register('arrival_airport_id')}
                          disabled={!!schedule}
                          className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium disabled:opacity-50"
                        >
                          <option value={0}>Select</option>
                          {airports.map((a) => (
                            <option key={a.id} value={a.id}>{a.code} — {a.city}</option>
                          ))}
                        </select>
                      </div>
                      {errors.arrival_airport_id && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.arrival_airport_id.message}</p>}
                    </div>
                  </div>
                  {schedule && <p className="text-[10px] text-slate-400 -mt-3 ml-1">Route can't be changed after creation -- create a new schedule instead.</p>}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Departure Time</label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          {...register('departure_time')}
                          placeholder="09:00"
                          className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                        />
                      </div>
                      {errors.departure_time && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.departure_time.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Arrival Time</label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          {...register('arrival_time')}
                          placeholder="11:30"
                          className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                        />
                      </div>
                      {errors.arrival_time && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.arrival_time.message}</p>}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 -mt-3 ml-1">
                    Local time-of-day only (HH:MM, 24h) -- no date or timezone, this is a recurring schedule.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Operating Days</label>
                    <Controller
                      control={control}
                      name="operating_days"
                      render={({ field }) => (
                        <div className="flex flex-wrap gap-2">
                          {WEEKDAYS.map((day) => {
                            const active = (field.value & day.bit) !== 0;
                            return (
                              <button
                                key={day.label}
                                type="button"
                                onClick={() => field.onChange(active ? field.value & ~day.bit : field.value | day.bit)}
                                className={`w-14 py-2.5 rounded text-xs font-bold uppercase tracking-wide transition-all ${
                                  active ? 'bg-primary text-white shadow' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                    {errors.operating_days && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.operating_days.message}</p>}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                      {isSubmitting ? 'Saving...' : schedule ? 'Save Changes' : 'Create Schedule'}
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

export default FlightScheduleFormModal;
