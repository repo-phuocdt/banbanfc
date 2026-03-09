-- Seed data from Excel: docs/theo_doi_dong_tien.xlsx
-- Generated: 2026-03-09
-- Members: 31, Contributions: 131, Transactions: 193

-- Clean existing data
TRUNCATE transactions, contributions, members CASCADE;

-- Seed 31 members (20 active, 11 inactive, 0 paused)
INSERT INTO members (name, status, joined_at) VALUES
  ('Hoàng Trọng Nghĩa', 'active', '2025-08-01'::timestamptz),
  ('Nguyễn Hữu Phụng', 'active', '2025-08-01'::timestamptz),
  ('Nguyễn Dũng Tiến', 'active', '2025-08-01'::timestamptz),
  ('Đinh Tấn Phước', 'active', '2025-08-01'::timestamptz),
  ('Bùi Công Vinh', 'active', '2025-12-01'::timestamptz),
  ('Dũng Nguyễn', 'active', '2025-08-01'::timestamptz),
  ('Đỗ Văn Tấn', 'active', '2025-11-01'::timestamptz),
  ('Hùng Nguyễn', 'active', '2025-09-01'::timestamptz),
  ('Nguyễn Xuân Hải', 'active', '2025-08-01'::timestamptz),
  ('Lê Văn Giảng', 'active', '2025-08-01'::timestamptz),
  ('Nguyễn Quang Trải', 'active', '2025-08-01'::timestamptz),
  ('Phạm Phi Vũ', 'active', '2025-10-01'::timestamptz),
  ('Thái Châu', 'active', '2025-08-01'::timestamptz),
  ('Trần Mẫu Điền', 'active', '2025-10-01'::timestamptz),
  ('Trần Quang Phú', 'active', '2025-12-01'::timestamptz),
  ('Trần Quang Qui', 'active', '2025-11-01'::timestamptz),
  ('Trần Quang Vinh', 'active', '2026-01-01'::timestamptz),
  ('Văn Duy', 'active', '2025-08-01'::timestamptz),
  ('Võ Văn Sinh', 'active', '2025-12-01'::timestamptz),
  ('Thái Đình Hiếu', 'active', '2025-11-01'::timestamptz),
  ('Trần Cường', 'inactive', '2025-09-01'::timestamptz),
  ('Phạm Văn Hùng', 'inactive', '2025-10-01'::timestamptz),
  ('Thanh Tống', 'inactive', '2025-09-01'::timestamptz),
  ('Mai Xuân Duy Khánh', 'inactive', '2025-09-01'::timestamptz),
  ('Nguyễn Đình Long', 'inactive', '2025-09-01'::timestamptz),
  ('Thái Đình Hải', 'inactive', '2025-09-01'::timestamptz),
  ('Thái Văn Huyên', 'inactive', '2025-08-01'::timestamptz),
  ('Trần Tuấn', 'inactive', '2025-08-01'::timestamptz),
  ('Nguyễn Hữu Thạnh', 'inactive', '2025-08-01'::timestamptz),
  ('Đức Anh', 'inactive', '2025-08-01'::timestamptz),
  ('Anh Bảy', 'inactive', '2025-10-01'::timestamptz);

