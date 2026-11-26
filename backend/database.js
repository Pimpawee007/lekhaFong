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
// API TEST: MANUAL API TESTING GUIDE
// ============================================================
//
// Base URL: http://localhost:3031
// Start the backend: cd backend && npm start
//
// Use Postman or another HTTP client. The current backend has no login
// token or authorization header, so no Bearer token is required.
//
// All examples are for a disposable local test database only. Do not run
// write/delete requests against lekhafong_production.
//
// JSON requests:
//   Headers: Content-Type: application/json
//   Body: raw -> JSON
//
// File upload:
//   Body -> form-data
//   Key: image, type File
//
// Replace placeholders such as TEST_CUSTOMER_PASSWORD, CUSTOMER_ACCOUNT_ID,
// NEW_PRODUCT_ID and TEST_EQUIPMENT_ID with values from your own test data.
//
// For POST/PUT handlers that read req.body, send a JSON object at minimum.
// A completely empty body can currently produce a 500 error because
// req.body is undefined; use {} to test the normal 400 validation path.

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
                console.warn('  Do NOT rerun lekhafong_production.sql; it starts with DROP DATABASE.');
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
// ============================================================
// API TEST: Equipment Image Upload
// ============================================================
//
// Purpose: Upload an image and receive a relative /uploads/... path for
// EQUIPMENT.main_image or EQUIPMENT.detail_images.
//
// Method: POST
// URL: http://localhost:3031/api/upload
// Headers: none required (the multipart boundary is automatic)
// URL Parameters: none
// Query Parameters: none
// Body: form-data
//
// Postman steps:
//   1. Open Body -> form-data.
//   2. Add key: image
//   3. Change the key type from Text to File.
//   4. Choose a JPG, PNG or WEBP file smaller than 5 MB.
//   5. Send the request.
//
// Testing Image Upload - Example 1 (Success, JPG)
// Method: POST
// URL: http://localhost:3031/api/upload
// Body: form-data; image = a valid .jpg file
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "url": "/uploads/eq-1730000000000-123456.jpg"
// }
//
// Testing Image Upload - Example 2 (Success, PNG)
// Method: POST
// URL: http://localhost:3031/api/upload
// Body: form-data; image = a valid .png file
//
// Expected Status: 200 OK
// Expected: success = true and a .png URL under /uploads/
//
// Testing Image Upload - Example 3 (Unsupported file type)
// Method: POST
// URL: http://localhost:3031/api/upload
// Body: form-data; image = a .txt file (MIME type text/plain)
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "รองรับเฉพาะไฟล์รูปภาพ JPG, PNG หรือ WEBP เท่านั้น"
// }
//
// Testing Image Upload - Example 4 (Oversized file)
// Method: POST
// URL: http://localhost:3031/api/upload
// Body: form-data; image = any image larger than 5 MB
//
// Expected Status: 400 Bad Request
// Expected: success = false and message "File too large"
//
// Testing Image Upload - Example 5 (Missing file)
// Method: POST
// URL: http://localhost:3031/api/upload
// Body: empty form-data (no image key)
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "ไม่พบไฟล์รูปภาพที่อัปโหลด"
// }
//
// Testing Image Upload - Example 6 (Wrong field name)
// Method: POST
// URL: http://localhost:3031/api/upload
// Body: form-data with key "file" instead of "image"
//
// Expected Status: 400 Bad Request
// Expected: success = false and message "Unexpected file field"
//
// Notes:
// - The file is stored in backend/uploads/ with a generated filename.
// - The returned URL is relative. Open it at:
//   http://localhost:3031/uploads/YOUR_FILE_NAME
// - The route accepts image/jpeg, image/png and image/webp only.
// - The size limit is 5 MB per file.
// - The MIME type comes from the multipart part; magic-byte validation is
//   not implemented in the current version.
// - This route has no authentication in the current version.
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
// ============================================================
// API TEST: Login (Customer or Admin)
// ============================================================
//
// Purpose: Authenticate a Customer or Admin account. The request field is
// named email, but it accepts either an email address or a username.
//
// Method: POST
// URL: http://localhost:3031/api/auth/login
// Headers: Content-Type: application/json
// URL Parameters: none
// Query Parameters: none
// Body: raw JSON
//
// Testing Login - Example 1 (Success, Customer)
// Method: POST
// URL: http://localhost:3031/api/auth/login
// Body: raw JSON
//
// {
//   "email": "test_customer@example.com",
//   "password": "TEST_CUSTOMER_PASSWORD"
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
//     "username": "test_customer",
//     "role": "Customer",
//     "first_name": "Test",
//     "last_name": "Customer",
//     "email": "test_customer@example.com"
//   }
// }
//
// Testing Login - Example 2 (Success, Admin)
// Method: POST
// URL: http://localhost:3031/api/auth/login
// Body: raw JSON
//
// {
//   "email": "test_admin@example.com",
//   "password": "TEST_ADMIN_PASSWORD"
// }
//
// Expected Status: 200 OK
// Expected: role = "Admin", admin_id is a number, customer_id is null
//
// Testing Login - Example 3 (Success, username instead of email)
// Method: POST
// URL: http://localhost:3031/api/auth/login
// Body: raw JSON
//
// {
//   "email": "test_customer",
//   "password": "TEST_CUSTOMER_PASSWORD"
// }
//
// Expected Status: 200 OK
// Expected: the same user profile as Example 1
//
// Testing Login - Example 4 (Wrong password)
// Method: POST
// URL: http://localhost:3031/api/auth/login
// Body: raw JSON
//
// {
//   "email": "test_customer@example.com",
//   "password": "WRONG_PASSWORD"
// }
//
// Expected Status: 401 Unauthorized
// Expected:
// {
//   "success": false,
//   "message": "รหัสผ่านไม่ถูกต้อง"
// }
//
// Testing Login - Example 5 (Unknown email or username)
// Method: POST
// URL: http://localhost:3031/api/auth/login
// Body: raw JSON
//
// {
//   "email": "unknown@example.com",
//   "password": "TEST_CUSTOMER_PASSWORD"
// }
//
// Expected Status: 401 Unauthorized
// Expected:
// {
//   "success": false,
//   "message": "ไม่พบบัญชีผู้ใช้งานนี้ในระบบ"
// }
//
// Testing Login - Example 6 (Missing credentials)
// Method: POST
// URL: http://localhost:3031/api/auth/login
// Body: raw JSON
//
// {
//   "email": "test_customer@example.com"
// }
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน"
// }
//
// Testing Login - Example 7 (Empty JSON object)
// Method: POST
// URL: http://localhost:3031/api/auth/login
// Body: raw JSON
//
// {}
//
// Expected Status: 400 Bad Request
// Expected: success = false
//
// Testing Login - Example 8 (Completely empty body - current bug)
// Method: POST
// URL: http://localhost:3031/api/auth/login
// Headers: Content-Type: application/json
// Body: none (no bytes)
//
// Expected Status: 500 Internal Server Error
// Expected: HTML error page beginning with:
// TypeError: Cannot destructure property 'email' of 'req.body' as it is undefined.
//
// Notes:
// - This is an actual current behavior, not the intended 400 validation.
//   Send {} when testing validation.
// - A successful or failed password check creates a LOGIN row when the
//   account exists: status "Success" or "Failed".
// - The current schema stores passwords as plaintext. This is a security
//   limitation; do not use real credentials in examples.
// - If a Customer and an Admin share the same email, the Customer lookup
//   runs first in the current implementation.
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

