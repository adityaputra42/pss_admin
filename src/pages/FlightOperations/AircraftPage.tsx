import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Plane,
  Plus,
  Search,
  Edit3,
  Trash2,
  Users,
  Building2,
  LayoutGrid,
} from 'lucide-react';

import { aircraftsApi } from '../../services/api-services/aircraft';
import type { Aircraft } from '../../types/api';

import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

import AircraftFormModal from '../../components/flight/AircraftFormModal';

const PAGE_LIMIT = 10;

const AircraftPage = () => {
  const navigate = useNavigate();

  // ============================================================
  // State
  // ============================================================

  const [aircrafts, setAircrafts] =
    useState<Aircraft[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [manufacturerFilter, setManufacturerFilter] =
    useState('ALL');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingAircraft, setEditingAircraft] =
    useState<Aircraft | null>(null);

  // ============================================================
  // Fetch
  // ============================================================

  const fetchAircrafts = async () => {
    setLoading(true);

    try {
      const response =
        await aircraftsApi.getAircrafts();

      setAircrafts(
        response.Items ?? [],
      );

      setCurrentPage(1);
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message ||
          'Failed to fetch aircrafts',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAircrafts();
  }, []);

  // ============================================================
  // Manufacturers
  // ============================================================

  const manufacturers = useMemo(() => {
    return [
      'ALL',
      ...new Set(
        aircrafts.map(
          (item) => item.manufacturer,
        ),
      ),
    ];
  }, [aircrafts]);

  // ============================================================
  // Filter
  // ============================================================

  const filteredAircrafts = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return aircrafts.filter(
      (aircraft) => {
        const matchesSearch =
          !keyword ||
          aircraft.model
            ?.toLowerCase()
            .includes(keyword) ||
          aircraft.manufacturer
            ?.toLowerCase()
            .includes(keyword) ||
          aircraft.registration_number
            ?.toLowerCase()
            .includes(keyword);

        const matchesManufacturer =
          manufacturerFilter === 'ALL' ||
          aircraft.manufacturer ===
            manufacturerFilter;

        return (
          matchesSearch &&
          matchesManufacturer
        );
      },
    );
  }, [
    aircrafts,
    search,
    manufacturerFilter,
  ]);

  // ============================================================
  // Pagination
  // ============================================================

  const totalAircrafts =
    filteredAircrafts.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalAircrafts / PAGE_LIMIT,
    ),
  );

  const paginatedAircrafts =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        PAGE_LIMIT;

      return filteredAircrafts.slice(
        startIndex,
        startIndex + PAGE_LIMIT,
      );
    }, [
      filteredAircrafts,
      currentPage,
    ]);

  // ============================================================
  // Reset Pagination
  // ============================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    manufacturerFilter,
  ]);

  // ============================================================
  // Keep Page Valid
  // ============================================================

  useEffect(() => {
    if (
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

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
        Math.abs(
          page - currentPage,
        ) <= 1;

      if (!shouldShow) {
        if (
          page === 2 &&
          currentPage > 3
        ) {
          pages.push(
            'ellipsis-left',
          );
        }

        if (
          page === totalPages - 1 &&
          currentPage <
            totalPages - 2
        ) {
          pages.push(
            'ellipsis-right',
          );
        }

        continue;
      }

      pages.push(page);
    }

    return pages;
  }, [
    totalPages,
    currentPage,
  ]);

  // ============================================================
  // Delete
  // ============================================================

  const handleDelete = async (
    aircraft: Aircraft,
  ) => {
    const confirmed =
      await showConfirmAlert(
        'Delete Aircraft',
        `Delete aircraft ${aircraft.model}?`,
      );

    if (!confirmed) return;

    try {
      await aircraftsApi.deleteAircraft(
        aircraft.id,
      );

      showSuccessAlert(
        'Aircraft deleted successfully',
      );

      fetchAircrafts();
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message ||
          'Failed to delete aircraft',
      );
    }
  };

  // ============================================================
  // Save
  // ============================================================

  const handleSave = async (
    data: {
      manufacturer: string;
      model: string;
      registration_number?: string;
    },
    id: number | null,
  ) => {
    try {
      if (id) {
        await aircraftsApi.updateAircraft(
          id,
          {
            manufacturer:
              data.manufacturer,
            model: data.model,
          },
        );
      } else {
        await aircraftsApi.createAircraft(
          data as {
            manufacturer: string;
            model: string;
            registration_number: string;
          },
        );
      }

      showSuccessAlert(
        id
          ? 'Aircraft updated'
          : 'Aircraft created',
      );

      setModalOpen(false);

      fetchAircrafts();
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message ||
          'Failed to save aircraft',
      );
    }
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Aircraft Fleet
          </h1>

          <p className="text-slate-500 mt-1">
            Manage aircraft inventory, fleet capacity and manufacturers.
          </p>

        </div>

        <button
          onClick={() => {
            setEditingAircraft(null);
            setModalOpen(true);
          }}
          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2 self-start lg:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Aircraft</span>
        </button>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="premium-card p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-slate-500 font-medium">
                Total Aircrafts
              </p>

              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {totalAircrafts}
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
                {totalAircrafts}
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

      {/* Search */}

      <div className="premium-card p-4 flex flex-col lg:flex-row gap-4 lg:items-center">

        <div className="relative flex-1 group">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search aircraft model or manufacturer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-slate-50 border-none rounded py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
          />

        </div>

        <select
          value={manufacturerFilter}
          onChange={(e) =>
            setManufacturerFilter(
              e.target.value,
            )
          }
          className="bg-slate-50 border-none rounded px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
        >

          {manufacturers.map(
            (manufacturer) => (
              <option
                key={manufacturer}
                value={manufacturer}
              >
                {manufacturer === 'ALL'
                  ? 'All Manufacturers'
                  : manufacturer}
              </option>
            ),
          )}

        </select>

        <div className="text-sm text-slate-500 font-medium whitespace-nowrap">

          Showing{' '}

          <span className="text-slate-900 font-bold">
            {paginatedAircrafts.length}
          </span>

          {' '}of{' '}

          <span className="text-slate-900 font-bold">
            {totalAircrafts}
          </span>

          {' '}aircrafts

        </div>

      </div>

      {/* Table */}

      <div className="premium-card overflow-hidden">

        {loading ? (

          <div className="p-20 flex flex-col items-center justify-center gap-4">

            <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />

            <p className="text-slate-500 font-medium italic">
              Loading aircraft fleet...
            </p>

          </div>

        ) : filteredAircrafts.length === 0 ? (

          <div className="p-20 text-center">

            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8" />
            </div>

            <p className="text-slate-500 font-medium">
              No aircraft found
            </p>

          </div>

        ) : (

          <>

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>

                  <tr className="border-b border-slate-50 bg-slate-50/50">

                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Model
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Manufacturer
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Registration
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Aircraft ID
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-50">

                  {paginatedAircrafts.map(
                    (aircraft) => (

                      <tr
                        key={aircraft.id}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >

                        <td className="px-6 py-4 whitespace-nowrap">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">

                              <Plane className="w-5 h-5" />

                            </div>

                            <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                              {aircraft.model}
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                          {aircraft.manufacturer}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">

                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase tracking-wider">
                            {aircraft.registration_number}
                          </span>

                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 break-all max-w-45">
                          {aircraft.id}
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap">

                          <div className="flex items-center justify-end gap-1">

                            <button
                              onClick={() =>
                                navigate(
                                  `/aircraft/${aircraft.id}`,
                                )
                              }
                              className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all"
                              title="View seat layout"
                            >
                              <LayoutGrid className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingAircraft(
                                  aircraft,
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
                                  aircraft,
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

            {/* Pagination */}

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
                    disabled={
                      currentPage === 1
                    }
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

      <AircraftFormModal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        aircraft={editingAircraft}
        onSave={handleSave}
      />

    </div>
  );
};

export default AircraftPage;
