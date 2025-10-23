import * as XLSX from 'xlsx';
import type { Student, CourseRegistration, GradeType, SubjectGrade } from '@/types/student';

// ==================== HELPER FUNCTIONS ====================

/**
 * Chuyển đổi số cột (0-based) sang ký tự cột Excel (A, B, ..., AA, AB, ...)
 */
function getColumnLetter(colIndex: number): string {
  let letter = '';
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
}

/**
 * Chuyển đổi ký tự cột Excel sang số (0-based)
 */
function columnLetterToIndex(letter: string): number {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + (letter.charCodeAt(i) - 64);
  }
  return index - 1;
}

// ==================== PARSE FUNCTIONS ====================

/**
 * Parse điểm từ string (ví dụ: "AA" -> ["A", "A"], "C+D" -> ["C+", "D"])
 */
function parseGrades(gradeString: string): SubjectGrade | null {
  if (!gradeString || gradeString.trim() === '') return null;
  
  const grades: GradeType[] = [];
  const validGrades: GradeType[] = ['A+', 'B+', 'C+', 'D+', 'A', 'B', 'C', 'D', 'F'];
  
  let i = 0;
  const str = gradeString.trim();
  
  while (i < str.length) {
    let found = false;
    
    // Kiểm tra điểm có dấu + trước (2 ký tự)
    for (const grade of validGrades) {
      if (str.substring(i, i + grade.length) === grade) {
        grades.push(grade);
        i += grade.length;
        found = true;
        break;
      }
    }
    
    if (!found) {
      i++; // Bỏ qua ký tự không hợp lệ
    }
  }
  
  if (grades.length === 0) return null;
  
  const latestGrade = grades[grades.length - 1];
  const needsRetake = latestGrade === 'D' || latestGrade === 'D+' || latestGrade === 'F';
  
  return {
    subjectName: '',
    grades,
    latestGrade,
    needsRetake,
  };
}

// Hàm helper để convert Excel date serial number sang dd/mm/yyyy
function excelDateToString(serial: number): string {
  // Excel epoch: 30/12/1899 (not 1/1/1900 to avoid leap year bug)
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const jsDate = new Date(excelEpoch.getTime() + serial * 86400000);
  
  const day = String(jsDate.getUTCDate()).padStart(2, '0');
  const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
  const year = jsDate.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
}

// Hàm helper để lấy giá trị cell
function getCellValue(worksheet: XLSX.WorkSheet, cell: string): string {
  const cellData = worksheet[cell];
  if (!cellData) return '';
  return cellData.v?.toString() || '';
}

// Hàm helper để lấy giá trị ngày từ cell
function getDateValue(worksheet: XLSX.WorkSheet, cell: string): string {
  const cellData = worksheet[cell];
  if (!cellData) return '';
  
  // Nếu là số (Excel date serial)
  if (typeof cellData.v === 'number') {
    return excelDateToString(cellData.v);
  }
  
  // Nếu đã là string
  if (typeof cellData.v === 'string') {
    return cellData.v;
  }
  
  return cellData.v?.toString() || '';
}

/**
 * Parse Bảng điểm tổng hợp theo cấu trúc mô tả
 */