-- Seed 131 contributions from member payment matrix
INSERT INTO contributions (member_id, month, amount, paid_at)
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Hữu Phụng'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Hữu Phụng'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Hữu Phụng'
UNION ALL
SELECT m.id, '2025-12', 100000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Hữu Phụng'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Hữu Phụng'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Hữu Phụng'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Dũng Tiến'
UNION ALL
SELECT m.id, '2025-09', 150000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Dũng Tiến'
UNION ALL
SELECT m.id, '2025-10', 150000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Dũng Tiến'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Dũng Tiến'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Dũng Tiến'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Dũng Tiến'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Đinh Tấn Phước'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Đinh Tấn Phước'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Đinh Tấn Phước'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Đinh Tấn Phước'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Đinh Tấn Phước'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Đinh Tấn Phước'
UNION ALL
SELECT m.id, '2025-12', 300000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Bùi Công Vinh'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Bùi Công Vinh'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Bùi Công Vinh'
UNION ALL
SELECT m.id, '2026-03', 200000, '2026-03-15'::timestamptz
FROM members m WHERE m.name = 'Bùi Công Vinh'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Dũng Nguyễn'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Dũng Nguyễn'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Dũng Nguyễn'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Dũng Nguyễn'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Dũng Nguyễn'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Dũng Nguyễn'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Dũng Nguyễn'
UNION ALL
SELECT m.id, '2026-03', 200000, '2026-03-15'::timestamptz
FROM members m WHERE m.name = 'Dũng Nguyễn'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Đỗ Văn Tấn'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Đỗ Văn Tấn'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Đỗ Văn Tấn'
UNION ALL
SELECT m.id, '2026-03', 200000, '2026-03-15'::timestamptz
FROM members m WHERE m.name = 'Đỗ Văn Tấn'
UNION ALL
SELECT m.id, '2025-09', 150000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Hùng Nguyễn'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Xuân Hải'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Xuân Hải'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Xuân Hải'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Xuân Hải'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Xuân Hải'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Xuân Hải'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Xuân Hải'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Lê Văn Giảng'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Lê Văn Giảng'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Lê Văn Giảng'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Lê Văn Giảng'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Lê Văn Giảng'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Lê Văn Giảng'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Lê Văn Giảng'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Quang Trải'
UNION ALL
SELECT m.id, '2025-09', 150000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Quang Trải'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Quang Trải'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Quang Trải'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Quang Trải'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Quang Trải'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Quang Trải'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Phạm Phi Vũ'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Phạm Phi Vũ'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Phạm Phi Vũ'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Phạm Phi Vũ'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Phạm Phi Vũ'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Thái Châu'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Thái Châu'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Thái Châu'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Thái Châu'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Thái Châu'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Thái Châu'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Trần Mẫu Điền'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Trần Mẫu Điền'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Trần Mẫu Điền'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Trần Mẫu Điền'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Trần Quang Phú'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Trần Quang Phú'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Trần Quang Qui'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Trần Quang Qui'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Trần Quang Qui'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Trần Quang Qui'
UNION ALL
SELECT m.id, '2026-03', 200000, '2026-03-15'::timestamptz
FROM members m WHERE m.name = 'Trần Quang Qui'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Trần Quang Vinh'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Văn Duy'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Văn Duy'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Văn Duy'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Văn Duy'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Văn Duy'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Văn Duy'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Văn Duy'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Võ Văn Sinh'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Võ Văn Sinh'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Võ Văn Sinh'
UNION ALL
SELECT m.id, '2026-03', 200000, '2026-03-15'::timestamptz
FROM members m WHERE m.name = 'Võ Văn Sinh'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Thái Đình Hiếu'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Thái Đình Hiếu'
UNION ALL
SELECT m.id, '2026-01', 200000, '2026-01-15'::timestamptz
FROM members m WHERE m.name = 'Thái Đình Hiếu'
UNION ALL
SELECT m.id, '2026-02', 200000, '2026-02-15'::timestamptz
FROM members m WHERE m.name = 'Thái Đình Hiếu'
UNION ALL
SELECT m.id, '2026-03', 200000, '2026-03-15'::timestamptz
FROM members m WHERE m.name = 'Thái Đình Hiếu'
UNION ALL
SELECT m.id, '2026-04', 200000, '2026-04-15'::timestamptz
FROM members m WHERE m.name = 'Thái Đình Hiếu'
UNION ALL
SELECT m.id, '2025-09', 150000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Trần Cường'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Trần Cường'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Trần Cường'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Phạm Văn Hùng'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Phạm Văn Hùng'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Phạm Văn Hùng'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Thanh Tống'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Thanh Tống'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Mai Xuân Duy Khánh'
UNION ALL
SELECT m.id, '2025-09', 150000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Đình Long'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Đình Long'
UNION ALL
SELECT m.id, '2025-09', 150000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Thái Đình Hải'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Thái Đình Hải'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Thái Đình Hải'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Thái Văn Huyên'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Thái Văn Huyên'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Thái Văn Huyên'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Thái Văn Huyên'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Thái Văn Huyên'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Trần Tuấn'
UNION ALL
SELECT m.id, '2025-09', 300000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Trần Tuấn'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Trần Tuấn'
UNION ALL
SELECT m.id, '2025-08', 150000, '2025-08-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Hữu Thạnh'
UNION ALL
SELECT m.id, '2025-09', 150000, '2025-09-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Hữu Thạnh'
UNION ALL
SELECT m.id, '2025-10', 150000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Hữu Thạnh'
UNION ALL
SELECT m.id, '2025-11', 200000, '2025-11-15'::timestamptz
FROM members m WHERE m.name = 'Nguyễn Hữu Thạnh'
UNION ALL
SELECT m.id, '2025-10', 200000, '2025-10-15'::timestamptz
FROM members m WHERE m.name = 'Anh Bảy'
UNION ALL
SELECT m.id, '2025-12', 200000, '2025-12-15'::timestamptz
FROM members m WHERE m.name = 'Anh Bảy';

