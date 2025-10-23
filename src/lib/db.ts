import Dexie, { type EntityTable } from 'dexie';
import type { Student, CourseRegistration } from '@/types/student';

// Định nghĩa database với Dexie
class StudentDatabase extends Dexie {
  students!: EntityTable<Student, 'id'>;
  courseRegistrations!: EntityTable<CourseRegistration, 'id'>;

  constructor() {
    super('StudentManagementDB');
    
    this.version(1).stores({
      students: '++id, troyId, vnuId, fullName, class, course, program, importedAt, fileType',
      courseRegistrations: '++id, studentId, partnerId, fullName, className, course, email, importedAt',
    });
  }

  // Xóa tất cả dữ liệu
  async clearAll() {
    await this.students.clear();
    await this.courseRegistrations.clear();
  }

  // Import danh sách sinh viên
  async importStudents(students: Student[]) {
    await this.students.bulkAdd(students);
  }

  // Import danh sách đăng ký môn
  async importCourseRegistrations(registrations: CourseRegistration[]) {
    await this.courseRegistrations.bulkAdd(registrations);
  }

  // Tìm kiếm sinh viên
  async searchStudents(query: string): Promise<Student[]> {
    const lowerQuery = query.toLowerCase();
    return this.students
      .filter(student => 
        student.fullName.toLowerCase().includes(lowerQuery) ||
        student.troyId.toLowerCase().includes(lowerQuery) ||
        student.vnuId.toLowerCase().includes(lowerQuery) ||
        student.class.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }

  // Tìm kiếm đăng ký môn
  async searchCourseRegistrations(query: string): Promise<CourseRegistration[]> {
    const lowerQuery = query.toLowerCase();
    return this.courseRegistrations
      .filter(reg => 
        reg.fullName.toLowerCase().includes(lowerQuery) ||
        reg.studentId.toLowerCase().includes(lowerQuery) ||
        reg.email.toLowerCase().includes(lowerQuery) ||
        reg.className.toLowerCase().includes(lowerQuery)
      )
      .toArray();
  }
}

export const db = new StudentDatabase();

