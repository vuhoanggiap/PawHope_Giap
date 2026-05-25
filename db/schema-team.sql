-- Schema team PawsHope (tham chiếu frontend)
-- Nguồn: DDL do nhóm cung cấp

-- 1. THÔNG TIN TỔ CHỨC
CREATE TABLE organization_info (
    id INT PRIMARY KEY DEFAULT 1,
    org_name VARCHAR(255),
    logo_url VARCHAR(255),
    hotline VARCHAR(20),
    email VARCHAR(100),
    facebook_link VARCHAR(255),
    address TEXT,
    mission_statement TEXT
) ENGINE=InnoDB;

-- 2. HƯỚNG DẪN NHẬN NUÔI
CREATE TABLE adoption_guidelines (
    guide_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority INT DEFAULT 0,
    INDEX idx_guidelines_priority (priority)
) ENGINE=InnoDB;

-- 3. NGƯỜI DÙNG
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role ENUM('ADMIN', 'VOLUNTEER', 'USER') DEFAULT 'USER',
    status TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB;

-- 4. TÌNH NGUYỆN VIÊN & LỊCH TRỰC
CREATE TABLE volunteer_applications (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    address TEXT,
    occupation VARCHAR(100),
    skills TEXT,
    experience_with_animals TEXT,
    reason_to_join TEXT,
    available_days SET('MON','TUE','WED','THU','FRI','SAT','SUN'),
    preferred_tasks SET('RESCUE','FEEDING','CLEANING','MEDICAL_SUPPORT','ADOPTION_SUPPORT','EVENT','TRANSPORT'),
    has_transport TINYINT(1) DEFAULT 0,
    status ENUM('PENDING','INTERVIEW_SCHEDULED','INTERVIEWED','APPROVED','REJECTED') DEFAULT 'PENDING',
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    rejection_reason TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_volapp_status (status),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE volunteer_interviews (
    interview_id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    interviewer_id INT NOT NULL,
    interview_datetime DATETIME NOT NULL,
    meeting_type ENUM('ONLINE','OFFLINE') DEFAULT 'ONLINE',
    meeting_link VARCHAR(255),
    location_text TEXT,
    status ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW') DEFAULT 'SCHEDULED',
    result ENUM('PENDING','PASSED','FAILED') DEFAULT 'PENDING',
    evaluation_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES volunteer_applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (interviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_volinterview_app (application_id),
    INDEX idx_volinterview_interviewer (interviewer_id),
    INDEX idx_volinterview_datetime (interview_datetime),
    INDEX idx_volinterview_result (result)
) ENGINE=InnoDB;

CREATE TABLE shifts (
    shift_id INT PRIMARY KEY AUTO_INCREMENT,
    shift_name VARCHAR(50),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    crosses_midnight TINYINT(1) DEFAULT 0
) ENGINE=InnoDB;

INSERT INTO shifts (shift_name, start_time, end_time, crosses_midnight) VALUES
('Ca 1', '08:00:00', '12:00:00', 0),
('Ca 2', '12:00:00', '16:00:00', 0),
('Ca 3', '16:00:00', '20:00:00', 0),
('Ca 4', '20:00:00', '00:00:00', 1);

CREATE TABLE volunteer_schedule_windows (
    window_id INT PRIMARY KEY AUTO_INCREMENT,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    open_at DATETIME NOT NULL,
    close_at DATETIME NOT NULL,
    status ENUM('NOT_OPEN','OPEN','CLOSED') DEFAULT 'NOT_OPEN',
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_volunteer_schedule_windows (week_start_date),
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_window_date (week_start_date, week_end_date),
    INDEX idx_window_open_close (open_at, close_at),
    INDEX idx_window_status (status)
) ENGINE=InnoDB;

CREATE TABLE volunteer_schedule_weeks (
    week_id INT PRIMARY KEY AUTO_INCREMENT,
    window_id INT NOT NULL,
    user_id INT NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    status ENUM('DRAFT','SUBMITTED','APPROVED','REJECTED') DEFAULT 'DRAFT',
    submitted_at DATETIME NULL,
    approved_by INT NULL,
    approved_at DATETIME NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_week (user_id, week_start_date),
    FOREIGN KEY (window_id) REFERENCES volunteer_schedule_windows(window_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_volunteer_week_window (window_id),
    INDEX idx_volunteer_week_user (user_id),
    INDEX idx_volunteer_week_date (week_start_date, week_end_date),
    INDEX idx_volunteer_week_status (status)
) ENGINE=InnoDB;

CREATE TABLE volunteer_schedules (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    week_id INT NOT NULL,
    user_id INT NOT NULL,
    shift_id INT NOT NULL,
    work_date DATE NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_shift_reg (user_id, shift_id, work_date),
    FOREIGN KEY (week_id) REFERENCES volunteer_schedule_weeks(week_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shifts(shift_id),
    INDEX idx_schedules_week (week_id),
    INDEX idx_schedules_user (user_id),
    INDEX idx_schedules_date (work_date, shift_id)
) ENGINE=InnoDB;

-- 5. CỨU HỘ
CREATE TABLE rescue_reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    reporter_name VARCHAR(100),
    reporter_phone VARCHAR(20) NOT NULL,
    location_text TEXT NOT NULL,
    urgency_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    injury_type ENUM('NONE','BLEEDING','BROKEN_BONE','DISEASE','OTHER') DEFAULT 'NONE',
    temperament ENUM('FRIENDLY','SCARED','AGGRESSIVE') DEFAULT 'SCARED',
    behavior ENUM('ACTIVE','IMMOBILE','LIMPING') DEFAULT 'ACTIVE',
    additional_note TEXT,
    image_url VARCHAR(255),
    status ENUM('PENDING', 'IN_PROGRESS', 'RESCUED', 'FAILED') DEFAULT 'PENDING',
    assigned_to INT NULL,
    tracking_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rescue_status (status),
    INDEX idx_rescue_assigned (assigned_to),
    INDEX idx_rescue_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. CHUỒNG & THÚ
CREATE TABLE kennels (
    kennel_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    description TEXT
) ENGINE=InnoDB;

CREATE TABLE pets (
    pet_id INT PRIMARY KEY AUTO_INCREMENT,
    pet_code VARCHAR(20) UNIQUE,
    name VARCHAR(100) NOT NULL,
    gender ENUM('MALE','FEMALE','UNKNOWN') DEFAULT 'UNKNOWN',
    species ENUM('DOG', 'CAT', 'OTHER') NOT NULL,
    breed VARCHAR(100),
    age_months INT,
    weight_kg DECIMAL(5,2),
    health_status ENUM('HEALTHY','VACCINATED','STERILIZED','UNDER_TREATMENT','SPECIAL_NEEDS') DEFAULT 'HEALTHY',
    personality SET('FRIENDLY','SHY','AGGRESSIVE','ACTIVE','LAZY','SOCIAL'),
    status ENUM('NOT_READY_FOR_ADOPTION','AVAILABLE_FOR_ADOPTION','PENDING_ADOPTION','ADOPTED','DECEASED') DEFAULT 'NOT_READY_FOR_ADOPTION',
    image_url VARCHAR(255),
    kennel_id INT,
    from_report_id INT NULL,
    intake_date DATE,
    description TEXT,
    INDEX idx_pets_status (status),
    INDEX idx_pets_species (species),
    FOREIGN KEY (kennel_id) REFERENCES kennels(kennel_id) ON DELETE SET NULL,
    FOREIGN KEY (from_report_id) REFERENCES rescue_reports(report_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE pet_medical_records (
    medical_id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    record_type ENUM('DEWORMING', 'VACCINATION', 'STERILIZATION', 'CHECKUP', 'TREATMENT') NOT NULL,
    record_date DATE NOT NULL,
    next_due_date DATE NULL,
    description TEXT,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_medical_pet (pet_id),
    INDEX idx_medical_type (record_type),
    INDEX idx_medical_next_due (next_due_date)
) ENGINE=InnoDB;

CREATE TABLE pet_status_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    old_status ENUM('NOT_READY_FOR_ADOPTION','AVAILABLE_FOR_ADOPTION','PENDING_ADOPTION','ADOPTED','DECEASED'),
    new_status ENUM('NOT_READY_FOR_ADOPTION','AVAILABLE_FOR_ADOPTION','PENDING_ADOPTION','ADOPTED','DECEASED') NOT NULL,
    note TEXT,
    updated_by INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(user_id),
    INDEX idx_pet_status_logs_pet (pet_id),
    INDEX idx_pet_status_logs_updated_by (updated_by)
) ENGINE=InnoDB;

-- 7. NHẬN NUÔI
CREATE TABLE adoptions (
    adoption_id INT PRIMARY KEY AUTO_INCREMENT,
    application_code VARCHAR(20) UNIQUE,
    pet_id INT NOT NULL,
    user_id INT NOT NULL,
    applicant_address TEXT,
    housing_type ENUM('APARTMENT','HOUSE','DORMITORY','OTHER'),
    has_pet_experience TINYINT(1) DEFAULT 0,
    current_pets TEXT,
    working_schedule VARCHAR(255),
    reason TEXT,
    family_agreement TINYINT(1) DEFAULT 1,
    financial_commitment TINYINT(1) DEFAULT 1,
    apply_date DATE NOT NULL,
    status ENUM('PENDING','MEETING_SCHEDULED','INTERVIEWING','APPROVED','REJECTED','HANDOVER_SCHEDULED','COMPLETED','CANCELLED') DEFAULT 'PENDING',
    priority_level ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
    review_status ENUM('NORMAL','NEED_MORE_INFO','SUSPICIOUS','PRIORITY') DEFAULT 'NORMAL',
    missing_info_note TEXT,
    adoption_fee DECIMAL(15,2) DEFAULT 0,
    payment_method ENUM('PAYPAL') DEFAULT 'PAYPAL',
    payment_status ENUM('UNPAID','PAID','WAIVED') DEFAULT 'UNPAID',
    paid_at DATETIME NULL,
    notes TEXT,
    processed_by INT NULL,
    reviewed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_adoptions_status (status),
    INDEX idx_adoptions_user (user_id),
    INDEX idx_adoptions_pet (pet_id),
    FOREIGN KEY (pet_id) REFERENCES pets(pet_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE adoption_meetings (
    meeting_id INT PRIMARY KEY AUTO_INCREMENT,
    adoption_id INT NOT NULL,
    staff_id INT NOT NULL,
    meeting_datetime DATETIME NOT NULL,
    meeting_location TEXT,
    status ENUM('SCHEDULED','COMPLETED','CANCELLED','RESCHEDULED') DEFAULT 'SCHEDULED',
    result ENUM('PENDING','PASSED','FAILED') DEFAULT 'PENDING',
    housing_check_result TEXT,
    experience_evaluation TEXT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adoption_id) REFERENCES adoptions(adoption_id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_meeting_datetime (meeting_datetime),
    INDEX idx_meeting_status (status),
    INDEX idx_meeting_result (result)
) ENGINE=InnoDB;

CREATE TABLE adoption_handovers (
    handover_id INT PRIMARY KEY AUTO_INCREMENT,
    adoption_id INT NOT NULL,
    handled_by INT NULL,
    pickup_datetime DATETIME NOT NULL,
    pickup_location TEXT,
    handover_method ENUM('AT_SHELTER','HOME_VISIT','MEETUP_POINT') DEFAULT 'AT_SHELTER',
    status ENUM('SCHEDULED','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW') DEFAULT 'SCHEDULED',
    adopter_confirmed TINYINT(1) DEFAULT 0,
    items_given TEXT,
    handover_photo_url VARCHAR(255),
    completion_note TEXT,
    completed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adoption_id) REFERENCES adoptions(adoption_id) ON DELETE CASCADE,
    FOREIGN KEY (handled_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_pickup_datetime (pickup_datetime),
    INDEX idx_handover_status (status)
) ENGINE=InnoDB;

CREATE TABLE adoption_followups (
    followup_id INT PRIMARY KEY AUTO_INCREMENT,
    adoption_id INT NOT NULL,
    followup_date DATE NOT NULL,
    followup_type ENUM('PHONE_CALL','MESSAGE','PHOTO_UPDATE','HOME_VISIT','HEALTH_CHECK') DEFAULT 'MESSAGE',
    status ENUM('SCHEDULED','CONFIRMED','COMPLETED','CANCELLED','NO_RESPONSE') DEFAULT 'SCHEDULED',
    confirmed_at DATETIME NULL,
    completed_at DATETIME NULL,
    pet_condition ENUM('EXCELLENT','GOOD','NORMAL','NEEDS_ATTENTION','URGENT') DEFAULT 'GOOD',
    adopter_feedback TEXT,
    staff_note TEXT,
    photo_url VARCHAR(255),
    next_followup_date DATE NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adoption_id) REFERENCES adoptions(adoption_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_followup_adoption (adoption_id),
    INDEX idx_followup_date (followup_date),
    INDEX idx_followup_status (status),
    INDEX idx_followup_condition (pet_condition)
) ENGINE=InnoDB;

-- 8. SHOP
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT chk_stock_non_negative CHECK (stock_quantity >= 0)
) ENGINE=InnoDB;

CREATE TABLE cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subtotal_amount DECIMAL(15,2) NOT NULL,
    shipping_fee DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('PAYPAL') DEFAULT 'PAYPAL',
    payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
    order_status ENUM('CONFIRMED','PREPARING','SHIPPING','DELIVERED','CANCELLED') DEFAULT 'CONFIRMED',
    shipping_address TEXT NOT NULL,
    receiver_name VARCHAR(100) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (order_status),
    INDEX idx_orders_payment (payment_status),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name_snapshot VARCHAR(150),
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB;

CREATE TABLE donation_campaigns (
    campaign_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('COMING_SOON','ONGOING','COMPLETED','CANCELLED') DEFAULT 'COMING_SOON',
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_campaign_status (status),
    INDEX idx_campaign_date (start_date, end_date)
) ENGINE=InnoDB;

-- 9. QUYÊN GÓP
CREATE TABLE donations (
    donation_id INT PRIMARY KEY AUTO_INCREMENT,
    campaign_id INT NOT NULL,
    user_id INT NULL,
    donor_name_manual VARCHAR(100) DEFAULT 'GUEST',
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('PAYPAL') DEFAULT 'PAYPAL',
    payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
    source_order_id INT NULL,
    donation_type ENUM('DONATE','PRODUCT_SALE') NOT NULL,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES donation_campaigns(campaign_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (source_order_id) REFERENCES orders(order_id),
    INDEX idx_donations_campaign (campaign_id),
    INDEX idx_donations_user (user_id),
    INDEX idx_donations_payment (payment_status),
    INDEX idx_donations_type (donation_type)
) ENGINE=InnoDB;

CREATE TABLE item_donations (
    item_donation_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    donor_name_manual VARCHAR(100),
    item_name VARCHAR(150) NOT NULL,
    received_by INT NULL,
    note TEXT,
    category ENUM('FOOD', 'MEDICAL_SUPPLY', 'CLEANING', 'EQUIPMENT', 'OTHER'),
    quantity VARCHAR(50),
    status ENUM('PENDING', 'RECEIVED', 'USED') DEFAULT 'PENDING',
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (received_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 10. CHI PHÍ & THÔNG BÁO
CREATE TABLE expenses (
    expense_id INT PRIMARY KEY AUTO_INCREMENT,
    category ENUM('FOOD', 'MEDICAL', 'UTILITY', 'FACILITY', 'OTHER') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    receipt_image_url VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
    noti_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type ENUM('ADOPTION_MEETING','ADOPTION_HANDOVER','ADOPTION_FOLLOWUP','RESCUE_ASSIGNED','ORDER_STATUS','DONATION','VOLUNTEER_INTERVIEW','VOLUNTEER_RESULT','SYSTEM') DEFAULT 'SYSTEM',
    related_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_noti_user_read (user_id, is_read),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE email_logs (
    email_id INT PRIMARY KEY AUTO_INCREMENT,
    recipient_email VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    email_type ENUM('VOLUNTEER_INTERVIEW','VOLUNTEER_RESULT','ADOPTION_MEETING','ADOPTION_RESULT','ADOPTION_HANDOVER','ADOPTION_FOLLOWUP','ORDER_STATUS','DONATION','SYSTEM') DEFAULT 'SYSTEM',
    related_table VARCHAR(50),
    related_id INT NULL,
    status ENUM('PENDING','SENT','FAILED') DEFAULT 'PENDING',
    error_message TEXT,
    sent_by INT NULL,
    sent_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sent_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_email_recipient (recipient_email),
    INDEX idx_email_type (email_type),
    INDEX idx_email_status (status),
    INDEX idx_email_related (related_table, related_id)
) ENGINE=InnoDB;
