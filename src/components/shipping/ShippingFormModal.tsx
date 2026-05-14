import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User as Mail } from 'lucide-react';

import type { ShippingMethod } from '../../types/api';

/* =======================
   Schema & Types
======================= */

const shippingSchema = z.object({
  name: z.string().min(1, 'name is required'),
  price: z.number().positive('Price must be positive'),
  state: z.enum(['active', 'inactive']),
});

type ShippingFormInputs = z.infer<typeof shippingSchema>;

interface ShippingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipping: ShippingMethod | null;
  onSave: (data: ShippingFormInputs, shippingId: number | null) => Promise<void> | void;
}

/* =======================
   Component
======================= */

const ShippingFormModal: React.FC<ShippingFormModalProps> = ({
  isOpen,
  onClose,
  shipping,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    unregister,
  } = useForm<ShippingFormInputs>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: '',
      price: 0,
      state: 'active',
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (shipping) {
      const safeState = shipping?.state === 'active' ? 'active' : 'inactive';

      reset({
        name: shipping.name,
        price: shipping.price,
        state: safeState,
      });
    } else {
      reset({
        name: '',
        price: 0,
        state: 'inactive',
      });
    }
  }, [isOpen, shipping, reset, unregister]);

  const onSubmit = async (data: ShippingFormInputs) => {
    await onSave(data, shipping ? shipping.id : null);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-95">
              <DialogPanel className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-900">
                      {shipping ? 'Update Shipping' : 'Add New Shipping'}
                    </DialogTitle>
                    <p className="text-xs text-slate-500 font-medium">
                      Configure shipping method details.
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Name
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('name')}
                        className="w-full bg-slate-50 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-rose-500 text-[10px] font-bold ml-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Price (IDR)
                    </label>
                    <input
                      type="number"
                      {...register('price', { valueAsNumber: true })}
                      className="w-full bg-slate-50 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-teal-500/20 outline-none"
                    />
                    {errors.price && (
                      <p className="text-rose-500 text-[10px] font-bold ml-1">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      State
                    </label>

                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <div className="flex gap-3">
                          {(['active', 'inactive'] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => field.onChange(status)}
                              className={`
                                flex-1 rounded-xl px-4 py-3 text-sm font-bold transition border
                                ${
                                  field.value === status
                                    ? status === 'active'
                                      ? 'bg-emerald-500 text-white border-emerald-500 shadow'
                                      : 'bg-rose-500 text-white border-rose-500 shadow'
                                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                }
                              `}
                            >
                              {status === 'active' ? 'Active' : 'Inactive'}
                            </button>
                          ))}
                        </div>
                      )}
                    />

                    {errors.state && (
                      <p className="text-rose-500 text-[10px] font-bold ml-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-secondary shadow disabled:opacity-50"
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : shipping
                        ? 'Save Changes'
                        : 'Create Shipping'}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ShippingFormModal;