// ============================================================
// API TEST: Customer Registration
// ============================================================
//
// Purpose: Create a new Customer account in USER_ACCOUNT and CUSTOMER.
//
// Method: POST
// URL: http://localhost:3031/api/auth/register
// Headers: Content-Type: application/json
// URL Parameters: none
// Query Parameters: none
// Body: raw JSON
//
// Testing Registration - Example 1 (Success, phone without hyphens)
// Method: POST
// URL: http://localhost:3031/api/auth/register
// Body: raw JSON
//
// {
//   "first_name": "Test",
//   "last_name": "Customer",
//   "email": "test_customer_new@example.com",
//   "phone": "0812345678",
//   "address": "Bangkok",
//   "username": "test_customer_new",
//   "password": "TEST_NEW_PASSWORD"
// }
//
// Expected Status: 200 OK
// Expected:
// {
//   "success": true,
//   "message": "สมัครสมาชิกสำเร็จ"
// }
//
// Testing Registration - Example 2 (Success, phone with hyphens)
// Method: POST
// URL: http://localhost:3031/api/auth/register
// Body: raw JSON
//
// {
//   "first_name": "Test",
//   "last_name": "CustomerTwo",
//   "email": "test_customer_two@example.com",
//   "phone": "081-234-5678",
//   "address": "Bangkok",
//   "username": "test_customer_two",
//   "password": "TEST_NEW_PASSWORD"
// }
//
// Expected Status: 200 OK
// Expected: success = true
//
// Testing Registration - Example 3 (Missing password)
// Method: POST
// URL: http://localhost:3031/api/auth/register
// Body: raw JSON
//
// {
//   "first_name": "Test",
//   "last_name": "Customer",
//   "email": "missing_password@example.com",
//   "phone": "0812345678",
//   "username": "missing_password"
// }
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "กรุณากำหนดรหัสผ่านก่อนสมัครสมาชิก"
// }
//
// Testing Registration - Example 4 (Empty password)
// Method: POST
// URL: http://localhost:3031/api/auth/register
// Body: raw JSON
//
// {
//   "first_name": "Test",
//   "last_name": "Customer",
//   "email": "empty_password@example.com",
//   "phone": "0812345678",
//   "username": "empty_password",
//   "password": ""
// }
//
// Expected Status: 400 Bad Request
// Expected: success = false
//
// Testing Registration - Example 5 (Duplicate username)
// Method: POST
// URL: http://localhost:3031/api/auth/register
// Body: raw JSON
//
// {
//   "first_name": "Another",
//   "last_name": "Person",
//   "email": "another_unique_email@example.com",
//   "phone": "0812345678",
//   "username": "test_customer_new",
//   "password": "TEST_NEW_PASSWORD"
// }
//
// Expected Status: 409 Conflict
// Expected:
// {
//   "success": false,
//   "message": "ชื่อผู้ใช้งาน (Username) นี้ถูกใช้งานแล้ว"
// }
//
// Testing Registration - Example 6 (Duplicate email)
// Method: POST
// URL: http://localhost:3031/api/auth/register
// Body: raw JSON
//
// {
//   "first_name": "Another",
//   "last_name": "Person",
//   "email": "test_customer_new@example.com",
//   "phone": "0812345678",
//   "username": "another_unique_username",
//   "password": "TEST_NEW_PASSWORD"
// }
//
// Expected Status: 409 Conflict
// Expected:
// {
//   "success": false,
//   "message": "อีเมลนี้ถูกใช้งานแล้ว"
// }
//
// Testing Registration - Example 7 (Invalid phone)
// Method: POST
// URL: http://localhost:3031/api/auth/register
// Body: raw JSON
//
// {
//   "first_name": "Test",
//   "last_name": "Customer",
//   "email": "invalid_phone@example.com",
//   "phone": "12345",
//   "username": "invalid_phone",
//   "password": "TEST_NEW_PASSWORD"
// }
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "กรุณากรอกเบอร์โทรศัพท์มือถือให้ถูกต้อง เช่น 0812345678 หรือ 081-234-5678"
// }
//
// Testing Registration - Example 8 (Missing required name fields)
// Method: POST
// URL: http://localhost:3031/api/auth/register
// Body: raw JSON
//
// {
//   "email": "missing_names@example.com",
//   "phone": "0812345678",
//   "username": "missing_names",
//   "password": "TEST_NEW_PASSWORD"
// }
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "กรุณากรอกชื่อและนามสกุลให้ครบถ้วน"
// }
//
// Testing Registration - Example 9 (Address longer than 100 characters)
// Method: POST
// URL: http://localhost:3031/api/auth/register
// Body: raw JSON with address set to 150 characters
//
// Expected Status: 500 Internal Server Error
// Expected:
// {
//   "success": false,
//   "message": "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง"
// }
// Note: CUSTOMER.address is VARCHAR(100); the current route does not
// validate address length before the INSERT. The transaction is rolled back.
//
// Notes:
// - Phone accepts 10-digit Thai mobile numbers beginning with 06, 08 or 09.
//   Hyphens are removed; the stored value keeps the leading zero.
// - username is optional in the handler and falls back to the email prefix.
//   The normal frontend form requires a username.
// - id_card_number is not read by this route. Sending it is ignored and
//   CUSTOMER.id_card_number remains NULL.
// - Password is stored as plaintext in the current schema. This is a known
//   security limitation.
// - Duplicate username and duplicate customer/admin email checks return 409.
// - Registration uses a transaction and an advisory lock; failures roll back.
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
// ============================================================
// API TEST: List Customers
// ============================================================
//
// Purpose: Return all customer accounts with profile data.
//
// Method: GET
// URL: http://localhost:3031/api/users
// Headers: none required
// URL Parameters: none
// Query Parameters: none
// Body: none
//
// Testing List Customers - Example 1 (Success)
// Method: GET
// URL: http://localhost:3031/api/users
//
// Expected Status: 200 OK
// Expected Response Structure: a JSON array
// [
//   {
//     "account_id": 2,
//     "username": "test_customer",
//     "customer_id": 1,
//     "first_name": "Test",
//     "last_name": "Customer",
//     "email": "test_customer@example.com",
//     "address": "Bangkok",
//     "phone": "0812345678"
//   }
// ]
//
// Testing List Customers - Example 2 (Empty table)
// Method: GET
// URL: http://localhost:3031/api/users
//
// Expected Status: 200 OK
// Expected: []
//
// Testing List Customers - Example 3 (Database failure)
// Method: GET
// URL: http://localhost:3031/api/users
// Setup: point the backend at a missing database, or stop MySQL.
//
// Expected Status: 500 Internal Server Error
// Expected Response Structure:
// {
//   "success": false,
//   "message": "database error text"
// }
//
// Notes:
// - Only role = 'Customer' is returned; Admins are excluded.
// - The endpoint joins USER_ACCOUNT and CUSTOMER.
// - There is no pagination, filtering or search parameter.
// - The current implementation returns the raw database error message in
//   the 500 response. Do not expose this endpoint publicly.
// - No authentication is required in the current version.
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

