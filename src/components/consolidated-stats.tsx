'use client';

import { Users, CheckCircle, AlertTriangle, FileQuestion } from 'lucide-react';
import type { ConsolidatedStudent } from '@/types/consolidated';

interface ConsolidatedStatsProps {
  data: ConsolidatedStudent[];
}

export function ConsolidatedStats({ data }: ConsolidatedStatsProps) {
  // Tính toán thống kê
  const totalStudents = data.length;
  
  // Đã đăng ký và có điểm
  const withGrades = data.reduce((sum, student) => 
    sum + student.registeredWithGrades.filter(r => r.status === 'registered-with-grade').length, 0
  );
  
  // Đã đăng ký nhưng chưa có điểm
  const noGrades = data.reduce((sum, student) => 
    sum + student.registeredWithGrades.filter(r => r.status === 'registered-no-grade').length, 0
  );
  
  // Cần học lại (trong các môn đã đăng ký)
  const needRetake = data.reduce((sum, student) => 
    sum + student.registeredWithGrades.filter(r => 
      r.status === 'registered-with-grade' && r.gradeInfo?.needsRetake
    ).length, 0
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
      label: 'Môn ĐK + có điểm',
      value: withGrades,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      label: 'Môn ĐK + học lại',
      value: needRetake,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
    {
      label: 'Môn ĐK + chưa điểm',
      value: noGrades,
      icon: FileQuestion,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
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

