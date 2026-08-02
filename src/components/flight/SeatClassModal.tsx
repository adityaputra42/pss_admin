import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Armchair } from 'lucide-react';

import type { SeatClass } from '../../types/api';

const schema = z.object({
  code: z.string().min(1, 'Code is required').max(30, 'Max 30 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
});

type FormInputs = z.infer<typeof schema>;

interface SeatClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  seatClass: SeatClass | null;
  onSave: (data: { code?: string; name: string }, id: number | null) => Promise<void> | void;
}

/**
 * code is only sent on create -- PUT /flights/seat-classes/{id} only
 * accepts name, same "immutable identifier after creation" convention
 * as Aircraft.registration_number / AncillaryCategory.code.
 */
const SeatClassModal: React.FC<SeatClassModalProps> = ({ isOpen, onClose, seatClass, onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', name: '' },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({ code: seatClass?.code ?? '', name: seatClass?.name ?? '' });
  }, [isOpen, seatClass, reset]);

  const onSubmit = async (data: FormInputs) => {
    const payload = seatClass ? { name: data.name } : { code: data.code, name: data.name };
    await onSave(payload, seatClass ? seatClass.id : null);
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
                      {seatClass ? 'Edit Seat Class' : 'New Seat Class'}
                    </Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">
                      e.g. Economy, Premium Economy, Business, First.
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Code</label>
                    <div className="relative">
                      <Armchair className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('code')}
                        disabled={!!seatClass}
                        placeholder="ECONOMY"
                        className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-semibold uppercase disabled:opacity-50"
                      />
                    </div>
                    {seatClass && <p className="text-[10px] text-slate-400 ml-1">Code can't be changed after creation.</p>}
                    {errors.code && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.code.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Name</label>
                    <input
                      {...register('name')}
                      placeholder="Economy"
                      className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                    />
                    {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.name.message}</p>}
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                      {isSubmitting ? 'Saving...' : seatClass ? 'Save Changes' : 'Create Seat Class'}
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

export default SeatClassModal;