// ============================================================
// API TEST: Update Customer
// ============================================================
//
// Purpose: Update a customer's username and CUSTOMER profile fields.
//
// Method: PUT
// URL: http://localhost:3031/api/users/CUSTOMER_ACCOUNT_ID
// Headers: Content-Type: application/json
// URL Parameters:
//   CUSTOMER_ACCOUNT_ID - USER_ACCOUNT.account_id of the customer
// Query Parameters: none
// Body: raw JSON
//
// Testing Update Customer - Example 1 (Success)
// Method: PUT
// URL: http://localhost:3031/api/users/2
// Body: raw JSON
//
// {
//   "username": "test_customer",
//   "email": "test_customer@example.com",
//   "first_name": "Updated",
//   "last_name": "Customer",
//   "phone": "081-234-5678",
//   "address": "Bangkok"
// }
//
// Expected Status: 200 OK
// Expected:
// {
//   "success": true,
//   "message": "อัปเดตข้อมูลผู้ใช้สำเร็จ"
// }
//
// Testing Update Customer - Example 2 (Duplicate username)
// Method: PUT
// URL: http://localhost:3031/api/users/2
// Body: raw JSON with username set to another existing customer's username
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "Username นี้มีผู้ใช้งานแล้ว"
// }
//
// Testing Update Customer - Example 3 (Unknown account ID)
// Method: PUT
// URL: http://localhost:3031/api/users/999999
// Body: raw JSON with valid-looking fields and a unique username
//
// Expected Status: 200 OK
// Expected:
// {
//   "success": true,
//   "message": "อัปเดตข้อมูลผู้ใช้สำเร็จ"
// }
// Note: The UPDATE affects zero rows, but the current code does not check
// affectedRows and still returns success.
//
// Testing Update Customer - Example 4 (Missing required fields)
// Method: PUT
// URL: http://localhost:3031/api/users/2
// Body: raw JSON with username omitted
//
// Expected Status: 500 Internal Server Error
// Expected: success = false
// Note: username is NOT NULL; sending undefined can cause a database error.
//
// Notes:
// - Phone formatting is normalized by removing non-digits. A leading zero
//   is preserved because the result is stored in a VARCHAR column.
// - CUSTOMER.email is not checked for duplicates by this route.
// - This route does not update the password. Use registration or an Admin
//   password path for password changes.
// - No authentication is required in the current version.
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

