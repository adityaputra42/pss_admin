
import { useEffect, useMemo, useState } from 'react';
import {
  Plane,
  Plus,
  Search,
  Edit3,
  Trash2,
  Users,
  Building2,
} from 'lucide-react';
import { aircraftsApi } from '../../services/api-services/aircraft';
import type { Aircraft } from '../../types/api';
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

const AircraftPage = () => {
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('ALL');

  const fetchAircrafts = async () => {
    setLoading(true);

    try {
      const response = await aircraftsApi.getAircrafts();
      setAircrafts(response.Items ?? []);
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message || 'Failed to fetch aircrafts',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAircrafts();
  }, []);

  const manufacturers = useMemo(() => {
    return [
      'ALL',
      ...new Set(aircrafts.map((item) => item.manufacturer)),
    ];
  }, [aircrafts]);

  const filteredAircrafts = aircrafts.filter((aircraft) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      aircraft.model?.toLowerCase().includes(keyword) ||
      aircraft.manufacturer?.toLowerCase().includes(keyword);

    const matchesManufacturer =
      manufacturerFilter === 'ALL' ||
      aircraft.manufacturer === manufacturerFilter;

    return matchesSearch && matchesManufacturer;
  });

  const handleDelete = async (aircraft: Aircraft) => {
    const confirmed = await showConfirmAlert(
      'Delete Aircraft',
      `Delete aircraft ${aircraft.model}?`,
    );

    if (!confirmed) return;

    try {
      await aircraftsApi.deleteAircraft(aircraft.id);
      showSuccessAlert('Aircraft deleted successfully');
      fetchAircrafts();
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message || 'Failed to delete aircraft',
      );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Aircraft Fleet
          </h1>

          <p className="text-slate-500 mt-1">
            Manage aircraft inventory, fleet capacity and manufacturers.
          </p>
        </div>

        <button className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2 self-start lg:self-auto">
          <Plus className="w-5 h-5" />
          <span>Add Aircraft</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Total Aircrafts
              </p>

              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {filteredAircrafts.length}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Plane className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Registered Fleet
              </p>

              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {filteredAircrafts.length}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Seat counts aren't returned here -- see each aircraft's seat layout.
              </p>
            </div>

            <div className="w-14 h-14 rounded-md bg-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Manufacturers
              </p>

              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {manufacturers.length - 1}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-md bg-violet-100 flex items-center justify-center text-violet-600">
              <Building2 className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      <div className="premium-card p-4 flex flex-col lg:flex-row gap-4 lg:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search aircraft model or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
          />
        </div>

        <select
          value={manufacturerFilter}
          onChange={(e) => setManufacturerFilter(e.target.value)}
          className="bg-slate-50 border-none rounded px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
        >
          {manufacturers.map((manufacturer) => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer === 'ALL' ? 'All Manufacturers' : manufacturer}
            </option>
          ))}
        </select>
      </div>

      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium italic">Loading aircraft fleet...</p>
          </div>
        ) : filteredAircrafts.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">No aircraft found</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Model</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Manufacturer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Registration</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Aircraft ID</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAircrafts.map((aircraft) => (
                <tr key={aircraft.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Plane className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{aircraft.model}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{aircraft.manufacturer}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase tracking-wider">
                      {aircraft.registration_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 break-all max-w-45">{aircraft.id}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(aircraft)}
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
    </div>
  );
};

export default AircraftPage;

