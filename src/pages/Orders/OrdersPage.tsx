import { useState, useEffect } from 'react';
import { ordersApi } from '../../services/api-services';
import type { Order } from '../../types/api';
import { ShoppingCart, Search, Filter, Eye } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getOrders();
      console.log(data);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': 
      case 'success':
        return 'bg-emerald-50 text-emerald-600 ring-emerald-100';
      case 'pending': 
      case 'processing':
        return 'bg-amber-50 text-amber-600 ring-amber-100';
      case 'cancelled': 
      case 'failed':
        return 'bg-rose-50 text-rose-600 ring-rose-100';
      default: 
        return 'bg-slate-50 text-slate-600 ring-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-slate-500 mt-1">Track and manage customer orders and their fulfillment status.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search orders by ID or customer..." 
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
         </div>
         <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
               <Filter className="w-4 h-4" />
               Filter
            </button>
            <div className="w-px h-8 bg-slate-100 mx-1 hidden md:block"></div>
            <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
               Total <span className="text-slate-900">{orders.length}</span> orders
            </p>
         </div>
      </div>

      <div className="premium-card overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
             <p className="text-slate-500 font-medium italic">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="p-20 text-center">
             <p className="text-rose-500 font-medium">{error}</p>
             <button onClick={fetchOrders} className="mt-4 text-primary font-semibold hover:underline">Try again</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-20 text-center">
             <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-500 font-medium">No orders found yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">
                             {order.user ? `${order.user.first_name} ${order.user.last_name}` : `User #${order.user_id}`}
                          </span>
                          <span className="text-xs text-slate-400">{order.user?.email || 'No email'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-3 py-1 ring-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                         {order.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                       {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <button 
                         className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all"
                         title="View Details"
                       >
                         <Eye className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
