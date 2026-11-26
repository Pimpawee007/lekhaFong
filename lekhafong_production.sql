DROP DATABASE IF EXISTS lekhafong_production;

CREATE DATABASE lekhafong_production;
USE lekhafong_production;

-- USER_ACCOUNT
CREATE TABLE USER_ACCOUNT (
    account_id INT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL, 
    role VARCHAR(10) NOT NULL,
    CONSTRAINT chk_user_role CHECK (role IN ('Admin', 'Customer'))
);

-- CONTRACT
CREATE TABLE CONTRACT (
    contract_id INT PRIMARY KEY,
    is_signed BOOLEAN NOT NULL,
    issued_date DATE NOT NULL,
    terms_version INT NOT NULL
);

-- LOGIN
CREATE TABLE LOGIN (
    login_id INT PRIMARY KEY,
    account_id INT NOT NULL,
    login_time DATETIME NOT NULL,
    status VARCHAR(10) NOT NULL,
    FOREIGN KEY (account_id) REFERENCES USER_ACCOUNT(account_id),
    CONSTRAINT chk_login_status CHECK (status IN ('Success', 'Failed'))
);

-- ADMIN
CREATE TABLE ADMIN (
    admin_id INT PRIMARY KEY,
    account_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    preferences TEXT NULL,
    address VARCHAR(100) NULL,
    email VARCHAR(100) NOT NULL,
    FOREIGN KEY (account_id) REFERENCES USER_ACCOUNT(account_id)
);

-- CUSTOMER
CREATE TABLE CUSTOMER (
    customer_id INT PRIMARY KEY,
    account_id INT NOT NULL,
    id_card_number BIGINT NULL, 
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address VARCHAR(100) NULL,
    phone VARCHAR(15) NOT NULL, 
    FOREIGN KEY (account_id) REFERENCES USER_ACCOUNT(account_id)
);

-- EQUIPMENT
CREATE TABLE EQUIPMENT (
    equipment_id INT PRIMARY KEY,
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
    FOREIGN KEY (admin_id) REFERENCES ADMIN(admin_id),
    CONSTRAINT chk_equip_status CHECK (status IN ('Available', 'In Use', 'Maintenance')),
    CONSTRAINT chk_daily_rate CHECK (daily_rate > 0)
);

-- RENTAL
CREATE TABLE RENTAL (
    rental_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    contract_id INT NOT NULL,
    rental_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(15) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id),
    FOREIGN KEY (contract_id) REFERENCES CONTRACT(contract_id),
    CONSTRAINT chk_rental_status CHECK (status IN ('Active', 'Completed', 'Cancelled'))
);

-- ITEM
CREATE TABLE ITEM (
    item_id INT PRIMARY KEY,
    equipment_id INT NOT NULL,
    rental_id INT NOT NULL,
    price_per_day DECIMAL(7,2) NOT NULL,
    FOREIGN KEY (equipment_id) REFERENCES EQUIPMENT(equipment_id),
    FOREIGN KEY (rental_id) REFERENCES RENTAL(rental_id),
    CONSTRAINT chk_item_price CHECK (price_per_day > 0)
);

ALTER TABLE EQUIPMENT
    ADD COLUMN main_image VARCHAR(255) NULL AFTER daily_rate,
    ADD COLUMN detail_images TEXT NULL AFTER main_image,
    ADD COLUMN stock INT NOT NULL DEFAULT 1 AFTER detail_images;

SET SQL_SAFE_UPDATES = 0;
UPDATE EQUIPMENT SET stock = 1 WHERE status = 'Available';
UPDATE EQUIPMENT SET stock = 0 WHERE status != 'Available';
SET SQL_SAFE_UPDATES = 1;

