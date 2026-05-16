import { useEffect, useState } from 'react';
import {
  Plane,
  Plus,
  Search,
  Edit3,
  Trash2,
  MapPin,
} from 'lucide-react';
import { airportsApi } from '../../services/api-services/airport';
import type { Airport } from '../../types/api';
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

const AirportPage = () => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAirports = async () => {
    setLoading(true);

    try {
      const response = await airportsApi.getAirports();
      setAirports(response ?? []);
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message || 'Failed to fetch airports',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirports();
  }, []);

  const filteredAirports = airports.filter((airport) => {
    const keyword = search.toLowerCase();

    return (
      airport.code?.toLowerCase().includes(keyword) ||
      airport.name?.toLowerCase().includes(keyword) ||
      airport.city?.toLowerCase().includes(keyword) ||
      airport.country?.toLowerCase().includes(keyword)
    );
  });

  const handleDelete = async (airport: Airport) => {
    const confirmed = await showConfirmAlert(
      'Delete Airport',
      `Delete airport ${airport.code}?`,
    );

    if (!confirmed) return;

    try {
      await airportsApi.deleteAirport(airport.id);
      showSuccessAlert('Airport deleted successfully');
      fetchAirports();
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message || 'Failed to delete airport',
      );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Airports
          </h1>
          <p className="text-slate-500 mt-1">
            Manage airport master data and route destinations.
          </p>
        </div>

        <button className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-5 h-5" />
          <span>Add Airport</span>
        </button>
      </div>
  <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search airport code, city, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
          />
        </div>

        <div className="text-sm text-slate-500 font-medium">
          Total Airports:{' '}
          <span className="text-slate-900 font-bold">
            {filteredAirports.length}
          </span>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium italic">
              Loading airports...
            </p>
          </div>
        ) : filteredAirports.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8" />
            </div>

            <p className="text-slate-500 font-medium">
              No airports found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Airport
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    City
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Country
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Timezone
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredAirports.map((airport) => (
                  <tr
                    key={airport.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {airport.code}
                        </div>

                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {airport.name}
                          </div>

                          <div className="text-xs text-slate-500">
                            {airport.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {airport.city}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {airport.country}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {airport.timezone}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all">
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(airport)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
    </div>
  );
};
export default AirportPage;