// ============================================================
// API TEST: Delete Customer
// ============================================================
//
// Purpose: Delete a customer account and its related CUSTOMER and LOGIN rows.
//
// Method: DELETE
// URL: http://localhost:3031/api/users/CUSTOMER_ACCOUNT_ID
// Headers: none required
// URL Parameters:
//   CUSTOMER_ACCOUNT_ID - USER_ACCOUNT.account_id of the customer
// Query Parameters: none
// Body: none
//
// Testing Delete Customer - Example 1 (Success)
// Method: DELETE
// URL: http://localhost:3031/api/users/3
//
// Expected Status: 200 OK
// Expected:
// {
//   "success": true,
//   "message": "ลบผู้ใช้งานเรียบร้อยแล้ว"
// }
//
// Testing Delete Customer - Example 2 (Unknown account ID)
// Method: DELETE
// URL: http://localhost:3031/api/users/999999
//
// Expected Status: 200 OK
// Expected: success = true
// Note: zero rows can be deleted, but the current code still reports success.
//
// Testing Delete Customer - Example 3 (Customer referenced by a rental)
// Method: DELETE
// URL: http://localhost:3031/api/users/2
// Setup: a RENTAL row references this customer's customer_id.
//
// Expected Status: 500 Internal Server Error
// Expected:
// {
//   "success": false,
//   "message": "ไม่สามารถลบผู้ใช้ได้ (อาจมีประวัติการเช่าค้างอยู่)"
// }
//
// Notes:
// - The route deletes LOGIN rows, then CUSTOMER, then USER_ACCOUNT in one
//   transaction.
// - A foreign-key reference from RENTAL blocks the delete and rolls back.
// - The current rental API does not create RENTAL rows, so this 500 is only
//   seen when a rental row exists from another source or manual test data.
// - Image files and other unrelated data are not deleted.
// - No authentication is required in the current version.
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
// ============================================================
// API TEST: List Equipment Types
// ============================================================
//
// Purpose: Return equipment type names from the database plus the built-in
// type list used by the Admin product form.
//
// Method: GET
// URL: http://localhost:3031/api/equipment-types
// Headers: none required
// URL Parameters: none
// Query Parameters: none
// Body: none
//
// Testing Equipment Types - Example 1 (Success)
// Method: GET
// URL: http://localhost:3031/api/equipment-types
//
// Expected Status: 200 OK
// Expected Response Structure: a JSON array of strings
// [
//   "Camera",
//   "Cinema Camera",
//   "Compact Camera",
//   "Lens",
//   "Microphone",
//   "Audio",
//   "Lighting",
//   "Computer",
//   "Speaker",
//   "Accessory"
// ]
//
// Testing Equipment Types - Example 2 (Database failure)
// Method: GET
// URL: http://localhost:3031/api/equipment-types
// Setup: stop MySQL or point at a missing database.
//
// Expected Status: 500 Internal Server Error
// Expected:
// {
//   "success": false,
//   "message": "database error text"
// }
//
// Notes:
// - The result is the union of DISTINCT EQUIPMENT.type values and the
//   built-in base list. Duplicate values are removed.
// - Order follows the database types first, then the built-in list; it may
//   differ from the example when the database contains other types.
// - If EQUIPMENT is empty, the built-in list is still returned.
// - No authentication is required in the current version.
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

