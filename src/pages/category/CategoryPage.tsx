import { Edit3, Plus, Trash2 } from "lucide-react";
import type { Category } from "../../types/api";
import { useEffect, useState } from "react";
import { categoriesApi } from "../../services/api-services";
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from "../../utils/alerts";

const CategoryPage = () => {

   const [categories, setCategory] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      fetchMethods();
    }, []);

    const fetchMethods = async () => {
      setIsLoading(true);
      try {
        const data = await categoriesApi.getCategories();
        console.log("payment method data => ",data);
        setCategory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // const toggleStatus = async (method: Category) => {
    //   try {
    //     await paymentMethodsApi.updatePaymentMethod(method.id, { is_active: !method.is_active });
    //     showSuccessAlert(`Bank ${method.bank_name} is now ${!method.is_active ? 'Active' : 'Inactive'}`);
    //     fetchMethods();
    //   } catch (error) {
    //     showErrorAlert('Failed to update status');
    //   }
    // };

    const deleteMethod = async (id: number) => {
      const confirmed = await showConfirmAlert('Delete?', 'This action cannot be undone.');
      if (confirmed) {
        try {
          await categoriesApi.deleteCategory(id);
          showSuccessAlert('Payment method removed');
          fetchMethods();
        } catch (error) {
          showErrorAlert('Failed to delete');
        }
      }
    };
  return <div>
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Category Product</h1>
          <p className="text-slate-500 mt-1">Manage your product categories.</p>
        </div>
        <button
            className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-5 h-5" />
          <span>Add New Category</span>
        </button>
      </div>
       <div className="premium-card overflow-hidden">
        {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Verifying ledger...</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Icon</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Create At</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {categories.map((category) => (
                            <tr key={category.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-4">
                                    <div className="shrink-0 h-8 w-8 rounded-xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-teal-100 transition-all">
                                      <img className="h-8 w-8 object-cover" src={Array.isArray(category.icon) ? category.icon[0] : (category.icon || 'https://via.placeholder.com/80')} alt="" />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="min-w-0">
                                      <div className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate max-w-50">{category.name}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="min-w-0">
                                      <div className="text-slate-400 font-medium max-w-50"> {new Date(category.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end gap-2">
                                      <button
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all"
                                        title="Edit Product">
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                      onClick={()=>{deleteMethod(category.id);}}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                        title="Delete Product">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {categories.length === 0 && (
                    <div className="p-20 text-center">
                        <p className="text-slate-400 font-medium italic">No Categories records found.</p>
                    </div>
                )}
            </div>
        )}
      </div>
      </div>
};

export default CategoryPage;
