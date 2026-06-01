SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE adoption_handovers;
TRUNCATE TABLE adoption_meetings;
TRUNCATE TABLE adoptions;
TRUNCATE TABLE pet_status_logs;
TRUNCATE TABLE pet_medical_records;
TRUNCATE TABLE pets;
TRUNCATE TABLE cart;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE item_donations;
TRUNCATE TABLE donations;
TRUNCATE TABLE expenses;
TRUNCATE TABLE notifications;
TRUNCATE TABLE email_logs;
TRUNCATE TABLE products;
TRUNCATE TABLE rescue_reports;
TRUNCATE TABLE volunteer_schedules;
TRUNCATE TABLE volunteer_interviews;
TRUNCATE TABLE volunteer_applications;
TRUNCATE TABLE shifts;
TRUNCATE TABLE users;
TRUNCATE TABLE kennels;
TRUNCATE TABLE adoption_guidelines;
TRUNCATE TABLE organization_info;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO organization_info (id, org_name, hotline, email, address, mission_statement)
VALUES (1, 'PawsHope - Sân Nhà Nhiều Chó', '0988015445', 'contact@pawshope.net', 'Hà Nội, Việt Nam',
        'Cứu hộ khẩn cấp - Chăm sóc y tế - Tìm mái ấm trọn đời cho chó mèo bị bỏ rơi.');

INSERT INTO adoption_guidelines (title, content, priority) VALUES
('Điều kiện nhận nuôi', 'Người nhận nuôi phải từ 18 tuổi, có nơi ở ổn định.', 1),
('Quy trình duyệt đơn', 'Sau khi điền đơn, đội ngũ sẽ phỏng vấn online và có thể yêu cầu thăm nhà.', 2),
('Phí nhận nuôi', 'Không thu phí, khuyến khích đóng góp tự nguyện.', 3);

INSERT INTO kennels (name, capacity, description) VALUES
('Khu Cún A', 20, 'Khu chó trưởng thành, có sân chơi rộng.'),
('Khu Miu B', 30, 'Khu mèo, lồng riêng và khu vui chơi.'),
('Khu cách ly', 10, 'Bé mới về, cần kiểm tra y tế.');

INSERT INTO products (product_name, description, price, stock_quantity) VALUES
('Áo thun PawsHope', 'Áo thun cotton in logo, gây quỹ cứu hộ', 199000, 50),
('Móc khóa hình chó', 'Móc khóa kim loại, dây da nâu', 35000, 100),
('Bộ bưu thiếp PawsHope', 'Bộ 6 bưu thiếp các bé đã được cứu hộ', 50000, 80),
('Mũ lưỡi trai PawsHope', 'Snapback in logo, cotton', 150000, 30);

INSERT INTO rescue_reports (reporter_name, reporter_phone, location_text, additional_note, status, tracking_code) VALUES
('Nguyễn Văn An', '0901234567', 'Đầu hẻm 234 Lê Văn Sỹ, Hà Nội', 'Bé mèo con bị thương ở chân, lông xám trắng.', 'PENDING', 'RP-2026-0001'),
('Phạm Thị Lan', '0987654321', 'Công viên Thống Nhất, Hà Nội', 'Một bé chó vàng nhỏ lang thang, đói khát.', 'IN_PROGRESS', 'RP-2026-0002'),
(NULL, '0911222333', 'Gầm cầu Long Biên, Hà Nội', 'Đàn 4 bé mèo sơ sinh bị bỏ rơi trong thùng giấy.', 'RESCUED', 'RP-2026-0003');

INSERT INTO pets (pet_code, name, species, breed, age_months, status, image_url, kennel_id, description, health_status) VALUES
('DOG-001', 'Bé Bơ', 'DOG', 'Golden', 24, 'AVAILABLE_FOR_ADOPTION',
 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80',
 (SELECT kennel_id FROM kennels WHERE name = 'Khu Cún A' LIMIT 1),
 'Khỏe mạnh, thích quấn người, đã tiêm phòng đủ.', 'VACCINATED'),
('CAT-001', 'Miu Vàng', 'CAT', 'Mèo ta', 8, 'AVAILABLE_FOR_ADOPTION',
 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80',
 (SELECT kennel_id FROM kennels WHERE name = 'Khu Miu B' LIMIT 1),
 'Nhút nhát nhưng thân thiện sau khi quen.', 'HEALTHY'),
('DOG-002', 'Cún Milo', 'DOG', 'Corgi', 14, 'AVAILABLE_FOR_ADOPTION',
 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80',
 (SELECT kennel_id FROM kennels WHERE name = 'Khu Cún A' LIMIT 1),
 'Năng động, thích đi dạo.', 'VACCINATED'),
('CAT-002', 'Luna', 'CAT', 'Anh lông ngắn', 18, 'AVAILABLE_FOR_ADOPTION',
 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80',
 (SELECT kennel_id FROM kennels WHERE name = 'Khu Miu B' LIMIT 1),
 'Đã triệt sản, quen khay vệ sinh.', 'STERILIZED');

INSERT INTO users (username, password_hash, full_name, email, phone, role) VALUES
('admin', '$2y$10$ND4EIRhrvbS1TLPnCOKWLeaLO0VH3xls78K3hAvCZZJUACidqSnw2', 'Quản trị PawsHope', 'admin@pawshope.net', '0988015445', 'ADMIN'),
('volunteer1', '$2y$10$3wxiKJk4FjdiTvuSyXT/heFl/DzpuknHGZqszq.Vvm/ik5qB2d2BC', 'TNV Trần Bình', 'volunteer1@pawshope.net', '0901111222', 'VOLUNTEER'),
('user1', '$2y$10$hMqidA/FGmkCguTBcEBTO.bC4RvOX6qTdWjXczYHsDt.Ajg.upeRi', 'Nguyễn Văn A', 'user1@example.com', '0903333444', 'USER');

INSERT INTO adoptions (
  application_code, pet_id, user_id, applicant_address, housing_type,
  has_pet_experience, reason, apply_date, status, priority_level, review_status
) VALUES (
  'AD-2026-0001', 1, (SELECT user_id FROM users WHERE email = 'user1@example.com' LIMIT 1),
  '12 Nguyễn Trãi, Hà Nội', 'APARTMENT', 1,
  'Muốn cho Bé Bơ có mái ấm ổn định.', CURDATE(), 'PENDING', 'HIGH', 'NORMAL'
);

INSERT INTO notifications (user_id, message, type, related_id, is_read)
SELECT user_id, 'Đơn AD-2026-0001 cho Bé Bơ đang chờ duyệt.', 'SYSTEM', 1, 0
FROM users WHERE email = 'user1@example.com' LIMIT 1;
