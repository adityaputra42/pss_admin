import { useState, useEffect } from 'react';
import { productsApi } from '../../services/api-services';
import type { Product } from '../../types/api';
import { Package, Plus, Search, Filter, Edit3, Trash2 } from 'lucide-react';
import ProductFormModal from '../../components/products/ProductFormModal';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/alerts';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productsApi.getProducts(1, 10);
      console.log("data product => ",data)
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
      setEditingProduct(null);
      setIsModalOpen(true);
  };

  const handleEditProduct = async (product: Product) => {
      try {
          const detailData = await productsApi.getProductById(product.id);
          setEditingProduct(detailData);
          setIsModalOpen(true);
      } catch (e) {
         console.error("Failed to fetch detail", e);
          setEditingProduct(product);
          setIsModalOpen(true);
      }
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = await showConfirmAlert(
        'Delete Product',
        `Are you sure you want to delete "${product.name}"?`
    );
    if (!confirmed) return;
    try {
        await productsApi.deleteProduct(product.id);
        showSuccessAlert('Product deleted successfully');
        fetchProducts();
    } catch (error: any) {
        showErrorAlert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSaveProduct = async (formData: FormData, productId: number | null) => {
      try {
          if (productId) {
              await productsApi.updateProduct(productId, formData);
              showSuccessAlert('Product updated successfully');
          } else {
              await productsApi.createProduct(formData);
              showSuccessAlert('Product created successfully');
          }
          setIsModalOpen(false);
          fetchProducts();
      } catch (error: any) {
          showErrorAlert(error.response?.data?.message || 'Failed to save product');
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
          <p className="text-slate-500 mt-1">Manage your inventory, prices and product categories.</p>
        </div>
        <button 
            onClick={handleAddProduct}
            className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" /> 
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
            />
         </div>
         <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
               <Filter className="w-4 h-4" />
               Filter
            </button>
            <div className="w-px h-8 bg-slate-100 mx-1 hidden md:block"></div>
            <p className="text-sm text-slate-500 font-medium">
               Showing <span className="text-slate-900">{products.length}</span> products
            </p>
         </div>
      </div>

      <div className="premium-card overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
             <p className="text-slate-500 font-medium italic">Loading catalog...</p>
          </div>
        ) : error ? (
          <div className="p-20 text-center">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
             </div>
             <p className="text-red-500 font-medium">{error}</p>
             <button onClick={fetchProducts} className="mt-4 text-primary font-semibold hover:underline">Try again</button>
          </div>
        ) : products.length === 0 ? (
          <div className="p-20 text-center">
             <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8" />
             </div>
             <p className="text-slate-500 font-medium">No products found in your catalog</p>
             <button onClick={handleAddProduct} className="mt-2 text-primary font-semibold hover:underline">Create your first product</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((product) => (
                  <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0 h-12 w-12 rounded-xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-teal-100 transition-all">
                          <img className="h-12 w-12 object-cover" src={Array.isArray(product.images) ? product.images[0] : (product.images || 'https://via.placeholder.com/80')} alt="" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate max-w-50">{product.name}</div>
                          <div className="text-xs text-slate-500 font-medium">#{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                          {product.category?.name}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-sm font-bold text-slate-700">{product.rating}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Product"
                          >
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
      
      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
};

export default ProductsPage;
