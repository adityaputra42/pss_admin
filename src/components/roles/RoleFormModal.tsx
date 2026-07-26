import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Shield, Layers } from 'lucide-react';

import type { Role } from '../../types/rbac';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Max 50 characters'),
  description: z.string().optional(),
  level: z.number().int().positive('Level must be greater than 0'),
  is_active: z.boolean(),
});

type FormInputs = z.infer<typeof schema>;

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSave: (
    data: { name?: string; description?: string; level?: number; is_active?: boolean },
    id: number | null,
  ) => Promise<void> | void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({ isOpen, onClose, role, onSave }) => {
  const isSystemRole = !!role?.is_system_role;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', level: 10, is_active: true },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: role?.name ?? '',
      description: role?.description ?? '',
      level: role?.level ?? 10,
      is_active: role ? role.is_active : true,
    });
  }, [isOpen, role, reset]);

  const onSubmit = async (data: FormInputs) => {
    if (role) {
      const payload = isSystemRole
        ? { description: data.description }
        : { description: data.description, level: data.level, is_active: data.is_active };
      await onSave(payload, role.id);
    } else {
      await onSave({ name: data.name, description: data.description, level: data.level }, null);
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
              <Dialog.Panel className="w-full max-w-md rounded-md bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <Dialog.Title className="text-xl font-bold text-slate-900">{role ? 'Edit Role' : 'New Role'}</Dialog.Title>
                    <p className="text-xs text-slate-500 font-medium">
                      {isSystemRole ? 'System role — only the description can be changed.' : 'Custom role.'}
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Name</label>
                    <div className="relative">
                      <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('name')}
                        disabled={!!role}
                        placeholder="ops_supervisor"
                        className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-semibold disabled:opacity-50"
                      />
                    </div>
                    {role && <p className="text-[10px] text-slate-400 ml-1">Name can't be changed after creation.</p>}
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

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Level</label>
                    <div className="relative">
                      <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        {...register('level', { valueAsNumber: true })}
                        disabled={isSystemRole}
                        placeholder="10"
                        className="w-full bg-slate-50 border-none rounded py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-bold disabled:opacity-50"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 ml-1">Higher level = more seniority. Purely informational -- actual access comes from assigned permissions.</p>
                    {errors.level && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.level.message}</p>}
                  </div>

                  {role && (
                    <label className={`flex items-center gap-3 bg-slate-50 rounded py-3 px-4 ${isSystemRole ? 'opacity-50' : 'cursor-pointer'}`}>
                      <input type="checkbox" disabled={isSystemRole} {...register('is_active')} className="w-4 h-4 rounded accent-primary" />
                      <span className="text-sm font-medium text-slate-700">Active</span>
                    </label>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                      {isSubmitting ? 'Saving...' : role ? 'Save Changes' : 'Create Role'}
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

export default RoleFormModal;
