'use client';

import { useState, useEffect } from 'react';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { parseExcelFile } from '@/lib/excel-parser';
import type { Student, CourseRegistration } from '@/types/student';

interface FileUploadProps {
  onUploadComplete: (fileType: 'bang-diem-full' | 'bang-dang-ki-mon') => void;
  defaultFileType?: 'bang-diem-full' | 'bang-dang-ki-mon';
}

export function FileUpload({ onUploadComplete, defaultFileType = 'bang-diem-full' }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileType, setFileType] = useState<'bang-diem-full' | 'bang-dang-ki-mon'>(defaultFileType);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync fileType with defaultFileType when it changes (tab switch)
  useEffect(() => {
    setFileType(defaultFileType);
  }, [defaultFileType]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset messages
    setError(null);
    setSuccess(null);
    setIsUploading(true);

    try {
      // Đọc file
      const arrayBuffer = await file.arrayBuffer();
      
      // Parse file Excel
      const data = parseExcelFile(arrayBuffer, fileType);
      console.log('📁 Dữ liệu sau khi parse:', data.length, 'records');
      
      // Import vào IndexedDB
      if (fileType === 'bang-diem-full') {
        const students = data as Student[];
        console.log('💾 Đang lưu vào IndexedDB...', students.length, 'sinh viên');
        await db.importStudents(students);
        console.log('✅ Đã lưu thành công vào IndexedDB');
        
        // Verify data saved
        const savedCount = await db.students.count();
        console.log('🔍 Verify: Tổng sinh viên trong DB:', savedCount);
        
        setSuccess(`Đã import thành công ${data.length} sinh viên!`);
      } else {
        await db.importCourseRegistrations(data as CourseRegistration[]);
        setSuccess(`Đã import thành công ${data.length} đăng ký môn học!`);
      }
      
      // Notify parent component with fileType
      onUploadComplete(fileType);
      
      // Reset input
      event.target.value = '';
    } catch (err) {
      console.error('Error importing file:', err);
      setError(`Lỗi khi import file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Import File Excel
        </h3>
        <p className="text-xs text-gray-600">
          Chọn loại file và tải lên file Excel
        </p>
      </div>

      {/* File Type Selection */}
      <div className="mb-3 flex items-center gap-2">
        <label className="text-xs text-gray-600 font-medium whitespace-nowrap">Loại file:</label>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value as 'bang-diem-full' | 'bang-dang-ki-mon')}
          disabled={isUploading}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white w-64"
        >
          <option value="bang-diem-full">Bảng điểm tổng hợp</option>
          <option value="bang-dang-ki-mon">Bảng đăng ký môn</option>
        </select>
      </div>

      {/* File Upload Area */}
      <div className="relative">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`flex items-center justify-center w-full h-14 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isUploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-600">Đang xử lý file...</p>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-blue-500" />
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Click để chọn file</span> hoặc kéo thả (.xlsx, .xls)
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-green-600" />
          <p className="text-xs text-green-800">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}

