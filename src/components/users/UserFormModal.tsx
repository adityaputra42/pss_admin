import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, User as UserIcon, Mail, Shield, Lock } from 'lucide-react';

import type { User } from '../../types/api';
import { useRoles } from '../../hooks/useRoles';

const userSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role_id: z.number().positive('Role is required'),
});

type UserFormInputs = z.infer<typeof userSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (data: UserFormInputs, userId: number | null) => Promise<void> | void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const { roles } = useRoles();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    unregister,
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      password: '',
      role_id: undefined,
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        role_id: user.role?.id,
      });
      unregister('password');
    } else {
      reset({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        role_id: undefined,
      });
    }
  }, [isOpen, user, reset, unregister]);

  const onSubmit = async (data: UserFormInputs) => {
    const payload = user && !data.password ? { ...data, password: undefined } : data;
    await onSave(payload, user ? user.id : null);
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
              <Dialog.Panel className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <Dialog.Title className="text-xl font-bold text-slate-900">
                            {user ? 'Update Staff Member' : 'Add New Staff'}
                        </Dialog.Title>
                        <p className="text-xs text-slate-500 font-medium">Configure administrative access details.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                            <input {...register('first_name')} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium" />
                            {errors.first_name && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.first_name.message}</p>}
                        </div>
                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                            <input {...register('last_name')} className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-medium" />
                            {errors.last_name && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5 focus-within:text-primary transition-colors">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="email" {...register('email')} className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" />
                        </div>
                        {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5 focus-within:text-primary transition-colors">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input {...register('username')} className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-semibold" />
                        </div>
                        {errors.username && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.username.message}</p>}
                    </div>

                    {!user && (
                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="password" {...register('password')} className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" />
                            </div>
                            {errors.password && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.password.message}</p>}
                        </div>
                    )}

                    <div className="space-y-1.5 focus-within:text-primary transition-colors">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assign Security Role</label>
                        <div className="relative">
                            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select {...register('role_id', { valueAsNumber: true })} className="w-full bg-slate-50 border-none rounded-xl py-3 pl-10 pr-8 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all font-bold appearance-none">
                                <option value="">Select a role...</option>
                                {roles?.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                        {errors.role_id && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{errors.role_id.message}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50">
                            {isSubmitting ? 'Saving...' : user ? 'Save Changes' : 'Create Account'}
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

export default UserFormModal;
