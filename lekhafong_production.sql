-- ============================================================================
-- LeKhaFong Production - complete fresh-install database
-- Target: MySQL 8.0 or newer (utf8mb4, InnoDB, CHECK constraints, foreign keys)
--
-- This file creates the database if it does not exist. It never drops a database
-- or table. It is intended for a fresh installation. If records already exist,
-- primary-key errors stop the import instead of overwriting live data.
--
-- Includes all eight tables, demo accounts, 14 cameras and 30 lenses.
-- Camera and lens photographs are stored as paths under /uploads/. The files
-- must be copied to backend/uploads/ from the approved catalog asset package.
-- Demo passwords are for local coursework only. Change them before any real use.
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
    PRIMARY KEY (admin_id),
    KEY idx_admin_account (account_id),
    CONSTRAINT fk_admin_account FOREIGN KEY (account_id) REFERENCES USER_ACCOUNT (account_id)
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

INSERT INTO ADMIN (admin_id, account_id, first_name, last_name, preferences, address, email) VALUES
(1, 1, 'Demo', 'Admin', 'Dark Mode', 'Bangkok', 'admin@example.com');

INSERT INTO CUSTOMER (customer_id, account_id, id_card_number, first_name, last_name, email, address, phone) VALUES
(1, 2, NULL, 'Demo', 'Customer', 'customer@example.com', 'Bangkok', '0812345678');