-- Seed 193 transactions from thu chi ledger
-- Income transactions linked to members
INSERT INTO transactions (date, type, amount, category, description) VALUES (NULL, 'income', 300000, 'Quỹ hàng tháng', 'Tiền của Thạnh (đóng luôn cho tháng 9 + 10)');
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT NULL, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Văn Duy';
INSERT INTO transactions (date, type, amount, category, description) VALUES ('2025-07-30'::timestamptz, 'expense', 400000, 'Tiền áo/đồ', '18 cái áo pitch');
INSERT INTO transactions (date, type, amount, category, description) VALUES ('2025-08-01'::timestamptz, 'expense', 330000, 'Tiền sân', 'Tiền sân');
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-03'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Thái Châu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-03'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Dũng Nguyễn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-03'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Nguyễn Hữu Phụng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-03'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Nguyễn Quang Trải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-03'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Nguyễn Xuân Hải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-03'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-04'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Nguyễn Dũng Tiến';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-04'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Trần Tuấn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-04'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Nguyễn Hữu Thạnh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-04'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Thái Văn Huyên';
INSERT INTO transactions (date, type, amount, category, description) VALUES ('2025-08-05'::timestamptz, 'expense', 330000, 'Tiền sân', 'Tiền sân cố định');
INSERT INTO transactions (date, type, amount, category, description) VALUES ('2025-08-08'::timestamptz, 'expense', 440000, 'Tiền sân + nước', 'Tiền sân + nước');
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-13'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-13'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 8', m.id FROM members m WHERE m.name = 'Lê Văn Giảng';
INSERT INTO transactions (date, type, amount, category, description) VALUES ('2025-08-15'::timestamptz, 'income', 200000, 'Góp thêm', 'AE bạn a Châu góp');
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-15'::timestamptz, 'expense', 474000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-22'::timestamptz, 'expense', 438000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-26'::timestamptz, 'expense', 456000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-28'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Nguyễn Xuân Hải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-28'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Thanh Tống';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-28'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Trần Cường';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-28'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Thái Văn Huyên';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-28'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Nguyễn Hữu Phụng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-28'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Nguyễn Quang Trải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-28'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Dũng Nguyễn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-28'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Văn Duy';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-28'::timestamptz, 'expense', 345000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-29'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Thái Đình Hải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-29'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Trần Tuấn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-29'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Mai Xuân Duy Khánh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-29'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Thái Châu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-29'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-29'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-08-30'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Lê Văn Giảng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-02'::timestamptz, 'expense', 497000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-05'::timestamptz, 'expense', 446000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-05'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Hùng Nguyễn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-07'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Văn Duy';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-08'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-08'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Nguyễn Xuân Hải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-09'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Nguyễn Hữu Phụng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-12'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Thanh Tống';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-12'::timestamptz, 'expense', 530000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-16'::timestamptz, 'expense', 385000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-16'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Trần Tuấn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-16'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Nguyễn Hữu Phụng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-19'::timestamptz, 'expense', 502000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-22'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Lê Văn Giảng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-22'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Mai Xuân Duy Khánh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-22'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Dũng Nguyễn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-22'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Thái Văn Huyên';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-22'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-22'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9 lần 2', m.id FROM members m WHERE m.name = 'Thái Châu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-23'::timestamptz, 'income', 150000, 'Quỹ hàng tháng', 'Quỹ tháng 9', m.id FROM members m WHERE m.name = 'Nguyễn Đình Long';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-23'::timestamptz, 'expense', 514000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-23'::timestamptz, 'expense', 444000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-24'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Anh Bảy';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-09-30'::timestamptz, 'expense', 420000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-03'::timestamptz, 'expense', 480000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Văn Duy';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Nguyễn Xuân Hải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Trần Mẫu Điền';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Dũng Nguyễn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Thái Văn Huyên';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Lê Văn Giảng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Nguyễn Quang Trải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Phạm Văn Hùng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Thái Đình Hải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Thanh Tống';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-07'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Trần Cường';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-10'::timestamptz, 'expense', 456000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-10'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Phạm Phi Vũ';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-11'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Trần Tuấn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-14'::timestamptz, 'expense', 470000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-17'::timestamptz, 'expense', 510000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-20'::timestamptz, 'expense', 468000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-24'::timestamptz, 'income', 242000, 'Quỹ hàng tháng', 'Quỹ làm đồ đá banh còn dư', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-10-30'::timestamptz, 'expense', 506000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-02'::timestamptz, 'expense', 296000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-02'::timestamptz, 'expense', 296000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-04'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 10', m.id FROM members m WHERE m.name = 'Thái Châu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-04'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Lê Văn Giảng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-04'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Thái Văn Huyên';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-04'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Thái Châu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-04'::timestamptz, 'expense', 542000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-04'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Trần Quang Qui';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-04'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Thái Đình Hiếu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-04'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Văn Duy';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-04'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Phạm Phi Vũ';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-04'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Nguyễn Xuân Hải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-04'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Phạm Văn Hùng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-05'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Nguyễn Hữu Thạnh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-05'::timestamptz, 'expense', 140000, 'Tiền áo/đồ', 'Tiền áo pitch', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-07'::timestamptz, 'expense', 508000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-07'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-07'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Dũng Nguyễn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-11'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Trần Mẫu Điền';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-14'::timestamptz, 'expense', 448000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-18'::timestamptz, 'expense', 472000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-21'::timestamptz, 'expense', 438000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-25'::timestamptz, 'expense', 470000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-26'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-27'::timestamptz, 'income', 350000, 'Quỹ hàng tháng', 'Quỹ tháng 10 + 11', m.id FROM members m WHERE m.name = 'Nguyễn Dũng Tiến';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-27'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Nguyễn Quang Trải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-27'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Văn Duy';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-28'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Thái Đình Hải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-28'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Nguyễn Đình Long';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-28'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 11', m.id FROM members m WHERE m.name = 'Đỗ Văn Tấn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-28'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Phạm Phi Vũ';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-11-28'::timestamptz, 'expense', 498000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-01'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Trần Quang Phú';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-01'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Nguyễn Xuân Hải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-01'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Thái Đình Hiếu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-02'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Anh Bảy';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-02'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Phạm Văn Hùng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-02'::timestamptz, 'expense', 498000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-02'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Bùi Công Vinh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-02'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Thái Văn Huyên';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-03'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Dũng Nguyễn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-05'::timestamptz, 'expense', 474000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-09'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Trần Quang Qui';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-09'::timestamptz, 'expense', 498000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-09'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Lê Văn Giảng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-09'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Trần Cường';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-12'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Thái Châu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-12'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Trần Mẫu Điền';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-12'::timestamptz, 'expense', 450000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-15'::timestamptz, 'expense', 250000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-19'::timestamptz, 'expense', 192000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-21'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Thái Đình Hiếu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-21'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Thái Đình Hiếu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-21'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 3', m.id FROM members m WHERE m.name = 'Thái Đình Hiếu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-22'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Võ Văn Sinh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-22'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-22'::timestamptz, 'expense', 534000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-26'::timestamptz, 'expense', 522000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-29'::timestamptz, 'income', 300000, 'Quỹ hàng tháng', 'Quỹ tháng 12 + tháng 1', m.id FROM members m WHERE m.name = 'Nguyễn Hữu Phụng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-29'::timestamptz, 'expense', 478000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-30'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Nguyễn Dũng Tiến';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-30'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Nguyễn Quang Trải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-31'::timestamptz, 'income', 400000, 'Quỹ hàng tháng', 'Quỹ tháng 12 + tháng 1', m.id FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-31'::timestamptz, 'income', 100000, 'Quỹ hàng tháng', 'Quỹ tháng 12', m.id FROM members m WHERE m.name = 'Bùi Công Vinh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-31'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Lê Văn Giảng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2025-12-31'::timestamptz, 'expense', 1560000, 'Tiền nhậu', 'Tiền nhậu', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-02'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Trần Quang Phú';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-05'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Phạm Phi Vũ';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-08'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Nguyễn Dũng Tiến';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-08'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Nguyễn Xuân Hải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-08'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Đỗ Văn Tấn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-09'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Trần Quang Qui';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-09'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Võ Văn Sinh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-09'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Nguyễn Quang Trải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-10'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Bùi Công Vinh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-10'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Dũng Nguyễn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-10'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Văn Duy';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-11'::timestamptz, 'expense', 734000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-12'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Trần Quang Vinh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-12'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Thái Châu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-12'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Trần Mẫu Điền';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-20'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 1', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-20'::timestamptz, 'expense', 92000, 'Tiền nước', 'Tiền nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-20'::timestamptz, 'expense', 1072000, 'Tiền sân + nước', 'Tiền sân + nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-23'::timestamptz, 'expense', 140000, 'Tiền nước', 'Tiền nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-26'::timestamptz, 'expense', 162000, 'Tiền nước', 'Tiền nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-01-30'::timestamptz, 'expense', 520000, 'Tiền sân', 'Tiền sân', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-02'::timestamptz, 'expense', 260000, 'Tiền sân', 'Tiền sân', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-10'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Bùi Công Vinh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-11'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Nguyễn Xuân Hải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-11'::timestamptz, 'income', 400000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Đỗ Văn Tấn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-11'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Văn Duy';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-11'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Dũng Nguyễn';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-11'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Nguyễn Quang Trải';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-11'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Nguyễn Hữu Phụng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-23'::timestamptz, 'expense', 400000, 'Tiền sân + nước', 'Tiền sân + tiền nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-25'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Lê Văn Giảng';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-25'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 4', m.id FROM members m WHERE m.name = 'Thái Đình Hiếu';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-25'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Phạm Phi Vũ';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-02-27'::timestamptz, 'expense', 406000, 'Tiền sân + nước', 'Tiền sân + tiền nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-03-02'::timestamptz, 'expense', 400000, 'Tiền sân + nước', 'Tiền sân + tiền nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-03-02'::timestamptz, 'expense', 472000, 'Tiền sân + nước', 'Tiền sân + tiền nước', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-03-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Võ Văn Sinh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-03-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 3', m.id FROM members m WHERE m.name = 'Võ Văn Sinh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-03-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Trần Quang Qui';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-03-06'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 3', m.id FROM members m WHERE m.name = 'Trần Quang Qui';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-03-09'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 3', m.id FROM members m WHERE m.name = 'Bùi Công Vinh';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-03-09'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Hoàng Trọng Nghĩa';
INSERT INTO transactions (date, type, amount, category, description, member_id) SELECT '2026-03-09'::timestamptz, 'income', 200000, 'Quỹ hàng tháng', 'Quỹ tháng 2', m.id FROM members m WHERE m.name = 'Đinh Tấn Phước';
