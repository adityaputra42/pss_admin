import { useEffect, useMemo, useState } from 'react';
import {
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

import AirportFormModal from '../../components/flight/AirportFormModal';

const PAGE_LIMIT = 10;

const AirportPage = () => {
  // ============================================================
  // State
  // ============================================================

  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAirport, setEditingAirport] =
    useState<Airport | null>(null);

  // ============================================================
  // Fetch Airports
  // ============================================================

  const fetchAirports = async () => {
    setLoading(true);

    try {
      const response = await airportsApi.getAirports();

      setAirports(response?.Items ?? []);
      setCurrentPage(1);
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message ||
          'Failed to fetch airports',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirports();
  }, []);

  // ============================================================
  // Filter
  // ============================================================

  const filteredAirports = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return airports;
    }

    return airports.filter((airport) => {
      return (
        airport.code
          ?.toLowerCase()
          .includes(keyword) ||
        airport.name
          ?.toLowerCase()
          .includes(keyword) ||
        airport.city
          ?.toLowerCase()
          .includes(keyword) ||
        airport.country
          ?.toLowerCase()
          .includes(keyword) ||
        airport.timezone
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [airports, search]);

  // ============================================================
  // Pagination
  // ============================================================

  const totalAirports = filteredAirports.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalAirports / PAGE_LIMIT),
  );

  const paginatedAirports = useMemo(() => {
    const startIndex =
      (currentPage - 1) * PAGE_LIMIT;

    return filteredAirports.slice(
      startIndex,
      startIndex + PAGE_LIMIT,
    );
  }, [
    filteredAirports,
    currentPage,
  ]);

  // ============================================================
  // Reset Page when Search Changes
  // ============================================================

  const handleSearchChange = (
    value: string,
  ) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // ============================================================
  // Keep Current Page Valid
  // ============================================================

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ============================================================
  // Page Numbers
  // ============================================================

  const paginationPages = useMemo(() => {
    const pages: (
      | number
      | 'ellipsis-left'
      | 'ellipsis-right'
    )[] = [];

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      const shouldShow =
        page === 1 ||
        page === totalPages ||
        Math.abs(page - currentPage) <= 1;

      if (!shouldShow) {
        if (
          page === 2 &&
          currentPage > 3
        ) {
          pages.push('ellipsis-left');
        }

        if (
          page === totalPages - 1 &&
          currentPage < totalPages - 2
        ) {
          pages.push('ellipsis-right');
        }

        continue;
      }

      pages.push(page);
    }

    return pages;
  }, [totalPages, currentPage]);

  // ============================================================
  // Delete
  // ============================================================

  const handleDelete = async (
    airport: Airport,
  ) => {
    const confirmed = await showConfirmAlert(
      'Delete Airport',
      `Delete airport ${airport.code}?`,
    );

    if (!confirmed) return;

    try {
      await airportsApi.deleteAirport(
        airport.id,
      );

      showSuccessAlert(
        'Airport deleted successfully',
      );

      fetchAirports();
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message ||
          'Failed to delete airport',
      );
    }
  };

  // ============================================================
  // Save
  // ============================================================

  const handleSave = async (
    data: {
      code?: string;
      name: string;
      city: string;
      country: string;
      timezone: string;
    },
    id: number | null,
  ) => {
    try {
      if (id) {
        await airportsApi.updateAirport(
          id,
          {
            name: data.name,
            city: data.city,
            country: data.country,
            timezone: data.timezone,
          },
        );
      } else {
        await airportsApi.createAirport(
          data as {
            code: string;
            name: string;
            city: string;
            country: string;
            timezone: string;
          },
        );
      }

      showSuccessAlert(
        id
          ? 'Airport updated'
          : 'Airport created',
      );

      setModalOpen(false);

      fetchAirports();
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message ||
          'Failed to save airport',
      );
    }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ========================================================
          Header
      ======================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Airports
          </h1>

          <p className="text-slate-500 mt-1">
            Manage airport master data and route destinations.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAirport(null);
            setModalOpen(true);
          }}
          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Airport</span>
        </button>

      </div>

      {/* ========================================================
          Search
      ======================================================== */}

      <div className="premium-card p-4 flex flex-col md:flex-row gap-4 items-center">

        <div className="relative flex-1 group w-full">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search airport code, city, country..."
            value={search}
            onChange={(e) =>
              handleSearchChange(
                e.target.value,
              )
            }
            className="w-full bg-slate-50 border-none rounded py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
          />

        </div>

        <div className="text-sm text-slate-500 font-medium whitespace-nowrap">

          Showing{' '}

          <span className="text-slate-900 font-bold">
            {paginatedAirports.length}
          </span>

          {' '}of{' '}

          <span className="text-slate-900 font-bold">
            {totalAirports}
          </span>

          {' '}airports

        </div>

      </div>

      {/* ========================================================
          Table
      ======================================================== */}

      <div className="premium-card overflow-hidden">

        {loading ? (

          <div className="p-20 flex flex-col items-center justify-center gap-4">

            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />

            <p className="text-slate-500 font-medium italic">
              Loading airports...
            </p>

          </div>

        ) : filteredAirports.length === 0 ? (

          <div className="p-20 text-center">

            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">

              <MapPin className="w-8 h-8" />

            </div>

            <p className="text-slate-500 font-medium">
              No airports found
            </p>

          </div>

        ) : (

          <>

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

                  {paginatedAirports.map(
                    (airport) => (

                      <tr
                        key={airport.id}
                        className="hover:bg-slate-50 transition-colors"
                      >

                        <td className="px-6 py-4 whitespace-nowrap">

                          <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">
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

                            <button
                              onClick={() => {
                                setEditingAirport(
                                  airport,
                                );
                                setModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  airport,
                                )
                              }
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>

                        </td>

                      </tr>

                    ),
                  )}

                </tbody>

              </table>

            </div>

            {/* ====================================================
                Pagination
            ==================================================== */}

            <div className="border-t border-slate-100 px-6 py-4">

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                <p className="text-sm text-slate-500">

                  Page{' '}

                  <span className="font-semibold text-slate-800">
                    {currentPage}
                  </span>

                  {' '}of{' '}

                  <span className="font-semibold text-slate-800">
                    {totalPages}
                  </span>

                </p>

                <div className="flex items-center gap-1">

                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage(
                        currentPage - 1,
                      )
                    }
                    className="px-3 py-2 rounded border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {paginationPages.map(
                    (page) => {

                      if (
                        typeof page !==
                        'number'
                      ) {
                        return (
                          <span
                            key={page}
                            className="px-2 text-slate-400"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={page}
                          onClick={() =>
                            setCurrentPage(
                              page,
                            )
                          }
                          className={`min-w-9 px-3 py-2 rounded text-sm font-semibold ${
                            currentPage === page
                              ? 'bg-primary text-white shadow'
                              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    },
                  )}

                  <button
                    disabled={
                      currentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        currentPage + 1,
                      )
                    }
                    className="px-3 py-2 rounded border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>

                </div>

              </div>

            </div>

          </>

        )}

      </div>

      <AirportFormModal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        airport={editingAirport}
        onSave={handleSave}
      />

    </div>
  );
};

export default AirportPage;