export function parseBangDiemFull(file: ArrayBuffer): Student[] {
  const workbook = XLSX.read(file, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  const students: Student[] = [];
  const subjects: string[] = [];
  
  // Đọc danh sách môn học từ L7 -> BF7
  const subjectStartCol = columnLetterToIndex('L'); // 11
  const subjectEndCol = columnLetterToIndex('BF'); // 57
  
  for (let col = subjectStartCol; col <= subjectEndCol; col++) {
    const colLetter = getColumnLetter(col);
    const subjectName = getCellValue(worksheet, `${colLetter}7`);
    if (subjectName && subjectName.trim()) {
      subjects.push(subjectName.trim());
    }
  }
  
  console.log(`📚 Tìm thấy ${subjects.length} môn học từ cột L7-BF7`);
  
  // Đọc dữ liệu sinh viên từ row 9 trở đi
  let row = 9;
  let emptyRowCount = 0;
  
  while (emptyRowCount < 5) { // Dừng khi gặp 5 dòng trống liên tiếp
    const troyId = getCellValue(worksheet, `J${row}`);
    
    // Nếu không có ID TROY, coi như dòng trống
    if (!troyId || !troyId.trim()) {
      emptyRowCount++;
      row++;
      continue;
    }
    
    emptyRowCount = 0; // Reset counter khi gặp dòng có data
    
    // Parse thông tin sinh viên
    const program = getCellValue(worksheet, `C${row}`);
    const course = getCellValue(worksheet, `D${row}`);
    const className = getCellValue(worksheet, `E${row}`);
    const lastName = getCellValue(worksheet, `F${row}`);
    const firstName = getCellValue(worksheet, `G${row}`);
    const gender = getCellValue(worksheet, `H${row}`);
    const dateOfBirth = getDateValue(worksheet, `I${row}`); // Parse date properly
    // troyId already declared above
    const vnuId = getCellValue(worksheet, `K${row}`);
    
    // Parse điểm các môn học
    const grades: SubjectGrade[] = [];
    
    for (let col = subjectStartCol; col <= subjectEndCol; col++) {
      const colLetter = getColumnLetter(col);
      const subjectIndex = col - subjectStartCol;
      
      if (subjectIndex >= subjects.length) break;
      
      const gradeString = getCellValue(worksheet, `${colLetter}${row}`);
      
      if (gradeString && gradeString.trim()) {
        const parsedGrade = parseGrades(gradeString);
        if (parsedGrade) {
          parsedGrade.subjectName = subjects[subjectIndex];
          grades.push(parsedGrade);
        }
      }
    }
    
    const student: Student = {
      program: program.trim(),
      course: course.trim(),
      class: className.trim(),
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      fullName: `${lastName.trim()} ${firstName.trim()}`,
      gender: gender.trim(),
      dateOfBirth: dateOfBirth.trim(),
      troyId: troyId.trim(),
      vnuId: vnuId.trim(),
      grades,
      importedAt: new Date(),
      fileType: 'bang-diem-full',
    };
    
    students.push(student);
    row++;
  }
  
  // Log thông tin parse
  console.log(`✅ Đã parse ${students.length} sinh viên từ Bảng điểm tổng hợp`);
  if (students.length > 0) {
    const totalGrades = students.reduce((sum, s) => sum + s.grades.length, 0);
    const totalRetake = students.reduce((sum, s) => sum + s.grades.filter(g => g.needsRetake).length, 0);
    
    console.log(`📊 Thống kê:`);
    console.log(`   - Tổng số môn học: ${subjects.length}`);
    console.log(`   - Tổng điểm đã nhập: ${totalGrades}`);
    console.log(`   - Tổng môn học lại: ${totalRetake}`);
    console.log('📝 Ví dụ sinh viên đầu tiên:', {
      name: students[0].fullName,
      dateOfBirth: students[0].dateOfBirth,
      totalGrades: students[0].grades.length,
      retakeCount: students[0].grades.filter(g => g.needsRetake).length,
      exampleGrade: students[0].grades[0]
    });
  }
  
  return students;
}

/**
 * Parse Bảng đăng ký môn theo cấu trúc mô tả
 */
export function parseBangDangKiMon(file: ArrayBuffer): CourseRegistration[] {
  const workbook = XLSX.read(file, { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  const registrations: CourseRegistration[] = [];
  const subjects: string[] = [];
  
  // Đọc danh sách môn học từ T2 -> BF2
  const subjectStartCol = columnLetterToIndex('T'); // 19
  const subjectEndCol = columnLetterToIndex('BF'); // 57
  
  for (let col = subjectStartCol; col <= subjectEndCol; col++) {
    const colLetter = getColumnLetter(col);
    const subjectName = getCellValue(worksheet, `${colLetter}2`);
    if (subjectName && subjectName.trim()) {
      subjects.push(subjectName.trim());
    }
  }
  
  console.log(`📚 Tìm thấy ${subjects.length} môn học từ cột T2-BF2`);
  
  // Đọc dữ liệu sinh viên từ row 4 trở đi
  let row = 4;
  let emptyRowCount = 0;
  
  while (emptyRowCount < 5) { // Dừng khi gặp 5 dòng trống liên tiếp
    const studentId = getCellValue(worksheet, `H${row}`);
    
    // Nếu không có mã sinh viên, coi như dòng trống
    if (!studentId || !studentId.trim()) {
      emptyRowCount++;
      row++;
      continue;
    }
    
    emptyRowCount = 0; // Reset counter khi gặp dòng có data
    
    const course = getCellValue(worksheet, `D${row}`);
    const className = getCellValue(worksheet, `E${row}`);
    const lastName = getCellValue(worksheet, `F${row}`);
    const firstName = getCellValue(worksheet, `G${row}`);
    const partnerId = getCellValue(worksheet, `I${row}`);
    const dateOfBirth = getDateValue(worksheet, `J${row}`); // Parse date properly
    const email = getCellValue(worksheet, `K${row}`);
    const vnuEmail = getCellValue(worksheet, `L${row}`);
    const phone = getCellValue(worksheet, `M${row}`);
    const tuitionFee = getCellValue(worksheet, `N${row}`);
    const maxCredits = getCellValue(worksheet, `O${row}`);
    const registeredCredits = getCellValue(worksheet, `P${row}`);
    const totalSubjects = getCellValue(worksheet, `Q${row}`);
    const approvalStatus = getCellValue(worksheet, `R${row}`);
    const approvalDetails = getCellValue(worksheet, `S${row}`);
    
    // Parse các môn đã đăng ký
    const registeredSubjects: string[] = [];
    
    for (let col = subjectStartCol; col <= subjectEndCol; col++) {
      const colLetter = getColumnLetter(col);
      const subjectIndex = col - subjectStartCol;
      
      if (subjectIndex >= subjects.length) break;
      
      const enrollmentStatus = getCellValue(worksheet, `${colLetter}${row}`);
      
      // Kiểm tra nếu môn đã đăng ký
      if (
        enrollmentStatus &&
        (enrollmentStatus.includes('Đ.ký | Đã duyệt') ||
          enrollmentStatus.includes('Đ.ký mới (Add) | Đã duyệt'))
      ) {
        registeredSubjects.push(subjects[subjectIndex]);
      }
    }
    
    const registration: CourseRegistration = {
      course: course.trim(),
      className: className.trim(),
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      fullName: `${lastName.trim()} ${firstName.trim()}`,
      studentId: studentId.trim(), // studentId from variable declaration
      partnerId: partnerId.trim(),
      dateOfBirth: dateOfBirth.trim(),
      email: email.trim(),
      vnuEmail: vnuEmail.trim(),
      phone: phone.trim(),
      tuitionFee: tuitionFee.trim(),
      maxCredits: Number.parseInt(maxCredits) || 0,
      registeredCredits: Number.parseInt(registeredCredits) || 0,
      totalSubjects: Number.parseInt(totalSubjects) || 0,
      approvalStatus: approvalStatus.trim(),
      approvalDetails: approvalDetails.trim(),
      registeredSubjects,
      importedAt: new Date(),
    };
    
    registrations.push(registration);
    row++;
  }
  
  return registrations;
}

export function parseExcelFile(file: ArrayBuffer, fileType: 'bang-diem-full' | 'bang-dang-ki-mon'): Student[] | CourseRegistration[] {
  if (fileType === 'bang-diem-full') {
    return parseBangDiemFull(file);
  } else {
    return parseBangDangKiMon(file);
  }
}

