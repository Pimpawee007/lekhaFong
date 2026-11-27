-- ============================================================================
-- LeKhaFong Production - complete fresh-install database
-- Target: MySQL 8.0 or newer (utf8mb4, InnoDB, CHECK constraints, foreign keys)
--
-- SINGLE-FILE DEPLOYMENT POLICY
--   This is the ONLY SQL file required for a fresh installation. It already
--   contains the database, all eight tables, keys, constraints, demonstration
--   accounts, all 80 equipment records and the final image paths. Do not apply
--   any separate migration after importing this file.
--
-- This file creates the database if it does not exist. It never drops a database
-- or table. It is intended for a fresh installation. If records already exist,
-- primary-key errors stop the import instead of overwriting live data.
--
-- Includes all eight tables, demo accounts, 14 cameras, 30 lenses and 36 accessories.
-- Catalog photographs are stored as paths under /uploads/. The image files must
-- also be present in backend/uploads/; the SQL file does not store image binaries.
-- Demo passwords are for local coursework only. Change them before any real use.
-- ADMIN.age is optional and constrained to the range 18-120.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS lekhafong_production
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE lekhafong_production;

SET NAMES utf8mb4;

-- 1. USER_ACCOUNT
CREATE TABLE IF NOT EXISTS USER_ACCOUNT (
    account_id INT NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL,
    PRIMARY KEY (account_id),
    CONSTRAINT chk_user_role CHECK (role IN ('Admin', 'Customer'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CONTRACT
CREATE TABLE IF NOT EXISTS CONTRACT (
    contract_id INT NOT NULL,
    is_signed BOOLEAN NOT NULL,
    issued_date DATE NOT NULL,
    terms_version INT NOT NULL,
    PRIMARY KEY (contract_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ADMIN
CREATE TABLE IF NOT EXISTS ADMIN (
    admin_id INT NOT NULL,
    account_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    preferences TEXT NULL,
    address VARCHAR(100) NULL,
    email VARCHAR(100) NOT NULL,
    age INT NULL,
    PRIMARY KEY (admin_id),
    KEY idx_admin_account (account_id),
    CONSTRAINT fk_admin_account FOREIGN KEY (account_id) REFERENCES USER_ACCOUNT (account_id),
    CONSTRAINT chk_admin_age CHECK (age BETWEEN 18 AND 120)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CUSTOMER
CREATE TABLE IF NOT EXISTS CUSTOMER (
    customer_id INT NOT NULL,
    account_id INT NOT NULL,
    id_card_number BIGINT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address VARCHAR(100) NULL,
    phone VARCHAR(15) NOT NULL,
    PRIMARY KEY (customer_id),
    KEY idx_customer_account (account_id),
    CONSTRAINT fk_customer_account FOREIGN KEY (account_id) REFERENCES USER_ACCOUNT (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. LOGIN
CREATE TABLE IF NOT EXISTS LOGIN (
    login_id INT NOT NULL,
    account_id INT NOT NULL,
    login_time DATETIME NOT NULL,
    status VARCHAR(10) NOT NULL,
    PRIMARY KEY (login_id),
    KEY idx_login_account (account_id),
    CONSTRAINT fk_login_account FOREIGN KEY (account_id) REFERENCES USER_ACCOUNT (account_id),
    CONSTRAINT chk_login_status CHECK (status IN ('Success', 'Failed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. EQUIPMENT
CREATE TABLE IF NOT EXISTS EQUIPMENT (
    equipment_id INT NOT NULL,
    admin_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    brand VARCHAR(20) NOT NULL,
    serial_number VARCHAR(20) NOT NULL,
    description TEXT NULL,
    image_url TEXT NULL,
    release_year DATE NULL,
    model_series VARCHAR(10) NULL,
    status VARCHAR(15) NOT NULL,
    daily_rate INT NOT NULL,
    main_image VARCHAR(255) NULL,
    detail_images TEXT NULL,
    stock INT NOT NULL DEFAULT 1,
    PRIMARY KEY (equipment_id),
    KEY idx_equipment_admin (admin_id),
    CONSTRAINT fk_equipment_admin FOREIGN KEY (admin_id) REFERENCES ADMIN (admin_id),
    CONSTRAINT chk_equip_status CHECK (status IN ('Available', 'In Use', 'Maintenance')),
    CONSTRAINT chk_daily_rate CHECK (daily_rate > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. RENTAL
CREATE TABLE IF NOT EXISTS RENTAL (
    rental_id INT NOT NULL,
    customer_id INT NOT NULL,
    contract_id INT NOT NULL,
    rental_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(15) NOT NULL,
    PRIMARY KEY (rental_id),
    KEY idx_rental_customer (customer_id),
    KEY idx_rental_contract (contract_id),
    CONSTRAINT fk_rental_customer FOREIGN KEY (customer_id) REFERENCES CUSTOMER (customer_id),
    CONSTRAINT fk_rental_contract FOREIGN KEY (contract_id) REFERENCES CONTRACT (contract_id),
    CONSTRAINT chk_rental_status CHECK (status IN ('Active', 'Completed', 'Cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. ITEM
CREATE TABLE IF NOT EXISTS ITEM (
    item_id INT NOT NULL,
    equipment_id INT NOT NULL,
    rental_id INT NOT NULL,
    price_per_day DECIMAL(7,2) NOT NULL,
    PRIMARY KEY (item_id),
    KEY idx_item_equipment (equipment_id),
    KEY idx_item_rental (rental_id),
    CONSTRAINT fk_item_equipment FOREIGN KEY (equipment_id) REFERENCES EQUIPMENT (equipment_id),
    CONSTRAINT fk_item_rental FOREIGN KEY (rental_id) REFERENCES RENTAL (rental_id),
    CONSTRAINT chk_item_price CHECK (price_per_day > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Initial demonstration data
-- ----------------------------------------------------------------------------
INSERT INTO USER_ACCOUNT (account_id, username, password, role) VALUES
(1, 'admin_demo', 'DemoAdmin123', 'Admin'),
(2, 'customer_demo', 'DemoCustomer123', 'Customer');

-- Age 30 is sample demonstration data for the fictional Demo Admin only. It is
-- not a real person's age and existing production Admins may keep age NULL.
INSERT INTO ADMIN (admin_id, account_id, first_name, last_name, preferences, address, email, age) VALUES
(1, 1, 'Demo', 'Admin', 'Dark Mode', 'Bangkok', 'admin@example.com', 30);

INSERT INTO CUSTOMER (customer_id, account_id, id_card_number, first_name, last_name, email, address, phone) VALUES
(1, 2, NULL, 'Demo', 'Customer', 'customer@example.com', 'Bangkok', '0812345678');

-- Camera release_year values are the real announcement dates. Lens release_year
-- values use 1 January because only the release year was recorded for the
-- demonstration lens catalog.
INSERT INTO EQUIPMENT (equipment_id, admin_id, name, type, brand, serial_number, description, image_url, release_year, model_series, status, daily_rate, main_image, detail_images, stock) VALUES
  (1, 1, 'Sony A7IV Mirrorless Camera', 'Camera', 'Sony', 'SNY-A74-001', 'Full-frame mirrorless camera for professional video and photo.', NULL, '2021-01-01', 'A7 Series', 'Available', 1500, '/uploads/camera-catalog/1-sony-a7iv-mirrorless-camera-bh-main.webp', '["/uploads/camera-catalog/1-sony-a7iv-alt.webp","/uploads/camera-catalog/1-sony-a7iv-rear.webp","/uploads/camera-catalog/1-sony-a7iv-top.webp","/uploads/camera-catalog/1-sony-a7iv-main.webp"]', 1),
  (2, 1, 'Sony A7S III Mirrorless Camera', 'Camera', 'Sony', 'SNY-A7S3-001', 'Full-frame mirrorless optimized for 4K 120p low-light video production.', NULL, '2020-07-28', 'A7 Series', 'Available', 1800, '/uploads/camera-catalog/2-sony-a7s-iii-mirrorless-camera-bh-main.webp', '["/uploads/camera-catalog/2-sony-a7siii-rear.webp","/uploads/camera-catalog/2-sony-a7siii-top.webp","/uploads/camera-catalog/2-sony-a7siii-alt.webp","/uploads/camera-catalog/2-sony-a7siii-detail.webp"]', 1),
  (3, 1, 'Sony A7C II Compact Full-Frame', 'Camera', 'Sony', 'SNY-A7C2-001', 'Lightweight compact full-frame camera ideal for travel and vlogging.', NULL, '2023-08-29', 'A7C', 'Available', 1200, '/uploads/camera-catalog/3-sony-a7c-ii-compact-full-frame-bh-main.webp', '["/uploads/camera-catalog/3-sony-a7cii-front.webp","/uploads/camera-catalog/3-sony-a7cii-top.webp","/uploads/camera-catalog/3-sony-a7cii-alt.webp"]', 1),
  (4, 1, 'Sony FX3 Full-Frame Cinema Line', 'Cinema Camera', 'Sony', 'SNY-FX3-001', 'Compact cinema camera with active cooling fan and XLR top handle.', NULL, '2021-02-23', 'CinemaLine', 'In Use', 2200, '/uploads/camera-catalog/4-sony-fx3-full-frame-cinema-line-bh-main.webp', '["/uploads/camera-catalog/4-sony-fx3-side.webp","/uploads/camera-catalog/4-sony-fx3-side2.webp","/uploads/camera-catalog/4-sony-fx3-alt.webp"]', 1),
  (5, 1, 'Sony ZV-E10 II Vlogging Camera', 'Camera', 'Sony', 'SNY-ZVE10-01', 'APS-C content creator camera with product showcase mode and flip screen.', NULL, '2024-07-10', 'ZV Series', 'Available', 750, '/uploads/camera-catalog/5-sony-zv-e10-ii-vlogging-camera-bh-main.webp', '[]', 1),
  (6, 1, 'Canon EOS R5 Mirrorless Camera', 'Camera', 'Canon', 'CN-R5-001', '45MP full-frame mirrorless with 8K RAW video and 5-axis IBIS.', NULL, '2020-07-09', 'EOS R', 'Available', 2000, '/uploads/camera-catalog/6-canon-eos-r5-mirrorless-camera-bh-main.webp', '["/uploads/camera-catalog/6-canon-eos-r5-rear.webp","/uploads/camera-catalog/6-canon-eos-r5-top.webp","/uploads/camera-catalog/6-canon-eos-r5-side.webp","/uploads/camera-catalog/6-canon-eos-r5-alt.webp"]', 1),
  (7, 1, 'Canon EOS R6 Mark II', 'Camera', 'Canon', 'CN-R6M2-001', 'High-speed 24.2MP full-frame camera for hybrid photo and video.', NULL, '2022-11-02', 'EOS R', 'Available', 1600, '/uploads/camera-catalog/7-canon-eos-r6-mark-ii-bh-main.webp', '["/uploads/camera-catalog/7-canon-eos-r6-mark-ii-rear.webp","/uploads/camera-catalog/7-canon-eos-r6-mark-ii-top.webp","/uploads/camera-catalog/7-canon-eos-r6-mark-ii-alt.webp","/uploads/camera-catalog/7-canon-eos-r6-mark-ii-front.webp"]', 1),
  (8, 1, 'Canon EOS R8 Full-Frame', 'Camera', 'Canon', 'CN-R8-001', 'Entry-level lightweight full-frame mirrorless with Dual Pixel CMOS AF II.', NULL, '2023-02-08', 'EOS R', 'Available', 1100, '/uploads/camera-catalog/8-canon-eos-r8-full-frame-bh-main.webp', '["/uploads/camera-catalog/8-canon-eos-r8-rear.webp","/uploads/camera-catalog/8-canon-eos-r8-top.webp","/uploads/camera-catalog/8-canon-eos-r8-front.webp","/uploads/camera-catalog/8-canon-eos-r8-alt.webp"]', 1),
  (9, 1, 'Fujifilm X-T5 Mirrorless Camera', 'Camera', 'Fujifilm', 'FJ-XT5-001', '40.2MP APS-C retro-styled camera with classic film simulations.', NULL, '2022-11-02', 'X Series', 'Available', 1300, '/uploads/camera-catalog/9-fujifilm-x-t5-mirrorless-camera-bh-main.webp', '["/uploads/camera-catalog/9-fujifilm-x-t5-rear.webp","/uploads/camera-catalog/9-fujifilm-x-t5-top.webp","/uploads/camera-catalog/9-fujifilm-x-t5-front.webp","/uploads/camera-catalog/9-fujifilm-x-t5-alt.webp"]', 1),
  (10, 1, 'Fujifilm X100VI Digital Camera', 'Compact Camera', 'Fujifilm', 'FJ-X1006-001', 'Premium fixed-lens 23mm f/2 compact camera with built-in ND filter.', NULL, '2024-02-20', 'X100', 'In Use', 1400, '/uploads/camera-catalog/10-fujifilm-x100vi-digital-camera-bh-main.webp', '["/uploads/camera-catalog/10-fujifilm-x100vi-rear.webp","/uploads/camera-catalog/10-fujifilm-x100vi-alt.webp"]', 1),
  (11, 1, 'Fujifilm X-S20 Mirrorless Camera', 'Camera', 'Fujifilm', 'FJ-XS20-001', 'All-around APS-C hybrid camera with dedicated Vlog mode and long battery.', NULL, '2023-05-24', 'X Series', 'Available', 1000, '/uploads/camera-catalog/11-fujifilm-x-s20-mirrorless-camera-bh-main.webp', '["/uploads/camera-catalog/11-fujifilm-x-s20-front.webp","/uploads/camera-catalog/11-fujifilm-x-s20-rear.webp","/uploads/camera-catalog/11-fujifilm-x-s20-top.webp","/uploads/camera-catalog/11-fujifilm-x-s20-main.webp"]', 1),
  (12, 1, 'Nikon Z8 Full-Frame Mirrorless', 'Camera', 'Nikon', 'NK-Z8-001', '45.7MP stacked sensor flagship hybrid camera without mechanical shutter.', NULL, '2023-05-10', 'Z Series', 'Available', 2300, '/uploads/camera-catalog/12-nikon-z8-full-frame-mirrorless-bh-main.webp', '["/uploads/camera-catalog/12-nikon-z8-rear.webp","/uploads/camera-catalog/12-nikon-z8-top.webp","/uploads/camera-catalog/12-nikon-z8-front.webp","/uploads/camera-catalog/12-nikon-z8-alt.webp"]', 1),
  (13, 1, 'Nikon Zf Retro Full-Frame', 'Camera', 'Nikon', 'NK-ZF-001', 'Heritage magnesium-alloy body with modern 24.5MP full-frame sensor.', NULL, '2023-09-20', 'Z Series', 'Available', 1400, '/uploads/camera-catalog/13-nikon-zf-retro-full-frame-bh-main.webp', '["/uploads/camera-catalog/13-nikon-zf-rear.webp","/uploads/camera-catalog/13-nikon-zf-top.webp","/uploads/camera-catalog/13-nikon-zf-front.webp","/uploads/camera-catalog/13-nikon-zf-alt.webp"]', 1),
  (14, 1, 'Panasonic Lumix S5 IIX', 'Camera', 'Panasonic', 'PN-S52X-001', 'All-black full-frame hybrid camera supporting SSD recording and ProRes.', NULL, '2023-01-04', 'Lumix S', 'Maintenance', 1500, '/uploads/camera-catalog/14-panasonic-lumix-s5-iix-bh-main.webp', '["/uploads/camera-catalog/14-panasonic-lumix-s5-iix-rear.webp","/uploads/camera-catalog/14-panasonic-lumix-s5-iix-top.webp","/uploads/camera-catalog/14-panasonic-lumix-s5-iix-front.webp","/uploads/camera-catalog/14-panasonic-lumix-s5-iix-side.webp"]', 1),
  (15, 1, 'Sony FE 16-35mm f/2.8 GM II', 'Lens', 'Sony', 'LNS-SNY-001', 'Full-frame E-mount wide-angle zoom, 16-35mm f/2.8 G Master II. Suitable for landscape, architecture and gimbal work. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2022-01-01', 'G Master', 'Available', 1200, '/uploads/lens-catalog/15-sony-fe-16-35mm-f-2-8-gm-ii-bh-main.webp', '["/uploads/lens-catalog/15-sony-16-35-gm2-detail2.webp","/uploads/lens-catalog/15-sony-16-35-gm2-detail3.webp","/uploads/lens-catalog/15-sony-16-35-gm2-main.webp"]', 1),
  (16, 1, 'Sony FE 24-70mm f/2.8 GM II', 'Lens', 'Sony', 'LNS-SNY-002', 'Full-frame E-mount standard zoom, 24-70mm f/2.8 G Master II. General-purpose professional photo and video lens. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2022-01-01', 'G Master', 'Available', 1300, '/uploads/lens-catalog/16-sony-fe-24-70mm-f-2-8-gm-ii-bh-main.webp', '["/uploads/lens-catalog/16-sony-24-70-gm2-detail1.webp","/uploads/lens-catalog/16-sony-24-70-gm2-detail2.webp","/uploads/lens-catalog/16-sony-24-70-gm2-detail3.webp"]', 1),
  (17, 1, 'Sony FE 70-200mm f/2.8 GM OSS II', 'Lens', 'Sony', 'LNS-SNY-003', 'Full-frame E-mount telephoto zoom, 70-200mm f/2.8 G Master OSS II with optical stabilization. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'G Master', 'Available', 1500, '/uploads/lens-catalog/17-sony-fe-70-200mm-f-2-8-gm-oss-ii-bh-main.webp', '[]', 1),
  (18, 1, 'Sony FE 50mm f/1.2 GM', 'Lens', 'Sony', 'LNS-SNY-004', 'Full-frame E-mount fast prime, 50mm f/1.2 G Master. Low-light and shallow depth-of-field work. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'G Master', 'Available', 1000, '/uploads/lens-catalog/18-sony-fe-50mm-f-1-2-gm-bh-main.webp', '[]', 1),
  (19, 1, 'Sony FE 85mm f/1.4 GM', 'Lens', 'Sony', 'LNS-SNY-005', 'Full-frame E-mount portrait prime, 85mm f/1.4 G Master with smooth bokeh. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2016-01-01', 'G Master', 'Available', 900, '/uploads/lens-catalog/19-sony-fe-85mm-f-1-4-gm-bh-main.webp', '["/uploads/lens-catalog/19-sony-85-14-gm-detail1.webp"]', 1),
  (20, 1, 'Sony FE 90mm f/2.8 Macro G OSS', 'Lens', 'Sony', 'LNS-SNY-006', 'Full-frame E-mount 1:1 macro lens, 90mm f/2.8 G with optical stabilization. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2015-01-01', 'G Master', 'Available', 700, '/uploads/lens-catalog/20-sony-fe-90mm-f-2-8-macro-g-oss-bh-main.webp', '[]', 1),
  (21, 1, 'Canon RF 15-35mm f/2.8L IS USM', 'Lens', 'Canon', 'LNS-CAN-001', 'Full-frame RF-mount wide-angle zoom, 15-35mm f/2.8L IS USM with image stabilization. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'L Series', 'Available', 1200, '/uploads/lens-catalog/21-canon-rf-15-35mm-f-2-8l-is-usm-bh-main.webp', '["/uploads/lens-catalog/21-canon-15-35-28-detail1.webp"]', 1),
  (22, 1, 'Canon RF 24-70mm f/2.8L IS USM', 'Lens', 'Canon', 'LNS-CAN-002', 'Full-frame RF-mount standard zoom, 24-70mm f/2.8L IS USM for professional hybrid work. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'L Series', 'Available', 1300, '/uploads/lens-catalog/22-canon-rf-24-70mm-f-2-8l-is-usm-bh-main.webp', '["/uploads/lens-catalog/22-canon-24-70-28-detail1.webp","/uploads/lens-catalog/22-canon-24-70-28-detail2.webp"]', 1),
  (23, 1, 'Canon RF 70-200mm f/2.8L IS USM', 'Lens', 'Canon', 'LNS-CAN-003', 'Full-frame RF-mount telephoto zoom, 70-200mm f/2.8L IS USM with compact extending barrel. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2023-01-01', 'L Series', 'Available', 1500, '/uploads/lens-catalog/23-canon-rf-70-200mm-f-2-8l-is-usm-bh-main.webp', '[]', 1),
  (24, 1, 'Canon RF 50mm f/1.2L USM', 'Lens', 'Canon', 'LNS-CAN-004', 'Full-frame RF-mount fast prime, 50mm f/1.2L USM for low-light and portrait use. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2020-01-01', 'L Series', 'Available', 1000, '/uploads/lens-catalog/24-canon-rf-50mm-f-1-2l-usm-bh-main.webp', '["/uploads/lens-catalog/24-canon-50-12-detail1.webp"]', 1),
  (25, 1, 'Canon RF 85mm f/1.2L USM', 'Lens', 'Canon', 'LNS-CAN-005', 'Full-frame RF-mount portrait prime, 85mm f/1.2L USM with very shallow depth of field. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2020-01-01', 'L Series', 'Available', 1100, '/uploads/lens-catalog/25-canon-rf-85mm-f-1-2l-usm-bh-main.webp', '[]', 1),
  (26, 1, 'Canon RF 100mm f/2.8L Macro IS USM', 'Lens', 'Canon', 'LNS-CAN-006', 'Full-frame RF-mount 1.4x macro lens, 100mm f/2.8L Macro IS USM with SA control. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'L Series', 'Available', 800, '/uploads/lens-catalog/26-canon-rf-100mm-f-2-8l-macro-is-usm-bh-main.webp', '["/uploads/lens-catalog/26-canon-100-28-macro-detail1.webp","/uploads/lens-catalog/26-canon-100-28-macro-detail2.webp"]', 1),
  (27, 1, 'Nikon NIKKOR Z 14-30mm f/4 S', 'Lens', 'Nikon', 'LNS-NIK-001', 'Full-frame Z-mount ultra-wide zoom, 14-30mm f/4 S with a compact retractable barrel. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'S-Line', 'Available', 800, '/uploads/lens-catalog/27-nikon-nikkor-z-14-30mm-f-4-s-bh-main.webp', '["/uploads/lens-catalog/27-nikon-14-30-28-detail2.webp","/uploads/lens-catalog/27-nikon-14-30-28-detail1.webp","/uploads/lens-catalog/27-nikon-14-30-28-main.webp"]', 1),
  (28, 1, 'Nikon NIKKOR Z 24-70mm f/2.8 S', 'Lens', 'Nikon', 'LNS-NIK-002', 'Full-frame Z-mount standard zoom, 24-70mm f/2.8 S for professional hybrid production. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'S-Line', 'Available', 1300, '/uploads/lens-catalog/28-nikon-nikkor-z-24-70mm-f-2-8-s-bh-main.webp', '[]', 1),
  (29, 1, 'Nikon NIKKOR Z 70-200mm f/2.8 VR S', 'Lens', 'Nikon', 'LNS-NIK-003', 'Full-frame Z-mount telephoto zoom, 70-200mm f/2.8 VR S with vibration reduction. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2020-01-01', 'S-Line', 'Available', 1500, '/uploads/lens-catalog/29-nikon-nikkor-z-70-200mm-f-2-8-vr-s-bh-main.webp', '["/uploads/lens-catalog/29-nikon-70-200-28-detail2.webp","/uploads/lens-catalog/29-nikon-70-200-28-main.webp"]', 1),
  (30, 1, 'Nikon NIKKOR Z 50mm f/1.2 S', 'Lens', 'Nikon', 'LNS-NIK-004', 'Full-frame Z-mount fast prime, 50mm f/1.2 S for available-light and portrait work. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2020-01-01', 'S-Line', 'Available', 1000, '/uploads/lens-catalog/30-nikon-nikkor-z-50mm-f-1-2-s-bh-main.webp', '[]', 1),
  (31, 1, 'Nikon NIKKOR Z 85mm f/1.2 S', 'Lens', 'Nikon', 'LNS-NIK-005', 'Full-frame Z-mount portrait prime, 85mm f/1.2 S with refined bokeh. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2023-01-01', 'S-Line', 'Available', 1100, '/uploads/lens-catalog/31-nikon-nikkor-z-85mm-f-1-2-s-bh-main.webp', '[]', 1),
  (32, 1, 'Nikon NIKKOR Z MC 105mm f/2.8 VR S', 'Lens', 'Nikon', 'LNS-NIK-006', 'Full-frame Z-mount 1:1 macro lens, 105mm f/2.8 VR S for product and detail work. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'S-Line', 'Available', 800, '/uploads/lens-catalog/32-nikon-nikkor-z-mc-105mm-f-2-8-vr-s-bh-main.webp', '["/uploads/lens-catalog/32-nikon-105-28-macro-detail1.webp","/uploads/lens-catalog/32-nikon-105-28-macro-detail2.webp"]', 1),
  (33, 1, 'Fujinon XF 16mm f/1.4 R WR', 'Lens', 'Fujifilm', 'LNS-FUJ-001', 'APS-C X-mount wide prime, 16mm f/1.4 R WR (24mm full-frame equivalent) with weather sealing. Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2015-01-01', 'X Series', 'Available', 550, '/uploads/lens-catalog/33-fujinon-xf-16mm-f-1-4-r-wr-bh-main.webp', '[]', 1),
  (34, 1, 'Fujinon XF 18-55mm f/2.8-4 R LM OIS', 'Lens', 'Fujifilm', 'LNS-FUJ-002', 'APS-C X-mount standard zoom, 18-55mm f/2.8-4 R LM OIS (27-84mm equivalent) with stabilization. Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2012-01-01', 'X Series', 'Available', 500, '/uploads/lens-catalog/34-fujinon-xf-18-55mm-f-2-8-4-r-lm-ois-bh-main.webp', '["/uploads/lens-catalog/34-fuji-18-55-detail1.webp"]', 1),
  (35, 1, 'Fujinon XF 70-300mm f/4-5.6 R LM OIS WR', 'Lens', 'Fujifilm', 'LNS-FUJ-003', 'APS-C X-mount telephoto zoom, 70-300mm f/4-5.6 R LM OIS WR (107-457mm equivalent). Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2021-01-01', 'X Series', 'Available', 700, '/uploads/lens-catalog/35-fujinon-xf-70-300mm-f-4-5-6-r-lm-ois-wr-bh-main.webp', '["/uploads/lens-catalog/35-fuji-70-300-detail1.webp","/uploads/lens-catalog/35-fuji-70-300-detail2.webp"]', 1),
  (36, 1, 'Fujinon XF 23mm f/1.4 R LM WR', 'Lens', 'Fujifilm', 'LNS-FUJ-004', 'APS-C X-mount fast prime, 23mm f/1.4 R LM WR (35mm equivalent) for reportage and low light. Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2021-01-01', 'X Series', 'Available', 650, '/uploads/lens-catalog/36-fujinon-xf-23mm-f-1-4-r-lm-wr-bh-main.webp', '["/uploads/lens-catalog/36-fuji-23-14-detail1.webp","/uploads/lens-catalog/36-fuji-23-14-detail2.webp","/uploads/lens-catalog/36-fuji-23-14-detail3.webp"]', 1),
  (37, 1, 'Fujinon XF 56mm f/1.2 R', 'Lens', 'Fujifilm', 'LNS-FUJ-005', 'APS-C X-mount portrait prime, 56mm f/1.2 R (84mm equivalent) with very shallow depth of field. Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2014-01-01', 'X Series', 'Available', 700, '/uploads/lens-catalog/37-fujinon-xf-56mm-f-1-2-r-bh-main.webp', '[]', 1),
  (38, 1, 'Fujinon XF 80mm f/2.8 R LM OIS WR Macro', 'Lens', 'Fujifilm', 'LNS-FUJ-006', 'APS-C X-mount 1:1 macro lens, 80mm f/2.8 R LM OIS WR (122mm equivalent). Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2017-01-01', 'X Series', 'Available', 750, '/uploads/lens-catalog/38-fujinon-xf-80mm-f-2-8-r-lm-ois-wr-macro-bh-main.webp', '["/uploads/lens-catalog/38-fuji-80-28-macro-detail1.webp","/uploads/lens-catalog/38-fuji-80-28-macro-detail2.webp"]', 1),
  (39, 1, 'Sigma 14-24mm f/2.8 DG DN Art', 'Lens', 'Sigma', 'LNS-SIG-001', 'Full-frame L-mount ultra-wide zoom, 14-24mm f/2.8 DG DN Art for landscape and architecture. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'DG DN', 'Available', 800, '/uploads/lens-catalog/39-sigma-14-24mm-f-2-8-dg-dn-art-bh-main.webp', '["/uploads/lens-catalog/39-sigma-14-24-28-detail1.webp"]', 1),
  (40, 1, 'Panasonic Lumix S 24-105mm f/4 Macro O.I.S.', 'Lens', 'Panasonic', 'LNS-PAN-001', 'Full-frame L-mount standard zoom, 24-105mm f/4 Macro O.I.S. with optical stabilization. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'S Series', 'Available', 700, '/uploads/lens-catalog/40-panasonic-lumix-s-24-105mm-f-4-macro-o-i-s-bh-main.webp', '["/uploads/lens-catalog/40-panasonic-24-105-f4-detail1.webp","/uploads/lens-catalog/40-panasonic-24-105-f4-detail2.webp","/uploads/lens-catalog/40-panasonic-24-105-f4-detail3.webp"]', 1),
  (41, 1, 'Panasonic Lumix S PRO 70-200mm f/4 O.I.S.', 'Lens', 'Panasonic', 'LNS-PAN-002', 'Full-frame L-mount telephoto zoom, 70-200mm f/4 S PRO O.I.S. with constant aperture. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'S PRO', 'Available', 900, '/uploads/lens-catalog/41-panasonic-lumix-s-pro-70-200mm-f-4-o-i-s-bh-main.webp', '[]', 1),
  (42, 1, 'Panasonic Lumix S 35mm f/1.8', 'Lens', 'Panasonic', 'LNS-PAN-003', 'Full-frame L-mount wide prime, 35mm f/1.8 for lightweight reportage and video kits. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2020-01-01', 'S Series', 'Available', 500, '/uploads/lens-catalog/42-panasonic-lumix-s-35mm-f-1-8-bh-main.webp', '[]', 1),
  (43, 1, 'Sigma 90mm f/2.8 DG DN Contemporary', 'Lens', 'Sigma', 'LNS-SIG-002', 'Full-frame L-mount short telephoto prime, 90mm f/2.8 DG DN Contemporary for portrait and detail work. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'DG DN', 'Available', 650, '/uploads/lens-catalog/43-sigma-90mm-f-2-8-dg-dn-contemporary-bh-main.webp', '[]', 1),
  (44, 1, 'Panasonic Lumix S 70-300mm f/4.5-5.6 Macro O.I.S.', 'Lens', 'Panasonic', 'LNS-PAN-004', 'Full-frame L-mount telephoto zoom, 70-300mm f/4.5-5.6 Macro O.I.S. for distant and close-up work. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'S Series', 'Available', 650, '/uploads/lens-catalog/44-panasonic-lumix-s-70-300mm-f-4-5-5-6-macro-o-i-bh-main.webp', '["/uploads/lens-catalog/44-panasonic-70-300-detail1.webp","/uploads/lens-catalog/44-panasonic-70-300-detail2.webp"]', 1),
  (45, 1, 'Aputure STORM 80c', 'Continuous Light', 'Aputure', 'ACC-LGT-001', '80W RGBWW point-source LED, 1,800-20,000K, CRI 97/TLCI 99, Mini ProLock Bowens mount, AC or V-mount power, IP65. Includes 35-degree reflector, diffuser, power supply and soft case. Demonstration rental price.', NULL, NULL, 'STORM', 'Available', 600, '/uploads/lighting-catalog/45-aputure-storm-80c-bh-main.webp', '[]', 1),
  (46, 1, 'Aputure STORM 400x', 'Continuous Light', 'Aputure', 'ACC-LGT-002', '400W bi-color point-source LED, 2,500-10,000K, CRI/TLCI 95, ProLock Bowens mount, AC or battery power, IP65. Includes reflector, power supply and case. Demonstration rental price.', NULL, NULL, 'STORM', 'Available', 1200, '/uploads/lighting-catalog/46-aputure-storm-400x-bh-main.webp', '[]', 1),
  (47, 1, 'Aputure LS 600c Pro II', 'Continuous Light', 'Aputure', 'ACC-LGT-003', '600W full-color RGBWW point-source LED, 2,300-10,000K, Bowens mount, 720W max draw, AC or 48V battery power, CRMX/DMX control. Includes reflector, control box and case. Demonstration rental price.', NULL, NULL, 'LS Pro', 'Available', 1800, '/uploads/lighting-catalog/47-aputure-ls-600c-pro-ii-bh-main.webp', '[]', 1),
  (48, 1, 'amaran 100x S', 'Continuous Light', 'amaran', 'ACC-LGT-004', '100W bi-color COB LED, 2,700-6,500K, Bowens mount, AC or 48V DC power, Sidus Link control. Includes reflector and power supply. Demonstration rental price.', NULL, NULL, 'amaran S', 'Available', 300, '/uploads/lighting-catalog/48-amaran-100x-s-bh-main.webp', '[]', 1),
  (49, 1, 'amaran 200x S', 'Continuous Light', 'amaran', 'ACC-LGT-005', '200W bi-color COB LED, 2,700-6,500K, Bowens mount, AC or 48V DC power, Sidus Link control. Includes reflector and power supply. Demonstration rental price.', NULL, NULL, 'amaran S', 'Available', 450, '/uploads/lighting-catalog/49-amaran-200x-s-bh-main.webp', '[]', 1),
  (50, 1, 'amaran 300c', 'Continuous Light', 'amaran', 'ACC-LGT-006', '300W RGBWW COB LED, 2,500-7,500K, Bowens mount, AC or 48V DC power, Sidus Link control. Includes reflector and power supply. Demonstration rental price.', NULL, NULL, 'amaran C', 'Available', 700, '/uploads/lighting-catalog/50-amaran-300c-bh-main.webp', '[]', 1),
  (51, 1, 'Nanlite Forza 60B II', 'Continuous Light', 'Nanlite', 'ACC-LGT-007', '60W bi-color LED spotlight, 2,700-6,500K, CRI 96/TLCI 98, Bowens mount, AC or 14.4V battery power, NANLINK control. Includes reflector and power supply. Demonstration rental price.', NULL, NULL, 'Forza II', 'Available', 300, '/uploads/lighting-catalog/51-nanlite-forza-60b-ii-bh-main.webp', '[]', 1),
  (52, 1, 'Nanlite Forza 300B II', 'Continuous Light', 'Nanlite', 'ACC-LGT-008', '300W bi-color LED spotlight, 2,700-6,500K, CRI 96/TLCI 97, Bowens mount, AC or 14.4-14.8V battery power, DMX/NANLINK control. Includes reflector, control unit and power cable. Demonstration rental price.', NULL, NULL, 'Forza II', 'Available', 800, '/uploads/lighting-catalog/52-nanlite-forza-300b-ii-bh-main.webp', '[]', 1),
  (53, 1, 'Nanlite PavoTube II 30X', 'Continuous Light', 'Nanlite', 'ACC-LGT-009', '30W RGBWW LED tube, 2,700-7,500K, CRI 95/TLCI 97, built-in battery and NANLINK control. Includes mounting clips, power adapter and carry case. Demonstration rental price.', NULL, NULL, 'PavoTube', 'Available', 400, '/uploads/lighting-catalog/53-nanlite-pavotube-ii-30x-bh-main.webp', '[]', 1),
  (54, 1, 'RØDE Wireless PRO', 'Wireless Microphone', 'RØDE', 'ACC-MIC-001', 'Dual-channel wireless kit: 2 transmitters, 1 receiver, 2 Lavalier II microphones, smart charging case, MagClip GO mounts and cables. 32-bit float onboard recording, timecode, 3.5mm TRS and USB-C connectivity. Demonstration rental price.', NULL, NULL, 'Wireless', 'Available', 700, '/uploads/microphone-catalog/54-rode-wireless-pro-bh-main.webp', '[]', 1),
  (55, 1, 'RØDE Wireless GO II', 'Wireless Microphone', 'RØDE', 'ACC-MIC-002', 'Dual-channel wireless kit: 2 transmitters with built-in microphones and 1 dual-channel receiver. Onboard recording, 3.5mm TRS and USB-C connectivity. Standard kit does not include external lavalier microphones. Demonstration rental price.', NULL, NULL, 'Wireless', 'Available', 400, '/uploads/microphone-catalog/55-rode-wireless-go-ii-bh-main.webp', '["/uploads/microphone-catalog/55-rode-wireless-go-ii-detail1.webp", "/uploads/microphone-catalog/55-rode-wireless-go-ii-detail2.webp", "/uploads/microphone-catalog/55-rode-wireless-go-ii-detail3.webp"]', 1),
  (56, 1, 'RØDE Wireless ME', 'Wireless Microphone', 'RØDE', 'ACC-MIC-003', 'Single-channel wireless kit: 1 transmitter and 1 receiver with built-in microphones. 3.5mm TRS and USB-C connectivity. Standard kit does not include an external lavalier microphone. Demonstration rental price.', NULL, NULL, 'Wireless', 'Available', 250, '/uploads/microphone-catalog/56-rode-wireless-me-bh-main.webp', '[]', 1),
  (57, 1, 'DJI Mic 2', 'Wireless Microphone', 'DJI', 'ACC-MIC-004', 'Dual-channel kit: 2 transmitters, 1 receiver and charging case. 32-bit float onboard recording, 8GB storage per transmitter, 3.5mm TRS, USB-C and Bluetooth connectivity. Built-in microphones; external lavaliers not included in the standard combo. Demonstration rental price.', NULL, NULL, 'Mic', 'Available', 600, '/uploads/microphone-catalog/57-dji-mic-2-bh-main.webp', '[]', 1),
  (58, 1, 'DJI Mic Mini', 'Wireless Microphone', 'DJI', 'ACC-MIC-005', 'Compact dual-channel kit: 2 transmitters, 1 receiver and charging case. Built-in microphones, noise cancellation, 3.5mm TRS, USB-C and Bluetooth connectivity. External lavaliers not included. Demonstration rental price.', NULL, NULL, 'Mic', 'Available', 300, '/uploads/microphone-catalog/58-dji-mic-mini-bh-main.webp', '[]', 1),
  (59, 1, 'DJI Mic 3', 'Wireless Microphone', 'DJI', 'ACC-MIC-006', 'Dual-channel kit: 2 transmitters, 1 receiver and charging case. 32-bit float recording, timecode, dual-band wireless, 3.5mm TRS, USB-C and Bluetooth connectivity. Built-in microphones; external lavaliers not included. Demonstration rental price.', NULL, NULL, 'Mic', 'Available', 700, '/uploads/microphone-catalog/59-dji-mic-3-bh-main.webp', '[]', 1),
  (60, 1, 'Hollyland LARK MAX 2', 'Wireless Microphone', 'Hollyland', 'ACC-MIC-007', 'Dual-channel kit: 2 transmitters, camera receiver, USB-C receiver, charging case, 2 omnidirectional lavalier microphones and cables. 32-bit float 8GB onboard recording, timecode and 3.5mm/USB-C connectivity. Demonstration rental price.', NULL, NULL, 'LARK MAX', 'Available', 600, '/uploads/microphone-catalog/60-hollyland-lark-max-2-bh-main.webp', '[]', 1),
  (61, 1, 'Hollyland LARK M2S', 'Wireless Microphone', 'Hollyland', 'ACC-MIC-008', 'Combo kit: 2 transmitters, camera receiver, USB-C receiver, charging case and cables. Built-in microphones, 24-bit recording, 3.5mm TRS and USB-C connectivity. External lavaliers not included. Demonstration rental price.', NULL, NULL, 'LARK M2', 'Available', 350, '/uploads/microphone-catalog/61-hollyland-lark-m2s-bh-main.webp', '[]', 1),
  (62, 1, 'Hollyland LARK M2', 'Wireless Microphone', 'Hollyland', 'ACC-MIC-009', 'Combo kit: 2 transmitters, camera receiver, USB-C receiver, charging case and cables. Built-in microphones, 24-bit audio, 3.5mm TRS and USB-C connectivity. External lavaliers not included. Demonstration rental price.', NULL, NULL, 'LARK M2', 'Available', 300, '/uploads/microphone-catalog/62-hollyland-lark-m2-bh-main.webp', '[]', 1),
  (63, 1, 'NiSi True Color CPL 82mm', 'Camera Filter', 'NiSi', 'ACC-FLT-001', '82mm circular polarizer with True Color coating. Fits lenses with an 82mm front thread; step-up rings for other diameters are optional and not included. Demonstration rental price.', NULL, NULL, 'True Color', 'Available', 150, '/uploads/filter-catalog/63-nisi-true-color-cpl-82mm-bh-main.webp', '[]', 1),
  (64, 1, 'NiSi True Color ND-VARIO Pro Nano 1-5 Stops 82mm', 'Camera Filter', 'NiSi', 'ACC-FLT-002', '82mm variable neutral density filter, 1-5 stops, True Color coating. Fits 82mm lens threads; step-up rings are optional and not included. Demonstration rental price.', NULL, NULL, 'True Color', 'Available', 250, '/uploads/filter-catalog/64-nisi-true-color-nd-vario-pro-nano-1-5-stops-82-bh-main.webp', '[]', 1),
  (65, 1, 'NiSi Black Mist 1/4 82mm', 'Camera Filter', 'NiSi', 'ACC-FLT-003', '82mm Black Mist 1/4 diffusion filter for highlight bloom and reduced contrast. Fits 82mm lens threads; step-up rings are optional and not included. Demonstration rental price.', NULL, NULL, 'Black Mist', 'Available', 180, '/uploads/filter-catalog/65-nisi-black-mist-1-4-82mm-bh-main.webp', '[]', 1),
  (66, 1, 'K&F Concept Nano-X Variable ND ND2-32 82mm', 'Camera Filter', 'K&F Concept', 'ACC-FLT-004', '82mm Nano-X variable ND filter, ND2-ND32 (1-5 stops), slim rotating frame. Fits 82mm lens threads; step-up rings are optional and not included. Demonstration rental price.', NULL, NULL, 'Nano-X', 'Available', 200, '/uploads/filter-catalog/66-kandf-concept-nano-x-variable-nd-nd2-32-82mm-bh-main.webp', '[]', 1),
  (67, 1, 'K&F Concept Nano-X CPL 82mm', 'Camera Filter', 'K&F Concept', 'ACC-FLT-005', '82mm Nano-X circular polarizer for reflection control and colour saturation. Fits 82mm lens threads; step-up rings are optional and not included. Demonstration rental price.', NULL, NULL, 'Nano-X', 'Available', 120, '/uploads/filter-catalog/67-kandf-concept-nano-x-cpl-82mm-bh-main.webp', '[]', 1),
  (68, 1, 'K&F Concept Nano-X Black Diffusion 1/4 82mm', 'Camera Filter', 'K&F Concept', 'ACC-FLT-006', '82mm Nano-X Black Diffusion 1/4 filter for softened highlights and a cinematic look. Fits 82mm lens threads; step-up rings are optional and not included. Demonstration rental price.', NULL, NULL, 'Nano-X', 'Available', 150, '/uploads/filter-catalog/68-kandf-concept-nano-x-black-diffusion-1-4-82mm-bh-main.webp', '[]', 1),
  (69, 1, 'Tiffen 82mm Variable ND 2-8 Stops', 'Camera Filter', 'Tiffen', 'ACC-FLT-007', '82mm variable neutral density filter, 2-8 stops (ND4-ND256), aluminium rotating mount. Fits 82mm lens threads; step-up rings are optional and not included. Demonstration rental price.', NULL, NULL, 'Variable', 'Available', 300, '/uploads/filter-catalog/69-tiffen-82mm-variable-nd-2-8-stops-bh-main.webp', '[]', 1),
  (70, 1, 'Tiffen 82mm Circular Polarizer', 'Camera Filter', 'Tiffen', 'ACC-FLT-008', '82mm circular polarizer for glare control and deeper skies. Fits 82mm lens threads; step-up rings are optional and not included. Demonstration rental price.', NULL, NULL, 'CPL', 'Available', 180, '/uploads/filter-catalog/70-tiffen-82mm-circular-polarizer-bh-main.webp', '[]', 1),
  (71, 1, 'Tiffen 82mm Black Pro-Mist 1/4', 'Camera Filter', 'Tiffen', 'ACC-FLT-009', '82mm Black Pro-Mist 1/4 diffusion filter for reduced highlights and contrast. Fits 82mm lens threads; step-up rings are optional and not included. Demonstration rental price.', NULL, NULL, 'Black Pro', 'Available', 220, '/uploads/filter-catalog/71-tiffen-82mm-black-pro-mist-1-4-bh-main.webp', '[]', 1),
  (72, 1, 'Manfrotto Befree Advanced Carbon Fiber Travel Tripod with 494 Ball Head', 'Tripod', 'Manfrotto', 'ACC-TRP-001', 'Carbon fiber 4-section travel tripod kit with 494 ball head and quick-release plate. Max height 150cm, folded 41cm, payload 8kg, flat base, carry case included. Demonstration rental price.', NULL, NULL, 'Befree', 'Available', 350, '/uploads/tripod-catalog/72-manfrotto-befree-advanced-carbon-fiber-travel-bh-main.webp', '[]', 1),
  (73, 1, 'Manfrotto 190XPRO4 Aluminum Tripod with XPRO Ball Head', 'Tripod', 'Manfrotto', 'ACC-TRP-002', 'Aluminum 4-section tripod kit with XPRO ball head and quick-release plate. Max height 160cm, folded 49cm, payload 7kg, 90-degree column, flat base. Carry case not included. Demonstration rental price.', NULL, NULL, '190XPRO4', 'Available', 450, '/uploads/tripod-catalog/73-manfrotto-190xpro4-aluminum-tripod-with-xpro-b-bh-main.webp', '[]', 1),
  (74, 1, 'Manfrotto 504X Fluid Video Head with 645 FTT Carbon Fiber Tripod', 'Tripod', 'Manfrotto', 'ACC-TRP-003', 'Carbon fiber video tripod kit with 504X fluid head, 4-step counterbalance and quick-release plate. Max height 157cm, folded 73cm, payload 25kg, 100mm bowl with 75mm adapter, carry case included. Demonstration rental price.', NULL, NULL, '504X', 'Available', 1200, '/uploads/tripod-catalog/74-manfrotto-504x-fluid-video-head-with-645-ftt-c-bh-main.webp', '[]', 1),
  (75, 1, 'Benro Tortoise 24C Carbon Fiber Tripod with GX30 Ball Head', 'Tripod', 'Benro', 'ACC-TRP-004', 'Columnless carbon fiber 4-section tripod kit with GX30 ball head and Arca-Swiss plate. Max height 130cm, folded 54cm, payload 14kg, flat base. Carry case not listed. Demonstration rental price.', NULL, NULL, 'Tortoise', 'Available', 500, '/uploads/tripod-catalog/75-benro-tortoise-24c-carbon-fiber-tripod-with-gx-bh-main.webp', '[]', 1),
  (76, 1, 'Benro Mach3 TMA37C Carbon Fiber Tripod with GX30 Ball Head', 'Tripod', 'Benro', 'ACC-TRP-005', '9-layer carbon fiber 3-section tripod kit with GX30 ball head and Arca-Swiss plate. Max height 162cm, folded 63cm, payload 16kg, flat base. Carry case not listed. Demonstration rental price.', NULL, NULL, 'Mach3', 'Available', 650, '/uploads/tripod-catalog/76-benro-mach3-tma37c-carbon-fiber-tripod-with-gx-bh-main.webp', '[]', 1),
  (77, 1, 'Benro Aero 4 Travel Angel Video Tripod Kit with S4 PRO Head', 'Tripod', 'Benro', 'ACC-TRP-006', 'Aluminum travel video tripod kit with S4 PRO fluid head and quick-release plate. Max height 166cm, folded 55cm, payload 4kg, 60mm flat base, carry case included. Demonstration rental price.', NULL, NULL, 'Aero 4', 'Available', 550, '/uploads/tripod-catalog/77-benro-aero-4-travel-angel-video-tripod-kit-wit-bh-main.webp', '[]', 1),
  (78, 1, 'SmallRig AD-01 Heavy-Duty Video Tripod with Fluid Head', 'Tripod', 'SmallRig', 'ACC-TRP-007', 'Aluminum heavy-duty video tripod kit with fluid head, Manfrotto-style and DJI RS 2 quick-release compatibility. Max height 186cm, folded 89cm, payload 8kg, 75mm bowl, carry bag included. Demonstration rental price.', NULL, NULL, 'AD-01', 'Available', 500, '/uploads/tripod-catalog/78-smallrig-ad-01-heavy-duty-video-tripod-with-fl-bh-main.webp', '[]', 1),
  (79, 1, 'SmallRig FreeBlazer Heavy-Duty Carbon Fiber Tripod Kit (AD-100/3989)', 'Tripod', 'SmallRig', 'ACC-TRP-008', 'Carbon fiber heavy-duty video tripod kit with fluid head and quick-release plate. Max height 197cm, folded 99cm, payload 10kg, 75mm bowl, carry bag included. Demonstration rental price.', NULL, NULL, 'FreeBlazer', 'Available', 800, '/uploads/tripod-catalog/79-smallrig-freeblazer-heavy-duty-carbon-fiber-tr-bh-main.webp', '[]', 1),
  (80, 1, 'SmallRig CT-10 Aluminum Tripod with Arca Ball Head (3935)', 'Tripod', 'SmallRig', 'ACC-TRP-009', 'Aluminum travel tripod kit with Arca ball head and quick-release plate. Max height 180cm, folded 60cm, tripod payload 15kg, flat base. Demonstration rental price.', NULL, NULL, 'CT-10', 'Available', 300, '/uploads/tripod-catalog/80-smallrig-ct-10-aluminum-tripod-with-arca-ball-bh-main.webp', '[]', 1);


-- No LOGIN, CONTRACT, RENTAL or ITEM rows are seeded. They are created by
-- normal application use or by the documented API test cases.

-- Verification (read-only):
SELECT 'EQUIPMENT' AS table_name, COUNT(*) AS row_count FROM EQUIPMENT
UNION ALL SELECT 'USER_ACCOUNT', COUNT(*) FROM USER_ACCOUNT
UNION ALL SELECT 'ADMIN', COUNT(*) FROM ADMIN
UNION ALL SELECT 'CUSTOMER', COUNT(*) FROM CUSTOMER;
SELECT type, COUNT(*) AS total FROM EQUIPMENT GROUP BY type ORDER BY type;