// ============================================================
// API TEST: List Products
// ============================================================
//
// Purpose: Return every equipment row in EQUIPMENT.
//
// Method: GET
// URL: http://localhost:3031/api/products
// Headers: none required
// URL Parameters: none
// Query Parameters: none
// Body: none
//
// Testing List Products - Example 1 (Success)
// Method: GET
// URL: http://localhost:3031/api/products
//
// Expected Status: 200 OK
// Expected Response Structure: a JSON array
// [
//   {
//     "equipment_id": 1,
//     "admin_id": 1,
//     "name": "Example Camera",
//     "type": "Camera",
//     "brand": "ExampleBrand",
//     "serial_number": "EX-CAM-001",
//     "description": "Example description",
//     "image_url": null,
//     "release_year": "2021-01-01T00:00:00.000Z",
//     "model_series": "X Series",
//     "status": "Available",
//     "daily_rate": 1200,
//     "main_image": "/uploads/example.jpg",
//     "detail_images": "[\"/uploads/example-detail.jpg\"]",
//     "stock": 2
//   }
// ]
//
// Testing List Products - Example 2 (Empty table)
// Method: GET
// URL: http://localhost:3031/api/products
//
// Expected Status: 200 OK
// Expected: []
//
// Testing List Products - Example 3 (Database failure)
// Method: GET
// URL: http://localhost:3031/api/products
// Setup: stop MySQL or point at a missing database.
//
// Expected Status: 500 Internal Server Error
// Expected:
// {
//   "success": false,
//   "message": "database error text"
// }
//
// Notes:
// - Rows are ordered by equipment_id ascending.
// - There is no search, filter, sort or pagination query parameter. The
//   frontend filters and sorts the full array in the browser.
// - detail_images is returned as a JSON string, not as an array. Parse it
//   before using it in JavaScript.
// - There is no GET /api/products/:id route in the current version. The
//   frontend loads the full list and selects a product by ID.
// - No authentication is required in the current version.
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM EQUIPMENT ORDER BY equipment_id ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ============================================================
// API TEST: Create Product
// ============================================================
//
// Purpose: Insert a new equipment row into EQUIPMENT.
//
// Method: POST
// URL: http://localhost:3031/api/products
// Headers: Content-Type: application/json
// URL Parameters: none
// Query Parameters: none
// Body: raw JSON
//
// Testing Create Product - Example 1 (Success)
// Method: POST
// URL: http://localhost:3031/api/products
// Body: raw JSON
//
// {
//   "admin_id": 1,
//   "name": "Test Camera",
//   "type": "Camera",
//   "brand": "TestBrand",
//   "serial_number": "TEST-CAM-001",
//   "description": "Camera created by an API test",
//   "model_series": "Test Series",
//   "status": "Available",
//   "daily_rate": 1000,
//   "stock": 2,
//   "main_image": "/uploads/eq-example.jpg",
//   "detail_images": [
//     "/uploads/eq-example-detail-1.jpg",
//     "/uploads/eq-example-detail-2.jpg"
//   ]
// }
//
// Expected Status: 200 OK
// Expected:
// {
//   "success": true,
//   "message": "เพิ่มอุปกรณ์ใหม่สำเร็จ"
// }
// Note: The response does not include the new equipment_id. Call
// GET /api/products and find the row by name or serial_number.
//
// Testing Create Product - Example 2 (Missing name or invalid rate)
// Method: POST
// URL: http://localhost:3031/api/products
// Body: raw JSON
//
// {
//   "type": "Camera",
//   "daily_rate": 0,
//   "stock": 1
// }
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "กรุณาระบุชื่ออุปกรณ์และราคาเช่าที่มากกว่า 0"
// }
//
// Testing Create Product - Example 3 (Missing type)
// Method: POST
// URL: http://localhost:3031/api/products
// Body: raw JSON
//
// {
//   "name": "Test Camera",
//   "daily_rate": 1000,
//   "stock": 1
// }
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "กรุณาเลือกประเภทอุปกรณ์"
// }
//
// Testing Create Product - Example 4 (Negative stock)
// Method: POST
// URL: http://localhost:3031/api/products
// Body: raw JSON with "stock": -5 and "status": "Available"
//
// Expected Status: 200 OK
// Expected: success = true
// Actual stored result: stock = 0 and status = "In Use"
// Note: negative stock is clamped to 0, not rejected.
//
// Testing Create Product - Example 5 (Unknown admin_id / database failure)
// Method: POST
// URL: http://localhost:3031/api/products
// Body: raw JSON with "admin_id": 999999
//
// Expected Status: 500 Internal Server Error
// Expected: success = false and a database error message
//
// Testing Create Product - Example 6 (Completely empty body)
// Method: POST
// URL: http://localhost:3031/api/products
// Headers: Content-Type: application/json
// Body: none
//
// Expected Status: 500 Internal Server Error
// Expected: HTML error caused by destructuring undefined req.body.
// Send a JSON object at minimum; {} reaches the normal validation path.
//
// Notes:
// - Required validation: name, type, and daily_rate > 0.
// - Defaults when omitted: admin_id = 1, brand = "Sony",
//   serial_number = generated value, description = "", model_series =
//   "General", status = "Available".
// - If stock is omitted or empty, it becomes 1 when status is Available,
//   otherwise 0.
// - A negative numeric stock is clamped to 0. A non-numeric stock falls
//   back to the same default logic.
// - detail_images accepts an array or a JSON string; empty entries are
//   removed and at most 4 entries are kept.
// - equipment_id is optional. If supplied, it is used as the primary key
//   and a duplicate ID will cause a 500 database error.
// - No authentication is required in the current version.
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
        res.json({ success: true, message: 'เพิ่มอุปกรณ์ใหม่สำเร็จ' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'ไม่สามารถเพิ่มอุปกรณ์ได้: ' + err.message });
    }
});

