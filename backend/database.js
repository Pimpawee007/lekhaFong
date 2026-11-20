const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// สร้างโฟลเดอร์เก็บไฟล์รูปภาพจริงใน backend/uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// ตั้งค่า Multer สำหรับอัปโหลดรูปภาพ (รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 5MB)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `eq-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('รองรับเฉพาะไฟล์รูปภาพ JPG, PNG หรือ WEBP เท่านั้น'));
        }
    }
});

// ============================================================================
// 1. DATABASE CONNECTION POOL
// ============================================================================
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lekhafong_production',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try {
        const conn = await db.getConnection();
        console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'lekhafong_production');
        conn.release();
    } catch (err) {
        console.error('❌ MySQL Connection Error:', err.message);
    }
})();

async function getNextId(connection, table, idColumn) {
    const [rows] = await connection.query(`SELECT COALESCE(MAX(${idColumn}), 0) + 1 AS nextId FROM ${table}`);
    return rows[0].nextId;
}

// ============================================================================
// 2. IMAGE UPLOAD API
// ============================================================================
app.post('/api/upload', (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message || 'อัปโหลดรูปภาพไม่สำเร็จ' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'ไม่พบไฟล์รูปภาพที่อัปโหลด' });
        }
        res.json({
            success: true,
            url: `/uploads/${req.file.filename}`
        });
    });
});

// ============================================================================
// 3. AUTHENTICATION (LOGIN / REGISTER)
// ============================================================================
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน' });
    }

    try {
        let accountId = null;
        const [customers] = await db.query('SELECT account_id FROM CUSTOMER WHERE email = ?', [email]);
        const [admins] = await db.query('SELECT account_id FROM ADMIN WHERE email = ?', [email]);

        if (customers.length > 0) {
            accountId = customers[0].account_id;
        } else if (admins.length > 0) {
            accountId = admins[0].account_id;
        } else {
            const [users] = await db.query('SELECT account_id FROM USER_ACCOUNT WHERE username = ?', [email]);
            if (users.length > 0) accountId = users[0].account_id;
        }

        if (!accountId) {
            return res.status(401).json({ success: false, message: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ' });
        }

        const numericPassword = Number(password);
        const [accounts] = await db.query(
            'SELECT * FROM USER_ACCOUNT WHERE account_id = ? AND password = ?',
            [accountId, numericPassword]
        );

        const nextLoginId = await getNextId(db, 'LOGIN', 'login_id');

        if (accounts.length === 0) {
            await db.query(
                'INSERT INTO LOGIN (login_id, account_id, login_time, status) VALUES (?, ?, NOW(), ?)',
                [nextLoginId, accountId, 'Failed']
            );
            return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
        }

        await db.query(
            'INSERT INTO LOGIN (login_id, account_id, login_time, status) VALUES (?, ?, NOW(), ?)',
            [nextLoginId, accountId, 'Success']
        );

        const userAccount = accounts[0];
        let profile = {};

        if (userAccount.role === 'Admin') {
            const [adminRows] = await db.query('SELECT * FROM ADMIN WHERE account_id = ?', [accountId]);
            profile = adminRows[0] || {};
        } else {
            const [custRows] = await db.query('SELECT * FROM CUSTOMER WHERE account_id = ?', [accountId]);
            profile = custRows[0] || {};
        }

        res.json({
            success: true,
            user: {
                id: accountId,
                admin_id: profile.admin_id || null,
                customer_id: profile.customer_id || null,
                username: userAccount.username,
                role: userAccount.role,
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                email: profile.email || ''
            }
        });
    } catch (err) {
        console.error('Login SQL Error:', err.message);
        res.status(500).json({ success: false, message: 'เชื่อมต่อฐานข้อมูลผิดพลาด: ' + err.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { first_name, last_name, email, phone, address, username, password } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [dupEmail] = await conn.query('SELECT email FROM CUSTOMER WHERE email = ?', [email]);
        if (dupEmail.length > 0) {
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' });
        }

        const nextAccountId = await getNextId(conn, 'USER_ACCOUNT', 'account_id');
        const nextCustomerId = await getNextId(conn, 'CUSTOMER', 'customer_id');
        const finalUsername = username || email.split('@')[0];
        const finalPassword = Number(password) || 123456;
        const cleanPhone = Number(String(phone || '0').replace(/\D/g, '')) || 0;

        await conn.query(
            'INSERT INTO USER_ACCOUNT (account_id, username, password, role) VALUES (?, ?, ?, ?)',
            [nextAccountId, finalUsername, finalPassword, 'Customer']
        );
        await conn.query(
            'INSERT INTO CUSTOMER (customer_id, account_id, first_name, last_name, email, address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nextCustomerId, nextAccountId, first_name, last_name, email, address || '', cleanPhone]
        );

        await conn.commit();
        res.json({ success: true, message: 'สมัครสมาชิกสำเร็จ' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'ไม่สามารถสมัครสมาชิกได้: ' + err.message });
    } finally {
        conn.release();
    }
});

// ============================================================================
// 4. USERS (CUSTOMER) MANAGEMENT
// ============================================================================
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.account_id, u.username, c.customer_id, c.first_name, c.last_name, c.email, c.address, c.phone
            FROM USER_ACCOUNT u
            JOIN CUSTOMER c ON u.account_id = c.account_id
            WHERE u.role = 'Customer'
            ORDER BY u.account_id ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/users/:accountId', async (req, res) => {
    const { accountId } = req.params;
    const { username, email, first_name, last_name, phone, address } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [dupUser] = await conn.query(
            'SELECT account_id FROM USER_ACCOUNT WHERE username = ? AND account_id != ?',
            [username, accountId]
        );
        if (dupUser.length > 0) {
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'Username นี้มีผู้ใช้งานแล้ว' });
        }

        const cleanPhone = Number(String(phone || '0').replace(/\D/g, '')) || 0;
        await conn.query('UPDATE USER_ACCOUNT SET username = ? WHERE account_id = ?', [username, accountId]);
        await conn.query(
            'UPDATE CUSTOMER SET email = ?, first_name = ?, last_name = ?, phone = ?, address = ? WHERE account_id = ?',
            [email, first_name || '', last_name || '', cleanPhone, address || '', accountId]
        );
        await conn.commit();
        res.json({ success: true, message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'ไม่สามารถอัปเดตข้อมูลได้: ' + err.message });
    } finally {
        conn.release();
    }
});

