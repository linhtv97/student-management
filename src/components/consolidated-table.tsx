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
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import type { ConsolidatedStudent } from '@/types/consolidated';

// Extend ColumnDef meta type
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue> {
    isSticky?: boolean;
    stickyLeft?: number;
  }
}

interface ConsolidatedTableProps {
  data: ConsolidatedStudent[];
}

export function ConsolidatedTable({ data }: ConsolidatedTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageSize, setPageSize] = useState(50);
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

  // Lấy tất cả subjects
  const allSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    data.forEach(student => {
      student.registeredWithGrades.forEach(item => {
        subjectSet.add(item.subjectName);
      });
    });
    return Array.from(subjectSet).sort();
  }, [data]);

  console.log("allSubjects", allSubjects);

  const columns = useMemo<ColumnDef<ConsolidatedStudent>[]>(
    () => {
      const baseColumns: ColumnDef<ConsolidatedStudent>[] = [
        {
          accessorKey: 'studentId',
          header: 'Mã SV',
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
          accessorKey: 'className',
          header: 'Lớp',
          cell: (info) => <span className="text-sm">{String(info.getValue())}</span>,
          size: 90,
        },
        {
          accessorKey: 'totalSubjects',
          header: 'SL ĐK',
          cell: (info) => <span className="text-sm font-semibold">{String(info.getValue())}</span>,
          size: 65,
        },
        {
          id: 'gradeCount',
          header: 'SL Điểm',
          cell: (info) => {
            const count = info.row.original.grades.length;
            return <span className="text-sm font-semibold text-blue-600">{count}</span>;
          },
          size: 70,
        },
      ];

      // Tạo dynamic columns cho từng môn
      const subjectColumns: ColumnDef<ConsolidatedStudent>[] = allSubjects.map((subject) => ({
        id: `subject-${subject}`,
        header: subject,
        cell: (info) => {
          const student = info.row.original;
          const item = student.registeredWithGrades.find(i => i.subjectName === subject);
          
          if (!item) {
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-gray-300 text-sm cursor-help">-</span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-gray-900">📚 {subject}</div>
                    <div className="text-gray-600">❌ Chưa đăng ký</div>
                    <div className="text-gray-600">❌ Chưa có điểm</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }
          
          // Đã đăng ký + có điểm
          if (item.status === 'registered-with-grade' && item.gradeInfo) {
            const displayGrade = item.gradeInfo.grades.join(',');
            const gradeHistory = item.gradeInfo.grades.join(' → ');
            const statusText = item.gradeInfo.needsRetake ? '❌ Cần học lại' : '✅ Đã đạt';
            const attemptCount = item.gradeInfo.grades.length;
            
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex flex-col items-center justify-center py-1 px-1 rounded relative cursor-help ${
                    item.gradeInfo.needsRetake ? 'bg-red-100 hover:bg-red-200' : 'bg-green-100 hover:bg-green-200'
                  }`}>
                    {/* Dấu tick góc trên bên phải để show đã đăng ký */}
                    <span className="absolute top-0 right-0.5 text-[10px]">✓</span>
                    
                    {/* Điểm số */}
                    <span className={`text-sm font-bold ${
                      item.gradeInfo.needsRetake ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {displayGrade}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-gray-900">📚 {subject}</div>
                    <div className="text-gray-700">✓ Đã đăng ký môn học</div>
                    <div className="text-gray-700">📊 Điểm: <span className="font-semibold">{gradeHistory}</span></div>
                    <div className="text-gray-700">📈 Số lần thi: <span className="font-semibold">{attemptCount}</span></div>
                    <div className={`font-semibold ${item.gradeInfo.needsRetake ? 'text-red-700' : 'text-green-700'}`}>
                      {statusText}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }
          
          // Đã đăng ký nhưng chưa có điểm
          if (item.status === 'registered-no-grade') {
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center py-0.5 px-1 rounded bg-blue-100 hover:bg-blue-200 cursor-help">
                    <span className="text-sm font-bold text-blue-700">
                      ✓
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-gray-900">📚 {subject}</div>
                    <div className="text-gray-700">✓ Đã đăng ký môn học</div>
                    <div className="text-orange-600 font-semibold">⚠️ Chưa có điểm</div>
                    <div className="text-gray-600 italic">💡 Có thể chưa thi hoặc chưa có kết quả</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }
          
          // Có điểm nhưng chưa đăng ký (case đặc biệt)
          if (item.status === 'not-registered-with-grade' && item.gradeInfo) {
            const displayGrade = item.gradeInfo.grades.join(',');
            const gradeHistory = item.gradeInfo.grades.join(' → ');
            const statusText = item.gradeInfo.needsRetake ? '❌ Cần học lại' : '✅ Đã đạt';
            const attemptCount = item.gradeInfo.grades.length;
            
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex flex-col items-center py-0.5 px-1 rounded border-2 cursor-help ${
                    item.gradeInfo.needsRetake ? 'border-red-300 bg-red-50 hover:bg-red-100' : 'border-green-300 bg-green-50 hover:bg-green-100'
                  }`}>
                    <span className={`text-xs font-medium ${
                      item.gradeInfo.needsRetake ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {displayGrade}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-gray-900">📚 {subject}</div>
                    <div className="text-orange-600 font-semibold">❌ Chưa đăng ký môn này</div>
                    <div className="text-gray-700">📊 Nhưng có điểm: <span className="font-semibold">{gradeHistory}</span></div>
                    <div className="text-gray-700">📈 Số lần thi: <span className="font-semibold">{attemptCount}</span></div>
                    <div className={`font-semibold ${item.gradeInfo.needsRetake ? 'text-red-700' : 'text-green-700'}`}>
                      {statusText}
                    </div>
                    <div className="text-gray-600 italic">💡 Có thể học kỳ trước hoặc dữ liệu không khớp</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }
          
          return <span className="text-gray-300 text-sm">-</span>;
        },
        size: 70,
      }));

      return [...baseColumns, ...subjectColumns];
    },
    [allSubjects, copiedValue, handleCopy]
  );

  const table = useReactTable({
    data,
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
  console.log("table", data);

  // Update page size when changed
  useMemo(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full">
      {/* Compact Search Bar */}
      <div className="mb-3 flex items-center gap-2 px-4 pt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Tìm kiếm: tên, mã SV, email, lớp..."
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
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
            📌 Sticky
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-semibold">
            🟢 ĐK + Điểm đạt
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold">
            🔴 ĐK + Học lại
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
            🔵 ĐK + Chưa điểm
          </span>
          <span className="text-[10px] text-gray-600">
            ✓ = Đã đăng ký
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
                        ['studentId', 'fullName', 'className'].includes(header.id) ? 'text-left' : 'text-center'
                      } ${isSticky ? 'sticky bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ 
                        minWidth: header.column.columnDef.size,
                        ...(isSticky ? { left: `${stickyLeft}px` } : {})
                      }}
                    >
                      <div className={`flex items-center gap-1 ${
                        ['studentId', 'fullName', 'className'].includes(header.id) ? 'justify-start' : 'justify-center'
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
                className="group hover:bg-blue-50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => {
                  const isSticky = cell.column.columnDef.meta?.isSticky;
                  const stickyLeft = cell.column.columnDef.meta?.stickyLeft;
                  
                  return (
                    <td
                      key={cell.id}
                      className={`px-3 py-2 text-sm text-gray-900 whitespace-nowrap border-r border-gray-100 last:border-r-0 transition-colors ${
                        ['studentId', 'fullName', 'className'].includes(cell.column.id) ? 'text-left' : 'text-center'
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
    </div>
    </TooltipProvider>
  );
}

