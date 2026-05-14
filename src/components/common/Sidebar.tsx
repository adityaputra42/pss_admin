import { NavLink } from 'react-router-dom';
import { Users, Shield, Menu, X, User, Package,PackageSearch, ShoppingCart, CreditCard, Truck, LayoutDashboard, Wallet, Banknote } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Categories', href: '/categories', icon:  PackageSearch},
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Payments', href: '/payments', icon: Banknote },
  { name: 'Shipping', href: '/shipping', icon: Truck },
  { name: 'Payment Methods', href: '/payment-methods', icon: Wallet },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Roles', href: '/roles', icon: Shield },
  { name: 'Profile', href: '/profile', icon: User },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar toggle - Visible only on mobile */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 bg-primary rounded-xl shadow-lg shadow-teal-200 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all hover:scale-105 active:scale-95"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile sidebar overlay - Closes sidebar when clicked */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity duration-300" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar - Handles both mobile (absolute/translate) and desktop (relative) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-all duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none`}
      >
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
               <Package className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Barakallah Hijab</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider opacity-60">Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 pb-4 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1.5">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-teal-50 text-primary font-bold shadow-sm shadow-teal-100/50' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                    'group-hover:text-primary'
                  }`} />
                  <span className="text-sm">{item.name}</span>
                  {/* Active indicator indicator dot */}
                  <div className="ml-auto opacity-0 group-[.active]:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-teal-200 animate-pulse"></div>
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-50">
          <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 group cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm overflow-hidden ring-2 ring-white">
                  <img src="https://ui-avatars.com/api/?name=Barrakallah&background=FDACAC&color=fff" alt="Avatar" />
              </div>
              <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-slate-900 truncate">Barakallah Hijab</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">System Administrator</p>
              </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
