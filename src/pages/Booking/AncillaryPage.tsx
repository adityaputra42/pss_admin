import { useEffect, useState } from 'react';
import {
  Layers,
  Package,
  ShoppingBag,
  Plus,
  Edit3,
  Trash2,
  DollarSign,
  Boxes,
  Search,
  Ban,
  CheckCircle2,
  XCircle,
  CircleSlash,
} from 'lucide-react';

import { ancillaryApi } from '../../services/api-services';
import type { AncillaryCategory, AncillaryPurchase, CatalogItem } from '../../types/api';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import ScaleIn from '../../components/animations/ScaleIn';

import AncillaryCategoryModal from '../../components/ancillary/AncillaryCategoryModal';
import AncillaryItemModal from '../../components/ancillary/AncillaryItemModal';
import { AncillaryInventoryModal, AncillaryPriceModal } from '../../components/ancillary/AncillaryPriceInventoryModals';

type Tab = 'categories' | 'catalog' | 'purchases';

const purchaseStatusStyle: Record<string, { icon: React.ReactNode; className: string }> = {
  ACTIVE: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, className: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
  USED: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, className: 'bg-sky-50 text-sky-600 ring-sky-100' },
  CANCELLED: { icon: <XCircle className="w-3.5 h-3.5" />, className: 'bg-rose-50 text-rose-600 ring-rose-100' },
};

/**
 * Replaces the old dead-stub BaggagePage. "Baggage" was never a real
 * backend module -- what actually exists is internal/ancillary, a
 * broader sellable-extras catalog (baggage is just one category among
 * several: seats, meals, etc). See ancillary.ts for the full endpoint
 * inventory and the caveats baked into each call.
 */
