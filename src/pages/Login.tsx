import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { authApi } from '../services/api-services';
import { Lock, Mail, ChevronRight, LayoutDashboard, ShieldCheck, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await authApi.login({ email: username, password });
      const { access_token, refresh_token, user } = data;
      login(access_token, refresh_token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white selection:bg-teal-100 overflow-hidden">
      {/* Visual Side - Hidden on Mobile, Side on Desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-lg text-center animate-in fade-in slide-in-from-left-8 duration-1000">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-bold tracking-wider uppercase mb-8 border border-white/20">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Next Gen Admin Panel</span>
           </div>
           <h1 className="text-5xl xl:text-6xl font-black text-white leading-tight tracking-tighter mb-6">
              Manage your store with <span className="text-teal-200">Confidence.</span>
           </h1>
           <p className="text-lg text-teal-100 font-medium mb-12 leading-relaxed opacity-80">
              Experience the fastest way to handle orders, products, and customer insights in one unified dashboard.
           </p>

           <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 text-left">
                 <ShieldCheck className="w-8 h-8 text-teal-300 mb-4" />
                 <h3 className="text-white font-bold mb-1">Secure</h3>
                 <p className="text-teal-200/60 text-xs">Military-grade protection for your data.</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 text-left">
                 <LayoutDashboard className="w-8 h-8 text-teal-300 mb-4" />
                 <h3 className="text-white font-bold mb-1">Intuitive</h3>
                 <p className="text-teal-200/60 text-xs">Built for speed and ease of use.</p>
              </div>
           </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 bg-slate-50 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-teal-500 via-purple-500 to-teal-500 lg:hidden"></div>
        
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center lg:text-left">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-teal-200 mx-auto lg:mx-0 mb-6 group hover:rotate-6 transition-transform">
               <Lock className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back!</h2>
            <p className="text-slate-500 mt-2 font-medium">Please enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block ml-1">Username / ID</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-semibold"
                  placeholder="admin_core"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5 focus-within:text-primary transition-colors">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs font-bold text-primary hover:text-teal-700">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-semibold"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in zoom-in-95">
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                 {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white rounded-2xl py-4 font-bold shadow-xl shadow-teal-100 hover:bg-secondary hover:shadow-teal-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs font-medium">
            Confidential System. Unauthorized access is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
