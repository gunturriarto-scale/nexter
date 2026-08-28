"use client";

import { useMemo, useState, type ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export type SortValue = string | number | boolean | null | undefined;

export interface DataTableColumn<Row> {
  /** Stable identifier for the column, also the sort key. */
  key: string;
  header: ReactNode;
  /** Cell renderer. `index` is the absolute row index across the full sorted set. */
  cell: (row: Row, index: number) => ReactNode;
  /** Provide to make the column sortable. */
  sortAccessor?: (row: Row) => SortValue;
  /** Extra classes for this column's <th>. */
  headClassName?: string;
  /** Extra classes for this column's <td>. */
  cellClassName?: string;
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row, index: number) => string | number;
  initialSort?: { key: string; direction: SortDirection };
  initialPageSize?: number;
  pageSizeOptions?: number[];
  /** Minimum table width in px — enables horizontal scroll on small screens. */
  minWidth?: number;
  /** Base text size for the table body. */
  size?: "sm" | "xs";
  /** Base padding/classes applied to every <td>. */
  cellClassName?: string;
  emptyMessage?: string;
  /** Extra classes per row (highlighting etc.). */
  rowClassName?: (row: Row, index: number) => string | undefined;
  /** Rendered between the table and the pager (e.g. a source note). */
  note?: ReactNode;
}

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

function compare(a: SortValue, b: SortValue): number {
  const aNil = a === null || a === undefined || a === "";
  const bNil = b === null || b === undefined || b === "";
  if (aNil && bNil) return 0;
  if (aNil) return 1; // nulls always sort last
  if (bNil) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return a === b ? 0 : a ? -1 : 1;
  return String(a).localeCompare(String(b), "id", { numeric: true, sensitivity: "base" });
}

function SortIndicator({ state }: { state: SortDirection | null }) {
  return (
    <span className="ml-1 inline-block w-2 text-[9px] text-[#2563EB]">
      {state === "asc" ? "▲" : state === "desc" ? "▼" : ""}
    </span>
  );
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  initialSort,
  initialPageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  minWidth,
  size = "sm",
  cellClassName = "px-3 py-2",
  emptyMessage = "Tidak ada data.",
  rowClassName,
  note,
}: DataTableProps<Row>) {
  const sizeOptions = useMemo(() => {
    const set = Array.from(new Set([...pageSizeOptions, initialPageSize])).filter((n) => n > 0);
    return set.sort((a, b) => a - b);
  }, [pageSizeOptions, initialPageSize]);

  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(initialSort ?? null);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortAccessor) return rows;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...rows]
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const result = compare(column.sortAccessor!(a.row), column.sortAccessor!(b.row));
        return result !== 0 ? result * factor : a.index - b.index;
      })
      .map((entry) => entry.row);
  }, [rows, columns, sort]);

  const total = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // `page` may lag behind the data (e.g. rows filtered away upstream); clamp on read.
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visibleRows = sortedRows.slice(start, start + pageSize);

  function changePageSize(next: number) {
    setPageSize(next);
    setPage(1);
  }

  const sizeClass = size === "xs" ? "text-[11px]" : "text-sm";

  function toggleSort(column: DataTableColumn<Row>) {
    if (!column.sortAccessor) return;
    setSort((current) =>
      current?.key !== column.key
        ? { key: column.key, direction: "asc" }
        : { key: column.key, direction: current.direction === "asc" ? "desc" : "asc" }
    );
    setPage(1);
  }

  return (
    <div>
      <div className="gfx-table-wrap gfx-table-scroll overflow-x-auto">
        <table className={`w-full text-left ${sizeClass}`} style={minWidth ? { minWidth } : undefined}>
          <thead>
            <tr>
              {columns.map((column) => {
                const active = sort?.key === column.key ? sort.direction : null;
                const sortable = Boolean(column.sortAccessor);
                return (
                  <th
                    key={column.key}
                    className={`gfx-th px-3 py-2 ${sortable ? "cursor-pointer select-none hover:text-[#2563EB]" : ""} ${column.headClassName ?? ""}`}
                    onClick={sortable ? () => toggleSort(column) : undefined}
                    aria-sort={active ? (active === "asc" ? "ascending" : "descending") : undefined}
                  >
                    <span className="inline-flex items-center">
                      {column.header}
                      {sortable && <SortIndicator state={active} />}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-[#7A8AA3]">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {visibleRows.map((row, i) => {
              const absoluteIndex = start + i;
              return (
                <tr key={rowKey(row, absoluteIndex)} className={`gfx-row-border ${rowClassName?.(row, absoluteIndex) ?? ""}`}>
                  {columns.map((column) => (
                    <td key={column.key} className={`${cellClassName} ${column.cellClassName ?? ""}`}>
                      {column.cell(row, absoluteIndex)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {note && <div className="mt-2 text-[11px] text-[#7A8AA3]">{note}</div>}

      {total > 0 && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#7A8AA3]">
          <label className="flex items-center gap-2">
            <span>Baris per halaman</span>
            <select
              className="gfx-select !min-h-0 !py-1 !text-[11px]"
              value={pageSize}
              onChange={(event) => changePageSize(Number(event.target.value))}
            >
              {sizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-3">
            <span>
              {total === 0 ? "0" : `${start + 1}–${Math.min(start + pageSize, total)}`} dari {total}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                className="rounded-none border border-[#CDD9E6] px-2 py-1 font-semibold text-[#536984] transition-colors enabled:hover:border-[#2563EB] enabled:hover:text-[#2563EB] disabled:opacity-40"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1}
              >
                Sebelumnya
              </button>
              <button
                type="button"
                className="rounded-none border border-[#CDD9E6] px-2 py-1 font-semibold text-[#536984] transition-colors enabled:hover:border-[#2563EB] enabled:hover:text-[#2563EB] disabled:opacity-40"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage >= totalPages}
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
