import { useEffect, useMemo, useState } from 'react';
import {
  Armchair,
  Plus,
  Search,
  Edit3,
  Trash2,
} from 'lucide-react';

import { seatClassesApi } from '../../services/api-services';
import type { SeatClass } from '../../types/api';

import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from '../../utils/alerts';

import SeatClassModal from '../../components/flight/SeatClassModal';

const PAGE_LIMIT = 10;

const SeatClassPage = () => {

  const [seatClasses, setSeatClasses] =
    useState<SeatClass[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<SeatClass | null>(null);

  const fetchSeatClasses = async () => {
    setLoading(true);

    try {
      const res =
        await seatClassesApi.getSeatClasses();

      setSeatClasses(
        res.Items ?? [],
      );

      setCurrentPage(1);
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message ||
          'Failed to fetch seat classes',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatClasses();
  }, []);

  // ============================================================
  // Search / Filter
  // ============================================================

  const filteredSeatClasses =
    useMemo(() => {
      const keyword =
        search.trim().toLowerCase();

      if (!keyword) {
        return seatClasses;
      }

      return seatClasses.filter(
        (seatClass) =>
          seatClass.code
            ?.toLowerCase()
            .includes(keyword) ||
          seatClass.name
            ?.toLowerCase()
            .includes(keyword),
      );
    }, [
      seatClasses,
      search,
    ]);


  const totalSeatClasses =
    filteredSeatClasses.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalSeatClasses /
        PAGE_LIMIT,
    ),
  );

  const paginatedSeatClasses =
    useMemo(() => {
      const startIndex =
        (currentPage - 1) *
        PAGE_LIMIT;

      return filteredSeatClasses.slice(
        startIndex,
        startIndex + PAGE_LIMIT,
      );
    }, [
      filteredSeatClasses,
      currentPage,
    ]);


  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
  // Save
  // ============================================================

  const handleSave = async (
    data: {
      code?: string;
      name: string;
    },
    id: number | null,
  ) => {
    try {
      if (id) {
        await seatClassesApi.updateSeatClass(
          id,
          data,
        );
      } else {
        await seatClassesApi.createSeatClass(
          data as {
            code: string;
            name: string;
          },
        );
      }

      showSuccessAlert(
        id
          ? 'Seat class updated'
          : 'Seat class created',
      );

      setModalOpen(false);

      fetchSeatClasses();
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message ||
          'Failed to save seat class',
      );
    }
  };

  // ============================================================
  // Delete
  // ============================================================

  const handleDelete = async (
    seatClass: SeatClass,
  ) => {
    const confirmed =
      await showConfirmAlert(
        'Delete Seat Class',
        `Delete "${seatClass.name}"? Fare classes or aircraft seat layouts still referencing it may be affected.`,
      );

    if (!confirmed) return;

    try {
      await seatClassesApi.deleteSeatClass(
        seatClass.id,
      );

      showSuccessAlert(
        'Seat class deleted',
      );

      fetchSeatClasses();
    } catch (error: any) {
      showErrorAlert(
        error?.response?.data?.message ||
          'Failed to delete seat class',
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

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Seat Classes
          </h1>

          <p className="text-slate-500 mt-1">
            Manage cabin seat classes -- Economy, Premium Economy, Business, First.
          </p>

        </div>

        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="premium-button bg-primary text-white hover:bg-secondary shadow-lg shadow-teal-200 flex items-center gap-2 self-start lg:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Seat Class</span>
        </button>

      </div>

      {/* ========================================================
          Search
      ======================================================== */}

      <div className="premium-card p-4 flex flex-col lg:flex-row gap-4 lg:items-center">

        <div className="relative flex-1 group">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search seat class code or name..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-slate-50 border-none rounded py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-teal-500/20 outline-none"
          />

        </div>

        <div className="text-sm text-slate-500 font-medium whitespace-nowrap">

          Showing{' '}

          <span className="text-slate-900 font-bold">
            {paginatedSeatClasses.length}
          </span>

          {' '}of{' '}

          <span className="text-slate-900 font-bold">
            {totalSeatClasses}
          </span>

          {' '}seat classes

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
              Loading seat classes...
            </p>

          </div>

        ) : filteredSeatClasses.length === 0 ? (

          <div className="p-20 text-center">

            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-md flex items-center justify-center mx-auto mb-4">

              <Armchair className="w-8 h-8" />

            </div>

            <p className="text-slate-500 font-medium">
              No seat classes found
            </p>

          </div>

        ) : (

          <>

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>

                  <tr className="border-b border-slate-50 bg-slate-50/50">

                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Code
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Seat Class ID
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-50">

                  {paginatedSeatClasses.map(
                    (seatClass) => (

                      <tr
                        key={seatClass.id}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >

                        <td className="px-6 py-4 whitespace-nowrap">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">

                              <Armchair className="w-5 h-5" />

                            </div>

                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase tracking-wider">
                              {seatClass.code}
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {seatClass.name}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                          {seatClass.id}
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap">

                          <div className="flex items-center justify-end gap-1">

                            <button
                              onClick={() => {
                                setEditing(
                                  seatClass,
                                );
                                setModalOpen(
                                  true,
                                );
                              }}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded transition-all"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(
                                  seatClass,
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

                  {/* Previous */}

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

                  {/* Page Numbers */}

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
                            currentPage ===
                            page
                              ? 'bg-primary text-white shadow'
                              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    },
                  )}

                  {/* Next */}

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

      {/* ========================================================
          Modal
      ======================================================== */}

      <SeatClassModal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        seatClass={editing}
        onSave={handleSave}
      />

    </div>
  );
};

export default SeatClassPage;

