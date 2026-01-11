'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Search, ChevronsLeft, ChevronsRight, Copy, Check } from 'lucide-react';
import { StudentDetailsModal } from './student-details-modal';
import type { Student } from '@/types/student';

// Extend ColumnDef meta type
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue> {
    isSticky?: boolean;
    stickyLeft?: number;
    hasColorCoding?: boolean;
  }
}

interface StudentTableProps {
  students: Student[];
}

export function StudentTable({ students }: StudentTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleCopy = useCallback(async (value: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Lấy tất cả subjects từ students
  const allSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    students.forEach(student => {
      student.grades.forEach(grade => {
        subjectSet.add(grade.subjectName);
      });
    });
    return Array.from(subjectSet).sort();
  }, [students]);

  const columns = useMemo<ColumnDef<Student>[]>(
    () => {
      const baseColumns: ColumnDef<Student>[] = [
        {
          accessorKey: 'troyId',
          header: 'ID TROY',
          cell: (info) => {
            const value = String(info.getValue());
            const isCopied = copiedValue === value;
            return (
              <div className="flex items-center gap-1.5 group/cell">
                <span className="text-sm">{value}</span>
                <button
                  onClick={(e) => handleCopy(value, e)}
                  className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 rounded cursor-pointer"
                  title="Copy"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
              </div>
            );
          },
          size: 110,
        },
        {
          accessorKey: 'vnuId',
          header: 'ID VNU',
          cell: (info) => {
            const value = String(info.getValue());
            const isCopied = copiedValue === value;
            return (
              <div className="flex items-center gap-1.5 group/cell">
                <span className="text-sm font-medium">{value}</span>
                <button
                  onClick={(e) => handleCopy(value, e)}
                  className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 rounded cursor-pointer"
                  title="Copy"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
              </div>
            );
          },
          size: 120,
          meta: { isSticky: true, stickyLeft: 0 },
        },
        {
          accessorKey: 'fullName',
          header: 'Họ và Tên',
          cell: (info) => {
            const value = String(info.getValue());
            const isCopied = copiedValue === value;
            return (
              <div className="flex items-center gap-1.5 group/cell">
                <span className="text-sm font-semibold">{value}</span>
                <button
                  onClick={(e) => handleCopy(value, e)}
                  className="opacity-0 group-hover/cell:opacity-100 transition-opacity p-0.5 hover:bg-gray-200 rounded cursor-pointer"
                  title="Copy"
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                  )}
                </button>
              </div>
            );
          },
          size: 200,
          meta: { isSticky: true, stickyLeft: 120 },
        },
        {
          accessorKey: 'class',
          header: 'Lớp',
          cell: (info) => <span className="text-sm">{String(info.getValue())}</span>,
          size: 90,
        },
        {
          accessorKey: 'dateOfBirth',
          header: 'Ngày sinh',
          cell: (info) => <span className="text-sm">{String(info.getValue())}</span>,
          size: 100,
        },
      ];

      const subjectColumns: ColumnDef<Student>[] = allSubjects.map((subject) => ({
        id: `subject-${subject}`,
        header: subject,
        cell: (info) => {
          const student = info.row.original;
          const gradeInfo = student.grades.find((g) => g.subjectName === subject);
          
          if (!gradeInfo) {
            return <span className="text-gray-300 text-sm">-</span>;
          }
          
          const displayGrade = gradeInfo.grades.join(',');
          
          return (
            <div className={`flex flex-col items-center py-0.5 px-1 rounded ${
              gradeInfo.needsRetake ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <span
                className={`text-sm font-bold ${
                  gradeInfo.needsRetake ? 'text-red-700' : 'text-green-700'
                }`}
              >
                {displayGrade}
              </span>
            </div>
          );
        },
        size: 65,
        meta: { hasColorCoding: true },
      }));

      return [...baseColumns, ...subjectColumns];
    },
    [allSubjects, copiedValue, handleCopy]
  );

  const table = useReactTable({
    data: students,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Update page size when changed
  useMemo(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  return (
    <div className="w-full">
      {/* Compact Search Bar */}
      <div className="mb-3 flex items-center gap-2 px-4 pt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm: tên, ID TROY, ID VNU, lớp..."
            className="w-full pl-10 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-600">Hiển thị:</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {[25, 50, 100, 200].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Compact Info hint */}
      <div className="mb-2 px-4 flex items-center justify-between">
        <div className="text-[10px] text-gray-500 flex items-center gap-1.5">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
            💡 Click dòng → chi tiết
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
            📌 Sticky
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-semibold">
            Đạt
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
            Học lại
          </span>
        </div>
        <div className="text-xs text-gray-600 font-medium">
          {allSubjects.length} môn
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSticky = header.column.columnDef.meta?.isSticky;
                  const stickyLeft = header.column.columnDef.meta?.stickyLeft;
                  
                  return (
                    <th
                      key={header.id}
                      className={`px-3 py-2 text-xs font-semibold text-gray-700 tracking-wide cursor-pointer hover:bg-gray-100 border-r border-gray-200 last:border-r-0 ${
                        ['troyId', 'vnuId', 'fullName', 'class'].includes(header.id) ? 'text-left' : 'text-center'
                      } ${isSticky ? 'sticky bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ 
                        minWidth: header.column.columnDef.size,
                        ...(isSticky ? { left: `${stickyLeft}px` } : {})
                      }}
                    >
                      <div className={`flex items-center gap-1 ${
                        ['troyId', 'vnuId', 'fullName', 'class'].includes(header.id) ? 'justify-start' : 'justify-center'
                      }`}>
                        <span className="truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        <span className="text-[10px]">
                          {{
                            asc: '🔼',
                            desc: '🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id} 
                className="group hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => setSelectedStudent(row.original)}
              >
                {row.getVisibleCells().map((cell) => {
                  const isSticky = cell.column.columnDef.meta?.isSticky;
                  const stickyLeft = cell.column.columnDef.meta?.stickyLeft;
                  
                  return (
                    <td
                      key={cell.id}
                      className={`px-3 py-2 text-sm text-gray-900 whitespace-nowrap border-r border-gray-100 last:border-r-0 transition-colors ${
                        ['troyId', 'vnuId', 'fullName', 'class'].includes(cell.column.id) ? 'text-left' : 'text-center'
                      } ${isSticky ? 'sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''} ${
                        isSticky ? 'group-hover:bg-blue-50 bg-white' : ''
                      }`}
                      style={{
                        ...(isSticky ? { left: `${stickyLeft}px` } : {})
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Compact Pagination */}
      <div className="px-4 py-2 flex items-center justify-between bg-gray-50 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          {table.getState().pagination.pageIndex * pageSize + 1} - {Math.min(
            (table.getState().pagination.pageIndex + 1) * pageSize,
            table.getFilteredRowModel().rows.length
          )} / <span className="font-semibold">{table.getFilteredRowModel().rows.length}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Trang đầu"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-700 px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Trang cuối"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Student Details Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}

