# Quick Start Guide

## 🚀 Khởi động nhanh trong 3 bước

### Bước 1: Cài đặt
```bash
yarn install
```

### Bước 2: Chạy ứng dụng
```bash
yarn dev
```

### Bước 3: Mở trình duyệt
Truy cập: **http://localhost:3000**

---

## 📝 Sử dụng cơ bản

### 1️⃣ Import dữ liệu
1. Chọn loại file: **"Bảng điểm tổng hợp"** hoặc **"Bảng đăng ký môn"**
2. Click vào khu vực upload hoặc **kéo thả file Excel**
3. Đợi thông báo thành công

### 2️⃣ Xem dữ liệu
- **Tìm kiếm**: Gõ tên, ID TROY, ID VNU hoặc lớp vào ô search
- **Sắp xếp**: Click vào header cột để sort
- **Phân trang**: Chọn số dòng hiển thị (10/20/50/100) và điều hướng trang
- **Chi tiết**: Click vào dòng sinh viên để xem điểm chi tiết

### 3️⃣ Export dữ liệu
- **Export học lại**: Click "Export học lại" để xuất danh sách sinh viên cần học lại
- **Export tất cả**: Click "Export tất cả" để xuất toàn bộ danh sách

### 4️⃣ Xóa dữ liệu
- Click **"Xóa dữ liệu"** ở góc phải trên → Confirm → Database được reset

---

## 📋 Format File Excel

### Bảng điểm tổng hợp
```
Row 7:  Tên các môn học (L7 → BF7)
Row 9+: Dữ liệu sinh viên

Cột C: Chương trình
Cột D: Khoá
Cột E: Lớp
Cột F: Họ
Cột G: Tên
Cột H: Giới tính
Cột I: Ngày sinh
Cột J: ID TROY
Cột K: ID VNU
Cột L-BF: Điểm các môn (ví dụ: AA, C+D, FDD+A)
```

### Bảng đăng ký môn
```
Row 2:  Tên các môn học (T2 → BF2)
Row 4+: Dữ liệu sinh viên

Cột D-S: Thông tin sinh viên
Cột T-BF: Trạng thái đăng ký môn
```

📖 Chi tiết: Xem file `src/docs/excel-format-guide.md`

---

## ⚠️ Lưu ý

- ✅ Dữ liệu lưu trong **IndexedDB của browser** (offline)
- ✅ Dữ liệu **không mất** khi reload trang
- ✅ Hỗ trợ file **.xlsx** và **.xls**
- ❌ Không hỗ trợ file .csv hoặc .ods

---

## 🐛 Troubleshooting

**Q: File upload không thành công?**  
A: Kiểm tra:
- File đúng format (.xlsx hoặc .xls)
- Cấu trúc file đúng theo hướng dẫn
- Row bắt đầu đúng (row 7/9 hoặc row 2/4)

**Q: Không thấy dữ liệu sau khi import?**  
A: Kiểm tra:
- Console log có lỗi không
- Cột C (bảng điểm) hoặc cột D (bảng đăng ký) có dữ liệu không

**Q: Xóa dữ liệu nhưng vẫn còn?**  
A: Clear browser cache hoặc F12 → Application → IndexedDB → Delete database

---

## 📚 Tài liệu

- `README.md` - Hướng dẫn đầy đủ
- `FEATURES.md` - Danh sách tính năng
- `src/docs/excel-format-guide.md` - Chi tiết format Excel
- `src/docs/requirement.md` - Yêu cầu ban đầu

---

## 🛠️ Commands

```bash
yarn dev      # Development server
yarn build    # Build production
yarn start    # Start production
yarn lint     # Lint code
yarn format   # Format code
```

---

Chúc bạn sử dụng vui vẻ! 🎉

