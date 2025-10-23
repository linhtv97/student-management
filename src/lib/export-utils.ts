import * as XLSX from 'xlsx';
import type { Student } from '@/types/student';
import type { ConsolidatedStudent } from '@/types/consolidated';

// Export danh sách sinh viên cần học lại (Group theo sinh viên)
export function exportRetakeStudents(students: Student[]) {
  // Lọc sinh viên có môn cần học lại
  const retakeData: Array<{
    'STT': number;
    'ID TROY': string;
    'ID VNU': string;
    'Họ và Tên': string;
    'Lớp': string;
    'Khoá': string;
    'Số môn học lại': number;
    'Danh sách môn học lại': string;
    'Chi tiết điểm': string;
  }> = [];

  let stt = 1;

  for (const student of students) {
    const retakeSubjects = student.grades.filter((g) => g.needsRetake);
    
    if (retakeSubjects.length > 0) {
      // Tạo danh sách môn học lại
      const subjectList = retakeSubjects.map((subject, index) => 
        `${index + 1}. ${subject.subjectName}`
      ).join('\n');

      // Tạo chi tiết điểm cho từng môn
      const gradeDetails = retakeSubjects.map((subject, index) => 
        `${index + 1}. ${subject.subjectName}: ${subject.grades.join(' → ')} (${subject.grades.length} lần thi)`
      ).join('\n');

      retakeData.push({
        'STT': stt++,
        'ID TROY': student.troyId,
        'ID VNU': student.vnuId,
        'Họ và Tên': student.fullName,
        'Lớp': student.class,
        'Khoá': student.course,
        'Số môn học lại': retakeSubjects.length,
        'Danh sách môn học lại': subjectList,
        'Chi tiết điểm': gradeDetails,
      });
    }
  }

  // Tạo workbook
  const ws = XLSX.utils.json_to_sheet(retakeData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách học lại');

  // Set column widths
  const colWidths = [
    { wch: 5 },  // STT
    { wch: 15 }, // ID TROY
    { wch: 15 }, // ID VNU
    { wch: 25 }, // Họ và Tên
    { wch: 10 }, // Lớp
    { wch: 10 }, // Khoá
    { wch: 12 }, // Số môn học lại
    { wch: 50 }, // Danh sách môn học lại
    { wch: 60 }, // Chi tiết điểm
  ];
  ws['!cols'] = colWidths;

  // Set row heights để hiển thị multi-line tốt hơn
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const dataRow = retakeData[R - 1];
    if (dataRow && dataRow['Số môn học lại'] > 1) {
      const height = Math.max(15 * dataRow['Số môn học lại'], 30);
      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][R] = { hpt: height };
    }
  }

  // Enable text wrapping for multi-line cells
  const cellRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = cellRange.s.r; R <= cellRange.e.r; ++R) {
    for (let C = cellRange.s.c; C <= cellRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      if (!ws[cellAddress].s) ws[cellAddress].s = {};
      ws[cellAddress].s.alignment = { wrapText: true, vertical: 'top' };
    }
  }

  // Download file
  XLSX.writeFile(wb, `danh-sach-hoc-lai-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export tất cả sinh viên
export function exportAllStudents(students: Student[]) {
  const exportData = students.map((student, index) => ({
    'STT': index + 1,
    'ID TROY': student.troyId,
    'ID VNU': student.vnuId,
    'Họ và Tên': student.fullName,
    'Giới tính': student.gender,
    'Ngày sinh': student.dateOfBirth,
    'Lớp': student.class,
    'Khoá': student.course,
    'Chương trình': student.program,
    'Tổng môn': student.grades.length,
    'Môn đạt': student.grades.filter((g) => !g.needsRetake).length,
    'Môn học lại': student.grades.filter((g) => g.needsRetake).length,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sinh viên');

  const colWidths = [
    { wch: 5 },  // STT
    { wch: 15 }, // ID TROY
    { wch: 15 }, // ID VNU
    { wch: 25 }, // Họ và Tên
    { wch: 10 }, // Giới tính
    { wch: 12 }, // Ngày sinh
    { wch: 10 }, // Lớp
    { wch: 10 }, // Khoá
    { wch: 20 }, // Chương trình
    { wch: 10 }, // Tổng môn
    { wch: 10 }, // Môn đạt
    { wch: 12 }, // Môn học lại
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `danh-sach-sinh-vien-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export danh sách tổng hợp: Sinh viên có môn đăng ký bị học lại (Group theo sinh viên)
export function exportConsolidatedRetake(consolidatedStudents: ConsolidatedStudent[]) {
  const retakeData: Array<{
    'STT': number;
    'Mã sinh viên': string;
    'ID TROY': string;
    'ID VNU': string;
    'Họ và Tên': string;
    'Lớp': string;
    'Khoá': string;
    'Số môn học lại': number;
    'Danh sách môn học lại': string;
    'Chi tiết điểm': string;
  }> = [];

  let stt = 1;

  for (const student of consolidatedStudents) {
    // Lọc các môn đã đăng ký VÀ có điểm VÀ cần học lại
    const retakeSubjects = student.registeredWithGrades.filter(
      (item) => item.status === 'registered-with-grade' && item.gradeInfo?.needsRetake
    );

    if (retakeSubjects.length > 0) {
      // Tạo danh sách môn học lại
      const subjectList = retakeSubjects.map((item, index) => 
        `${index + 1}. ${item.subjectName}`
      ).join('\n');

      // Tạo chi tiết điểm cho từng môn
      const gradeDetails = retakeSubjects.map((item, index) => {
        if (item.gradeInfo) {
          return `${index + 1}. ${item.subjectName}: ${item.gradeInfo.grades.join(' → ')} (${item.gradeInfo.grades.length} lần thi)`;
        }
        return '';
      }).join('\n');

      retakeData.push({
        'STT': stt++,
        'Mã sinh viên': student.studentId,
        'ID TROY': student.troyId || '',
        'ID VNU': student.vnuId || '',
        'Họ và Tên': student.fullName,
        'Lớp': student.className,
        'Khoá': student.course,
        'Số môn học lại': retakeSubjects.length,
        'Danh sách môn học lại': subjectList,
        'Chi tiết điểm': gradeDetails,
      });
    }
  }

  // Tạo workbook
  const ws = XLSX.utils.json_to_sheet(retakeData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sinh viên học lại');

  // Set column widths
  const colWidths = [
    { wch: 5 },  // STT
    { wch: 15 }, // Mã sinh viên
    { wch: 15 }, // ID TROY
    { wch: 15 }, // ID VNU
    { wch: 25 }, // Họ và Tên
    { wch: 10 }, // Lớp
    { wch: 10 }, // Khoá
    { wch: 12 }, // Số môn học lại
    { wch: 50 }, // Danh sách môn học lại
    { wch: 60 }, // Chi tiết điểm
  ];
  ws['!cols'] = colWidths;

  // Set row heights để hiển thị multi-line tốt hơn
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    // Tính số dòng trong cell dựa trên số môn học lại
    const dataRow = retakeData[R - 1];
    if (dataRow && dataRow['Số môn học lại'] > 1) {
      // Mỗi môn = 1 dòng, height = 15 per line
      const height = Math.max(15 * dataRow['Số môn học lại'], 30);
      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][R] = { hpt: height };
    }
  }

  // Enable text wrapping for multi-line cells
  const cellRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let R = cellRange.s.r; R <= cellRange.e.r; ++R) {
    for (let C = cellRange.s.c; C <= cellRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      if (!ws[cellAddress].s) ws[cellAddress].s = {};
      ws[cellAddress].s.alignment = { wrapText: true, vertical: 'top' };
    }
  }

  // Download file
  XLSX.writeFile(wb, `danh-sach-sinh-vien-hoc-lai-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export danh sách tổng hợp: Tất cả sinh viên có đăng ký môn
export function exportConsolidatedAll(consolidatedStudents: ConsolidatedStudent[]) {
  const allData: Array<{
    'STT': number;
    'Mã sinh viên': string;
    'ID TROY': string;
    'ID VNU': string;
    'Họ và Tên': string;
    'Lớp': string;
    'Khoá': string;
    'Ngày sinh': string;
    'Email': string;
    'Tổng môn ĐK': number;
    'Tổng tín ĐK': number;
    'Môn có điểm': number;
    'Môn đạt': number;
    'Môn học lại': number;
    'Môn chưa điểm': number;
  }> = [];

  let stt = 1;

  for (const student of consolidatedStudents) {
    // Tính toán thống kê
    const registeredWithGrade = student.registeredWithGrades.filter(
      (i) => i.status === 'registered-with-grade'
    ).length;
    
    const registeredPassed = student.registeredWithGrades.filter(
      (i) => i.status === 'registered-with-grade' && i.gradeInfo && !i.gradeInfo.needsRetake
    ).length;
    
    const registeredRetake = student.registeredWithGrades.filter(
      (i) => i.status === 'registered-with-grade' && i.gradeInfo && i.gradeInfo.needsRetake
    ).length;
    
    const registeredNoGrade = student.registeredWithGrades.filter(
      (i) => i.status === 'registered-no-grade'
    ).length;

    allData.push({
      'STT': stt++,
      'Mã sinh viên': student.studentId,
      'ID TROY': student.troyId || '',
      'ID VNU': student.vnuId || '',
      'Họ và Tên': student.fullName,
      'Lớp': student.className,
      'Khoá': student.course,
      'Ngày sinh': student.dateOfBirth,
      'Email': student.email || '',
      'Tổng môn ĐK': student.totalSubjects,
      'Tổng tín ĐK': student.registeredCredits,
      'Môn có điểm': registeredWithGrade,
      'Môn đạt': registeredPassed,
      'Môn học lại': registeredRetake,
      'Môn chưa điểm': registeredNoGrade,
    });
  }

  // Tạo workbook
  const ws = XLSX.utils.json_to_sheet(allData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tổng hợp ĐK & Điểm');

  // Set column widths
  const colWidths = [
    { wch: 5 },  // STT
    { wch: 15 }, // Mã sinh viên
    { wch: 15 }, // ID TROY
    { wch: 15 }, // ID VNU
    { wch: 25 }, // Họ và Tên
    { wch: 10 }, // Lớp
    { wch: 10 }, // Khoá
    { wch: 12 }, // Ngày sinh
    { wch: 25 }, // Email
    { wch: 12 }, // Tổng môn ĐK
    { wch: 12 }, // Tổng tín ĐK
    { wch: 12 }, // Môn có điểm
    { wch: 10 }, // Môn đạt
    { wch: 12 }, // Môn học lại
    { wch: 13 }, // Môn chưa điểm
  ];
  ws['!cols'] = colWidths;

  // Download file
  XLSX.writeFile(wb, `tong-hop-dk-diem-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export chi tiết từng môn cho sinh viên (detailed export)
export function exportConsolidatedDetailed(consolidatedStudents: ConsolidatedStudent[]) {
  const detailedData: Array<{
    'STT': number;
    'Mã sinh viên': string;
    'Họ và Tên': string;
    'Lớp': string;
    'Môn học': string;
    'Đã đăng ký': string;
    'Có điểm': string;
    'Điểm': string;
    'Trạng thái': string;
    'Số lần thi': number | string;
  }> = [];

  let stt = 1;

  for (const student of consolidatedStudents) {
    for (const item of student.registeredWithGrades) {
      let status = '';
      let hasGrade = 'Không';
      let isRegistered = item.isRegistered ? 'Có' : 'Không';
      let gradeDisplay = '-';
      let attemptCount: number | string = '-';

      if (item.status === 'registered-with-grade' && item.gradeInfo) {
        hasGrade = 'Có';
        gradeDisplay = item.gradeInfo.grades.join(' → ');
        status = item.gradeInfo.needsRetake ? 'Cần học lại' : 'Đã đạt';
        attemptCount = item.gradeInfo.grades.length;
      } else if (item.status === 'registered-no-grade') {
        hasGrade = 'Không';
        status = 'Chưa có điểm';
      } else if (item.status === 'not-registered-with-grade' && item.gradeInfo) {
        hasGrade = 'Có';
        gradeDisplay = item.gradeInfo.grades.join(' → ');
        status = item.gradeInfo.needsRetake ? 'Có điểm - Cần học lại' : 'Có điểm - Đã đạt';
        attemptCount = item.gradeInfo.grades.length;
      } else {
        status = 'Chưa đăng ký & chưa điểm';
      }

      detailedData.push({
        'STT': stt++,
        'Mã sinh viên': student.studentId,
        'Họ và Tên': student.fullName,
        'Lớp': student.className,
        'Môn học': item.subjectName,
        'Đã đăng ký': isRegistered,
        'Có điểm': hasGrade,
        'Điểm': gradeDisplay,
        'Trạng thái': status,
        'Số lần thi': attemptCount,
      });
    }
  }

  // Tạo workbook
  const ws = XLSX.utils.json_to_sheet(detailedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Chi tiết từng môn');

  // Set column widths
  const colWidths = [
    { wch: 5 },  // STT
    { wch: 15 }, // Mã sinh viên
    { wch: 25 }, // Họ và Tên
    { wch: 10 }, // Lớp
    { wch: 40 }, // Môn học
    { wch: 12 }, // Đã đăng ký
    { wch: 10 }, // Có điểm
    { wch: 20 }, // Điểm
    { wch: 20 }, // Trạng thái
    { wch: 12 }, // Số lần thi
  ];
  ws['!cols'] = colWidths;

  // Download file
  XLSX.writeFile(wb, `chi-tiet-tung-mon-${new Date().toISOString().split('T')[0]}.xlsx`);
}

