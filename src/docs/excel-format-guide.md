# Hướng dẫn Format File Excel

## 1. Bảng điểm tổng hợp (bang-diem-full)

### Cấu trúc file:
- **Row 7**: Tên các môn học (từ cột L đến cột BF)
- **Row 9+**: Dữ liệu sinh viên

### Các cột bắt buộc:
| Cột | Tên trường | Mô tả |
|-----|-----------|-------|
| C | Chương trình | Tên chương trình đào tạo |
| D | Khoá | Khoá học (ví dụ: K68) |
| E | Lớp | Tên lớp |
| F | Họ | Họ của sinh viên |
| G | Tên | Tên của sinh viên |
| H | Giới tính | Nam/Nữ |
| I | Ngày sinh | Ngày sinh (dd/mm/yyyy) |
| J | ID TROY | Mã sinh viên TROY |
| K | ID VNU | Mã sinh viên VNU |
| L-BF | Điểm các môn | Điểm của từng môn học |

### Cách ghi điểm:
- **Điểm hợp lệ**: A+, A, B+, B, C+, C, D+, D, F
- **Điểm học lại**: D, D+, F (điểm mới nhất)
- **Nhiều lần học**: Ghi liền nhau không có dấu cách
  - Ví dụ: `AA` = Học 2 lần, cả 2 lần đều A
  - Ví dụ: `C+D` = Học 2 lần, lần 1 C+, lần 2 D (cần học lại)
  - Ví dụ: `FDD+A` = Học 4 lần, F → D → D+ → A (không học lại)

### Ví dụ:

| C | D | E | F | G | H | I | J | K | L (Toán cao cấp) | M (Vật lý) |
|---|---|---|---|---|---|---|---|---|-----------------|-----------|
| CNTT | K68 | QH-2020-I-CQ-C | Nguyễn Văn | An | Nam | 01/01/2002 | TROY001 | VNU001 | AA | C+D |

Giải thích:
- Môn Toán cao cấp: Học 2 lần, cả 2 lần đều A → Không học lại
- Môn Vật lý: Học 2 lần, lần 1 C+, lần 2 D → Cần học lại

---

## 2. Bảng đăng ký môn (bang-dang-ki-mon)

### Cấu trúc file:
- **Row 2**: Tên các môn học (từ cột T đến cột BF)
- **Row 4+**: Dữ liệu sinh viên

### Các cột bắt buộc:
| Cột | Tên trường | Mô tả |
|-----|-----------|-------|
| D | Khóa học | Khoá học |
| E | Tên lớp | Tên lớp |
| F | Họ đệm | Họ đệm của sinh viên |
| G | Tên | Tên của sinh viên |
| H | Mã sinh viên | Mã sinh viên chính |
| I | Mã SV đối tác | Mã sinh viên đối tác |
| J | Ngày sinh | Ngày sinh |
| K | Email | Email cá nhân |
| L | Email VNU | Email VNU |
| M | SĐT | Số điện thoại |
| N | Học phí | Học phí |
| O | Tổng tín tối đa | Tổng tín đăng ký tối đa |
| P | Tổng tín đã đăng ký | Tổng tín đã đăng ký |
| Q | Tổng môn | Tổng môn đăng ký |
| R | Duyệt | Trạng thái duyệt |
| S | Duyệt (Chi tiết) | Chi tiết duyệt |
| T-BF | Trạng thái môn | Trạng thái đăng ký từng môn |

### Trạng thái đăng ký môn:
- **Đã đăng ký**: `Đ.ký | Đã duyệt` hoặc `Đ.ký mới (Add) | Đã duyệt`
- **Chưa đăng ký**: Để trống hoặc `Hủy | Drop`

### Ví dụ:

| D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T (Toán) | U (Lý) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---------|--------|
| K68 | QH-2020 | Nguyễn Văn | An | SV001 | TROY001 | 01/01/02 | nvan@mail | nvan@vnu | 0901234 | 1000000 | 24 | 18 | 6 | Đã duyệt | OK | Đ.ký \| Đã duyệt | Đ.ký mới (Add) \| Đã duyệt |

---

## Lưu ý chung:

1. **Không được để trống** các cột bắt buộc
2. **Định dạng ngày tháng**: Có thể là dd/mm/yyyy hoặc mm/dd/yyyy (Excel tự động format)
3. **Tên môn học**: Nên ngắn gọn, rõ ràng
4. **File format**: `.xlsx` hoặc `.xls`
5. **Encoding**: UTF-8 để hiển thị đúng tiếng Việt
6. **Dữ liệu kết thúc**: Khi cột C (bảng điểm) hoặc cột D (bảng đăng ký) trống, hệ thống sẽ ngừng đọc

## Xử lý lỗi:

- Nếu file sai format, hệ thống sẽ báo lỗi
- Kiểm tra kỹ số row bắt đầu (row 7/9 cho bảng điểm, row 2/4 cho bảng đăng ký)
- Đảm bảo các cột đúng vị trí theo hướng dẫn