// ============================================================
// API TEST: Update Product
// ============================================================
//
// Purpose: Replace the editable fields of an existing EQUIPMENT row.
//
// Method: PUT
// URL: http://localhost:3031/api/products/NEW_PRODUCT_ID
// Headers: Content-Type: application/json
// URL Parameters:
//   NEW_PRODUCT_ID - equipment_id of a product in your test database
// Query Parameters: none
// Body: raw JSON
//
// Testing Update Product - Example 1 (Success with images)
// Method: PUT
// URL: http://localhost:3031/api/products/2
// Body: raw JSON
//
// {
//   "name": "Updated Camera",
//   "type": "Camera",
//   "brand": "TestBrand",
//   "serial_number": "TEST-CAM-001",
//   "description": "Updated by API test",
//   "model_series": "Test Series",
//   "status": "Available",
//   "daily_rate": 1200,
//   "stock": 3,
//   "main_image": "/uploads/eq-updated.jpg",
//   "detail_images": ["/uploads/eq-updated-detail-1.jpg"]
// }
//
// Expected Status: 200 OK
// Expected:
// {
//   "success": true,
//   "message": "อัปเดตข้อมูลอุปกรณ์สำเร็จ"
// }
//
// Testing Update Product - Example 2 (Success without image fields)
// Method: PUT
// URL: http://localhost:3031/api/products/2
// Body: raw JSON with the same fields but WITHOUT main_image and
// detail_images
//
// Expected Status: 200 OK
// Expected: existing image paths remain unchanged
//
// Testing Update Product - Example 3 (Clear images explicitly)
// Method: PUT
// URL: http://localhost:3031/api/products/2
// Body: raw JSON with:
//   "main_image": null
//   "detail_images": []
//
// Expected Status: 200 OK
// Expected: the main image becomes null and detail images become []
//
// Testing Update Product - Example 4 (Unknown product ID)
// Method: PUT
// URL: http://localhost:3031/api/products/999999
// Body: raw JSON with any valid-looking fields
//
// Expected Status: 404 Not Found
// Expected:
// {
//   "success": false,
//   "message": "ไม่พบอุปกรณ์นี้ในระบบ"
// }
//
// Testing Update Product - Example 5 (Missing status)
// Method: PUT
// URL: http://localhost:3031/api/products/2
// Body: raw JSON without the status field
//
// Expected Status: 500 Internal Server Error
// Expected: success = false
// Note: status is NOT NULL; include status on every update.
//
// Notes:
// - This is a full update, not PATCH. Send all editable fields.
// - Image fields are only replaced when the property is present in the
//   JSON body. Omit them to keep the existing images.
// - Explicitly sending an empty detail_images array clears the images.
// - stock 0 with status Available is stored as status "In Use".
// - detail_images is limited to 4 non-empty entries.
// - No authentication is required in the current version.
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

