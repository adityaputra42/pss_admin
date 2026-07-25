import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Tag, Layers } from 'lucide-react';

import type { AncillaryCategory, CatalogItem } from '../../types/api';

const schema = z.object({
  category_id: z.number().positive('Category is required'),
  code: z.string().min(1, 'Code is required').max(50, 'Max 50 characters'),
  name: z.string().min(1, 'Name is required').max(150, 'Max 150 characters'),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type FormInputs = z.infer<typeof schema>;

interface AncillaryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  categories: AncillaryCategory[];
  onSave: (
    data: {
      category_id: number;
      code?: string;
      name: string;
      description?: string;
      is_active: boolean;
    },
    id: number | null,
  ) => Promise<void> | void;
}

/** ⚠️ code is only sent on create -- same immutable-identifier
 * convention as AncillaryCategoryModal (PUT /ancillaries/{id} doesn't
 * accept code). */
const AncillaryItemModal: React.FC<AncillaryItemModalProps> = ({
  isOpen,
  onClose,
  item,
  categories,
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: { category_id: undefined, code: '', name: '', description: '', is_active: true },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      category_id: item?.CategoryID ?? categories[0]?.id ?? undefined,
      code: item?.Code ?? '',
      name: item?.Name ?? '',
      description: item?.Description ?? '',
      is_active: item ? item.IsActive : true,
    });
  }, [isOpen, item, categories, reset]);

  const onSubmit = async (data: FormInputs) => {
    const payload = item
      ? { category_id: data.category_id, name: data.name, description: data.description, is_active: data.is_active }
      : { category_id: data.category_id, code: data.code, name: data.name, description: data.description, is_active: data.is_active };
    await onSave(payload, item ? item.ID : null);
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
                      {item ? 'Edit Ancillary' : 'New Ancillary'}
                    </Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">A sellable catalog item, e.g. Extra Baggage 20kg.</p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <div className="relative">
                      <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select
                        {...register('category_id', { valueAsNumber: true })}
                        className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium appearance-none"
                      >
                        {categories.length === 0 && <option value="">No categories yet</option>}
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.category_id && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.category_id.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Code</label>
                    <div className="relative">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('code')}
                        disabled={!!item}
                        placeholder="BAG-20KG"
                        className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-semibold uppercase disabled:opacity-50"
                      />
                    </div>
                    {item && <p className="text-[10px] text-slate-400 ml-1">Code can't be changed after creation.</p>}
                    {errors.code && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.code.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Name</label>
                    <input
                      {...register('name')}
                      placeholder="Extra Baggage 20kg"
                      className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium"
                    />
                    {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      {...register('description')}
                      rows={2}
                      placeholder="Optional"
                      className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 bg-slate-50 rounded py-3 px-4 cursor-pointer">
                    <input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded accent-primary" />
                    <span className="text-sm font-medium text-slate-700">Active (purchasable by customers)</span>
                  </label>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                      {isSubmitting ? 'Saving...' : item ? 'Save Changes' : 'Create Ancillary'}
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

export default AncillaryItemModal;
