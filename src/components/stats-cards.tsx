'use client';

import { Users, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Student } from '@/types/student';

interface StatsCardsProps {
  students: Student[];
}

export function StatsCards({ students }: StatsCardsProps) {
  // Tính toán thống kê
  const totalStudents = students.length;
  
  const totalSubjects = students.reduce((sum, student) => sum + student.grades.length, 0);
  const avgSubjectsPerStudent = totalStudents > 0 ? (totalSubjects / totalStudents).toFixed(1) : '0';
  
  const studentsWithRetake = students.filter(s => 
    s.grades.some(g => g.needsRetake)
  ).length;
  
  const totalRetakeSubjects = students.reduce((sum, student) => 
    sum + student.grades.filter(g => g.needsRetake).length, 0
  );

  const stats = [
    {
      label: 'Tổng sinh viên',
      value: totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Trung bình môn/SV',
      value: avgSubjectsPerStudent,
      icon: BookOpen,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      label: 'SV cần học lại',
      value: studentsWithRetake,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
    {
      label: 'Tổng môn học lại',
      value: totalRetakeSubjects,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center gap-3"
          >
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <Icon className={`w-5 h-5 ${stat.textColor}`} />
            </div>
            <div>
              <p className="text-xs text-gray-600">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

