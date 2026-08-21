import { useEffect, useState } from 'react';
import { useAuthStore } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi, walletApi } from '../services/api-services';
import { showSuccessAlert, showErrorAlert } from '../utils/alerts';
import { User as UserIcon, Mail, Shield, Smartphone, ShieldAlert, Wallet, Loader2, Plus, Copy, CheckCircle2 } from 'lucide-react';
import type { TopupResult, WalletTransaction } from '../types/api';

const formatMoney = (amount: string | number, currency = 'IDR') => {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(n)) return `${currency} —`;
  return `${currency} ${n.toLocaleString('id-ID')}`;
};

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();

  const { register: profileRegister, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isSubmitting: isProfileSubmitting } } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
    },
  });

  const onProfileSubmit = async (data: ProfileFormInputs) => {
    try {
      const userData = await usersApi.updateMe(data);
      if (userData) setUser(userData);
      showSuccessAlert('Profile updated successfully!');
    } catch (error: any) {
      showErrorAlert(error.response?.data?.message || 'Failed to update profile.');
    }
  };
  const [balance, setBalance] = useState<{ balance: string; currency: string } | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [recentTx, setRecentTx] = useState<WalletTransaction[]>([]);
  const [amount, setAmount] = useState('');
  const [topupSubmitting, setTopupSubmitting] = useState(false);
  const [activeTopup, setActiveTopup] = useState<TopupResult | null>(null);
  const [topupStatus, setTopupStatus] = useState('PENDING');
  const [copied, setCopied] = useState(false);

  const loadWallet = async () => {
    setBalanceLoading(true);
    try {
      const [b, tx] = await Promise.all([walletApi.getBalance(), walletApi.listTransactions(1, 5)]);
      setBalance(b);
      setRecentTx(tx?.items ?? []);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  useEffect(() => {
    if (!activeTopup) return;
    const poll = async () => {
      const status = await walletApi.getTopupStatus(activeTopup.topup_code);
      if (!status) return;
      setTopupStatus(status.status);
      if (status.status === 'PAID') loadWallet();
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopup]);

  const submitTopup = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      showErrorAlert('Enter an amount greater than zero.');
      return;
    }
    setTopupSubmitting(true);
    try {
      const result = await walletApi.topup({ amount: value });
      if (!result) throw new Error('no result');
      setActiveTopup(result);
      setTopupStatus('PENDING');
      setAmount('');
    } catch (err: any) {
      showErrorAlert(err.response?.data?.message || 'Could not start top up.');
    } finally {
      setTopupSubmitting(false);
    }
  };

  const copyVA = () => {
    if (!activeTopup) return;
    navigator.clipboard.writeText(activeTopup.virtual_account_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your personal information.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card Summary */}
        <div className="lg:col-span-1 space-y-6">
            <div className="premium-card p-8 flex flex-col items-center text-center">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-md overflow-hidden ring-4 ring-teal-50 shadow-xl shadow-teal-100 group-hover:scale-105 transition-transform duration-300">
                         <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || '')}&background=6366f1&color=fff&size=128`} alt="Profile" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded shadow-lg hover:bg-secondary transition-colors">
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-6">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{user?.full_name}</h2>
                    <p className="text-sm font-medium text-slate-500">@{user?.username}</p>
                </div>
                <div className="mt-6 w-full pt-6 border-t border-slate-50 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className="px-2 py-0.5 bg-teal-50 text-primary rounded text-xs font-bold uppercase tracking-wider">Role #{user?.role_id}</span>
                    </div>
                </div>
            </div>

            <div className="premium-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-primary" /> My Wallet
                  </h3>
                </div>

                <div className="mb-4">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Balance</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {balanceLoading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : formatMoney(balance?.balance ?? '0', balance?.currency ?? 'IDR')}
                  </div>
                </div>

                {activeTopup ? (
                  <div className="bg-teal-50/60 rounded-md p-3 space-y-2 text-xs">
                    {topupStatus === 'PAID' ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Received -- balance updated.
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">VA number</span>
                          <button onClick={copyVA} className="font-bold inline-flex items-center gap-1">
                            {activeTopup.virtual_account_no} <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Amount</span>
                          <span className="font-bold">{formatMoney(activeTopup.amount, activeTopup.currency)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Loader2 className="w-3 h-3 animate-spin" /> Waiting for payment...
                          {copied && <span className="text-emerald-600 font-bold ml-auto">Copied</span>}
                        </div>
                      </>
                    )}
                    <button onClick={() => setActiveTopup(null)} className="w-full text-center text-primary font-bold py-1.5">
                      {topupStatus === 'PAID' ? 'Top up again' : 'Cancel'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount"
                      className="flex-1 bg-slate-50 border-none rounded py-2 px-3 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
                    />
                    <button
                      onClick={submitTopup}
                      disabled={topupSubmitting}
                      className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50 px-4"
                    >
                      {topupSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {recentTx.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Recent activity</div>
                    {recentTx.map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 truncate">{t.description || t.type}</span>
                        <span className={`font-bold shrink-0 ml-2 ${t.type === 'PAYMENT_DEBIT' || t.type === 'ADJUSTMENT' ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {t.type === 'PAYMENT_DEBIT' || t.type === 'ADJUSTMENT' ? '-' : '+'}{formatMoney(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="premium-card p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" /> Password Change Unavailable
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  pss_modular_cqrs has no "change my password" endpoint for a logged-in user --
                  only a token-based forgot/reset-password email flow. Use that flow instead.
                </p>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
            {/* Profile Form */}
            <div className="premium-card p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-teal-50 text-primary rounded flex items-center justify-center">
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
                </div>

                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="space-y-1.5 focus-within:text-primary transition-colors">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Full Name</label>
                        <input
                            {...profileRegister('full_name')}
                            className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 font-medium"
                        />
                        {profileErrors.full_name && <p className="mt-1 text-xs text-rose-500 font-medium">{profileErrors.full_name.message}</p>}
                    </div>

                    <div className="space-y-1.5 focus-within:text-primary transition-colors">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Email Address</label>
                        <input
                            type="email"
                            {...profileRegister('email')}
                            className="w-full bg-slate-50 border-none rounded py-3 px-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-slate-900 font-medium"
                        />
                        {profileErrors.email && <p className="mt-1 text-xs text-rose-500 font-medium">{profileErrors.email.message}</p>}
                    </div>

                    <p className="text-xs text-slate-400">Username can't be changed once created (no backend endpoint for it).</p>

                    <button
                        type="submit"
                        disabled={isProfileSubmitting}
                        className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50"
                    >
                        {isProfileSubmitting ? 'Saving changes...' : 'Save Profile Changes'}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
