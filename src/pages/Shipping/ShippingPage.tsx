import { useState, useEffect } from 'react';
import { shippingApi } from '../../services/api-services';
import type { ShippingMethod as ApiShippingMethod } from '../../types/api';
import { Truck, Plus, Package, Edit3, Trash2 } from 'lucide-react';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import ShippingFormModal from '../../components/shipping/ShippingFormModal';


interface ShippingMethod extends ApiShippingMethod {
  state: string; 
}

const ShippingPage = () => {
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipping, setEditingShipping] = useState<ShippingMethod | null>(null);

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    setIsLoading(true);
    try {
      const data = await shippingApi.getShippingMethods();
      console.log("data shipping => ",data)
  
      setShippingMethods(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shipping methods');
    } finally {
      setIsLoading(false);
    }
  };



    const handleAddShipping = () => {
        setEditingShipping(null);
        setIsModalOpen(true);
    };
  
    const handleEditshipping = async (shipping: ShippingMethod) => {
        try {
            const detailData = await shippingApi.getShippingById(shipping.id);
            setEditingShipping(detailData);
            setIsModalOpen(true);
        } catch (e) {
           console.error("Failed to fetch detail", e);
            setEditingShipping(shipping);
            setIsModalOpen(true);
        }
    };
  
    const handleDeleteshipping = async (shipping: ShippingMethod) => {
      const confirmed = await showConfirmAlert(
          'Delete Shipping',
          `Are you sure you want to delete "${shipping.name}"?`
      );
      if (!confirmed) return;
      try {
          await shippingApi.deleteShipping(shipping.id);
          showSuccessAlert('shipping deleted successfully');
          fetchShippingMethods();
      } catch (error: any) {
          showErrorAlert(error.response?.data?.message || 'Failed to delete shipping');
      }
    };
  
    const handleSaveShipping = async (data: any, shippingId: number | null) => {
        try {
            if (shippingId) {
                await shippingApi.updateShipping(shippingId,data);
                showSuccessAlert('shipping updated successfully');
            } else {
                await shippingApi.createShipping(data);
                showSuccessAlert('shipping created successfully');
            }
            setIsModalOpen(false);
            fetchShippingMethods();
        } catch (error: any) {
            showErrorAlert(error.response?.data?.message || 'Failed to save shipping');
        }
    };

  const getStateStyle = (state: string) => {
    switch (state.toLowerCase()) {
      case 'active': return 'bg-emerald-50 text-emerald-600 ring-emerald-100';
      case 'inactive': return 'bg-rose-50 text-rose-600 ring-rose-100';
      default: return 'bg-slate-50 text-slate-600 ring-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight transition-all">Shipping Config</h1>
          <p className="text-slate-500 mt-1">Configure your logistics, delivery rates, and courier partners.</p>
        </div>
        <button onClick={()=> handleAddShipping()}
            className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" /> 
          <span>New Shipping</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Stats mini cards for context */}
         <div className="lg:col-span-1 space-y-6">
            <div className="premium-card p-6 flex items-center gap-4 bg-linear-to-br from-teal-500 to-teal-600 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                    <p className="text-xs font-bold text-teal-100 uppercase tracking-widest">Active Couriers</p>
                    <p className="text-2xl font-bold">{shippingMethods.filter(m => m.state === 'active').length}</p>
                </div>
            </div>
            <div className="premium-card p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    Delivery Stats
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Standard Delivery</span>
                        <span className="text-slate-900 font-bold">2-3 Days</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full w-[70%]" />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-medium">Express Delivery</span>
                        <span className="text-slate-900 font-bold">Today</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[40%]" />
                    </div>
                </div>
            </div>
         </div>

         <div className="lg:col-span-3">
             <div className="premium-card overflow-hidden">
                {isLoading ? (
                  <div className="p-20 flex flex-col items-center justify-center gap-4">
                     <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                     <p className="text-slate-500 font-medium italic">Fetching methods...</p>
                  </div>
                ) : error ? (
                  <div className="p-20 text-center">
                     <p className="text-rose-500 font-medium">{error}</p>
                     <button onClick={fetchShippingMethods} className="mt-4 text-primary font-semibold hover:underline">Try again</button>
                  </div>
                ) : shippingMethods.length === 0 ? (
                  <div className="p-20 text-center text-slate-500">No shipping methods configured</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-50">
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Method Name</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Base Price</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">State</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Last Sync</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {shippingMethods.map((method) => (
                          <tr key={method.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                               <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-teal-50 transition-colors">
                                       <Truck className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                   </div>
                                   <span className="text-sm font-bold text-slate-900">
                                     {method.name}
                                   </span>
                               </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(method.price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <span className={`px-2.5 py-1 ring-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStateStyle(method.state)}`}>
                                 {method.state}
                               </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                               {new Date(method.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                               <div className="flex items-center justify-end gap-1">
                                  <button onClick={()=> handleEditshipping(method)} className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button  onClick={() => handleDeleteshipping(method)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
             </div>
         </div>
      </div>
         <ShippingFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shipping={editingShipping}
        onSave={handleSaveShipping}
      />
    </div>
  );
};

export default ShippingPage;
