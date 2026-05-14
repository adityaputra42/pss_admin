import { useAuthStore } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi } from '../services/api-services';
import { showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { User as UserIcon, Key, Mail, Shield, Smartphone } from 'lucide-react';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(8, 'Current password must be at least 8 characters'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
  confirm_password: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type PasswordFormInputs = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  
  const { register: profileRegister, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isSubmitting: isProfileSubmitting } } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      username: user?.username || '',
    },
  });

  const { register: passwordRegister, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }, reset: resetPasswordForm } = useForm<PasswordFormInputs>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormInputs) => {
    try {
      const userData = await usersApi.updateProfile(data);
      setUser(userData);
      showSuccessAlert('Profile updated successfully!');
    } catch (error: any) {
      showErrorAlert(error.response?.data?.message || 'Failed to update profile.');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormInputs) => {
    try {
      await usersApi.updateProfilePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      showSuccessAlert('Password updated successfully!');
      resetPasswordForm();
    } catch (error: any) {
      showErrorAlert(error.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your personal information and security preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card Summary */}
        <div className="lg:col-span-1 space-y-6">
            <div className="premium-card p-8 flex flex-col items-center text-center">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4 ring-teal-50 shadow-xl shadow-teal-100 group-hover:scale-105 transition-transform duration-300">
                         <img src={`https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=6366f1&color=fff&size=128`} alt="Profile" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-lg hover:bg-secondary transition-colors">
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-6">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{user?.first_name} {user?.last_name}</h2>
                    <p className="text-sm font-medium text-slate-500">@{user?.username}</p>
                </div>
                <div className="mt-6 w-full pt-6 border-t border-slate-50 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className="px-2 py-0.5 bg-teal-50 text-primary rounded-lg text-xs font-bold uppercase tracking-wider">Administrator</span>
                    </div>
                </div>
            </div>

            <div className="premium-card p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Account Security</h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">Ensure your account is using a strong password for better security.</p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                    <Key className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[11px] text-amber-700 font-medium">Last password change was not recorded. We recommend updating your password every 3 months.</p>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
            {/* Profile Form */}
            <div className="premium-card p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-teal-50 text-primary rounded-xl flex items-center justify-center">
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                </div>
                
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">First Name</label>
                            <input 
                                {...profileRegister('first_name')} 
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 font-medium" 
                            />
                            {profileErrors.first_name && <p className="mt-1 text-xs text-rose-500 font-medium">{profileErrors.first_name.message}</p>}
                        </div>
                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Last Name</label>
                            <input 
                                {...profileRegister('last_name')} 
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 font-medium" 
                            />
                            {profileErrors.last_name && <p className="mt-1 text-xs text-rose-500 font-medium">{profileErrors.last_name.message}</p>}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Email Address</label>
                            <input 
                                type="email" 
                                {...profileRegister('email')} 
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 font-medium" 
                            />
                            {profileErrors.email && <p className="mt-1 text-xs text-rose-500 font-medium">{profileErrors.email.message}</p>}
                        </div>
                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Username</label>
                            <input 
                                {...profileRegister('username')} 
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 font-medium" 
                            />
                            {profileErrors.username && <p className="mt-1 text-xs text-rose-500 font-medium">{profileErrors.username.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isProfileSubmitting}
                        className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50"
                    >
                        {isProfileSubmitting ? 'Saving changes...' : 'Save Profile Changes'}
                    </button>
                </form>
            </div>

            {/* Password Form */}
            <div className="premium-card p-8 border-l-4 border-amber-400 shadow-amber-50">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Change Security Password</h2>
                </div>
                
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Current Password</label>
                        <input 
                            type="password" 
                            {...passwordRegister('current_password')} 
                            className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" 
                        />
                        {passwordErrors.current_password && <p className="mt-1 text-xs text-rose-500 font-medium">{passwordErrors.current_password.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">New Password</label>
                            <input 
                                type="password" 
                                {...passwordRegister('new_password')} 
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" 
                            />
                            {passwordErrors.new_password && <p className="mt-1 text-xs text-rose-500 font-medium">{passwordErrors.new_password.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                {...passwordRegister('confirm_password')} 
                                className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" 
                            />
                            {passwordErrors.confirm_password && <p className="mt-1 text-xs text-rose-500 font-medium">{passwordErrors.confirm_password.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPasswordSubmitting}
                        className="premium-button bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200 disabled:opacity-50"
                    >
                        {isPasswordSubmitting ? 'Updating...' : 'Update Password securely'}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
