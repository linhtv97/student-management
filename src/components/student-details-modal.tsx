'use client';

import { X } from 'lucide-react';
import type { Student } from '@/types/student';

interface StudentDetailsModalProps {
  student: Student | null;
  onClose: () => void;
}

export function StudentDetailsModal({ student, onClose }: StudentDetailsModalProps) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Chi tiết Sinh viên</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Student Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Họ và Tên</p>
              <p className="font-semibold text-lg">{student.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Giới tính</p>
              <p className="font-semibold">{student.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày sinh</p>
              <p className="font-semibold">{student.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID TROY</p>
              <p className="font-semibold font-mono">{student.troyId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID VNU</p>
              <p className="font-semibold font-mono">{student.vnuId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Lớp</p>
              <p className="font-semibold">{student.class}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Khoá</p>
              <p className="font-semibold">{student.course}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Chương trình</p>
              <p className="font-semibold">{student.program}</p>
            </div>
          </div>

          {/* Grades */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Bảng điểm chi tiết</h3>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                  ✓ = Đạt
                </span>
                <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded">
                  ✗ = Học lại
                </span>
              </div>
            </div>
            
            {student.grades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Môn học
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Lịch sử điểm
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Số lần học
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Điểm mới nhất
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {student.grades.map((grade, index) => (
                      <tr 
                        key={index} 
                        className={`hover:bg-gray-50 ${
                          grade.needsRetake ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {grade.subjectName}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {grade.grades.map((g, idx) => (
                              <span key={idx}>
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                    g === 'D' || g === 'D+' || g === 'F'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {g}
                                </span>
                                {idx < grade.grades.length - 1 && (
                                  <span className="text-gray-400 mx-0.5">,</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                            {grade.grades.length}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                              grade.needsRetake
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {grade.latestGrade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {grade.needsRetake ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ✗ Học lại
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Đạt
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Summary */}
                <div className="mt-4 flex gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Tổng số môn</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {student.grades.length}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Môn đạt</p>
                    <p className="text-2xl font-bold text-green-600">
                      {student.grades.filter((g) => !g.needsRetake).length}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Môn học lại</p>
                    <p className="text-2xl font-bold text-red-600">
                      {student.grades.filter((g) => g.needsRetake).length}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Chưa có dữ liệu điểm
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