-- Camera release_year values are the real announcement dates. Lens release_year
-- values use 1 January because only the release year was recorded for the
-- demonstration lens catalog.
INSERT INTO EQUIPMENT (equipment_id, admin_id, name, type, brand, serial_number, description, image_url, release_year, model_series, status, daily_rate, main_image, detail_images, stock) VALUES
(1, 1, 'Sony A7IV Mirrorless Camera', 'Camera', 'Sony', 'SNY-A74-001', 'Full-frame mirrorless camera for professional video and photo.', NULL, '2021-01-01', 'A7 Series', 'Available', 1500, '/uploads/camera-catalog/1-sony-a7iv-main.webp', '["/uploads/camera-catalog/1-sony-a7iv-rear.webp","/uploads/camera-catalog/1-sony-a7iv-top.webp","/uploads/camera-catalog/1-sony-a7iv-side.webp","/uploads/camera-catalog/1-sony-a7iv-alt.webp"]', 1),
(2, 1, 'Sony A7S III Mirrorless Camera', 'Camera', 'Sony', 'SNY-A7S3-001', 'Full-frame mirrorless optimized for 4K 120p low-light video production.', NULL, '2020-07-28', 'A7 Series', 'Available', 1800, '/uploads/camera-catalog/2-sony-a7siii-main.webp', '["/uploads/camera-catalog/2-sony-a7siii-rear.webp","/uploads/camera-catalog/2-sony-a7siii-top.webp","/uploads/camera-catalog/2-sony-a7siii-alt.webp","/uploads/camera-catalog/2-sony-a7siii-detail.webp"]', 1),
(3, 1, 'Sony A7C II Compact Full-Frame', 'Camera', 'Sony', 'SNY-A7C2-001', 'Lightweight compact full-frame camera ideal for travel and vlogging.', NULL, '2023-08-29', 'A7C', 'Available', 1200, '/uploads/camera-catalog/3-sony-a7cii-main.webp', '["/uploads/camera-catalog/3-sony-a7cii-front.webp","/uploads/camera-catalog/3-sony-a7cii-top.webp","/uploads/camera-catalog/3-sony-a7cii-alt.webp"]', 1),
(4, 1, 'Sony FX3 Full-Frame Cinema Line', 'Cinema Camera', 'Sony', 'SNY-FX3-001', 'Compact cinema camera with active cooling fan and XLR top handle.', NULL, '2021-02-23', 'CinemaLine', 'In Use', 2200, '/uploads/camera-catalog/4-sony-fx3-main.webp', '["/uploads/camera-catalog/4-sony-fx3-side.webp","/uploads/camera-catalog/4-sony-fx3-side2.webp","/uploads/camera-catalog/4-sony-fx3-alt.webp"]', 1),
(5, 1, 'Sony ZV-E10 II Vlogging Camera', 'Camera', 'Sony', 'SNY-ZVE10-01', 'APS-C content creator camera with product showcase mode and flip screen.', NULL, '2024-07-10', 'ZV Series', 'Available', 750, '/uploads/camera-catalog/5-sony-zv-e10ii-main.webp', '[]', 1),
(6, 1, 'Canon EOS R5 Mirrorless Camera', 'Camera', 'Canon', 'CN-R5-001', '45MP full-frame mirrorless with 8K RAW video and 5-axis IBIS.', NULL, '2020-07-09', 'EOS R', 'Available', 2000, '/uploads/camera-catalog/6-canon-eos-r5-main.webp', '["/uploads/camera-catalog/6-canon-eos-r5-rear.webp","/uploads/camera-catalog/6-canon-eos-r5-top.webp","/uploads/camera-catalog/6-canon-eos-r5-side.webp","/uploads/camera-catalog/6-canon-eos-r5-alt.webp"]', 1),
(7, 1, 'Canon EOS R6 Mark II', 'Camera', 'Canon', 'CN-R6M2-001', 'High-speed 24.2MP full-frame camera for hybrid photo and video.', NULL, '2022-11-02', 'EOS R', 'Available', 1600, '/uploads/camera-catalog/7-canon-eos-r6-mark-ii-main.webp', '["/uploads/camera-catalog/7-canon-eos-r6-mark-ii-rear.webp","/uploads/camera-catalog/7-canon-eos-r6-mark-ii-top.webp","/uploads/camera-catalog/7-canon-eos-r6-mark-ii-alt.webp","/uploads/camera-catalog/7-canon-eos-r6-mark-ii-front.webp"]', 1),
(8, 1, 'Canon EOS R8 Full-Frame', 'Camera', 'Canon', 'CN-R8-001', 'Entry-level lightweight full-frame mirrorless with Dual Pixel CMOS AF II.', NULL, '2023-02-08', 'EOS R', 'Available', 1100, '/uploads/camera-catalog/8-canon-eos-r8-main.webp', '["/uploads/camera-catalog/8-canon-eos-r8-rear.webp","/uploads/camera-catalog/8-canon-eos-r8-top.webp","/uploads/camera-catalog/8-canon-eos-r8-front.webp","/uploads/camera-catalog/8-canon-eos-r8-alt.webp"]', 1),
(9, 1, 'Fujifilm X-T5 Mirrorless Camera', 'Camera', 'Fujifilm', 'FJ-XT5-001', '40.2MP APS-C retro-styled camera with classic film simulations.', NULL, '2022-11-02', 'X Series', 'Available', 1300, '/uploads/camera-catalog/9-fujifilm-x-t5-main.webp', '["/uploads/camera-catalog/9-fujifilm-x-t5-rear.webp","/uploads/camera-catalog/9-fujifilm-x-t5-top.webp","/uploads/camera-catalog/9-fujifilm-x-t5-front.webp","/uploads/camera-catalog/9-fujifilm-x-t5-alt.webp"]', 1),
(10, 1, 'Fujifilm X100VI Digital Camera', 'Compact Camera', 'Fujifilm', 'FJ-X1006-001', 'Premium fixed-lens 23mm f/2 compact camera with built-in ND filter.', NULL, '2024-02-20', 'X100', 'In Use', 1400, '/uploads/camera-catalog/10-fujifilm-x100vi-main.webp', '["/uploads/camera-catalog/10-fujifilm-x100vi-rear.webp","/uploads/camera-catalog/10-fujifilm-x100vi-alt.webp"]', 1),
(11, 1, 'Fujifilm X-S20 Mirrorless Camera', 'Camera', 'Fujifilm', 'FJ-XS20-001', 'All-around APS-C hybrid camera with dedicated Vlog mode and long battery.', NULL, '2023-05-24', 'X Series', 'Available', 1000, '/uploads/camera-catalog/11-fujifilm-x-s20-main.webp', '["/uploads/camera-catalog/11-fujifilm-x-s20-rear.webp","/uploads/camera-catalog/11-fujifilm-x-s20-top.webp","/uploads/camera-catalog/11-fujifilm-x-s20-front.webp","/uploads/camera-catalog/11-fujifilm-x-s20-alt.webp"]', 1),
(12, 1, 'Nikon Z8 Full-Frame Mirrorless', 'Camera', 'Nikon', 'NK-Z8-001', '45.7MP stacked sensor flagship hybrid camera without mechanical shutter.', NULL, '2023-05-10', 'Z Series', 'Available', 2300, '/uploads/camera-catalog/12-nikon-z8-main.webp', '["/uploads/camera-catalog/12-nikon-z8-rear.webp","/uploads/camera-catalog/12-nikon-z8-top.webp","/uploads/camera-catalog/12-nikon-z8-front.webp","/uploads/camera-catalog/12-nikon-z8-alt.webp"]', 1),
(13, 1, 'Nikon Zf Retro Full-Frame', 'Camera', 'Nikon', 'NK-ZF-001', 'Heritage magnesium-alloy body with modern 24.5MP full-frame sensor.', NULL, '2023-09-20', 'Z Series', 'Available', 1400, '/uploads/camera-catalog/13-nikon-zf-main.webp', '["/uploads/camera-catalog/13-nikon-zf-rear.webp","/uploads/camera-catalog/13-nikon-zf-top.webp","/uploads/camera-catalog/13-nikon-zf-front.webp","/uploads/camera-catalog/13-nikon-zf-alt.webp"]', 1),
(14, 1, 'Panasonic Lumix S5 IIX', 'Camera', 'Panasonic', 'PN-S52X-001', 'All-black full-frame hybrid camera supporting SSD recording and ProRes.', NULL, '2023-01-04', 'Lumix S', 'Maintenance', 1500, '/uploads/camera-catalog/14-panasonic-lumix-s5-iix-main.webp', '["/uploads/camera-catalog/14-panasonic-lumix-s5-iix-rear.webp","/uploads/camera-catalog/14-panasonic-lumix-s5-iix-top.webp","/uploads/camera-catalog/14-panasonic-lumix-s5-iix-front.webp","/uploads/camera-catalog/14-panasonic-lumix-s5-iix-side.webp"]', 1),
(15, 1, 'Sony FE 16-35mm f/2.8 GM II', 'Lens', 'Sony', 'LNS-SNY-001', 'Full-frame E-mount wide-angle zoom, 16-35mm f/2.8 G Master II. Suitable for landscape, architecture and gimbal work. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2022-01-01', 'G Master', 'Available', 1200, '/uploads/lens-catalog/15-sony-16-35-gm2-main.webp', '["/uploads/lens-catalog/15-sony-16-35-gm2-detail1.webp","/uploads/lens-catalog/15-sony-16-35-gm2-detail2.webp","/uploads/lens-catalog/15-sony-16-35-gm2-detail3.webp"]', 1),
(16, 1, 'Sony FE 24-70mm f/2.8 GM II', 'Lens', 'Sony', 'LNS-SNY-002', 'Full-frame E-mount standard zoom, 24-70mm f/2.8 G Master II. General-purpose professional photo and video lens. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2022-01-01', 'G Master', 'Available', 1300, '/uploads/lens-catalog/16-sony-24-70-gm2-main.webp', '["/uploads/lens-catalog/16-sony-24-70-gm2-detail1.webp","/uploads/lens-catalog/16-sony-24-70-gm2-detail2.webp","/uploads/lens-catalog/16-sony-24-70-gm2-detail3.webp"]', 1),
(17, 1, 'Sony FE 70-200mm f/2.8 GM OSS II', 'Lens', 'Sony', 'LNS-SNY-003', 'Full-frame E-mount telephoto zoom, 70-200mm f/2.8 G Master OSS II with optical stabilization. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'G Master', 'Available', 1500, '/uploads/lens-catalog/17-sony-70-200-gm2-main.webp', '[]', 1),
(18, 1, 'Sony FE 50mm f/1.2 GM', 'Lens', 'Sony', 'LNS-SNY-004', 'Full-frame E-mount fast prime, 50mm f/1.2 G Master. Low-light and shallow depth-of-field work. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'G Master', 'Available', 1000, '/uploads/lens-catalog/18-sony-50-12-gm-main.webp', '[]', 1),
(19, 1, 'Sony FE 85mm f/1.4 GM', 'Lens', 'Sony', 'LNS-SNY-005', 'Full-frame E-mount portrait prime, 85mm f/1.4 G Master with smooth bokeh. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2016-01-01', 'G Master', 'Available', 900, '/uploads/lens-catalog/19-sony-85-14-gm-main.webp', '["/uploads/lens-catalog/19-sony-85-14-gm-detail1.webp"]', 1),
(20, 1, 'Sony FE 90mm f/2.8 Macro G OSS', 'Lens', 'Sony', 'LNS-SNY-006', 'Full-frame E-mount 1:1 macro lens, 90mm f/2.8 G with optical stabilization. Mount: Sony E. Coverage: Full-frame. Demonstration rental price.', NULL, '2015-01-01', 'G Master', 'Available', 700, '/uploads/lens-catalog/20-sony-90-28-macro-main.webp', '[]', 1),
(21, 1, 'Canon RF 15-35mm f/2.8L IS USM', 'Lens', 'Canon', 'LNS-CAN-001', 'Full-frame RF-mount wide-angle zoom, 15-35mm f/2.8L IS USM with image stabilization. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'L Series', 'Available', 1200, '/uploads/lens-catalog/21-canon-15-35-28-main.webp', '["/uploads/lens-catalog/21-canon-15-35-28-detail1.webp"]', 1),
(22, 1, 'Canon RF 24-70mm f/2.8L IS USM', 'Lens', 'Canon', 'LNS-CAN-002', 'Full-frame RF-mount standard zoom, 24-70mm f/2.8L IS USM for professional hybrid work. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'L Series', 'Available', 1300, '/uploads/lens-catalog/22-canon-24-70-28-main.webp', '["/uploads/lens-catalog/22-canon-24-70-28-detail1.webp","/uploads/lens-catalog/22-canon-24-70-28-detail2.webp"]', 1),
(23, 1, 'Canon RF 70-200mm f/2.8L IS USM', 'Lens', 'Canon', 'LNS-CAN-003', 'Full-frame RF-mount telephoto zoom, 70-200mm f/2.8L IS USM with compact extending barrel. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2023-01-01', 'L Series', 'Available', 1500, '/uploads/lens-catalog/23-canon-70-200-28-main.webp', '[]', 1),
(24, 1, 'Canon RF 50mm f/1.2L USM', 'Lens', 'Canon', 'LNS-CAN-004', 'Full-frame RF-mount fast prime, 50mm f/1.2L USM for low-light and portrait use. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2020-01-01', 'L Series', 'Available', 1000, '/uploads/lens-catalog/24-canon-50-12-main.webp', '["/uploads/lens-catalog/24-canon-50-12-detail1.webp"]', 1),
(25, 1, 'Canon RF 85mm f/1.2L USM', 'Lens', 'Canon', 'LNS-CAN-005', 'Full-frame RF-mount portrait prime, 85mm f/1.2L USM with very shallow depth of field. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2020-01-01', 'L Series', 'Available', 1100, '/uploads/lens-catalog/25-canon-85-12-main.webp', '[]', 1),
(26, 1, 'Canon RF 100mm f/2.8L Macro IS USM', 'Lens', 'Canon', 'LNS-CAN-006', 'Full-frame RF-mount 1.4x macro lens, 100mm f/2.8L Macro IS USM with SA control. Mount: Canon RF. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'L Series', 'Available', 800, '/uploads/lens-catalog/26-canon-100-28-macro-main.webp', '["/uploads/lens-catalog/26-canon-100-28-macro-detail1.webp","/uploads/lens-catalog/26-canon-100-28-macro-detail2.webp"]', 1),
(27, 1, 'Nikon NIKKOR Z 14-30mm f/4 S', 'Lens', 'Nikon', 'LNS-NIK-001', 'Full-frame Z-mount ultra-wide zoom, 14-30mm f/4 S with a compact retractable barrel. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'S-Line', 'Available', 800, '/uploads/lens-catalog/27-nikon-14-30-28-main.webp', '["/uploads/lens-catalog/27-nikon-14-30-28-detail1.webp","/uploads/lens-catalog/27-nikon-14-30-28-detail2.webp","/uploads/lens-catalog/27-nikon-14-30-28-detail3.webp"]', 1),
(28, 1, 'Nikon NIKKOR Z 24-70mm f/2.8 S', 'Lens', 'Nikon', 'LNS-NIK-002', 'Full-frame Z-mount standard zoom, 24-70mm f/2.8 S for professional hybrid production. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'S-Line', 'Available', 1300, '/uploads/lens-catalog/28-nikon-24-70-28-main.webp', '[]', 1),
(29, 1, 'Nikon NIKKOR Z 70-200mm f/2.8 VR S', 'Lens', 'Nikon', 'LNS-NIK-003', 'Full-frame Z-mount telephoto zoom, 70-200mm f/2.8 VR S with vibration reduction. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2020-01-01', 'S-Line', 'Available', 1500, '/uploads/lens-catalog/29-nikon-70-200-28-main.webp', '["/uploads/lens-catalog/29-nikon-70-200-28-detail1.webp","/uploads/lens-catalog/29-nikon-70-200-28-detail2.webp"]', 1),
(30, 1, 'Nikon NIKKOR Z 50mm f/1.2 S', 'Lens', 'Nikon', 'LNS-NIK-004', 'Full-frame Z-mount fast prime, 50mm f/1.2 S for available-light and portrait work. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2020-01-01', 'S-Line', 'Available', 1000, '/uploads/lens-catalog/30-nikon-50-12-main.webp', '[]', 1),
(31, 1, 'Nikon NIKKOR Z 85mm f/1.2 S', 'Lens', 'Nikon', 'LNS-NIK-005', 'Full-frame Z-mount portrait prime, 85mm f/1.2 S with refined bokeh. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2023-01-01', 'S-Line', 'Available', 1100, '/uploads/lens-catalog/31-nikon-85-12-main.webp', '[]', 1),
(32, 1, 'Nikon NIKKOR Z MC 105mm f/2.8 VR S', 'Lens', 'Nikon', 'LNS-NIK-006', 'Full-frame Z-mount 1:1 macro lens, 105mm f/2.8 VR S for product and detail work. Mount: Nikon Z. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'S-Line', 'Available', 800, '/uploads/lens-catalog/32-nikon-105-28-macro-main.webp', '["/uploads/lens-catalog/32-nikon-105-28-macro-detail1.webp","/uploads/lens-catalog/32-nikon-105-28-macro-detail2.webp"]', 1),
(33, 1, 'Fujinon XF 16mm f/1.4 R WR', 'Lens', 'Fujifilm', 'LNS-FUJ-001', 'APS-C X-mount wide prime, 16mm f/1.4 R WR (24mm full-frame equivalent) with weather sealing. Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2015-01-01', 'X Series', 'Available', 550, '/uploads/lens-catalog/33-fuji-16-14-main.webp', '[]', 1),
(34, 1, 'Fujinon XF 18-55mm f/2.8-4 R LM OIS', 'Lens', 'Fujifilm', 'LNS-FUJ-002', 'APS-C X-mount standard zoom, 18-55mm f/2.8-4 R LM OIS (27-84mm equivalent) with stabilization. Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2012-01-01', 'X Series', 'Available', 500, '/uploads/lens-catalog/34-fuji-18-55-main.webp', '["/uploads/lens-catalog/34-fuji-18-55-detail1.webp"]', 1),
(35, 1, 'Fujinon XF 70-300mm f/4-5.6 R LM OIS WR', 'Lens', 'Fujifilm', 'LNS-FUJ-003', 'APS-C X-mount telephoto zoom, 70-300mm f/4-5.6 R LM OIS WR (107-457mm equivalent). Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2021-01-01', 'X Series', 'Available', 700, '/uploads/lens-catalog/35-fuji-70-300-main.webp', '["/uploads/lens-catalog/35-fuji-70-300-detail1.webp","/uploads/lens-catalog/35-fuji-70-300-detail2.webp"]', 1),
(36, 1, 'Fujinon XF 23mm f/1.4 R LM WR', 'Lens', 'Fujifilm', 'LNS-FUJ-004', 'APS-C X-mount fast prime, 23mm f/1.4 R LM WR (35mm equivalent) for reportage and low light. Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2021-01-01', 'X Series', 'Available', 650, '/uploads/lens-catalog/36-fuji-23-14-main.webp', '["/uploads/lens-catalog/36-fuji-23-14-detail1.webp","/uploads/lens-catalog/36-fuji-23-14-detail2.webp","/uploads/lens-catalog/36-fuji-23-14-detail3.webp"]', 1),
(37, 1, 'Fujinon XF 56mm f/1.2 R', 'Lens', 'Fujifilm', 'LNS-FUJ-005', 'APS-C X-mount portrait prime, 56mm f/1.2 R (84mm equivalent) with very shallow depth of field. Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2014-01-01', 'X Series', 'Available', 700, '/uploads/lens-catalog/37-fuji-56-12-main.webp', '[]', 1),
(38, 1, 'Fujinon XF 80mm f/2.8 R LM OIS WR Macro', 'Lens', 'Fujifilm', 'LNS-FUJ-006', 'APS-C X-mount 1:1 macro lens, 80mm f/2.8 R LM OIS WR (122mm equivalent). Mount: Fujifilm X. Coverage: APS-C. Demonstration rental price.', NULL, '2017-01-01', 'X Series', 'Available', 750, '/uploads/lens-catalog/38-fuji-80-28-macro-main.webp', '["/uploads/lens-catalog/38-fuji-80-28-macro-detail1.webp","/uploads/lens-catalog/38-fuji-80-28-macro-detail2.webp"]', 1),
(39, 1, 'Sigma 14-24mm f/2.8 DG DN Art', 'Lens', 'Sigma', 'LNS-SIG-001', 'Full-frame L-mount ultra-wide zoom, 14-24mm f/2.8 DG DN Art for landscape and architecture. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'DG DN', 'Available', 800, '/uploads/lens-catalog/39-sigma-14-24-28-main.webp', '["/uploads/lens-catalog/39-sigma-14-24-28-detail1.webp"]', 1),
(40, 1, 'Panasonic Lumix S 24-105mm f/4 Macro O.I.S.', 'Lens', 'Panasonic', 'LNS-PAN-001', 'Full-frame L-mount standard zoom, 24-105mm f/4 Macro O.I.S. with optical stabilization. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'S Series', 'Available', 700, '/uploads/lens-catalog/40-panasonic-24-105-f4-main.webp', '["/uploads/lens-catalog/40-panasonic-24-105-f4-detail1.webp","/uploads/lens-catalog/40-panasonic-24-105-f4-detail2.webp","/uploads/lens-catalog/40-panasonic-24-105-f4-detail3.webp"]', 1),
(41, 1, 'Panasonic Lumix S PRO 70-200mm f/4 O.I.S.', 'Lens', 'Panasonic', 'LNS-PAN-002', 'Full-frame L-mount telephoto zoom, 70-200mm f/4 S PRO O.I.S. with constant aperture. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2019-01-01', 'S PRO', 'Available', 900, '/uploads/lens-catalog/41-panasonic-70-200-f4-main.webp', '[]', 1),
(42, 1, 'Panasonic Lumix S 35mm f/1.8', 'Lens', 'Panasonic', 'LNS-PAN-003', 'Full-frame L-mount wide prime, 35mm f/1.8 for lightweight reportage and video kits. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2020-01-01', 'S Series', 'Available', 500, '/uploads/lens-catalog/42-panasonic-35-18-main.webp', '[]', 1),
(43, 1, 'Sigma 90mm f/2.8 DG DN Contemporary', 'Lens', 'Sigma', 'LNS-SIG-002', 'Full-frame L-mount short telephoto prime, 90mm f/2.8 DG DN Contemporary for portrait and detail work. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'DG DN', 'Available', 650, '/uploads/lens-catalog/43-sigma-90-28-main.webp', '[]', 1),
(44, 1, 'Panasonic Lumix S 70-300mm f/4.5-5.6 Macro O.I.S.', 'Lens', 'Panasonic', 'LNS-PAN-004', 'Full-frame L-mount telephoto zoom, 70-300mm f/4.5-5.6 Macro O.I.S. for distant and close-up work. Mount: Leica L. Coverage: Full-frame. Demonstration rental price.', NULL, '2021-01-01', 'S Series', 'Available', 650, '/uploads/lens-catalog/44-panasonic-70-300-main.webp', '["/uploads/lens-catalog/44-panasonic-70-300-detail1.webp","/uploads/lens-catalog/44-panasonic-70-300-detail2.webp"]', 1);

-- No LOGIN, CONTRACT, RENTAL or ITEM rows are seeded. They are created by
-- normal application use or by the documented API test cases.

-- Verification (read-only):
SELECT 'EQUIPMENT' AS table_name, COUNT(*) AS row_count FROM EQUIPMENT
UNION ALL SELECT 'USER_ACCOUNT', COUNT(*) FROM USER_ACCOUNT
UNION ALL SELECT 'ADMIN', COUNT(*) FROM ADMIN
UNION ALL SELECT 'CUSTOMER', COUNT(*) FROM CUSTOMER;
SELECT type, COUNT(*) AS total FROM EQUIPMENT GROUP BY type ORDER BY type;