app.delete('/api/users/:accountId', async (req, res) => {
    const { accountId } = req.params;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        await conn.query('DELETE FROM LOGIN WHERE account_id = ?', [accountId]);
        await conn.query('DELETE FROM CUSTOMER WHERE account_id = ?', [accountId]);
        await conn.query('DELETE FROM USER_ACCOUNT WHERE account_id = ?', [accountId]);
        await conn.commit();
        res.json({ success: true, message: 'ลบผู้ใช้งานเรียบร้อยแล้ว' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'ไม่สามารถลบผู้ใช้ได้ (อาจมีประวัติการเช่าค้างอยู่)' });
    } finally {
        conn.release();
    }
});

// ============================================================================
// 5. PRODUCTS (EQUIPMENT) & TYPES MANAGEMENT
// ============================================================================
app.get('/api/equipment-types', async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DISTINCT type FROM EQUIPMENT WHERE type IS NOT NULL AND TRIM(type) != '' ORDER BY type ASC"
        );
        const baseTypes = [
            'Camera',
            'Cinema Camera',
            'Lens',
            'Microphone',
            'Audio',
            'Lighting',
            'Computer',
            'Speaker',
            'Accessory'
        ];
        const dbTypes = rows.map(r => r.type.trim());
        const merged = Array.from(new Set([...dbTypes, ...baseTypes]));
        res.json(merged);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM EQUIPMENT ORDER BY equipment_id ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    const {
        equipment_id,
        admin_id,
        name,
        type,
        brand,
        serial_number,
        description,
        model_series,
        status,
        daily_rate,
        main_image,
        detail_images,
        stock
    } = req.body;

    try {
        if (!name || !daily_rate || Number(daily_rate) <= 0) {
            return res.status(400).json({ success: false, message: 'กรุณาระบุชื่ออุปกรณ์และราคาเช่าที่มากกว่า 0' });
        }
        if (!type) {
            return res.status(400).json({ success: false, message: 'กรุณาเลือกประเภทอุปกรณ์' });
        }

        const nextId = equipment_id ? Number(equipment_id) : await getNextId(db, 'EQUIPMENT', 'equipment_id');
        const stockVal = stock !== undefined && stock !== '' ? Math.max(0, Number(stock)) : (status === 'Available' ? 1 : 0);
        const finalStatus = stockVal <= 0 && status === 'Available' ? 'In Use' : (status || 'Available');
        const detailJson = Array.isArray(detail_images) ? JSON.stringify(detail_images.slice(0, 4)) : '[]';

        await db.query(
            `INSERT INTO EQUIPMENT 
            (equipment_id, admin_id, name, type, brand, serial_number, description, model_series, status, daily_rate, main_image, detail_images, stock)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nextId,
                admin_id || 1,
                name,
                type,
                brand || 'Sony',
                serial_number || `SN-${Date.now().toString().slice(-6)}`,
                description || '',
                model_series || 'General',
                finalStatus,
                Number(daily_rate),
                main_image || null,
                detailJson,
                stockVal
            ]
        );
        res.json({ success: true, message: 'เพิ่มอุปกรณ์ใหม่สำเร็จ' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'ไม่สามารถเพิ่มอุปกรณ์ได้: ' + err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const {
        name,
        type,
        brand,
        serial_number,
        description,
        model_series,
        status,
        daily_rate,
        main_image,
        detail_images,
        stock
    } = req.body;

    try {
        const stockVal = stock !== undefined && stock !== '' ? Math.max(0, Number(stock)) : (status === 'Available' ? 1 : 0);
        const finalStatus = stockVal <= 0 && status === 'Available' ? 'In Use' : status;
        const detailJson = Array.isArray(detail_images) ? JSON.stringify(detail_images.slice(0, 4)) : '[]';

        await db.query(
            `UPDATE EQUIPMENT 
             SET name = ?, type = ?, brand = ?, serial_number = ?, description = ?, model_series = ?, status = ?, daily_rate = ?, main_image = ?, detail_images = ?, stock = ?
             WHERE equipment_id = ?`,
            [
                name,
                type,
                brand,
                serial_number,
                description || '',
                model_series || '',
                finalStatus,
                Number(daily_rate),
                main_image || null,
                detailJson,
                stockVal,
                id
            ]
        );
        res.json({ success: true, message: 'อัปเดตข้อมูลอุปกรณ์สำเร็จ' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'ไม่สามารถอัปเดตอุปกรณ์ได้: ' + err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM EQUIPMENT WHERE equipment_id = ?', [id]);
        res.json({ success: true, message: 'ลบอุปกรณ์ออกจากระบบแล้ว' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'ไม่สามารถลบอุปกรณ์ได้ (อาจมีรายการเช่าอ้างอิงอยู่)' });
    }
});

// ============================================================================
// 6. RENTAL / BOOKING API (WITH TRANSACTION & STOCK CONCURRENCY LOCK)
// ============================================================================
app.post('/api/rentals', async (req, res) => {
    const { account_id, equipment_id, start_date, return_date } = req.body;

    if (!account_id || !equipment_id || !start_date || !return_date) {
        return res.status(400).json({ success: false, message: 'ข้อมูลการเช่าไม่ครบถ้วน กรุณาตรวจสอบอีกครั้ง' });
    }

    const rentalDays = Math.ceil((new Date(return_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
    if (isNaN(rentalDays) || rentalDays <= 0) {
        return res.status(400).json({ success: false, message: 'วันคืนอุปกรณ์ต้องอยู่หลังวันรับอุปกรณ์อย่างน้อย 1 วัน' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [eqRows] = await conn.query('SELECT * FROM EQUIPMENT WHERE equipment_id = ? FOR UPDATE', [equipment_id]);
        if (eqRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ success: false, message: 'ไม่พบอุปกรณ์นี้ในระบบ' });
        }

        const equipment = eqRows[0];
        if (equipment.status !== 'Available' || Number(equipment.stock) <= 0) {
            await conn.rollback();
            return res.status(409).json({ success: false, message: 'อุปกรณ์นี้ไม่พร้อมให้เช่าในช่วงวันที่เลือก' });
        }

        const dailyRate = Number(equipment.daily_rate);
        const totalPrice = dailyRate * rentalDays;
        const deposit = Math.max(500, Math.round(totalPrice * 0.3));

        const updatedStock = Math.max(0, Number(equipment.stock) - 1);
        const updatedStatus = updatedStock === 0 ? 'In Use' : equipment.status;

        await conn.query(
            'UPDATE EQUIPMENT SET stock = ?, status = ? WHERE equipment_id = ?',
            [updatedStock, updatedStatus, equipment_id]
        );

        await conn.commit();
        res.json({
            success: true,
            message: 'ทำรายการเช่าสำเร็จ',
            rental: {
                rental_id: Math.floor(100000 + Math.random() * 900000),
                product_name: equipment.name,
                start_date,
                return_date,
                rental_days: rentalDays,
                daily_rate: dailyRate,
                total_price: totalPrice,
                deposit,
                status: 'Confirmed'
            }
        });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการทำรายการเช่า: ' + err.message });
    } finally {
        conn.release();
    }
});

// ============================================================================
// 7. ADMINS MANAGEMENT
// ============================================================================
app.get('/api/admins', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.admin_id, a.account_id, u.username, a.first_name, a.last_name, a.email, a.address
            FROM ADMIN a
            JOIN USER_ACCOUNT u ON a.account_id = u.account_id
            WHERE u.role = 'Admin'
            ORDER BY a.admin_id ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admins', async (req, res) => {
    const { username, password, first_name, last_name, email, address } = req.body;
    if (!username || !password || !email || !first_name) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }
    if (!/^\d+$/.test(String(password))) {
        return res.status(400).json({ success: false, message: 'รหัสผ่านต้องเป็นตัวเลขเท่านั้น' });
    }
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [dupUser] = await conn.query('SELECT username FROM USER_ACCOUNT WHERE username = ?', [username]);
        if (dupUser.length > 0) {
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'Username นี้ถูกใช้งานแล้ว' });
        }
        const nextAccountId = await getNextId(conn, 'USER_ACCOUNT', 'account_id');
        const nextAdminId = await getNextId(conn, 'ADMIN', 'admin_id');

        await conn.query('INSERT INTO USER_ACCOUNT (account_id, username, password, role) VALUES (?, ?, ?, ?)', [nextAccountId, username, Number(password), 'Admin']);
        await conn.query('INSERT INTO ADMIN (admin_id, account_id, first_name, last_name, email, address) VALUES (?, ?, ?, ?, ?, ?)', [nextAdminId, nextAccountId, first_name, last_name || '', email, address || '']);

        await conn.commit();
        res.json({ success: true, message: 'เพิ่มผู้ดูแลระบบ (Admin) สำเร็จ' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'ไม่สามารถเพิ่ม Admin ได้: ' + err.message });
    } finally {
        conn.release();
    }
});

app.put('/api/admins/:accountId', async (req, res) => {
    const { accountId } = req.params;
    const { username, password, first_name, last_name, email, address } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        if (password) {
            if (!/^\d+$/.test(String(password))) {
                await conn.rollback();
                return res.status(400).json({ success: false, message: 'รหัสผ่านใหม่ต้องเป็นตัวเลขเท่านั้น' });
            }
            await conn.query('UPDATE USER_ACCOUNT SET username = ?, password = ? WHERE account_id = ?', [username, Number(password), accountId]);
        } else {
            await conn.query('UPDATE USER_ACCOUNT SET username = ? WHERE account_id = ?', [username, accountId]);
        }
        await conn.query('UPDATE ADMIN SET first_name = ?, last_name = ?, email = ?, address = ? WHERE account_id = ?', [first_name, last_name || '', email, address || '', accountId]);
        await conn.commit();
        res.json({ success: true, message: 'อัปเดตข้อมูล Admin สำเร็จ' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'ไม่สามารถอัปเดตข้อมูล Admin ได้: ' + err.message });
    } finally {
        conn.release();
    }
});

app.delete('/api/admins/:accountId', async (req, res) => {
    const { accountId } = req.params;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM ADMIN');
        if (countRows[0].total <= 1) {
            await conn.rollback();
            return res.status(400).json({ success: false, message: 'ไม่สามารถลบ Admin คนสุดท้ายของระบบได้' });
        }
        await conn.query('DELETE FROM LOGIN WHERE account_id = ?', [accountId]);
        await conn.query('DELETE FROM ADMIN WHERE account_id = ?', [accountId]);
        await conn.query('DELETE FROM USER_ACCOUNT WHERE account_id = ?', [accountId]);
        await conn.commit();
        res.json({ success: true, message: 'ลบ Admin เรียบร้อยแล้ว' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'ไม่สามารถลบ Admin ได้' });
    } finally {
        conn.release();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 LekhaFong Backend running at http://localhost:${PORT}`);
});