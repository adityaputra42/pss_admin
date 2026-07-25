import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../hooks/useAuth';
import { LogOut, Bell, Search, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showSuccessAlert, showConfirmAlert } from '../../utils/alerts';
import Drawer from '../animations/Drawer';
import Pulse from '../animations/Pulse';
import BounceButton from '../animations/BounceButton';

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = async () => {
    const confirmed = await showConfirmAlert(
      'Logout Confirmation',
      'Are you sure you want to logout?'
    );

    if (confirmed) {
      logout();
      showSuccessAlert('Logged out successfully!');
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 md:h-20 glass border-b border-slate-100 px-4 md:px-6 flex items-center justify-between">
      {/* Search Bar - Hidden on mobile, flexible on desktop */}
      <div className="hidden lg:flex items-center flex-1 max-w-md">
         <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-slate-50 border-none rounded py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
            />
         </div>
      </div>

      {/* Spacing for mobile (since sidebar toggle is absolute) */}
      <div className="w-12 md:hidden"></div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* Quick actions */}
        <div className="flex items-center gap-1 md:gap-2 mr-1 md:mr-4 border-r border-slate-100 pr-2 md:pr-4">
            <button
                onClick={() => setIsNotifOpen(true)}
                className="p-2 text-slate-500 hover:bg-slate-50 rounded transition-colors relative group"
            >
                <Bell className="w-5 h-5 group-hover:shake transition-all" />
                <div className="absolute top-1.5 right-2">
                  <Pulse />
                </div>
            </button>
            <button className="hidden sm:block p-2 text-slate-500 hover:bg-slate-50 rounded transition-colors">
                <Settings className="w-5 h-5" />
            </button>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-900 leading-tight">{user?.full_name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admin</p>
          </div>

          <div className="group relative">
              <BounceButton
                  className="flex items-center gap-2 p-0.5 md:p-1 rounded hover:bg-slate-50 transition-colors"
                  onClick={handleLogout}
                  title="Logout"
              >
                <div className="w-9 h-9 md:w-10 md:h-10 rounded overflow-hidden ring-2 ring-teal-50 shadow-sm">
                     <img src={`https://ui-avatars.com/api/?name=${user?.full_name}&background=6366f1&color=fff`} alt="Profile" />
                </div>
                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors hidden md:block" />
              </BounceButton>
          </div>
        </div>
      </div>

      {/* Notifications drawer */}
      <AnimatePresence>
        {isNotifOpen && (
          <>
            <div
              onClick={() => setIsNotifOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            />
            <Drawer>
              <div className="flex flex-col h-full">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">Notifications</h2>
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="w-12 h-12 rounded bg-slate-50 text-slate-300 flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-400">
                    Nothing here yet -- pss_modular_cqrs doesn't have a notifications
                    endpoint yet, so this panel has no data source.
                  </p>
                </div>
              </div>
            </Drawer>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