const AncillaryPage = () => {
  const [tab, setTab] = useState<Tab>('categories');

  // ---- shared: categories (used by both Categories tab and Catalog's category filter/select) ----
  const [categories, setCategories] = useState<AncillaryCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AncillaryCategory | null>(null);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await ancillaryApi.listCategories(1, 100);
      setCategories(res.items ?? []);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSaveCategory = async (data: { code?: string; name: string; description?: string }, id: number | null) => {
    try {
      if (id) {
        await ancillaryApi.updateCategory(id, data);
      } else {
        await ancillaryApi.createCategory(data as { code: string; name: string; description?: string });
      }
      showSuccessAlert(id ? 'Category updated' : 'Category created');
      setCategoryModalOpen(false);
      loadCategories();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (category: AncillaryCategory) => {
    const confirmed = await showConfirmAlert('Delete category?', `"${category.name}" will be removed. Ancillaries still assigned to it may be affected.`);
    if (!confirmed) return;
    try {
      await ancillaryApi.deleteCategory(category.id);
      showSuccessAlert('Category deleted');
      loadCategories();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to delete category');
    }
  };

  // ---- Catalog tab ----
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [targetItem, setTargetItem] = useState<CatalogItem | null>(null);

  const loadCatalog = async () => {
    setCatalogLoading(true);
    try {
      const res = await ancillaryApi.listCatalog({
        category_id: categoryFilter || undefined,
        page: 1,
        limit: 100,
      });
      setCatalog(res.items ?? []);
      setCatalogTotal(res.total ?? 0);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to load catalog');
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'catalog') loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, categoryFilter]);

  const handleSaveItem = async (
    data: { category_id: number; code?: string; name: string; description?: string; is_active: boolean },
    id: number | null,
  ) => {
    try {
      if (id) {
        await ancillaryApi.updateAncillary(id, data);
      } else {
        await ancillaryApi.createAncillary(data as { category_id: number; code: string; name: string; description?: string; is_active: boolean });
      }
      showSuccessAlert(id ? 'Ancillary updated' : 'Ancillary created');
      setItemModalOpen(false);
      loadCatalog();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to save ancillary');
    }
  };

  const handleDeleteItem = async (item: CatalogItem) => {
    const confirmed = await showConfirmAlert('Delete ancillary?', `"${item.Name}" will be removed from the catalog.`);
    if (!confirmed) return;
    try {
      await ancillaryApi.deleteAncillary(item.ID);
      showSuccessAlert('Ancillary deleted');
      loadCatalog();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to delete ancillary');
    }
  };

  const handleSavePrice = async (payload: { amount: string; currency: string }) => {
    if (!targetItem) return;
    try {
      await ancillaryApi.setPrice(targetItem.ID, payload);
      showSuccessAlert('Price updated');
      setPriceModalOpen(false);
      loadCatalog();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to set price');
    }
  };

  const handleSaveInventory = async (payload: { flight_id: number; available_quantity: number }) => {
    if (!targetItem) return;
    try {
      await ancillaryApi.setInventory(targetItem.ID, payload);
      showSuccessAlert('Inventory updated for that flight');
      setInventoryModalOpen(false);
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to set inventory');
    }
  };

  // ---- Purchases tab (search by PNR ID -- no list-all endpoint exists) ----
  const [pnrQuery, setPnrQuery] = useState('');
  const [purchases, setPurchases] = useState<AncillaryPurchase[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesSearched, setPurchasesSearched] = useState(false);

  const searchPurchases = async () => {
    if (!pnrQuery) return;
    setPurchasesLoading(true);
    setPurchasesSearched(true);
    try {
      const res = await ancillaryApi.listPurchasesByPNR(Number(pnrQuery));
      setPurchases(res);
    } catch (err: any) {
      setPurchases([]);
      showErrorAlert(err?.response?.data?.message || 'Failed to load purchases for that PNR');
    } finally {
      setPurchasesLoading(false);
    }
  };

  const handleCancelPurchase = async (purchase: AncillaryPurchase) => {
    const confirmed = await showConfirmAlert(
      'Cancel this purchase?',
      "This does not restore flight-scoped inventory automatically -- that's a known schema gap server-side.",
    );
    if (!confirmed) return;
    try {
      await ancillaryApi.cancelPurchase(purchase.id);
      showSuccessAlert('Purchase cancelled');
      searchPurchases();
    } catch (err: any) {
      showErrorAlert(err?.response?.data?.message || 'Failed to cancel purchase');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ancillary</h1>
        <p className="text-slate-500 mt-1">Manage sellable extras -- baggage, seats, meals -- and their pricing, stock, and purchases.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-100">
        {([
          { key: 'categories', label: 'Categories', icon: Layers },
          { key: 'catalog', label: 'Catalog', icon: Package },
          { key: 'purchases', label: 'Purchases', icon: ShoppingBag },
        ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
              tab === key ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ================= CATEGORIES ================= */}
      {tab === 'categories' && (
        <ScaleIn>
          <div className="premium-card overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Categories</h2>
                <p className="text-xs text-slate-500">Groups for catalog items, e.g. Baggage, Seats, Meals.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
                className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> New Category
              </button>
            </div>

            {categoriesLoading ? (
              <div className="p-10 text-center text-sm text-slate-400">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">No categories yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="text-left px-6 py-3">Code</th>
                    <th className="text-left px-6 py-3">Name</th>
                    <th className="text-left px-6 py-3">Description</th>
                    <th className="text-right px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{c.code}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{c.name}</td>
                      <td className="px-6 py-4 text-slate-500">{c.description || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(c);
                              setCategoryModalOpen(true);
                            }}
                            className="p-2 rounded hover:bg-slate-100 text-slate-500"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCategory(c)} className="p-2 rounded hover:bg-rose-50 text-rose-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ScaleIn>
      )}

      {/* ================= CATALOG ================= */}
      {tab === 'catalog' && (
        <ScaleIn>
          <div className="premium-card overflow-hidden">
            <div className="p-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Catalog ({catalogTotal})</h2>
                <p className="text-xs text-slate-500">Sellable items with their current price. Blank price means nothing is configured yet.</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
                  className="bg-slate-50 border-none rounded py-2.5 px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setItemModalOpen(true);
                  }}
                  disabled={categories.length === 0}
                  className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> New Ancillary
                </button>
              </div>
            </div>

            {categories.length === 0 && (
              <div className="mx-6 mt-4 bg-amber-50/60 border border-amber-100 rounded p-3 text-[11px] text-amber-800">
                Create a category first -- every ancillary needs one.
              </div>
            )}

            {catalogLoading ? (
              <div className="p-10 text-center text-sm text-slate-400">Loading...</div>
            ) : catalog.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">No ancillaries yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <tr>
                    <th className="text-left px-6 py-3">Code</th>
                    <th className="text-left px-6 py-3">Name</th>
                    <th className="text-left px-6 py-3">Price</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-right px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {catalog.map((item) => (
                    <tr key={item.ID} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{item.Code}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{item.Name}</td>
                      <td className="px-6 py-4 text-slate-700">
                        {item.CurrentPrice ? (
                          <span className="font-bold">
                            {item.Currency ?? ''} {Number(item.CurrentPrice).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${
                            item.IsActive ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' : 'bg-slate-100 text-slate-500 ring-slate-200'
                          }`}
                        >
                          {item.IsActive ? <CheckCircle2 className="w-3 h-3" /> : <CircleSlash className="w-3 h-3" />}
                          {item.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setTargetItem(item);
                              setPriceModalOpen(true);
                            }}
                            title="Set price"
                            className="p-2 rounded hover:bg-slate-100 text-slate-500"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setTargetItem(item);
                              setInventoryModalOpen(true);
                            }}
                            title="Set inventory"
                            className="p-2 rounded hover:bg-slate-100 text-slate-500"
                          >
                            <Boxes className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setItemModalOpen(true);
                            }}
                            title="Edit"
                            className="p-2 rounded hover:bg-slate-100 text-slate-500"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteItem(item)} title="Delete" className="p-2 rounded hover:bg-rose-50 text-rose-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </ScaleIn>
      )}

      {/* ================= PURCHASES ================= */}
      {tab === 'purchases' && (
        <ScaleIn>
          <div className="space-y-6">
            <div className="premium-card p-6 flex items-start gap-4 bg-amber-50/50 border border-amber-100">
              <Ban className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                No "list all purchases" endpoint exists server-side -- only a per-PNR lookup. Search by PNR ID below.
              </p>
            </div>

            <div className="premium-card p-6 flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={pnrQuery}
                  onChange={(e) => setPnrQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchPurchases()}
                  placeholder="PNR ID"
                  className="w-full pl-10 pr-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                onClick={searchPurchases}
                disabled={purchasesLoading || !pnrQuery}
                className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-100 disabled:opacity-50"
              >
                {purchasesLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {purchasesSearched && !purchasesLoading && (
              <div className="premium-card overflow-hidden">
                {purchases.length === 0 ? (
                  <div className="p-10 text-center text-sm text-slate-400">No ancillary purchases found for that PNR.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <tr>
                        <th className="text-left px-6 py-3">Ancillary ID</th>
                        <th className="text-left px-6 py-3">Qty</th>
                        <th className="text-left px-6 py-3">Total Price</th>
                        <th className="text-left px-6 py-3">Payment</th>
                        <th className="text-left px-6 py-3">Status</th>
                        <th className="text-right px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {purchases.map((p) => {
                        const style = purchaseStatusStyle[p.status] ?? purchaseStatusStyle.ACTIVE;
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">#{p.ancillary_id}</td>
                            <td className="px-6 py-4 text-slate-700">{p.quantity}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{p.total_price.toLocaleString()}</td>
                            <td className="px-6 py-4 text-slate-500">{p.payment_status}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ring-1 ${style.className}`}>
                                {style.icon}
                                {p.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end">
                                {p.status === 'ACTIVE' && (
                                  <button
                                    onClick={() => handleCancelPurchase(p)}
                                    title="Cancel purchase"
                                    className="p-2 rounded hover:bg-rose-50 text-rose-500"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </ScaleIn>
      )}

      <AncillaryCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        category={editingCategory}
        onSave={handleSaveCategory}
      />
      <AncillaryItemModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        item={editingItem}
        categories={categories}
        onSave={handleSaveItem}
      />
      <AncillaryPriceModal isOpen={priceModalOpen} onClose={() => setPriceModalOpen(false)} item={targetItem} onSave={handleSavePrice} />
      <AncillaryInventoryModal isOpen={inventoryModalOpen} onClose={() => setInventoryModalOpen(false)} item={targetItem} onSave={handleSaveInventory} />
    </div>
  );
};

export default AncillaryPage;
