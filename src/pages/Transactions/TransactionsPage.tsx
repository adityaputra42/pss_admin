import { useState, useEffect } from 'react';
import { transactionsApi } from '../../services/api-services';
import type { Transaction } from '../../types/api';
import { CreditCard, Search, Filter, Download } from 'lucide-react';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await transactionsApi.getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': 
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 ring-emerald-100';
      case 'pending': 
        return 'bg-amber-50 text-amber-600 ring-amber-100';
      case 'failed': 
      case 'cancelled':
        return 'bg-rose-50 text-rose-600 ring-rose-100';
      default: 
        return 'bg-slate-50 text-slate-600 ring-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transactions Log</h1>
          <p className="text-slate-500 mt-1">Audit trail for all payments and monetary movements.</p>
        </div>
        <button className="premium-button bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm flex items-center gap-2 self-start md:self-auto">
          <Download className="w-4 h-4" /> 
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by transaction ID or order..." 
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                   <Filter className="w-4 h-4" />
                   Filter
                </button>
            </div>
            <div className="w-px h-8 bg-slate-100 hidden md:block"></div>
            <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
               <span className="text-slate-900 font-bold">{transactions.length}</span> records
            </p>
         </div>
      </div>

      <div className="premium-card overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
             <p className="text-slate-500 font-medium italic">Syncing transactions...</p>
          </div>
        ) : error ? (
          <div className="p-20 text-center">
             <p className="text-rose-500 font-medium">{error}</p>
             <button onClick={fetchTransactions} className="mt-4 text-primary font-semibold hover:underline">Retry sync</button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-20 text-center">
             <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-500 font-medium">No transaction records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((t) => (
                  <tr key={t.tx_id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{t.tx_id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg inline-block">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">User #{t.user_id}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(t.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                          <span className="text-sm font-semibold text-slate-600 capitalize">{t.payment_method?.bank_name || 'N/A'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-3 py-1 ring-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusStyle(t.status)}`}>
                         {t.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                       {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

export default TransactionsPage;
