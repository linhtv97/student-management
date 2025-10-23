'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Student } from '@/types/student';

interface DebugPanelProps {
  students: Student[];
}

export function DebugPanel({ students }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (students.length === 0) return null;

  const totalGrades = students.reduce((sum, s) => sum + s.grades.length, 0);
  const totalRetake = students.reduce((sum, s) => sum + s.grades.filter(g => g.needsRetake).length, 0);
  const studentsWithRetake = students.filter(s => s.grades.some(g => g.needsRetake)).length;

  const sampleStudent = students[0];
  const sampleGrade = sampleStudent.grades[0];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden max-w-md">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-between"
        >
          <span className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-xs">
              🐛
            </span>
            Debug Info
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Content */}
        {isOpen && (
          <div className="p-4 text-xs space-y-3 max-h-96 overflow-y-auto">
            {/* Database Stats */}
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">📊 Database Stats</h4>
              <div className="space-y-1 pl-2 border-l-2 border-blue-500">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tổng sinh viên:</span>
                  <span className="font-mono text-green-400">{students.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tổng môn học:</span>
                  <span className="font-mono text-green-400">{totalGrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Môn học lại:</span>
                  <span className="font-mono text-red-400">{totalRetake}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">SV có học lại:</span>
                  <span className="font-mono text-orange-400">{studentsWithRetake}</span>
                </div>
              </div>
            </div>

            {/* Sample Data */}
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">📝 Sample Student</h4>
              <div className="space-y-1 pl-2 border-l-2 border-purple-500">
                <div>
                  <span className="text-gray-400">Tên: </span>
                  <span className="font-mono text-white">{sampleStudent.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-400">ID TROY: </span>
                  <span className="font-mono text-white">{sampleStudent.troyId}</span>
                </div>
                <div>
                  <span className="text-gray-400">Ngày sinh: </span>
                  <span className="font-mono text-white">{sampleStudent.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-gray-400">Số môn: </span>
                  <span className="font-mono text-white">{sampleStudent.grades.length}</span>
                </div>
              </div>
            </div>

            {/* Sample Grade */}
            {sampleGrade && (
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">📚 Sample Grade</h4>
                <div className="space-y-1 pl-2 border-l-2 border-yellow-500">
                  <div>
                    <span className="text-gray-400">Môn: </span>
                    <span className="font-mono text-white">{sampleGrade.subjectName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Điểm: </span>
                    <span className="font-mono text-white">{sampleGrade.grades.join(' → ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Điểm mới nhất: </span>
                    <span className={`font-mono font-bold ${sampleGrade.needsRetake ? 'text-red-400' : 'text-green-400'}`}>
                      {sampleGrade.latestGrade}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Học lại: </span>
                    <span className={`font-mono ${sampleGrade.needsRetake ? 'text-red-400' : 'text-green-400'}`}>
                      {sampleGrade.needsRetake ? 'CÓ' : 'KHÔNG'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Số lần học: </span>
                    <span className="font-mono text-blue-400">{sampleGrade.grades.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Console Hint */}
            <div className="pt-2 border-t border-gray-700">
              <p className="text-gray-400 text-xs">
                💡 Mở <span className="font-mono bg-gray-800 px-1 rounded">Console (F12)</span> để xem log chi tiết
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