// ============================================================
// API TEST: Delete Product
// ============================================================
//
// Purpose: Delete an equipment row from EQUIPMENT.
//
// Method: DELETE
// URL: http://localhost:3031/api/products/NEW_PRODUCT_ID
// Headers: none required
// URL Parameters:
//   NEW_PRODUCT_ID - equipment_id of a disposable test product
// Query Parameters: none
// Body: none
//
// Testing Delete Product - Example 1 (Success)
// Method: DELETE
// URL: http://localhost:3031/api/products/2
//
// Expected Status: 200 OK
// Expected:
// {
//   "success": true,
//   "message": "ลบอุปกรณ์ออกจากระบบแล้ว"
// }
//
// Testing Delete Product - Example 2 (Unknown product ID)
// Method: DELETE
// URL: http://localhost:3031/api/products/999999
//
// Expected Status: 200 OK
// Expected: success = true
// Note: the current code does not check affectedRows, so deleting a
// non-existent ID still reports success.
//
// Testing Delete Product - Example 3 (Referenced by ITEM)
// Method: DELETE
// URL: http://localhost:3031/api/products/2
// Setup: an ITEM row references this equipment_id.
//
// Expected Status: 500 Internal Server Error
// Expected:
// {
//   "success": false,
//   "message": "ไม่สามารถลบอุปกรณ์ได้ (อาจมีรายการเช่าอ้างอิงอยู่)"
// }
//
// Notes:
// - The row is deleted immediately; there is no soft delete.
// - Files in backend/uploads/ are NOT deleted when the product is deleted.
// - The current rental API does not insert ITEM rows, so the 500 path is
//   normally seen only with manually inserted or externally created data.
// - No authentication is required in the current version.
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
// ============================================================
// API TEST: Create Rental Request
// ============================================================
//
// Purpose: Check stock, decrement EQUIPMENT.stock by 1, and return a
// calculated rental quote.
//
// Method: POST
// URL: http://localhost:3031/api/rentals
// Headers: Content-Type: application/json
// URL Parameters: none
// Query Parameters: none
// Body: raw JSON
//
// Testing Rental - Example 1 (Success)
// Method: POST
// URL: http://localhost:3031/api/rentals
// Body: raw JSON
//
// {
//   "account_id": 2,
//   "equipment_id": 2,
//   "start_date": "2026-12-01",
//   "return_date": "2026-12-03",
//   "pickup_method": "จัดส่งถึงที่"
// }
//
// Expected Status: 200 OK
// Expected Response Structure:
// {
//   "success": true,
//   "message": "ทำรายการเช่าสำเร็จ",
//   "rental": {
//     "rental_id": 482913,
//     "product_name": "Test Camera",
//     "start_date": "2026-12-01",
//     "return_date": "2026-12-03",
//     "rental_days": 2,
//     "daily_rate": 1000,
//     "total_price": 2000,
//     "deposit": 600,
//     "status": "Confirmed"
//   }
// }
//
// Testing Rental - Example 2 (Missing equipment ID)
// Method: POST
// URL: http://localhost:3031/api/rentals
// Body: raw JSON
//
// {
//   "account_id": 2,
//   "start_date": "2026-12-01",
//   "return_date": "2026-12-03"
// }
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "ข้อมูลการเช่าไม่ครบถ้วน กรุณาตรวจสอบอีกครั้ง"
// }
//
// Testing Rental - Example 3 (Invalid dates / same day)
// Method: POST
// URL: http://localhost:3031/api/rentals
// Body: raw JSON
//
// {
//   "account_id": 2,
//   "equipment_id": 2,
//   "start_date": "2026-12-03",
//   "return_date": "2026-12-03"
// }
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "วันคืนอุปกรณ์ต้องอยู่หลังวันรับอุปกรณ์อย่างน้อย 1 วัน"
// }
//
// Testing Rental - Example 4 (Unknown equipment)
// Method: POST
// URL: http://localhost:3031/api/rentals
// Body: raw JSON with "equipment_id": 999999
//
// Expected Status: 404 Not Found
// Expected:
// {
//   "success": false,
//   "message": "ไม่พบอุปกรณ์นี้ในระบบ"
// }
//
// Testing Rental - Example 5 (Equipment unavailable or insufficient stock)
// Method: POST
// URL: http://localhost:3031/api/rentals
// Body: raw JSON using an equipment_id whose status is not Available or
// whose stock is 0
//
// Expected Status: 409 Conflict
// Expected:
// {
//   "success": false,
//   "message": "อุปกรณ์นี้ไม่พร้อมให้เช่าในช่วงวันที่เลือก"
// }
//
// Testing Rental - Example 6 (Unknown account - current behavior)
// Method: POST
// URL: http://localhost:3031/api/rentals
// Body: raw JSON with "account_id": 999999 and a valid available product
//
// Expected Status: 200 OK
// Expected: success = true
// Note: account_id is not validated against USER_ACCOUNT or CUSTOMER.
// There is no foreign key check in this route.
//
// Testing Rental - Example 7 (Duplicate submissions)
// Method: POST
// URL: http://localhost:3031/api/rentals
// Body: send the same valid request two or three times.
//
// Expected:
// - First request with stock >= 1: 200 OK
// - Each successful request decrements stock by 1
// - When stock reaches 0: 409 Conflict
// - There is no idempotency key and no duplicate-submission detection
//
// Notes and actual current behavior:
// - rental_days = ceil(return_date - start_date), minimum 1.
// - total_price = daily_rate * rental_days.
// - deposit = max(500, round(total_price * 0.30)).
// - pickup_method is accepted in the request but ignored by the backend.
// - Delivery fee is not calculated or stored here.
// - rental_id is a synthetic random 6-digit number. It is NOT read from
//   the RENTAL table.
// - This route does NOT insert rows into RENTAL, ITEM or CONTRACT. It only
//   updates EQUIPMENT.stock and EQUIPMENT.status. Do not claim that rental
//   history is persisted.
// - There is no date-overlap check; only status and stock are checked.
// - The transaction locks the equipment row with SELECT ... FOR UPDATE.
// - No authentication is required in the current version.
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
// ============================================================
// API TEST: List Administrators
// ============================================================
//
// Purpose: Return all administrator accounts with profile data.
//
// Method: GET
// URL: http://localhost:3031/api/admins
// Headers: none required
// URL Parameters: none
// Query Parameters: none
// Body: none
//
// Testing List Administrators - Example 1 (Success)
// Method: GET
// URL: http://localhost:3031/api/admins
//
// Expected Status: 200 OK
// Expected Response Structure: a JSON array
// [
//   {
//     "admin_id": 1,
//     "account_id": 1,
//     "username": "test_admin",
//     "first_name": "Test",
//     "last_name": "Admin",
//     "email": "test_admin@example.com",
//     "address": "Bangkok"
//   }
// ]
//
// Testing List Administrators - Example 2 (Database failure)
// Method: GET
// URL: http://localhost:3031/api/admins
// Setup: stop MySQL or point at a missing database.
//
// Expected Status: 500 Internal Server Error
// Expected:
// {
//   "success": false,
//   "message": "database error text"
// }
//
// Notes:
// - Only role = 'Admin' is returned.
// - Password is not included in the response.
// - No pagination or search parameter exists.
// - The current implementation returns the raw database error message in
//   the 500 response. Do not expose this endpoint publicly.
// - No authentication is required in the current version.
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

