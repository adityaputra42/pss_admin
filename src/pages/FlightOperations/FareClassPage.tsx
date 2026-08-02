import { useEffect, useMemo, useState } from 'react';
import { Ticket, Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, Luggage } from 'lucide-react';

import { fareClassesApi, seatClassesApi } from '../../services/api-services';
import type { FareClass, SeatClass } from '../../types/api';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../utils/alerts';
import FareClassModal from '../../components/flight/FareClassModal';

/**
 * Full CRUD against internal/flight/interfaces/http/router.go's "----
 * Fare Classes ----" block (GET/POST/PUT/DELETE /flights/fare-classes).
 * A fare class (e.g. "Economy Saver") belongs to one seat class (e.g.
 * "Economy") and is what generate-flights prices a flight against.
 */
const FareClassPage = () => {
  const [fareClasses, setFareClasses] = useState<FareClass[]>([]);
  const [seatClasses, setSeatClasses] = useState<SeatClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [seatClassFilter, setSeatClassFilter] = useState<number | 'ALL'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FareClass | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [fareRes, seatRes] = await Promise.all([
        fareClassesApi.getFareClasses(),
        seatClassesApi.getSeatClasses(),
      ]);
      setFareClasses(fareRes.Items ?? []);
      setSeatClasses(seatRes.Items ?? []);
    } catch (error: any) {
      showErrorAlert(error?.response?.data?.message || 'Failed to fetch fare classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const seatClassById = useMemo(() => {
    const map = new Map<number, SeatClass>();
    for (const sc of seatClasses) map.set(sc.id, sc);
    return map;
  }, [seatClasses]);

  const filtered = fareClasses.filter((fc) => {
    const keyword = search.toLowerCase();
    const matchesSearch = fc.code?.toLowerCase().includes(keyword) || fc.name?.toLowerCase().includes(keyword);
    const matchesSeatClass = seatClassFilter === 'ALL' || fc.seat_class_id === seatClassFilter;
    return matchesSearch && matchesSeatClass;
  });

  const handleSave = async (
    data: { code?: string; seat_class_id?: number; name: string; refundable: boolean; rescheduleable: boolean; baggage_kg: number },
    id: number | null,
  ) => {
    try {
      if (id) {
        await fareClassesApi.updateFareClass(id, data);
      } else {
        await fareClassesApi.createFareClass(
          data as { code: string; seat_class_id: number; name: string; refundable: boolean; rescheduleable: boolean; baggage_kg: number },
        );
      }
      showSuccessAlert(id ? 'Fare class updated' : 'Fare class created');
      setModalOpen(false);
      fetchAll();
    } catch (error: any) {
      showErrorAlert(error?.response?.data?.message || 'Failed to save fare class');
    }
  };

  const handleDelete = async (fareClass: FareClass) => {
    const confirmed = await showConfirmAlert(
      'Delete Fare Class',
      `Delete "${fareClass.name}"? Flights already generated with it, or bookings using it, may block this.`,
    );
    if (!confirmed) return;
    try {
      await fareClassesApi.deleteFareClass(fareClass.id);
      showSuccessAlert('Fare class deleted');
      fetchAll();
    } catch (error: any) {
      showErrorAlert(error?.response?.data?.message || 'Failed to delete fare class');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fare Classes</h1>
          <p className="text-slate-500 mt-1">
            Manage fare classes -- pricing tiers within each seat class (e.g. Economy Saver, Economy Flex).
          </p>
        </div>

        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2 self-start lg:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Fare Class</span>
        </button>
      </div>

      <div className="premium-card p-4 flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search fare class code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
          />
        </div>

        <select
          value={seatClassFilter}
          onChange={(e) => setSeatClassFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          className="bg-slate-50 border-none rounded px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
        >
          <option value="ALL">All Seat Classes</option>
          {seatClasses.map((sc) => (
            <option key={sc.id} value={sc.id}>{sc.name}</option>
          ))}
        </select>
      </div>

      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium italic">Loading fare classes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">No fare classes found</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Seat Class</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Baggage</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Refundable</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Rescheduleable</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((fareClass) => (
                <tr key={fareClass.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase tracking-wider">
                        {fareClass.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {fareClass.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                    {seatClassById.get(fareClass.seat_class_id)?.name ?? `#${fareClass.seat_class_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Luggage className="w-3.5 h-3.5 text-slate-400" />
                      {fareClass.baggage_kg} kg
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {fareClass.refundable ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Yes</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-bold"><XCircle className="w-3.5 h-3.5" /> No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {fareClass.rescheduleable ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Yes</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-bold"><XCircle className="w-3.5 h-3.5" /> No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditing(fareClass); setModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(fareClass)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                        title="Delete"
                      >
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

      <FareClassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fareClass={editing}
        seatClasses={seatClasses}
        onSave={handleSave}
      />
    </div>
  );
};

export default FareClassPage;