INSERT INTO USER_ACCOUNT (account_id, username, password, role) VALUES 
(001, 'admin_guy', 123456, 'Admin'),
(002, 'cust_mhiyok', 654321, 'Customer');
INSERT INTO ADMIN (admin_id, account_id, first_name, last_name, preferences, address, email) VALUES 
(1, 1, 'Warittawat', 'Sricartoonchai', 'Dark Mode', 'Charan 81, Bangkok', 'admin@lekhafong.com');
INSERT INTO CUSTOMER (customer_id, account_id, id_card_number, first_name, last_name, email, address, phone) VALUES 
(1, 2, 1100999888777, 'Peerepee', 'Fong', 'peerapee@email.com', 'Phaya Thai, Bangkok', 0812345678);
INSERT INTO EQUIPMENT (equipment_id, admin_id, name, type, brand, serial_number, description, release_year, model_series, status, daily_rate) VALUES 
(1, 1, 'Sony A7IV Mirrorless Camera', 'Camera', 'Sony', 'SNY-A74-001', 'Full-frame mirrorless camera for professional video and photo.', '2021-01-01', 'A7 Series', 'Available', 1500);

INSERT INTO EQUIPMENT (equipment_id, admin_id, name, type, brand, serial_number, description, release_year, model_series, status, daily_rate) VALUES 
(2, 1, 'Sony A7S III Mirrorless Camera', 'Camera', 'Sony', 'SNY-A7S3-001', 'Full-frame mirrorless optimized for 4K 120p low-light video production.', '2020-07-28', 'A7 Series', 'Available', 1800),
(3, 1, 'Sony A7C II Compact Full-Frame', 'Camera', 'Sony', 'SNY-A7C2-001', 'Lightweight compact full-frame camera ideal for travel and vlogging.', '2023-08-29', 'A7C', 'Available', 1200),
(4, 1, 'Sony FX3 Full-Frame Cinema Line', 'Cinema Camera', 'Sony', 'SNY-FX3-001', 'Compact cinema camera with active cooling fan and XLR top handle.', '2021-02-23', 'CinemaLine', 'In Use', 2200),
(5, 1, 'Sony ZV-E10 II Vlogging Camera', 'Camera', 'Sony', 'SNY-ZVE10-01', 'APS-C content creator camera with product showcase mode and flip screen.', '2024-07-10', 'ZV Series', 'Available', 750),
(6, 1, 'Canon EOS R5 Mirrorless Camera', 'Camera', 'Canon', 'CN-R5-001', '45MP full-frame mirrorless with 8K RAW video and 5-axis IBIS.', '2020-07-09', 'EOS R', 'Available', 2000),
(7, 1, 'Canon EOS R6 Mark II', 'Camera', 'Canon', 'CN-R6M2-001', 'High-speed 24.2MP full-frame camera for hybrid photo and video.', '2022-11-02', 'EOS R', 'Available', 1600),
(8, 1, 'Canon EOS R8 Full-Frame', 'Camera', 'Canon', 'CN-R8-001', 'Entry-level lightweight full-frame mirrorless with Dual Pixel CMOS AF II.', '2023-02-08', 'EOS R', 'Available', 1100),
(9, 1, 'Fujifilm X-T5 Mirrorless Camera', 'Camera', 'Fujifilm', 'FJ-XT5-001', '40.2MP APS-C retro-styled camera with classic film simulations.', '2022-11-02', 'X Series', 'Available', 1300),
(10, 1, 'Fujifilm X100VI Digital Camera', 'Compact Camera', 'Fujifilm', 'FJ-X1006-001', 'Premium fixed-lens 23mm f/2 compact camera with built-in ND filter.', '2024-02-20', 'X100', 'In Use', 1400),
(11, 1, 'Fujifilm X-S20 Mirrorless Camera', 'Camera', 'Fujifilm', 'FJ-XS20-001', 'All-around APS-C hybrid camera with dedicated Vlog mode and long battery.', '2023-05-24', 'X Series', 'Available', 1000),
(12, 1, 'Nikon Z8 Full-Frame Mirrorless', 'Camera', 'Nikon', 'NK-Z8-001', '45.7MP stacked sensor flagship hybrid camera without mechanical shutter.', '2023-05-10', 'Z Series', 'Available', 2300),
(13, 1, 'Nikon Zf Retro Full-Frame', 'Camera', 'Nikon', 'NK-ZF-001', 'Heritage magnesium-alloy body with modern 24.5MP full-frame sensor.', '2023-09-20', 'Z Series', 'Available', 1400),
(14, 1, 'Panasonic Lumix S5 IIX', 'Camera', 'Panasonic', 'PN-S52X-001', 'All-black full-frame hybrid camera supporting SSD recording and ProRes.', '2023-01-04', 'Lumix S', 'Maintenance', 1500);

