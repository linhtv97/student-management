import type { Student, CourseRegistration, SubjectGrade } from './student';

// Type cho dữ liệu tổng hợp
export interface ConsolidatedStudent {
  // Thông tin cơ bản
  studentId: string; // Mã sinh viên (từ CourseRegistration)
  troyId?: string; // ID TROY (từ Student)
  vnuId?: string; // ID VNU (từ Student)
  fullName: string;
  className: string;
  course: string;
  dateOfBirth: string;
  email?: string;
  
  // Thông tin đăng ký
  registeredSubjects: string[]; // Các môn đã đăng ký
  registeredCredits: number; // Tổng tín đã đăng ký
  totalSubjects: number; // Tổng môn đăng ký
  
  // Thông tin điểm
  grades: SubjectGrade[]; // Tất cả điểm
  
  // Thông tin tổng hợp
  registeredWithGrades: {
    subjectName: string;
    isRegistered: boolean;
    gradeInfo?: SubjectGrade;
    status: 'registered-with-grade' | 'registered-no-grade' | 'not-registered-with-grade' | 'not-registered';
  }[];
}

// Helper để match sinh viên giữa 2 bảng
export function matchStudent(
  registration: CourseRegistration,
  students: Student[]
): Student | undefined {
  // Thử match bằng nhiều cách
  return students.find(s => 
    s.troyId === registration.studentId ||
    s.troyId === registration.partnerId ||
    s.vnuId === registration.studentId ||
    s.vnuId === registration.partnerId
  );
}

// Helper để tạo consolidated data
export function consolidateData(
  students: Student[],
  registrations: CourseRegistration[]
): ConsolidatedStudent[] {
  const consolidated: ConsolidatedStudent[] = [];
  
  // Process từng registration
  for (const reg of registrations) {
    const matchedStudent = matchStudent(reg, students);
    
    // Lấy tất cả môn unique (từ cả đăng ký và điểm)
    const allSubjects = new Set<string>();
    reg.registeredSubjects.forEach(s => allSubjects.add(s));
    if (matchedStudent) {
      matchedStudent.grades.forEach(g => allSubjects.add(g.subjectName));
    }
    
    // Tạo thông tin tổng hợp cho từng môn
    const registeredWithGrades = Array.from(allSubjects).map(subject => {
      const isRegistered = reg.registeredSubjects.includes(subject);
      const gradeInfo = matchedStudent?.grades.find(g => g.subjectName === subject);
      
      let status: ConsolidatedStudent['registeredWithGrades'][0]['status'];
      if (isRegistered && gradeInfo) {
        status = 'registered-with-grade';
      } else if (isRegistered && !gradeInfo) {
        status = 'registered-no-grade';
      } else if (!isRegistered && gradeInfo) {
        status = 'not-registered-with-grade';
      } else {
        status = 'not-registered';
      }
      
      return {
        subjectName: subject,
        isRegistered,
        gradeInfo,
        status,
      };
    });
    
    consolidated.push({
      studentId: reg.studentId,
      troyId: matchedStudent?.troyId,
      vnuId: matchedStudent?.vnuId,
      fullName: reg.fullName,
      className: reg.className,
      course: reg.course,
      dateOfBirth: reg.dateOfBirth,
      email: reg.email,
      registeredSubjects: reg.registeredSubjects,
      registeredCredits: reg.registeredCredits,
      totalSubjects: reg.totalSubjects,
      grades: matchedStudent?.grades || [],
      registeredWithGrades,
    });
  }
  
  return consolidated;
}

