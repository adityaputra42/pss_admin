import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, KeySquare } from 'lucide-react';

import type { Permission } from '../../types/rbac';

const schema = z.object({
  module: z.string().min(1, 'Module is required').max(50, 'Max 50 characters'),
  resource: z.string().min(1, 'Resource is required').max(50, 'Max 50 characters'),
  action: z.string().min(1, 'Action is required').max(50, 'Max 50 characters'),
  description: z.string().optional(),
});

type FormInputs = z.infer<typeof schema>;

interface PermissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: Permission | null;
  onSave: (
    data: { module?: string; resource?: string; action?: string; description?: string },
    id: number | null,
  ) => Promise<void> | void;
}

/**
 * module/resource/action are only sent on create -- PUT
 * /permissions/{id} only accepts description. That tuple is exactly
 * what every RequirePermission(module, resource, action) call in every
 * router.go checks against, and what every seed migration's
 * role_permissions INSERT matches on -- changing it after the fact
 * would silently detach this row from whatever route it was meant to
 * gate. Create a new permission instead if the tuple itself is wrong.
 */
const PermissionFormModal: React.FC<PermissionFormModalProps> = ({ isOpen, onClose, permission, onSave }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: { module: '', resource: '', action: '', description: '' },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      module: permission?.module ?? '',
      resource: permission?.resource ?? '',
      action: permission?.action ?? '',
      description: permission?.description ?? '',
    });
  }, [isOpen, permission, reset]);

  const onSubmit = async (data: FormInputs) => {
    const payload = permission
      ? { description: data.description }
      : { module: data.module, resource: data.resource, action: data.action, description: data.description };
    await onSave(payload, permission ? permission.id : null);
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
                      {permission ? 'Edit Permission' : 'New Permission'}
                    </Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">
                      Must exactly match a RequirePermission(module, resource, action) check in the backend.
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Module</label>
                      <input
                        {...register('module')}
                        disabled={!!permission}
                        placeholder="flight"
                        className="w-full bg-slate-50 border-none rounded py-3 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-semibold disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Resource</label>
                      <input
                        {...register('resource')}
                        disabled={!!permission}
                        placeholder="flight"
                        className="w-full bg-slate-50 border-none rounded py-3 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-semibold disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Action</label>
                      <input
                        {...register('action')}
                        disabled={!!permission}
                        placeholder="create"
                        className="w-full bg-slate-50 border-none rounded py-3 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-semibold disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="relative -mt-3">
                    <KeySquare className="w-3.5 h-3.5 text-slate-300 inline mr-1" />
                    <span className="text-[10px] text-slate-400">
                      {permission ? "Tuple can't be changed after creation." : 'e.g. flight / flight / create'}
                    </span>
                  </div>
                  {(errors.module || errors.resource || errors.action) && (
                    <p className="text-rose-500 text-[10px] font-bold -mt-3 ml-1">
                      {errors.module?.message || errors.resource?.message || errors.action?.message}
                    </p>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      {...register('description')}
                      rows={2}
                      placeholder="What this permission gates (optional, but future-you will thank you)"
                      className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                      {isSubmitting ? 'Saving...' : permission ? 'Save Changes' : 'Create Permission'}
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

export default PermissionFormModal;
