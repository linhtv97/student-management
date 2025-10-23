# Hệ thống Quản lý Sinh viên

Hệ thống quản lý sinh viên với khả năng import dữ liệu từ file Excel, lưu trữ vào IndexedDB và hiển thị với bảng dữ liệu tương tác.

## Tính năng

- ✅ Import dữ liệu từ file Excel (2 loại: Bảng điểm tổng hợp và Bảng đăng ký môn)
- ✅ Lưu trữ dữ liệu vào IndexedDB (offline-first)
- ✅ Hiển thị danh sách sinh viên với bảng tương tác
- ✅ Tìm kiếm theo tên, ID TROY, ID VNU, lớp
- ✅ Phân trang với tùy chọn số dòng hiển thị
- ✅ Sắp xếp theo các cột
- ✅ Scroll ngang cho bảng rộng
- ✅ Thống kê tổng quan với cards (tổng SV, trung bình môn, SV học lại, tổng môn học lại)
- ✅ Hiển thị số môn học lại
- ✅ Xem chi tiết điểm của sinh viên (click vào dòng trong bảng)
- ✅ Modal hiển thị lịch sử điểm và trạng thái học lại
- ✅ Export danh sách sinh viên học lại ra Excel
- ✅ Export toàn bộ danh sách sinh viên ra Excel

## Công nghệ sử dụng

- **Next.js 16** - React Framework
- **TypeScript** - Type safety
- **TanStack Table** - Bảng dữ liệu tương tác
- **Dexie.js** - IndexedDB wrapper
- **XLSX** - Đọc file Excel
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Cài đặt

```bash
# Clone repository
git clone <repository-url>

# Cài đặt dependencies
yarn install

# Chạy development server
yarn dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Cấu trúc File Excel

### 1. Bảng điểm tổng hợp

- Dữ liệu sinh viên bắt đầu từ **row 9**
- Môn học từ **L7 -> BF7**
- Các cột:
  - **C**: Chương trình
  - **D**: Khoá
  - **E**: Lớp
  - **F**: Họ
  - **G**: Tên
  - **H**: Giới tính
  - **I**: Ngày sinh
  - **J**: ID TROY
  - **K**: ID VNU
  - **L-BF**: Điểm các môn học

**Cách ghi điểm:**
- Các loại điểm: A+, A, B+, B, C+, C, D+, D, F
- Điểm cần học lại: D, D+, F
- Một môn có thể có nhiều lần học (ví dụ: "AA", "C+D", "FDD+A")

### 2. Bảng đăng ký môn

- Dữ liệu sinh viên bắt đầu từ **row 4**
- Môn học từ **T2 -> BF2**
- Các cột:
  - **D**: Khóa học
  - **E**: Tên lớp
  - **F**: Họ đệm
  - **G**: Tên
  - **H**: Mã sinh viên
  - **I**: Mã sinh viên đối tác
  - **J**: Ngày sinh
  - **K**: Email
  - **L**: Email VNU
  - **M**: SĐT
  - **N**: Học phí
  - **O**: Tổng tín đăng ký tối đa
  - **P**: Tổng tín đã đăng ký
  - **Q**: Tổng môn đăng ký
  - **R**: Duyệt
  - **S**: Duyệt (Chi tiết)
  - **T-BF**: Trạng thái đăng ký môn

## Hướng dẫn sử dụng

1. **Chọn loại file**: Chọn "Bảng điểm tổng hợp" hoặc "Bảng đăng ký môn"
2. **Upload file Excel**: Click vào khu vực upload hoặc kéo thả file
3. **Xem dữ liệu**: Dữ liệu sẽ được hiển thị trong bảng bên dưới
4. **Tìm kiếm**: Sử dụng ô tìm kiếm để lọc sinh viên
5. **Phân trang**: Điều chỉnh số dòng hiển thị và chuyển trang
6. **Sắp xếp**: Click vào tiêu đề cột để sắp xếp
7. **Xem chi tiết**: Click vào dòng sinh viên để xem chi tiết điểm số
8. **Export dữ liệu**: 
   - Click "Export học lại" để xuất danh sách sinh viên cần học lại
   - Click "Export tất cả" để xuất toàn bộ danh sách sinh viên
9. **Xóa dữ liệu**: Click nút "Xóa dữ liệu" để reset database

## Scripts

```bash
# Development
yarn dev

# Build production
yarn build

# Start production server
yarn start

# Lint code
yarn lint

# Format code
yarn format
```

## Cấu trúc thư mục

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── file-upload.tsx              # File upload component
│   ├── student-table.tsx            # Student table component
│   ├── student-details-modal.tsx   # Student details modal
│   └── stats-cards.tsx              # Statistics cards
├── lib/
│   ├── db.ts               # IndexedDB service
│   ├── excel-parser.ts     # Excel parser
│   └── export-utils.ts     # Export utilities
├── types/
│   └── student.ts          # TypeScript types
└── docs/
    ├── requirement.md
    ├── bang-diem-full.description.md
    └── bang-dang-ki-mon.description.md
```

## Lưu ý

- Dữ liệu được lưu trữ trong IndexedDB của trình duyệt (offline-first)
- Dữ liệu sẽ được giữ nguyên khi reload trang
- Hỗ trợ file Excel định dạng .xlsx và .xls
- Responsive design cho mobile và desktop
