import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plane, Building2, Hash } from 'lucide-react';

import type { Aircraft } from '../../types/api';

const schema = z.object({
  manufacturer: z.string().min(1, 'Manufacturer is required').max(100, 'Max 100 characters'),
  model: z.string().min(1, 'Model is required').max(100, 'Max 100 characters'),
  registration_number: z.string().min(1, 'Registration number is required').max(20, 'Max 20 characters'),
});

type FormInputs = z.infer<typeof schema>;

interface AircraftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  aircraft: Aircraft | null;
  onSave: (
    data: { manufacturer: string; model: string; registration_number?: string },
    id: number | null,
  ) => Promise<void> | void;
}


const AircraftFormModal: React.FC<AircraftFormModalProps> = ({ isOpen, onClose, aircraft, onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: { manufacturer: '', model: '', registration_number: '' },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      manufacturer: aircraft?.manufacturer ?? '',
      model: aircraft?.model ?? '',
      registration_number: aircraft?.registration_number ?? '',
    });
  }, [isOpen, aircraft, reset]);

  const onSubmit = async (data: FormInputs) => {
    const payload = aircraft
      ? { manufacturer: data.manufacturer, model: data.model }
      : { manufacturer: data.manufacturer, model: data.model, registration_number: data.registration_number };
    await onSave(payload, aircraft ? aircraft.id : null);
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
              <Dialog.Panel className="w-full max-w-md rounded-md bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-slate-900">
                      {aircraft ? 'Edit Aircraft' : 'New Aircraft'}
                    </Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">Fleet master data.</p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Registration Number</label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('registration_number')}
                        disabled={!!aircraft}
                        placeholder="PK-GFA"
                        className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-semibold uppercase disabled:opacity-50"
                      />
                    </div>
                    {aircraft && <p className="text-[10px] text-slate-400 ml-1">Registration number can't be changed after creation.</p>}
                    {errors.registration_number && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.registration_number.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Manufacturer</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('manufacturer')}
                        placeholder="Airbus"
                        className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                      />
                    </div>
                    {errors.manufacturer && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.manufacturer.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Model</label>
                    <div className="relative">
                      <Plane className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('model')}
                        placeholder="A320-200"
                        className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                      />
                    </div>
                    {errors.model && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.model.message}</p>}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                      {isSubmitting ? 'Saving...' : aircraft ? 'Save Changes' : 'Create Aircraft'}
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

export default AircraftFormModal;
