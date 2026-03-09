-- Seed 31 members (20 active, 8 inactive, 3 paused)
INSERT INTO members (name, status, joined_at) VALUES
  ('Nguyễn Văn An', 'active', '2025-08-01'),
  ('Trần Minh Đức', 'active', '2025-08-01'),
  ('Lê Hoàng Nam', 'active', '2025-08-01'),
  ('Phạm Quốc Huy', 'active', '2025-08-01'),
  ('Võ Thành Long', 'active', '2025-08-01'),
  ('Đỗ Anh Tuấn', 'active', '2025-08-01'),
  ('Bùi Minh Khoa', 'active', '2025-08-01'),
  ('Hoàng Đức Thắng', 'active', '2025-08-01'),
  ('Ngô Thanh Tùng', 'active', '2025-08-01'),
  ('Dương Văn Phúc', 'active', '2025-08-01'),
  ('Trương Quang Hải', 'active', '2025-08-01'),
  ('Đinh Công Vinh', 'active', '2025-08-01'),
  ('Lý Hoàng Sơn', 'active', '2025-08-01'),
  ('Phan Thanh Bình', 'active', '2025-08-01'),
  ('Huỳnh Minh Trí', 'active', '2025-08-01'),
  ('Nguyễn Hữu Thọ', 'active', '2025-09-01'),
  ('Trần Đại Nghĩa', 'active', '2025-09-01'),
  ('Lê Quang Liêm', 'active', '2025-10-01'),
  ('Phạm Thành Luân', 'active', '2025-10-01'),
  ('Võ Minh Nhật', 'active', '2025-11-01'),
  ('Đặng Văn Lâm', 'inactive', '2025-08-01'),
  ('Mai Tiến Dũng', 'inactive', '2025-08-01'),
  ('Tô Quốc Bảo', 'inactive', '2025-08-01'),
  ('Châu Ngọc Quang', 'inactive', '2025-08-01'),
  ('Vũ Đình Toàn', 'inactive', '2025-09-01'),
  ('Hà Minh Châu', 'inactive', '2025-09-01'),
  ('Cao Xuân Trường', 'inactive', '2025-10-01'),
  ('Lương Thế Vinh', 'inactive', '2025-10-01'),
  ('Nguyễn Công Phượng', 'paused', '2025-08-01'),
  ('Trần Quốc Tuấn', 'paused', '2025-08-01'),
  ('Lê Văn Thịnh', 'paused', '2025-09-01');

-- Sample contributions (a few months for some members)
INSERT INTO contributions (member_id, month, amount, paid_at)
SELECT m.id, '2025-08', 200000, '2025-08-15'
FROM members m WHERE m.status = 'active' AND m.joined_at <= '2025-08-31';

INSERT INTO contributions (member_id, month, amount, paid_at)
SELECT m.id, '2025-09', 200000, '2025-09-15'
FROM members m WHERE m.status = 'active' AND m.joined_at <= '2025-09-30';

INSERT INTO contributions (member_id, month, amount, paid_at)
SELECT m.id, '2025-10', 200000, '2025-10-15'
FROM members m WHERE m.status = 'active' AND m.joined_at <= '2025-10-31';

-- Sample transactions (income from contributions + expenses)
INSERT INTO transactions (date, type, amount, category, description, member_id, contribution_id)
SELECT c.paid_at, 'income', c.amount, 'Quỹ hàng tháng',
  'Đóng quỹ tháng ' || c.month, c.member_id, c.id
FROM contributions c;

INSERT INTO transactions (date, type, amount, category, description) VALUES
  ('2025-08-20', 'expense', 500000, 'Thuê sân', 'Thuê sân bóng tuần 3 tháng 8'),
  ('2025-08-27', 'expense', 200000, 'Nước uống', 'Nước uống sau trận'),
  ('2025-09-10', 'expense', 500000, 'Thuê sân', 'Thuê sân bóng tuần 2 tháng 9'),
  ('2025-09-17', 'expense', 500000, 'Thuê sân', 'Thuê sân bóng tuần 3 tháng 9'),
  ('2025-09-25', 'expense', 300000, 'Nước uống', 'Nước + trái cây sau trận'),
  ('2025-10-05', 'expense', 500000, 'Thuê sân', 'Thuê sân bóng tuần 1 tháng 10'),
  ('2025-10-15', 'expense', 1500000, 'Trang phục', 'In áo đội 20 bộ'),
  ('2025-10-20', 'expense', 350000, 'Bóng', 'Mua 2 quả bóng mới');
