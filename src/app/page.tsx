'use client';

import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { FileUpload } from '@/components/file-upload';
import { StudentTable } from '@/components/student-table';
import { CourseRegistrationTable } from '@/components/course-registration-table';
import { ConsolidatedTable } from '@/components/consolidated-table';
import { StatsCards } from '@/components/stats-cards';
import { ConsolidatedStats } from '@/components/consolidated-stats';
import { DebugPanel } from '@/components/debug-panel';
import { db } from '@/lib/db';
import { exportRetakeStudents, exportAllStudents, exportConsolidatedRetake, exportConsolidatedAll, exportConsolidatedDetailed, exportConsolidatedNotRegistered, exportSubjectNotRegisteredStats } from '@/lib/export-utils';
import { consolidateData } from '@/types/consolidated';
import { GraduationCap, Trash2, Download, FileWarning, ChevronDown, ChevronUp } from 'lucide-react';

type TabType = 'bang-diem' | 'dang-ky-mon' | 'tong-hop';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('bang-diem');
  
  const students = useLiveQuery(
    async () => {
      const data = await db.students.toArray();
      return data;
    },
    [refreshKey]
  );

  const courseRegistrations = useLiveQuery(
    async () => {
      const data = await db.courseRegistrations.toArray();
      return data;
    },
    [refreshKey]
  );

  // Consolidated data
  const consolidatedData = useMemo(() => {
    if (!students || !courseRegistrations) return [];
    return consolidateData(students, courseRegistrations);
  }, [students, courseRegistrations]);

  // Auto show/hide upload based on data
  const [showUpload, setShowUpload] = useState(true);
  const hasData = (students && students.length > 0) || (courseRegistrations && courseRegistrations.length > 0);

  const handleUploadComplete = (fileType: 'bang-diem-full' | 'bang-dang-ki-mon') => {
    // Trigger refresh
    setRefreshKey(prev => prev + 1);
    // Auto collapse upload section to focus on table
    setShowUpload(false);
    // Auto switch to appropriate tab
    setActiveTab(fileType === 'bang-diem-full' ? 'bang-diem' : 'dang-ky-mon');
  };

  const handleClearData = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu?')) {
      await db.clearAll();
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleExportRetake = () => {
    if (students && students.length > 0) {
      exportRetakeStudents(students);
    }
  };

  const handleExportAll = () => {
    if (students && students.length > 0) {
      exportAllStudents(students);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-full px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-900">
                Quản lý Sinh viên
          </h1>
              <div className="ml-3 flex items-center gap-2">
                {students && students.length > 0 && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    {students.length} điểm
                  </span>
                )}
                {courseRegistrations && courseRegistrations.length > 0 && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                    {courseRegistrations.length} ĐK
                  </span>
                )}
              </div>
            </div>
            {hasData && (
              <div className="flex items-center gap-2">
                {activeTab === 'bang-diem' && students && students.length > 0 && (
                  <>
                    <button
                      onClick={handleExportRetake}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors cursor-pointer"
                    >
                      <FileWarning className="w-3.5 h-3.5" />
                      Export học lại
                    </button>
                    <button
                      onClick={handleExportAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export tất cả
                    </button>
                  </>
                )}
                {activeTab === 'tong-hop' && consolidatedData.length > 0 && (
                  <>
                    <button
                      onClick={() => exportConsolidatedRetake(consolidatedData)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors cursor-pointer"
                    >
                      <FileWarning className="w-3.5 h-3.5" />
                      Export môn ĐK học lại
                    </button>
                    <button
                      onClick={() => exportConsolidatedNotRegistered(consolidatedData, students || undefined, courseRegistrations || undefined)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors cursor-pointer"
                    >
                      <FileWarning className="w-3.5 h-3.5" />
                      Export môn chưa ĐK & chưa điểm
                    </button>
                    <button
                      onClick={() => exportSubjectNotRegisteredStats(consolidatedData)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Thống kê môn chưa ĐK & chưa điểm
                    </button>
                    <button
                      onClick={() => exportConsolidatedDetailed(consolidatedData)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export chi tiết
                    </button>
                    <button
                      onClick={() => exportConsolidatedAll(consolidatedData)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export tổng hợp
                    </button>
                  </>
                )}
                <button
                  onClick={handleClearData}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-4">
        {/* Collapsible File Upload Section */}
        {hasData ? (
          <div className="mb-4">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 cursor-pointer"
            >
              {showUpload ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span className="text-xs font-semibold text-gray-700">
                {showUpload ? 'Thu gọn' : 'Hiện'} Import File Excel
              </span>
            </button>
            {showUpload && (
              <div className="mt-2 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <FileUpload 
                  onUploadComplete={handleUploadComplete}
                  defaultFileType={
                    activeTab === 'dang-ky-mon' ? 'bang-dang-ki-mon' : 'bang-diem-full'
                  }
                />
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <FileUpload 
              onUploadComplete={handleUploadComplete}
              defaultFileType={
                activeTab === 'dang-ky-mon' ? 'bang-dang-ki-mon' : 'bang-diem-full'
              }
            />
          </div>
        )}

        {/* Tabs Navigation */}
        {hasData && (
          <div className="mb-3 flex items-center gap-1 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab('bang-diem')}
              className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'bang-diem'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Bảng điểm
              {students && students.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'bang-diem' ? 'bg-blue-500' : 'bg-gray-200 text-gray-700'
                }`}>
                  {students.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('dang-ky-mon')}
              className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'dang-ky-mon'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📝 Đăng ký môn
              {courseRegistrations && courseRegistrations.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'dang-ky-mon' ? 'bg-blue-500' : 'bg-gray-200 text-gray-700'
                }`}>
                  {courseRegistrations.length}
                </span>
              )}
            </button>
            {consolidatedData.length > 0 && (
              <button
                onClick={() => setActiveTab('tong-hop')}
                className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === 'tong-hop'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔗 Tổng hợp
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'tong-hop' ? 'bg-purple-500' : 'bg-gray-200 text-gray-700'
                }`}>
                  {consolidatedData.length}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Table Content based on active tab */}
        {hasData ? (
          <>
            {/* Compact Stats Cards */}
            {activeTab === 'bang-diem' && students && students.length > 0 && (
              <div className="mb-3">
                <StatsCards students={students} />
              </div>
            )}
            
            {activeTab === 'tong-hop' && consolidatedData.length > 0 && (
              <div className="mb-3">
                <ConsolidatedStats data={consolidatedData} />
              </div>
            )}

            {/* Full-width Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              {activeTab === 'bang-diem' ? (
                students && students.length > 0 ? (
                  <StudentTable students={students} />
                ) : (
                  <div className="p-12 text-center">
                    <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có dữ liệu bảng điểm
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vui lòng import file Bảng điểm tổng hợp
                    </p>
                  </div>
                )
              ) : activeTab === 'dang-ky-mon' ? (
                courseRegistrations && courseRegistrations.length > 0 ? (
                  <CourseRegistrationTable registrations={courseRegistrations} />
                ) : (
                  <div className="p-12 text-center">
                    <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có dữ liệu đăng ký môn
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vui lòng import file Bảng đăng ký môn
                    </p>
                  </div>
                )
              ) : (
                consolidatedData.length > 0 ? (
                  <ConsolidatedTable data={consolidatedData} />
                ) : (
                  <div className="p-12 text-center">
                    <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Cần import cả 2 file để xem tổng hợp
                    </h3>
                    <p className="text-sm text-gray-600">
                      Vui lòng import cả Bảng điểm tổng hợp và Bảng đăng ký môn
                    </p>
                  </div>
                )
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có dữ liệu
            </h3>
            <p className="text-sm text-gray-600">
              Vui lòng tải lên file Excel để bắt đầu
            </p>
        </div>
        )}
      </main>

    </div>
  );
}
