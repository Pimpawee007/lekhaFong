const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors({
    origin: 'http://localhost:3030',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// ============================================================
// API TESTING NOTES
// ============================================================
// The core routes below have test cases TC-001 to TC-016. The search extensions
// are documented as TC-017 to TC-019; TC-008B and TC-013B are additional
// rubric examples for the two criteria-based admin searches.
// Use a disposable local database for write and delete requests.
// Send JSON with Content-Type: application/json and uploads as form-data.
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
const dbPortValue = process.env.DB_PORT;
const dbPort = (dbPortValue === undefined || String(dbPortValue).trim() === '')
    ? 3306
    : Number(dbPortValue);
if (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535) {
    console.error(`Invalid DB_PORT value "${dbPortValue}": DB_PORT must be an integer between 1 and 65535.`);
    process.exit(1);
}

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: dbPort,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

(async () => {
    let conn;
    try {
        conn = await db.getConnection();
        console.log('Connected to MySQL database:', process.env.DB_NAME || 'lekhafong_production');

        // Read-only compatibility check. This never alters the database; it
        // only warns when a database created from the older schema still has
        // numeric password/phone columns. See migrations/.
        try {
            const [columns] = await conn.query(`
                SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND (
                    (UPPER(TABLE_NAME) = 'USER_ACCOUNT' AND UPPER(COLUMN_NAME) = 'PASSWORD')
                    OR
                    (UPPER(TABLE_NAME) = 'CUSTOMER' AND UPPER(COLUMN_NAME) = 'PHONE')
                  )
            `);
            const characterTypes = new Set(['char', 'varchar', 'tinytext', 'text', 'mediumtext', 'longtext']);
            const found = new Map(columns.map(column => [
                `${String(column.TABLE_NAME).toUpperCase()}.${String(column.COLUMN_NAME).toUpperCase()}`,
                column
            ]));
            const expected = [
                ['USER_ACCOUNT.PASSWORD', 'varchar(255)'],
                ['CUSTOMER.PHONE', 'varchar(15)']
            ];
            const mismatches = expected.flatMap(([key, expectedType]) => {
                const column = found.get(key);
                if (!column || characterTypes.has(String(column.DATA_TYPE).toLowerCase())) {
                    return [];
                }
                return [`${column.TABLE_NAME}.${column.COLUMN_NAME} is ${column.COLUMN_TYPE}; expected ${expectedType}`];
            });

            if (mismatches.length > 0) {
                console.warn('Database schema compatibility warning:');
                mismatches.forEach(message => console.warn('  - ' + message));
                console.warn('  Registration with text passwords or Thai phone numbers can fail with ER_TRUNCATED_WRONG_VALUE_FOR_FIELD.');
                console.warn('  Back up the database, then apply migrations/2026-11-26-align-registration-schema.sql manually.');
                console.warn('  Do NOT rerun lekhafong_production.sql on an existing database; it is a fresh-install script.');
            }
        } catch (schemaErr) {
            console.warn('Schema compatibility check skipped:', schemaErr.code || schemaErr.message);
        }
    } catch (err) {
        console.error('MySQL Connection Error:', err.message);
    } finally {
        if (conn) conn.release();
    }
})();

async function getNextId(connection, table, idColumn) {
    const [rows] = await connection.query(`SELECT COALESCE(MAX(${idColumn}), 0) + 1 AS nextId FROM ${table}`);
    return rows[0].nextId;
}

// Accept both 0812345678 and 081-234-5678. Returns a normalised 10-digit
// string (leading zero preserved) or null when the value is not a Thai mobile.
function normalizeThaiPhone(value) {
    if (value === undefined || value === null) return null;
    const raw = String(value).trim();
    // Only digits, spaces and hyphens are allowed; letters/symbols are rejected.
    if (!raw || !/^[0-9\s-]+$/.test(raw)) return null;
    const digits = raw.replace(/[^0-9]/g, '');
    if (!/^0[689][0-9]{8}$/.test(digits)) return null;
    return digits;
}

// Accept an array or a JSON string for detail_images and keep at most 4
// non-empty URL/path entries. Returns null when the value is not provided.
function normalizeDetailImagesInput(value) {
    if (value === undefined || value === null) return null;
    let list = value;
    if (typeof value === 'string') {
        if (!value.trim()) return [];
        try {
            list = JSON.parse(value);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(list)) return [];
    return list
        .filter(item => typeof item === 'string' && item.trim())
        .map(item => item.trim())
        .slice(0, 4);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

// Age is optional. An empty value is stored as NULL; any supplied value must be
// an integer from 18 to 120 so the database CHECK constraint and API agree.
function parseOptionalAge(value) {
    if (value === undefined || value === null || String(value).trim() === '') {
        return { value: null };
    }
    const age = Number(value);
    if (!Number.isInteger(age) || age < 18 || age > 120) {
        return { error: 'อายุต้องเป็นจำนวนเต็มระหว่าง 18 ถึง 120 ปี' };
    }
    return { value: age };
}

// Extract only the column name from a MySQL error message. The full message
// can contain user-supplied values, so it must never be logged.
function extractErrorColumn(sqlMessage) {
    const text = String(sqlMessage || '');
    const backticked = [...text.matchAll(/`([^`]+)`/g)].map(match => match[1]);
    if (backticked.length > 0) {
        return backticked[backticked.length - 1];
    }
    const quoted = /for column '([^']+)'/i.exec(text);
    return quoted ? quoted[1] : null;
}

// Development diagnostics: operation, MySQL code, SQLSTATE and column only.
// Never log SQL parameter arrays, passwords, names, emails, phones or addresses.
function logRegistrationFailure(err, operation) {
    if (process.env.NODE_ENV === 'production') {
        console.error('Register Error:', err.code || 'UNKNOWN_REGISTRATION_ERROR');
        return;
    }
    console.error('Register Error:', {
        operation,
        code: err.code || null,
        errno: err.errno || null,
        sqlState: err.sqlState || null,
        column: extractErrorColumn(err.sqlMessage)
    });
}

// ============================================================================
// 2. IMAGE UPLOAD API
// ============================================================================
// API TEST: TC-001 - Upload a Valid JPG Image
//
// URL: http://localhost:3031/api/upload
// Method: POST
// Body: multipart/form-data
//   image: test-camera.jpg (image/jpeg, under 5 MB)
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "url": "/uploads/eq-<timestamp>-<random>.jpg"
// }
//
// Description:
// Uploads one JPG, PNG or WebP image up to 5 MB and returns its public path.
//

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
// API TEST: TC-002 - Successful Customer Login
//
// URL: http://localhost:3031/api/auth/login
// Method: POST
// Body: application/json
// {
//   "email": "customer@example.com",
//   "password": "CustomerDemo123"
// }
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "user": {
//     "id": 2,
//     "admin_id": null,
//     "customer_id": 1,
//     "username": "customer_demo",
//     "role": "Customer",
//     "first_name": "Demo",
//     "last_name": "Customer",
//     "email": "customer@example.com"
//   }
// }
//
// Description:
// Authenticates a customer by email or username, records a successful LOGIN row,
// and returns the account profile.
//

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

        const [accounts] = await db.query(
            'SELECT * FROM USER_ACCOUNT WHERE account_id = ? AND password = ?',
            [accountId, String(password)]
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

// API TEST: TC-003 - Successful Customer Registration
//
// URL: http://localhost:3031/api/auth/register
// Method: POST
// Body: application/json
// {
//   "first_name": "Test",
//   "last_name": "Customer",
//   "email": "new.customer@example.com",
//   "phone": "0812345678",
//   "address": "Bangkok",
//   "username": "test_customer",
//   "password": "TestPass123"
// }
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "message": "สมัครสมาชิกสำเร็จ"
// }
//
// Description:
// Validates the customer details, checks duplicate username and email, then
// creates matching USER_ACCOUNT and CUSTOMER rows in one transaction.
//

app.post('/api/auth/register', async (req, res) => {
    const { first_name, last_name, email, phone, address, username, password } = req.body || {};

    // ---- Validation (never fall back to a default password) ----
    if (password === undefined || password === null || String(password).length === 0) {
        return res.status(400).json({ success: false, message: 'กรุณากำหนดรหัสผ่านก่อนสมัครสมาชิก' });
    }
    const finalPassword = String(password);
    if (!finalPassword.trim()) {
        return res.status(400).json({ success: false, message: 'รหัสผ่านต้องไม่เป็นช่องว่าง' });
    }
    if (finalPassword.length > 255) {
        return res.status(400).json({ success: false, message: 'รหัสผ่านยาวเกินไป (สูงสุด 255 ตัวอักษร)' });
    }

    const emailStr = String(email || '').trim();
    if (!emailStr || !isValidEmail(emailStr)) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมลให้ถูกต้อง' });
    }

    const firstNameStr = String(first_name || '').trim();
    const lastNameStr = String(last_name || '').trim();
    if (!firstNameStr || !lastNameStr) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อและนามสกุลให้ครบถ้วน' });
    }

    const finalUsername = (typeof username === 'string' && username.trim())
        ? username.trim()
        : emailStr.split('@')[0];
    if (!finalUsername) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้งาน (Username)' });
    }

    const cleanPhone = normalizeThaiPhone(phone);
    if (!cleanPhone) {
        return res.status(400).json({
            success: false,
            message: 'กรุณากรอกเบอร์โทรศัพท์มือถือให้ถูกต้อง เช่น 0812345678 หรือ 081-234-5678'
        });
    }

    let lockAcquired = false;
    let registrationStep = 'acquire-lock';
    const conn = await db.getConnection();
    try {
        // Serialise registrations so the MAX(id)+1 allocation and the
        // duplicate checks cannot race within this single-process API.
        // GET_LOCK also works if more than one API process is running.
        const [lockRows] = await conn.query("SELECT GET_LOCK('lekhafong_register', 10) AS acquired");
        lockAcquired = Number(lockRows[0]?.acquired) === 1;
        if (!lockAcquired) {
            return res.status(503).json({ success: false, message: 'ระบบกำลังดำเนินการสมัครสมาชิกอื่น กรุณาลองใหม่อีกครั้ง' });
        }

        registrationStep = 'begin-transaction';
        await conn.beginTransaction();

        registrationStep = 'check-username';
        const [dupUser] = await conn.query(
            'SELECT account_id FROM USER_ACCOUNT WHERE username = ? LIMIT 1',
            [finalUsername]
        );
        if (dupUser.length > 0) {
            await conn.rollback();
            return res.status(409).json({ success: false, message: 'ชื่อผู้ใช้งาน (Username) นี้ถูกใช้งานแล้ว' });
        }

        registrationStep = 'check-email';
        const [dupCustomerEmail] = await conn.query(
            'SELECT customer_id FROM CUSTOMER WHERE email = ? LIMIT 1',
            [emailStr]
        );
        const [dupAdminEmail] = await conn.query(
            'SELECT admin_id FROM ADMIN WHERE email = ? LIMIT 1',
            [emailStr]
        );
        if (dupCustomerEmail.length > 0 || dupAdminEmail.length > 0) {
            await conn.rollback();
            return res.status(409).json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' });
        }

        registrationStep = 'allocate-account-id';
        const nextAccountId = await getNextId(conn, 'USER_ACCOUNT', 'account_id');
        registrationStep = 'allocate-customer-id';
        const nextCustomerId = await getNextId(conn, 'CUSTOMER', 'customer_id');

        registrationStep = 'insert-user-account';
        await conn.query(
            'INSERT INTO USER_ACCOUNT (account_id, username, password, role) VALUES (?, ?, ?, ?)',
            [nextAccountId, finalUsername, finalPassword, 'Customer']
        );
        registrationStep = 'insert-customer';
        await conn.query(
            'INSERT INTO CUSTOMER (customer_id, account_id, first_name, last_name, email, address, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nextCustomerId, nextAccountId, firstNameStr, lastNameStr, emailStr, String(address || ''), cleanPhone]
        );

        registrationStep = 'commit';
        await conn.commit();
        res.json({ success: true, message: 'สมัครสมาชิกสำเร็จ' });
    } catch (err) {
        try { await conn.rollback(); } catch { /* no active transaction */ }
        logRegistrationFailure(err, registrationStep);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'ชื่อผู้ใช้งานหรืออีเมลนี้ถูกใช้งานแล้ว' });
        }
        if (err.code === 'ER_LOCK_WAIT_TIMEOUT' || err.code === 'ER_LOCK_DEADLOCK') {
            return res.status(503).json({ success: false, message: 'ระบบไม่ว่าง กรุณาลองสมัครใหม่อีกครั้ง' });
        }
        res.status(500).json({ success: false, message: 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง' });
    } finally {
        if (lockAcquired) {
            try { await conn.query("SELECT RELEASE_LOCK('lekhafong_register')"); } catch { /* ignore */ }
        }
        conn.release();
    }
});

// ============================================================================
// 4. USERS (CUSTOMER) MANAGEMENT
// ============================================================================
// API TEST: TC-004 - List Customers
//
// URL: http://localhost:3031/api/users
// Method: GET
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure: JSON array of customer accounts
// [
//   {
//     "account_id": 2,
//     "username": "customer_demo",
//     "customer_id": 1,
//     "first_name": "Demo",
//     "last_name": "Customer",
//     "email": "customer@example.com",
//     "address": "Bangkok",
//     "phone": "0812345678"
//   }
// ]
//
// Description:
// Returns all accounts whose role is Customer. Admin accounts are excluded.
//

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

// API TEST: TC-005 - Update Customer
//
// URL: http://localhost:3031/api/users/2
// Method: PUT
// Body: application/json
// {
//   "username": "customer_demo",
//   "email": "customer@example.com",
//   "first_name": "Updated",
//   "last_name": "Customer",
//   "phone": "081-234-5678",
//   "address": "Bangkok"
// }
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "message": "อัปเดตข้อมูลผู้ใช้สำเร็จ"
// }
//
// Description:
// Updates the customer username and CUSTOMER profile fields. Phone formatting
// is normalized and a duplicate username returns 400.
//

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

        const cleanPhone = String(String(phone || '0').replace(/\D/g, '')) || 0;
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

// API TEST: TC-006 - Delete Customer
//
// URL: http://localhost:3031/api/users/9001
// Method: DELETE
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "message": "ลบผู้ใช้งานเรียบร้อยแล้ว"
// }
//
// Description:
// Deletes a disposable customer account, its LOGIN rows and CUSTOMER row in one
// transaction. Use an account created only for testing.
//

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
// API TEST: TC-007 - List Equipment Types
//
// URL: http://localhost:3031/api/equipment-types
// Method: GET
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure: JSON array of type names
// [
//   "Camera",
//   "Camera Filter",
//   "Cinema Camera",
//   "Compact Camera",
//   "Continuous Light",
//   "Lens",
//   "Tripod",
//   "Wireless Microphone"
// ]
//
// Description:
// Returns distinct equipment types from the database merged with the current
// built-in type list used by the Admin product form. The obsolete Computer and
// Speaker options (and their older aliases) were removed because no product in
// the 80-item catalog uses them.
//

app.get('/api/equipment-types', async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DISTINCT type FROM EQUIPMENT WHERE type IS NOT NULL AND TRIM(type) != '' ORDER BY type ASC"
        );
        const baseTypes = [
            'Camera',
            'Cinema Camera',
            'Compact Camera',
            'Lens',
            'Continuous Light',
            'Wireless Microphone',
            'Camera Filter',
            'Tripod'
        ];
        const dbTypes = rows.map(r => r.type.trim());
        const merged = Array.from(new Set([...dbTypes, ...baseTypes]));
        res.json(merged);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// API TEST: TC-008 - List Products
//
// URL: http://localhost:3031/api/products
// Method: GET
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure: JSON array of equipment rows
// [
//   {
//     "equipment_id": 1,
//     "admin_id": 1,
//     "name": "Sony A7IV Mirrorless Camera",
//     "type": "Camera",
//     "brand": "Sony",
//     "serial_number": "SNY-A74-001",
//     "description": "Full-frame mirrorless camera for professional video and photo.",
//     "release_year": "2021-01-01T00:00:00.000Z",
//     "model_series": "A7 Series",
//     "status": "Available",
//     "daily_rate": 1500,
//     "main_image": "/uploads/camera-catalog/1-sony-a7iv-main.webp",
//     "detail_images": "["/uploads/camera-catalog/1-sony-a7iv-rear.webp"]",
//     "stock": 1
//   }
// ]
//
// Description:
// Returns every equipment record, including the camera and lens catalog, ordered
// by equipment_id. Optional query parameters search, brand, type, minPrice and
// maxPrice narrow the result set without changing the response shape. No
// parameters returns all 80 products exactly as before.
//
// API TEST: TC-017 - Search Products by Name
//
// URL: http://localhost:3031/api/products?search=Sony
// Method: GET
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure: JSON array of matching equipment rows
// [
//   {
//     "equipment_id": 1,
//     "name": "Sony A7IV Mirrorless Camera",
//     "brand": "Sony",
//     "type": "Camera"
//   }
// ]
//
// Description:
// Searches product name, brand, type and description with a parameterized LIKE
// clause. Matching is case-insensitive under the utf8mb4_unicode_ci collation.
//
// API TEST: TC-018 - Filter Products by Category
//
// URL: http://localhost:3031/api/products?type=Lens
// Method: GET
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure: JSON array containing only Lens rows
// [
//   {
//     "equipment_id": 15,
//     "name": "Sony FE 16-35mm f/2.8 GM II",
//     "type": "Lens"
//   }
// ]
//
// Description:
// Filters products by the exact equipment type. Type can be combined with
// search, brand, minPrice and maxPrice.
//
// API TEST: TC-008B - Product Search with Criteria
//
// URL: http://localhost:3031/api/products?type=Lens&brand=Canon
// Method: GET
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure: JSON array containing only Canon lenses
//
// Description:
// Verifies server-side filtering with two criteria. Both criteria are bound as
// SQL parameters; no user input is concatenated into the query.
//

function parseOptionalNonNegativeNumber(value) {
    if (value === undefined || value === null || String(value).trim() === '') return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : NaN;
}

app.get('/api/products', async (req, res) => {
    try {
        const search = String(req.query.search || '').trim();
        const brand = String(req.query.brand || '').trim();
        const type = String(req.query.type || '').trim();
        const minPrice = parseOptionalNonNegativeNumber(req.query.minPrice);
        const maxPrice = parseOptionalNonNegativeNumber(req.query.maxPrice);

        if (Number.isNaN(minPrice) || Number.isNaN(maxPrice)) {
            return res.status(400).json({ success: false, message: 'minPrice และ maxPrice ต้องเป็นตัวเลขที่ไม่ติดลบ' });
        }
        if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
            return res.status(400).json({ success: false, message: 'minPrice ต้องไม่มากกว่า maxPrice' });
        }

        const conditions = [];
        const params = [];
        if (search) {
            const like = `%${search}%`;
            conditions.push('(name LIKE ? OR brand LIKE ? OR type LIKE ? OR description LIKE ?)');
            params.push(like, like, like, like);
        }
        if (brand) {
            conditions.push('brand LIKE ?');
            params.push(`%${brand}%`);
        }
        if (type) {
            conditions.push('type = ?');
            params.push(type);
        }
        if (minPrice !== null) {
            conditions.push('daily_rate >= ?');
            params.push(minPrice);
        }
        if (maxPrice !== null) {
            conditions.push('daily_rate <= ?');
            params.push(maxPrice);
        }

        const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
        const [rows] = await db.query(
            `SELECT * FROM EQUIPMENT${where} ORDER BY equipment_id ASC`,
            params
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// API TEST: TC-009 - Create Product
//
// URL: http://localhost:3031/api/products
// Method: POST
// Body: application/json
// {
//   "admin_id": 1,
//   "name": "Test Rental Lens",
//   "type": "Lens",
//   "brand": "Test",
//   "serial_number": "TEST-LENS-001",
//   "description": "Disposable product created for API testing.",
//   "model_series": "Test",
//   "status": "Available",
//   "daily_rate": 500,
//   "main_image": null,
//   "detail_images": [],
//   "stock": 1
// }
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "message": "เพิ่มอุปกรณ์ใหม่สำเร็จ"
// }
//
// Description:
// Validates the name, type and positive daily rate, allocates the next
// equipment_id, and inserts one EQUIPMENT row.
//

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
        const parsedStock = Number(stock);
        const stockVal = (stock !== undefined && stock !== '' && Number.isFinite(parsedStock))
            ? Math.max(0, parsedStock)
            : (status === 'Available' ? 1 : 0);
        const finalStatus = stockVal <= 0 && status === 'Available' ? 'In Use' : (status || 'Available');
        const detailJson = JSON.stringify(normalizeDetailImagesInput(detail_images) || []);

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
        res.json({ success: true, message: 'เพิ่มอุปกรณ์ใหม่สำเร็จ',equipment_id: nextId});
    } catch (err) {
        res.status(500).json({ success: false, message: 'ไม่สามารถเพิ่มอุปกรณ์ได้: ' + err.message });
    }
});

// API TEST: TC-010 - Update Product
//
// URL: http://localhost:3031/api/products/45
// Method: PUT
// Body: application/json
// {
//   "name": "Test Rental Lens",
//   "type": "Lens",
//   "brand": "Test",
//   "serial_number": "TEST-LENS-001",
//   "description": "Updated disposable product.",
//   "model_series": "Test",
//   "status": "Available",
//   "daily_rate": 550,
//   "main_image": null,
//   "detail_images": [],
//   "stock": 1
// }
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "message": "อัปเดตข้อมูลอุปกรณ์สำเร็จ"
// }
//
// Description:
// Updates an existing equipment row. A missing product returns 404 and stock
// values are clamped to zero or above.
//

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
        const [existingRows] = await db.query(
            'SELECT main_image, detail_images FROM EQUIPMENT WHERE equipment_id = ? LIMIT 1',
            [id]
        );
        if (existingRows.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบอุปกรณ์นี้ในระบบ' });
        }
        const existing = existingRows[0];

        const parsedStock = Number(stock);
        const stockVal = (stock !== undefined && stock !== '' && Number.isFinite(parsedStock))
            ? Math.max(0, parsedStock)
            : (status === 'Available' ? 1 : 0);
        const finalStatus = stockVal <= 0 && status === 'Available' ? 'In Use' : status;

        // Image fields are only replaced when the caller explicitly sends them.
        // This keeps an edit that does not open the image manager from wiping
        // the product's existing images.
        const hasMainImage = Object.prototype.hasOwnProperty.call(req.body || {}, 'main_image');
        const hasDetailImages = Object.prototype.hasOwnProperty.call(req.body || {}, 'detail_images');
        const nextMainImage = hasMainImage ? (main_image || null) : existing.main_image;
        const nextDetailJson = hasDetailImages
            ? JSON.stringify(normalizeDetailImagesInput(detail_images) || [])
            : (existing.detail_images || '[]');

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
                nextMainImage,
                nextDetailJson,
                stockVal,
                id
            ]
        );
        res.json({ success: true, message: 'อัปเดตข้อมูลอุปกรณ์สำเร็จ' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'ไม่สามารถอัปเดตอุปกรณ์ได้ กรุณาลองใหม่อีกครั้ง' });
    }
});

// API TEST: TC-011 - Delete Product
//
// URL: http://localhost:3031/api/products/45
// Method: DELETE
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "message": "ลบอุปกรณ์ออกจากระบบแล้ว"
// }
//
// Description:
// Deletes one disposable equipment row by equipment_id. A row referenced by
// ITEM returns 500 because of the foreign key.
//

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
// API TEST: TC-012 - Successful Rental API Request
//
// URL: http://localhost:3031/api/rentals
// Method: POST
// Body: application/json
// {
//   "account_id": 2,
//   "equipment_id": 5,
//   "start_date": "2026-12-01",
//   "return_date": "2026-12-03"
// }
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "message": "ทำรายการเช่าสำเร็จ",
//   "rental": {
//     "rental_id": 123456,
//     "product_name": "Sony ZV-E10 II Vlogging Camera",
//     "start_date": "2026-12-01",
//     "return_date": "2026-12-03",
//     "rental_days": 2,
//     "daily_rate": 750,
//     "total_price": 1500,
//     "deposit": 500,
//     "status": "Confirmed"
//   }
// }
//
// Description:
// Checks that the equipment is available, calculates days, price and deposit,
// and reduces stock inside a transaction. It does not insert a RENTAL row.
//

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
// API TEST: TC-013 - List Administrators
//
// URL: http://localhost:3031/api/admins
// Method: GET
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure: JSON array of administrator accounts
// [
//   {
//     "admin_id": 1,
//     "account_id": 1,
//     "username": "admin_demo",
//     "first_name": "Demo",
//     "last_name": "Admin",
//     "age": 30,
//     "email": "admin@example.com",
//     "address": "Bangkok"
//   }
// ]
//
// Description:
// Returns all accounts whose role is Admin. Optional search, username and email
// query parameters narrow the result set. Passwords are never selected.
//
// API TEST: TC-019 - Search Admin by Name
//
// URL: http://localhost:3031/api/admins?search=Demo
// Method: GET
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure: JSON array of matching Admin rows
// [
//   {
//     "admin_id": 1,
//     "first_name": "Demo",
//     "last_name": "Admin",
//     "age": 30
//   }
// ]
//
// Description:
// Searches first name, last name, full name, username and email with
// parameterized SQL. The current route is not protected by a session; it exposes
// only non-sensitive Admin profile fields and never password material. If
// authentication is added later, callers must supply the same credentials as the
// rest of the Admin API; no secret is hardcoded in this test.
//
// API TEST: TC-013B - Admin Search with Criteria
//
// URL: http://localhost:3031/api/admins?search=Demo
// Method: GET
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure: JSON array containing matching Admin accounts
//
// Description:
// Verifies server-side Admin search without exposing passwords. The response may
// also be filtered with username=... or email=...
//

app.get('/api/admins', async (req, res) => {
    try {
        const search = String(req.query.search || '').trim();
        const username = String(req.query.username || '').trim();
        const email = String(req.query.email || '').trim();

        const conditions = ["u.role = 'Admin'"];
        const params = [];
        if (search) {
            const like = `%${search}%`;
            conditions.push('(a.first_name LIKE ? OR a.last_name LIKE ? OR CONCAT(a.first_name, \' \', a.last_name) LIKE ? OR u.username LIKE ? OR a.email LIKE ?)');
            params.push(like, like, like, like, like);
        }
        if (username) {
            conditions.push('u.username LIKE ?');
            params.push(`%${username}%`);
        }
        if (email) {
            conditions.push('a.email LIKE ?');
            params.push(`%${email}%`);
        }

        const [rows] = await db.query(`
            SELECT  a.admin_id, a.account_id, u.username, a.first_name, a.last_name,
                    a.age, a.email, a.address
            FROM ADMIN a
            JOIN USER_ACCOUNT u ON a.account_id = u.account_id
            WHERE ${conditions.join(' AND ')}
            ORDER BY a.admin_id ASC
        `, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// API TEST: TC-014 - Create Administrator
//
// URL: http://localhost:3031/api/admins
// Method: POST
// Body: application/json
// {
//   "username": "test_admin",
//   "password": "TestAdmin123",
//   "first_name": "Test",
//   "last_name": "Admin",
//   "age": 30,
//   "email": "test.admin@example.com",
//   "address": "Bangkok"
// }
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "message": "เพิ่มผู้ดูแลระบบ (Admin) สำเร็จ"
// }
//
// Description:
// Creates a new USER_ACCOUNT row with role Admin and its matching ADMIN row.
//

app.post('/api/admins', async (req, res) => {
    const { username, password, first_name, last_name, email, address, age } = req.body;
    if (!username || !password || !email || !first_name) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    }
    const parsedAge = parseOptionalAge(age);
    if (parsedAge.error) {
        return res.status(400).json({ success: false, message: parsedAge.error });
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

        await conn.query('INSERT INTO USER_ACCOUNT (account_id, username, password, role) VALUES (?, ?, ?, ?)', [nextAccountId, username, String(password), 'Admin']);
        await conn.query('INSERT INTO ADMIN (admin_id, account_id, first_name, last_name, email, address, age) VALUES (?, ?, ?, ?, ?, ?, ?)', [nextAdminId, nextAccountId, first_name, last_name || '', email, address || '', parsedAge.value]);

        await conn.commit();
        res.json({ success: true, message: 'เพิ่มผู้ดูแลระบบ (Admin) สำเร็จ' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'ไม่สามารถเพิ่ม Admin ได้: ' + err.message });
    } finally {
        conn.release();
    }
});

// API TEST: TC-015 - Update Administrator
//
// URL: http://localhost:3031/api/admins/3
// Method: PUT
// Body: application/json
// {
//   "username": "test_admin",
//   "password": "TestAdmin123",
//   "first_name": "Updated",
//   "last_name": "Admin",
//   "age": 31,
//   "email": "test.admin@example.com",
//   "address": "Bangkok"
// }
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "message": "อัปเดตข้อมูล Admin สำเร็จ"
// }
//
// Description:
// Updates the admin username and profile. The password is changed only when a
// non-empty password is supplied.
//

app.put('/api/admins/:accountId', async (req, res) => {
    const { accountId } = req.params;
    const { username, password, first_name, last_name, email, address, age } = req.body;
    const hasAge = Object.prototype.hasOwnProperty.call(req.body || {}, 'age');
    const parsedAge = parseOptionalAge(age);
    if (hasAge && parsedAge.error) {
        return res.status(400).json({ success: false, message: parsedAge.error });
    }
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        if (password) {
            await conn.query('UPDATE USER_ACCOUNT SET username = ?, password = ? WHERE account_id = ?', [username, String(password), accountId]);
        } else {
            await conn.query('UPDATE USER_ACCOUNT SET username = ? WHERE account_id = ?', [username, accountId]);
        }
        if (hasAge) {
            await conn.query('UPDATE ADMIN SET first_name = ?, last_name = ?, email = ?, address = ?, age = ? WHERE account_id = ?', [first_name, last_name || '', email, address || '', parsedAge.value, accountId]);
        } else {
            await conn.query('UPDATE ADMIN SET first_name = ?, last_name = ?, email = ?, address = ? WHERE account_id = ?', [first_name, last_name || '', email, address || '', accountId]);
        }
        await conn.commit();
        res.json({ success: true, message: 'อัปเดตข้อมูล Admin สำเร็จ' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ success: false, message: 'ไม่สามารถอัปเดตข้อมูล Admin ได้: ' + err.message });
    } finally {
        conn.release();
    }
});

// API TEST: TC-016 - Delete Administrator
//
// URL: http://localhost:3031/api/admins/3
// Method: DELETE
// Body: None
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "message": "ลบ Admin เรียบร้อยแล้ว"
// }
//
// Description:
// Deletes a disposable administrator, its LOGIN rows and USER_ACCOUNT row. The
// route refuses to delete the last remaining admin.
//

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

function resolvePort(value) {
    if (value === undefined || value === null || String(value).trim() === '') {
        return 3031;
    }
    const raw = String(value).trim();
    if (!/^[0-9]+$/.test(raw)) {
        throw new Error(`Invalid PORT value "${raw}": PORT must be an integer between 1 and 65535.`);
    }
    const port = Number(raw);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid PORT value "${raw}": PORT must be an integer between 1 and 65535.`);
    }
    return port;
}

let PORT;
try {
    PORT = resolvePort(process.env.PORT);
} catch (err) {
    console.error(err.message);
    process.exit(1);
}

const server = app.listen(PORT, () => {
    console.log(`LekhaFong Backend running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
    console.error('Backend server error:', err.message);
    process.exit(1);
});
