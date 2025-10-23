// Types cho hệ thống quản lý sinh viên

export type GradeType = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';

export interface SubjectGrade {
  subjectName: string;
  grades: GradeType[]; // Mảng các điểm (có thể có nhiều lần học)
  latestGrade: GradeType; // Điểm mới nhất
  needsRetake: boolean; // Có cần học lại không (D, D+, F)
}

export interface Student {
  id?: number; // IndexedDB auto-increment ID
  program: string; // Chương trình
  course: string; // Khoá
  class: string; // Lớp
  lastName: string; // Họ
  firstName: string; // Tên
  fullName: string; // Họ và tên đầy đủ
  gender: string; // Giới tính
  dateOfBirth: string; // Ngày sinh
  troyId: string; // ID TROY
  vnuId: string; // ID VNU
  grades: SubjectGrade[]; // Danh sách điểm các môn
  importedAt: Date; // Thời gian import
  fileType: 'bang-diem-full' | 'bang-dang-ki-mon'; // Loại file import
}

export interface CourseRegistration {
  id?: number;
  course: string; // Khóa học
  className: string; // Tên lớp
  lastName: string; // Họ đệm
  firstName: string; // Tên
  fullName: string; // Họ và tên đầy đủ
  studentId: string; // Mã sinh viên
  partnerId: string; // Mã sinh viên đối tác
  dateOfBirth: string; // Ngày sinh
  email: string; // Email
  vnuEmail: string; // Email VNU
  phone: string; // SĐT
  tuitionFee: string; // Học phí
  maxCredits: number; // Tổng tín đăng ký tối đa
  registeredCredits: number; // Tổng tín đã đăng ký
  totalSubjects: number; // Tổng môn đăng ký
  approvalStatus: string; // Duyệt
  approvalDetails: string; // Duyệt(Chi tiết)
  registeredSubjects: string[]; // Danh sách môn đã đăng ký
  importedAt: Date;
}