// ============================================================
// API TEST: Create Administrator
// ============================================================
//
// Purpose: Create a USER_ACCOUNT with role Admin and the matching ADMIN row.
//
// Method: POST
// URL: http://localhost:3031/api/admins
// Headers: Content-Type: application/json
// URL Parameters: none
// Query Parameters: none
// Body: raw JSON
//
// Testing Create Administrator - Example 1 (Success)
// Method: POST
// URL: http://localhost:3031/api/admins
// Body: raw JSON
//
// {
//   "username": "test_admin_new",
//   "password": "TEST_ADMIN_PASSWORD",
//   "first_name": "Test",
//   "last_name": "Admin",
//   "email": "test_admin_new@example.com",
//   "address": "Bangkok"
// }
//
// Expected Status: 200 OK
// Expected:
// {
//   "success": true,
//   "message": "เพิ่มผู้ดูแลระบบ (Admin) สำเร็จ"
// }
//
// Testing Create Administrator - Example 2 (Missing required fields)
// Method: POST
// URL: http://localhost:3031/api/admins
// Body: raw JSON
//
// {
//   "username": "test_admin_missing"
// }
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน"
// }
//
// Testing Create Administrator - Example 3 (Duplicate username)
// Method: POST
// URL: http://localhost:3031/api/admins
// Body: raw JSON with an existing username and a new email
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "Username นี้ถูกใช้งานแล้ว"
// }
//
// Testing Create Administrator - Example 4 (Duplicate email - current behavior)
// Method: POST
// URL: http://localhost:3031/api/admins
// Body: raw JSON with a new username but an email already used by an Admin
//
// Expected Status: 200 OK
// Expected:
// {
//   "success": true,
//   "message": "เพิ่มผู้ดูแลระบบ (Admin) สำเร็จ"
// }
// Note: The current route checks duplicate username only. It does NOT
// check duplicate email, and the schema has no unique email constraint.
// This is a known limitation.
//
// Testing Create Administrator - Example 5 (Database failure)
// Method: POST
// URL: http://localhost:3031/api/admins
// Body: raw JSON with values longer than the column limits or invalid SQL data
//
// Expected Status: 500 Internal Server Error
// Expected: success = false and a database error message
//
// Notes:
// - Required fields: username, password, email, first_name.
// - last_name and address are optional and default to an empty string.
// - Password is stored as plaintext in the current schema.
// - The response does not include admin_id or account_id. Call
//   GET /api/admins and find the new username.
// - No authentication is required in the current version.
app.post('/api/admins', async (req, res) => {
    const { username, password, first_name, last_name, email, address } = req.body;
    if (!username || !password || !email || !first_name) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
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

// ============================================================
// API TEST: Update Administrator
// ============================================================
//
// Purpose: Update an administrator's username, optional password, and
// ADMIN profile fields.
//
// Method: PUT
// URL: http://localhost:3031/api/admins/ADMIN_ACCOUNT_ID
// Headers: Content-Type: application/json
// URL Parameters:
//   ADMIN_ACCOUNT_ID - USER_ACCOUNT.account_id of the administrator
// Query Parameters: none
// Body: raw JSON
//
// Testing Update Administrator - Example 1 (Success without password change)
// Method: PUT
// URL: http://localhost:3031/api/admins/1
// Body: raw JSON
//
// {
//   "username": "test_admin",
//   "first_name": "Updated",
//   "last_name": "Admin",
//   "email": "test_admin@example.com",
//   "address": "Bangkok"
// }
//
// Expected Status: 200 OK
// Expected:
// {
//   "success": true,
//   "message": "อัปเดตข้อมูล Admin สำเร็จ"
// }
//
// Testing Update Administrator - Example 2 (Success with password change)
// Method: PUT
// URL: http://localhost:3031/api/admins/1
// Body: raw JSON with a non-empty password field
//
// Expected Status: 200 OK
// Expected: success = true
// Note: an omitted or empty password keeps the existing password.
//
// Testing Update Administrator - Example 3 (Unknown account ID)
// Method: PUT
// URL: http://localhost:3031/api/admins/999999
// Body: raw JSON with valid-looking fields
//
// Expected Status: 200 OK
// Expected: success = true
// Note: zero rows are updated, but the current code does not check
// affectedRows and still reports success.
//
// Testing Update Administrator - Example 4 (Missing username)
// Method: PUT
// URL: http://localhost:3031/api/admins/1
// Body: raw JSON without username
//
// Expected Status: 500 Internal Server Error
// Expected: success = false
// Note: username is NOT NULL.
//
// Notes:
// - This route does not check duplicate username or duplicate email before
//   updating. The schema has no unique constraints on these columns, so
//   duplicates are possible. This is a known limitation.
// - Password is stored as plaintext when changed.
// - No authentication is required in the current version.
app.put('/api/admins/:accountId', async (req, res) => {
    const { accountId } = req.params;
    const { username, password, first_name, last_name, email, address } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        if (password) {
            await conn.query('UPDATE USER_ACCOUNT SET username = ?, password = ? WHERE account_id = ?', [username, String(password), accountId]);
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

// ============================================================
// API TEST: Delete Administrator
// ============================================================
//
// Purpose: Delete an administrator and the related LOGIN, ADMIN and
// USER_ACCOUNT rows.
//
// Method: DELETE
// URL: http://localhost:3031/api/admins/ADMIN_ACCOUNT_ID
// Headers: none required
// URL Parameters:
//   ADMIN_ACCOUNT_ID - USER_ACCOUNT.account_id of the administrator
// Query Parameters: none
// Body: none
//
// Testing Delete Administrator - Example 1 (Success)
// Method: DELETE
// URL: http://localhost:3031/api/admins/2
// Setup: there is more than one Admin in the database.
//
// Expected Status: 200 OK
// Expected:
// {
//   "success": true,
//   "message": "ลบ Admin เรียบร้อยแล้ว"
// }
//
// Testing Delete Administrator - Example 2 (Last admin protection)
// Method: DELETE
// URL: http://localhost:3031/api/admins/1
// Setup: this is the only remaining Admin.
//
// Expected Status: 400 Bad Request
// Expected:
// {
//   "success": false,
//   "message": "ไม่สามารถลบ Admin คนสุดท้ายของระบบได้"
// }
//
// Testing Delete Administrator - Example 3 (Unknown account ID)
// Method: DELETE
// URL: http://localhost:3031/api/admins/999999
// Setup: more than one Admin exists.
//
// Expected Status: 200 OK
// Expected: success = true
// Note: zero rows are deleted, but the current code still reports success.
//
// Testing Delete Administrator - Example 4 (Last admin count check)
// Method: DELETE
// URL: http://localhost:3031/api/admins/1
// Setup: exactly one Admin exists.
//
// Expected Status: 400 Bad Request
// Expected: last-admin protection message
//
// Notes:
// - The protection checks COUNT(*) FROM ADMIN, not the specific target.
//   Create another Admin before deleting the current one.
// - The route deletes LOGIN, ADMIN, then USER_ACCOUNT in one transaction.
// - No authentication is required in the current version.
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
