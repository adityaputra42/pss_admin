

type PageToken = number | 'ellipsis-left' | 'ellipsis-right';

const getPaginationPages = (
  currentPage: number,
  totalPages: number,
): PageToken[] => {
  const pages: PageToken[] = [];

  for (let page = 1; page <= totalPages; page++) {
    const shouldShow =
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1;

    if (!shouldShow) {
      if (page === 2 && currentPage > 3) {
        pages.push('ellipsis-left');
      }
      if (page === totalPages - 1 && currentPage < totalPages - 2) {
        pages.push('ellipsis-right');
      }
      continue;
    }

    pages.push(page);
  }

  return pages;
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const Pagination = ({ currentPage, totalPages, onPageChange, disabled }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className="border-t border-slate-100 px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Page{' '}
          <span className="font-semibold text-slate-800">{currentPage}</span>
          {' '}of{' '}
          <span className="font-semibold text-slate-800">{totalPages}</span>
        </p>

        <div className="flex items-center gap-1">
          <button
            disabled={disabled || currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-2 rounded border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {pages.map((page, idx) =>
            typeof page !== 'number' ? (
              <span key={`${page}-${idx}`} className="px-2 text-slate-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                disabled={disabled}
                onClick={() => onPageChange(page)}
                className={`min-w-9 px-3 py-2 rounded text-sm font-semibold ${
                  currentPage === page
                    ? 'bg-primary text-white shadow'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            disabled={disabled || currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-2 rounded border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
