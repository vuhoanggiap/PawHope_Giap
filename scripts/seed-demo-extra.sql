-- Extra demo rows (run after seed-team-data.sql)
INSERT INTO adoptions (
  application_code, pet_id, user_id, applicant_address, housing_type,
  has_pet_experience, reason, apply_date, status, priority_level, review_status
) VALUES (
  'AD-2026-0001', 1, (SELECT user_id FROM users WHERE email = 'user1@example.com' LIMIT 1),
  '12 Nguyễn Trãi, Hà Nội', 'APARTMENT', 1,
  'Muốn cho Bé Bơ có mái ấm ổn định.', CURDATE(), 'PENDING', 'HIGH', 'NORMAL'
);

INSERT INTO notifications (user_id, message, type, related_id, is_read) VALUES
((SELECT user_id FROM users WHERE email = 'user1@example.com' LIMIT 1),
 'Đơn AD-2026-0001 cho Bé Bơ đang chờ duyệt.', 'SYSTEM',
 (SELECT adoption_id FROM adoptions WHERE application_code = 'AD-2026-0001' LIMIT 1), 0);
