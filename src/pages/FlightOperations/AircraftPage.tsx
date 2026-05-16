
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
      setAircrafts(response ?? []);
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

  const totalSeats = filteredAircrafts.reduce(
    (acc, item) => acc + (item.total_seats || 0),
    0,
  );

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

            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Plane className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Total Seats
              </p>

              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {totalSeats}
              </h3>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
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

            <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
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
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
          />
        </div>

        <select
          value={manufacturerFilter}
          onChange={(e) => setManufacturerFilter(e.target.value)}
          className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
        >
          {manufacturers.map((manufacturer) => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer === 'ALL' ? 'All Manufacturers' : manufacturer}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full premium-card p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>

            <p className="text-slate-500 font-medium italic">
              Loading aircraft fleet...
            </p>
          </div>
        ) : filteredAircrafts.length === 0 ? (
          <div className="col-span-full premium-card p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8" />
            </div>

            <p className="text-slate-500 font-medium">
              No aircraft found
            </p>
          </div>
        ) : (
          filteredAircrafts.map((aircraft) => (
            <div
              key={aircraft.id}
              className="premium-card p-6 hover:shadow-2xl transition-all duration-300 border border-slate-100"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                  <Plane className="w-8 h-8" />
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-xl transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(aircraft)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {aircraft.model}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    {aircraft.manufacturer}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Total Seats
                    </p>

                    <h4 className="text-2xl font-bold text-slate-900 mt-2">
                      {aircraft.total_seats}
                    </h4>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Manufacturer
                    </p>

                    <h4 className="text-lg font-bold text-slate-900 mt-2 truncate">
                      {aircraft.manufacturer}
                    </h4>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      Aircraft ID
                    </p>

                    <p className="text-xs text-slate-500 mt-1 break-all max-w-[180px]">
                      {aircraft.id}
                    </p>
                  </div>

                  <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-secondary transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AircraftPage;

