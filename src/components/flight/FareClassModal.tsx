import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Ticket } from 'lucide-react';

import type { FareClass, SeatClass } from '../../types/api';

const schema = z.object({
  code: z.string().min(1, 'Code is required').max(30, 'Max 30 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  seat_class_id: z.coerce.number({ error: 'Seat class is required' }).min(1, 'Seat class is required'),
  refundable: z.boolean(),
  rescheduleable: z.boolean(),
  baggage_kg: z.coerce.number().min(0, 'Must be 0 or more'),
});

type FormInputs = z.infer<typeof schema>;

interface FareClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  fareClass: FareClass | null;
  seatClasses: SeatClass[];
  onSave: (
    data: {
      code?: string;
      seat_class_id?: number;
      name: string;
      refundable: boolean;
      rescheduleable: boolean;
      baggage_kg: number;
    },
    id: number | null,
  ) => Promise<void> | void;
}

/**
 * code and seat_class_id are only sent on create -- PUT
 * /flights/fare-classes/{id} (updateFareClassRequest server-side) only
 * accepts name/refundable/rescheduleable/baggage_kg. Create a new fare
 * class instead of trying to "move" one to a different seat class.
 */
const FareClassModal: React.FC<FareClassModalProps> = ({ isOpen, onClose, fareClass, seatClasses, onSave }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
    resolver: zodResolver(schema) as Resolver<FormInputs>,
    defaultValues: {
      code: '',
      name: '',
      seat_class_id: 0,
      refundable: false,
      rescheduleable: false,
      baggage_kg: 20,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      code: fareClass?.code ?? '',
      name: fareClass?.name ?? '',
      seat_class_id: fareClass?.seat_class_id ?? 0,
      refundable: fareClass?.refundable ?? false,
      rescheduleable: fareClass?.rescheduleable ?? false,
      baggage_kg: fareClass?.baggage_kg ?? 20,
    });
  }, [isOpen, fareClass, reset]);

  const onSubmit = async (data: FormInputs) => {
    const payload = fareClass
      ? {
          name: data.name,
          refundable: data.refundable,
          rescheduleable: data.rescheduleable,
          baggage_kg: data.baggage_kg,
        }
      : {
          code: data.code,
          name: data.name,
          seat_class_id: data.seat_class_id,
          refundable: data.refundable,
          rescheduleable: data.rescheduleable,
          baggage_kg: data.baggage_kg,
        };
    await onSave(payload, fareClass ? fareClass.id : null);
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
                      {fareClass ? 'Edit Fare Class' : 'New Fare Class'}
                    </Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">
                      e.g. Economy Saver, Economy Flex, Business.
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Code</label>
                      <div className="relative">
                        <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          {...register('code')}
                          disabled={!!fareClass}
                          placeholder="ECOSAVER"
                          className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-semibold uppercase disabled:opacity-50"
                        />
                      </div>
                      {errors.code && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.code.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Seat Class</label>
                      <select
                        {...register('seat_class_id')}
                        disabled={!!fareClass}
                        className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium disabled:opacity-50"
                      >
                        <option value={0}>Select</option>
                        {seatClasses.map((sc) => (
                          <option key={sc.id} value={sc.id}>{sc.name}</option>
                        ))}
                      </select>
                      {errors.seat_class_id && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.seat_class_id.message}</p>}
                    </div>
                  </div>
                  {fareClass && (
                    <p className="text-[10px] text-slate-400 -mt-3 ml-1">Code and seat class can't be changed after creation.</p>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Name</label>
                    <input
                      {...register('name')}
                      placeholder="Economy Saver"
                      className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                    />
                    {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Baggage Allowance (kg)</label>
                    <input
                      type="number"
                      min={0}
                      {...register('baggage_kg')}
                      className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                    />
                    {errors.baggage_kg && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.baggage_kg.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      control={control}
                      name="refundable"
                      render={({ field }) => (
                        <label className="flex items-center gap-2.5 bg-slate-50 rounded py-3 px-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="w-4 h-4 rounded accent-primary"
                          />
                          <span className="text-sm font-medium text-slate-700">Refundable</span>
                        </label>
                      )}
                    />

                    <Controller
                      control={control}
                      name="rescheduleable"
                      render={({ field }) => (
                        <label className="flex items-center gap-2.5 bg-slate-50 rounded py-3 px-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="w-4 h-4 rounded accent-primary"
                          />
                          <span className="text-sm font-medium text-slate-700">Rescheduleable</span>
                        </label>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                      {isSubmitting ? 'Saving...' : fareClass ? 'Save Changes' : 'Create Fare Class'}
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

export default FareClassModal;
