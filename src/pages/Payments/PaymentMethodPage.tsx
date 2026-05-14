import { useState, useEffect } from 'react';
import { paymentMethodsApi } from '../../services/api-services';
import type { PaymentMethod } from '../../types/api';
import { Plus, XCircle, Trash2, ShieldCheck, Landmark } from 'lucide-react';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/alerts';

const PaymentMethodPage = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    setIsLoading(true);
    try {
      const data = await paymentMethodsApi.getPaymentMethods();
      console.log("payment method data => ",data);
      setMethods(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (method: PaymentMethod) => {
    try {
      await paymentMethodsApi.updatePaymentMethod(method.id, { is_active: !method.is_active });
      showSuccessAlert(`Bank ${method.bank_name} is now ${!method.is_active ? 'Active' : 'Inactive'}`);
      fetchMethods();
    } catch (error) {
      showErrorAlert('Failed to update status');
    }
  };

  const deleteMethod = async (id: number) => {
    const confirmed = await showConfirmAlert('Delete?', 'This action cannot be undone.');
    if (confirmed) {
      try {
        await paymentMethodsApi.deletePaymentMethod(id);
        showSuccessAlert('Payment method removed');
        fetchMethods();
      } catch (error) {
        showErrorAlert('Failed to delete');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payment Methods</h1>
          <p className="text-slate-500 mt-1">Configure how your customers will pay for their orders.</p>
        </div>
        <button className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2 self-start md:self-auto group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>New Method</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
            <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {methods.map((method) => (
            <div key={method.id} className="premium-card p-6 flex flex-col justify-between group overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform duration-700 opacity-50"></div>
               
               <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
                       {method.bank_images ? (
                           <img src={method.bank_images} alt={method.bank_name} className="w-full h-full object-contain p-2" />
                       ) : (
                           <Landmark className="w-8 h-8 text-slate-300" />
                       )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      method.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {method.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">{method.bank_name}</h3>
                        <p className="text-xs text-slate-500 font-medium">Digital Banking Transfer</p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Name</span>
                             <span className="text-sm font-bold text-slate-900">{method.account_name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Number</span>
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-900 font-mono tracking-tighter">{method.account_number}</span>
                             </div>
                          </div>
                      </div>
                  </div>
               </div>

               <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-50 relative z-10">
                  <button 
                    onClick={() => toggleStatus(method)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        method.is_active 
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                        : 'bg-teal-50 text-primary hover:bg-teal-100'
                    }`}
                  >
                    {method.is_active ? <XCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                    {method.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button 
                    onClick={() => deleteMethod(method.id)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))}

          <button className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-teal-300 hover:bg-teal-50/30 transition-all group min-h-80">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all">
                <Plus className="w-8 h-8 text-slate-400 group-hover:text-primary" />
             </div>
             <div className="text-center">
                <p className="text-sm font-bold text-slate-900">Add Payment Method</p>
                <p className="text-xs text-slate-400 mt-1 max-w-37.5">Support more banks or digital wallets</p>
             </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodPage;
