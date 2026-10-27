import React, { useState, useMemo, useEffect } from 'react';
import GlassCard from './GlassCard.jsx';
import Input from './Input.jsx';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchKey = 'name',
  onRowClick = null,
  emptyMessage = 'No records found',
  headerRight = null,
  defaultPageSize = 8,
  className = '',
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const handleSort = (key) => {
    setCurrentPage(1);
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter((item) => {
        if (typeof searchKey === 'function') {
          return searchKey(item, q);
        }
        const val = item[searchKey];
        if (typeof val === 'string') return val.toLowerCase().includes(q);
        if (typeof val === 'number') return val.toString().includes(q);
        // Fallback: search all primitive values in object
        return Object.values(item).some(
          (v) => typeof v === 'string' && v.toLowerCase().includes(q)
        );
      });
    }

    if (sortKey) {
      result.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [data, query, sortKey, sortOrder, searchKey]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const startEntry = filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, filteredData.length);

  return (
    <GlassCard variant="white" className={`p-0 overflow-hidden ${className}`}>
      {(searchable || headerRight) && (
        <div className="p-4 md:p-6 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
          {searchable ? (
            <div className="w-full max-w-xs">
              <Input
                variant="pill"
                icon={Search}
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          ) : (
            <div />
          )}
          {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/5 bg-[#FAFAFC] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              {columns.map((col) => {
                const canSort = col.sortable !== false;
                const isSorted = sortKey === col.accessor;
                return (
                  <th
                    key={col.header}
                    onClick={() => canSort && col.accessor && handleSort(col.accessor)}
                    className={`py-3.5 px-6 select-none ${
                      canSort && col.accessor ? 'cursor-pointer hover:text-[#0B0B0F]' : ''
                    } ${col.align === 'right' ? 'text-right' : ''}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end w-full' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {canSort && col.accessor && (
                        <span className="text-[#94A3B8]">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#0B0B0F]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#0B0B0F]" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04] text-sm">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-[#F8F8FA] active:bg-[#F2F2F6]'
                      : 'hover:bg-[#FDFDFE]'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={`py-4 px-6 ${
                        col.align === 'right' ? 'text-right' : ''
                      }`}
                    >
                      {col.render
                        ? col.render(row)
                        : col.accessor
                        ? row[col.accessor]
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-[#94A3B8] font-medium"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3.5 border-t border-black/5 bg-[#FAFAFC] flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-[#0B0B0F]">{startEntry}</strong>–
            <strong className="text-[#0B0B0F]">{endEntry}</strong> of{' '}
            <strong className="text-[#0B0B0F]">{filteredData.length}</strong> entries
            {filteredData.length !== data.length && ` (filtered from ${data.length})`}
          </span>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCurrentPage(1);
              }}
              className="text-violet-600 hover:text-violet-700 font-semibold underline cursor-pointer"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-black/10 bg-white text-[#0B0B0F] font-semibold focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={15}>15</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-black/10 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#0B0B0F]" />
            </button>
            <span className="px-2.5 font-semibold text-[#0B0B0F]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-black/10 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#0B0B0F]" />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

