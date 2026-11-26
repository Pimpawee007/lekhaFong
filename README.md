# LeKhaFong Production — Equipment Rental Web Application

## คู่มือการติดตั้งและใช้งานระบบ (ฉบับสมบูรณ์)

เอกสารนี้อธิบายวิธีติดตั้ง ตั้งค่า เริ่มระบบ และทดสอบเว็บแอปพลิเคชัน **LeKhaFong Production** สำหรับผู้ที่ไม่มีพื้นฐานด้านการเขียนโปรแกรม ตั้งแต่การติดตั้งโปรแกรมที่จำเป็น การสร้างฐานข้อมูล MySQL การตั้งค่า Environment Variables ไปจนถึงการใช้งานหน้าเว็บแต่ละหน้าและการทดสอบ REST API

> **อ่านก่อนเริ่ม:** เอกสารนี้เป็นคู่มือสำหรับการติดตั้งบนเครื่องคอมพิวเตอร์ส่วนบุคคล (Local Machine) เท่านั้น ระบบนี้ยังไม่ผ่านการออกแบบด้านความปลอดภัยสำหรับการเปิดให้บุคคลภายนอกเข้าถึงผ่านอินเทอร์เน็ต ห้ามนำไป Deploy บน Public Hosting ในสภาพปัจจุบัน

---

## สารบัญ

1. [ข้อมูลโปรเจกต์และสมาชิกกลุ่ม](#1-ข้อมูลโปรเจกต์และสมาชิกกลุ่ม)
2. [คำชี้แจงและสถาปัตยกรรมระบบ](#2-คำชี้แจงและสถาปัตยกรรมระบบ)
3. [สิ่งที่ต้องติดตั้งก่อนเริ่มต้น](#3-สิ่งที่ต้องติดตั้งก่อนเริ่มต้น)
4. [แผนผังโครงสร้างโฟลเดอร์](#4-แผนผังโครงสร้างโฟลเดอร์)
5. [ขั้นตอนที่ 1: การติดตั้งและเตรียมฐานข้อมูล MySQL](#5-ขั้นตอนที่-1-การติดตั้งและเตรียมฐานข้อมูล-mysql)
6. [ขั้นตอนที่ 2: การตั้งค่าและรัน Back-End REST API Server](#6-ขั้นตอนที่-2-การตั้งค่าและรัน-back-end-rest-api-server)
7. [ขั้นตอนที่ 3: การตั้งค่าและรัน Front-End Server](#7-ขั้นตอนที่-3-การตั้งค่าและรัน-front-end-server)
8. [ขั้นตอนที่ 4: การเปิดใช้งานและทดสอบหน้าเว็บ](#8-ขั้นตอนที่-4-การเปิดใช้งานและทดสอบหน้าเว็บ)
9. [ขั้นตอนที่ 5: คู่มือทดสอบ REST API](#9-ขั้นตอนที่-5-คู่มือทดสอบ-rest-api)
10. [ขั้นตอนที่ 6: การปิดและเริ่มระบบใหม่](#10-ขั้นตอนที่-6-การปิดและเริ่มระบบใหม่)
11. [ขั้นตอนที่ 7: การแก้ไขปัญหาที่พบบ่อย](#11-ขั้นตอนที่-7-การแก้ไขปัญหาที่พบบ่อย)
12. [ข้อจำกัดและข้อควรระวัง](#12-ข้อจำกัดและข้อควรระวัง)
13. [คำถามที่พบบ่อย (FAQ)](#13-คำถามที่พบบ่อย-faq)
14. [ภาคผนวก](#14-ภาคผนวก)

---

## 1. ข้อมูลโปรเจกต์และสมาชิกกลุ่ม

### 1.1 ข้อมูลโปรเจกต์

| รายการ | รายละเอียด |
|---|---|
| ชื่อโปรเจกต์ | **LeKhaFong Production — Equipment Rental Web Application** |
| ประเภทระบบ | Web Application สำหรับให้เช่าอุปกรณ์ถ่ายทำ |
| รูปแบบการติดตั้ง | Local Machine (คอมพิวเตอร์ของผู้พัฒนาแต่ละคน) |
| Front-End | Static Web Server ที่เขียนด้วย Node.js (พอร์ต 3030) |
| Back-End | REST API Server ด้วย Node.js + Express (พอร์ต 3031) |
| ฐานข้อมูล | MySQL ฐานข้อมูลชื่อ `lekhafong_production` (พอร์ต 3306) |
| จำนวนตาราง | 8 ตาราง |
| จำนวนอุปกรณ์ตัวอย่าง | 80 รายการ (กล้อง 14, เลนส์ 30, อุปกรณ์เสริม 36) |
| ภาษาที่ใช้ในเอกสาร | ภาษาไทย โดยคงคำศัพท์ทางเทคนิคเป็นภาษาอังกฤษ |
| วันที่ปรับปรุงเอกสาร | 27 พฤศจิกายน 2026 |

### 1.2 ความเป็นมาและวัตถุประสงค์ของโปรเจกต์

**LeKhaFong Production** เป็นเว็บแอปพลิเคชันสำหรับธุรกิจให้เช่าอุปกรณ์ถ่ายทำภาพยนตร์และคอนเทนต์ เช่น กล้อง เลนส์ ไฟสตูดิโอ ไมโครโฟน คอมพิวเตอร์ ลำโพง และอุปกรณ์เสริมต่าง ๆ ระบบถูกออกแบบให้ลูกค้าค้นหาอุปกรณ์ ดูรายละเอียด ตรวจสอบสถานะการว่าง เลือกวันรับ–คืน และส่งคำขอเช่าผ่านหน้าเว็บได้ ในขณะเดียวกันผู้ดูแลระบบ (Admin) สามารถจัดการข้อมูลอุปกรณ์ ผู้ใช้งาน และบัญชีผู้ดูแลระบบได้จากหน้า Admin

วัตถุประสงค์ของโปรเจกต์มีดังนี้

1. เพื่อรวบรวมข้อมูลอุปกรณ์ให้เช่าไว้ในฐานข้อมูลเดียว แทนการจดบันทึกหรือใช้ไฟล์Spreadsheetหลายไฟล์
2. เพื่อให้ลูกค้าค้นหาและกรองอุปกรณ์ได้สะดวกขึ้น
3. เพื่อแสดงราคาค่าเช่าต่อวัน สถานะ และจำนวนสต็อกอย่างชัดเจน
4. เพื่อฝึกการเชื่อมต่อระบบจริง 3 ชั้น ได้แก่ Front-End, Back-End REST API และ MySQL Database
5. เพื่อฝึกการจัดการสิทธิ์ผู้ใช้เบื้องต้นระหว่าง Customer และ Admin

### 1.3 ขอบเขตการทำงานของระบบ

ระบบในเวอร์ชันนี้รองรับความสามารถต่อไปนี้

- แสดงหน้าแรกพร้อมแบนเนอร์และหมวดหมู่แบรนด์
- ค้นหาและกรองอุปกรณ์ตามคำค้นหา ประเภท ยี่ห้อ ราคา และสถานะว่าง
- เรียงลำดับอุปกรณ์ตามราคาและชื่อ
- บันทึกรายการโปรดไว้ใน Browser ของผู้ใช้
- แสดงรายละเอียดอุปกรณ์และภาพประกอบ
- คำนวณค่าเช่าตามจำนวนวันและค่าจัดส่งแบบเหมาจ่าย
- สมัครสมาชิกและเข้าสู่ระบบ
- ส่งคำขอเช่าอุปกรณ์ (ระบบตัดสต็อกทันที)
- จัดการสินค้า ผู้ใช้ และผู้ดูแลระบบผ่านหน้า Admin
- อัปโหลดรูปภาพอุปกรณ์ (รูปหลัก 1 รูป และรูปประกอบไม่เกิน 4 รูป)
- แสดงแคตตาล็อกเลนส์ 30 รายการ ครอบคลุม Sony E, Canon RF, Nikon Z, Fujifilm X และ Leica L
- แสดงอุปกรณ์เสริม 36 รายการ แบ่งเป็นไฟต่อเนื่อง 9, ไมโครโฟนไร้สาย 9, ฟิลเตอร์ 9 และขาตั้งกล้อง 9
- แสดงเครดิตและลิขสิทธิ์รูปภาพกล้อง เลนส์ และอุปกรณ์เสริมจาก Wikimedia Commons

> **หมายเหตุ:** ระบบนี้เป็นโปรเจกต์เพื่อการศึกษาและการทดสอบบนเครื่อง Local ไม่ใช่ระบบพร้อมใช้งานเชิงพาณิชย์ ข้อจำกัดด้านความปลอดภัยและการบันทึกข้อมูลการเช่าแสดงไว้ในหัวข้อที่ 12

### 1.4 สมาชิกกลุ่ม

ข้อมูลรหัสนักศึกษาและชื่อภาษาไทยด้านล่างนำมาจากหน้าทีมงานในไฟล์ `frontend/script.js` ส่วน **ชื่อภาษาอังกฤษ** และ **บัญชี GitHub** ไม่มีระบุไว้ใน Repository จึงเว้นเป็นช่องว่างให้ทีมงานกรอกเพิ่มเติม

| รหัสนักศึกษา | ชื่อ-นามสกุล | ชื่อภาษาอังกฤษ | บัญชี GitHub |
|---|---|---|---|
| 6887032 | นันท์นภัส ดาวดาษ | *(โปรดระบุ)* | *(โปรดระบุ)* |
| 6887039 | พิมพ์ปวีณ์ เพชรเจริญ | *(โปรดระบุ)* | *(โปรดระบุ)* |
| 6887042 | พีร์ระพี คำฟอง | *(โปรดระบุ)* | *(โปรดระบุ)* |
| 6887053 | วริทธิ์ธวัฒน์ ศรีตระกูลชัย | *(โปรดระบุ)* | *(โปรดระบุ)* |
| 6887066 | อรปรียา ร่มโพธิ์ | *(โปรดระบุ)* | *(โปรดระบุ)* |

> **สำหรับทีมงาน:** กรุณาแก้ไขเครื่องหมาย *(โปรดระบุ)* ด้วยข้อมูลจริงก่อนส่งงาน ห้ามใช้ข้อมูลสมมติแทนสมาชิกจริง

### 1.5 ข้อมูล Repository

| รายการ | รายละเอียด |
|---|---|
| ชื่อ Repository | `lekhaFong` |
| เจ้าของ Repository | `Pimpawee007` |
| Remote (Git) | `git@github.com:Pimpawee007/lekhaFong.git` |
| โฟลเดอร์หลัก | `backend/`, `frontend/` |
| ไฟล์ฐานข้อมูล | `lekhafong_production.sql` |

---

## 2. คำชี้แจงและสถาปัตยกรรมระบบ

### 2.1 ระบบแบ่งออกเป็น 3 ส่วน

เว็บแอปพลิเคชันนี้ไม่ได้ทำงานเป็นโปรแกรมเดียว แต่แบ่งออกเป็น 3 ส่วนที่ทำงานร่วมกันผ่านพอร์ต (Port) ที่แตกต่างกัน ดังตารางต่อไปนี้

| ลำดับ | ส่วนของระบบ | โฟลเดอร์ | ไฟล์หลัก | เทคโนโลยี | พอร์ต |
|---|---|---|---|---|---|
| 1 | **Front-End Web Application Server** | `frontend/` | `frontserver.js`, `index.html`, `script.js`, `style.css` | Node.js HTTP Server + HTML/CSS/JavaScript | **3030** |
| 2 | **Back-End REST API Server** | `backend/` | `database.js` | Node.js + Express + mysql2 + multer | **3031** |
| 3 | **MySQL Database Server** | — | `lekhafong_production.sql` | MySQL Community Server | **3306** |

คำว่า **พอร์ต (Port)** เปรียบเสมือนเลขห้องของโปรแกรมบนเครื่องคอมพิวเตอร์ เครื่องเดียวกันสามารถมีหลายโปรแกรมทำงานพร้อมกันได้ แต่แต่ละโปรแกรมต้องใช้เลขห้องไม่ซ้ำกัน

- `http://localhost:3030` คือห้องของ Front-End
- `http://localhost:3031` คือห้องของ Back-End
- `localhost:3306` คือห้องของ MySQL

คำว่า **localhost** หมายถึง “เครื่องคอมพิวเตอร์เครื่องนี้เอง” ไม่ใช่เว็บไซต์บนอินเทอร์เน็ต

### 2.2 แผนผังสถาปัตยกรรมระบบ

```text
┌─────────────────────────────────────────────────────────────┐
│                        เบราว์เซอร์ของผู้ใช้                  │
│  Chrome / Edge / Firefox                                     │
│                                                             │
│  1. เปิด http://localhost:3030                               │
│  2. เบราว์เซอร์ขอไฟล์ HTML / CSS / JavaScript               │
│  3. JavaScript เรียกข้อมูลจาก http://localhost:3031/api     │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Front-End Web Application Server — พอร์ต 3030              │
│  ไฟล์: frontend/frontserver.js                               │
│                                                             │
│  หน้าที่:                                                     │
│  - ส่งไฟล์ index.html, script.js, style.css ให้เบราว์เซอร์  │
│  - ส่งรูปภาพใน frontend/banner และ frontend/pic_member       │
│  - ไม่ได้เก็บข้อมูลธุรกิจและไม่ได้ต่อ MySQL โดยตรง           │
└───────────────────────────┬─────────────────────────────────┘
                            │ fetch() ไปยัง REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Back-End REST API Server — พอร์ต 3031                      │
│  ไฟล์: backend/database.js                                   │
│                                                             │
│  หน้าที่:                                                     │
│  - รับคำขอจาก Front-End ผ่าน /api/...                        │
│  - ตรวจสอบข้อมูลและรันคำสั่ง SQL                             │
│  - รับอัปโหลดรูปภาพไปที่ backend/uploads                     │
│  - ส่งผลลัพธ์กลับเป็น JSON                                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ mysql2 Connection Pool
                            │ TCP พอร์ต 3306
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  MySQL Database Server — พอร์ต 3306                         │
│  ฐานข้อมูล: lekhafong_production                             │
│                                                             │
│  8 ตาราง:                                                    │
│  USER_ACCOUNT, CONTRACT, LOGIN, ADMIN, CUSTOMER,            │
│  EQUIPMENT, RENTAL, ITEM                                     │
└─────────────────────────────────────────────────────────────┘

        ▲                                      ▲
        │                                      │
        └──── รูปภาพที่อัปโหลดใหม่ ────────────┘
             เบราว์เซอร์โหลดจาก
             http://localhost:3031/uploads/...
```

### 2.3 การสื่อสารระหว่างแต่ละส่วน

ลำดับการทำงานเมื่อผู้ใช้เปิดหน้าเว็บมีดังนี้

1. ผู้ใช้พิมพ์ `http://localhost:3030` ในเบราว์เซอร์
2. เบราว์เซอร์ส่งคำขอไปยัง Front-End Server ที่พอร์ต 3030
3. `frontserver.js` อ่านไฟล์ `index.html` แล้วส่งกลับให้เบราว์เซอร์
4. เบราว์เซอร์โหลด `style.css`, `script.js`, รูปโลโก้ และรูปแบนเนอร์จากพอร์ต 3030
5. เมื่อ `script.js` ทำงาน จะเรียกข้อมูลอุปกรณ์จาก `http://localhost:3031/api/products`
6. Back-End Server รับคำขอ แล้วใช้ `mysql2` ส่งคำสั่ง SQL ไปยัง MySQL ที่พอร์ต 3306
7. MySQL ส่งแถวข้อมูล (Rows) กลับมาให้ Back-End
8. Back-End แปลงข้อมูลเป็น JSON แล้วส่งกลับให้เบราว์เซอร์
9. `script.js` นำข้อมูลไปสร้างการ์ดสินค้า ตาราง Admin หรือรายละเอียดอุปกรณ์
10. หากมีรูปภาพที่อัปโหลดใหม่ เบราว์เซอร์จะโหลดจาก `http://localhost:3031/uploads/...`

จะเห็นว่า **Front-End ไม่ได้ต่อ MySQL โดยตรง** และ **Back-End ไม่ได้สร้างหน้าเว็บ** หน้าที่ถูกแยกจากกันอย่างชัดเจน

### 2.4 การอนุญาตการเชื่อมต่อ (CORS)

ในไฟล์ `backend/database.js` มีการตั้งค่า CORS ไว้ดังนี้

```js
origin: 'http://localhost:3030'
```

หมายความว่า Back-End ยอมรับคำขอจาก Front-End ที่อยู่ที่ `http://localhost:3030` เท่านั้น หากเปิดหน้าเว็บด้วยวิธีอื่น เช่น ดับเบิลคลิกไฟล์ `index.html` จน URL ขึ้นต้นด้วย `file://` หรือเปลี่ยนพอร์ต Front-End เป็น 3032 ระบบอาจแสดงข้อผิดพลาด CORS และโหลดข้อมูลไม่ได้

### 2.5 เหตุใดจึงต้องรันสอง Server พร้อมกัน

- ถ้ารันเฉพาะ Front-End จะเปิดหน้าเว็บได้ แต่ข้อมูลอุปกรณ์จะว่างหรือแสดงข้อผิดพลาด เพราะไม่มีใครตอบคำขอ API
- ถ้ารันเฉพาะ Back-End จะเปิดหน้าเว็บไม่ได้ เพราะไม่มีโปรแกรมส่งไฟล์ HTML/CSS/JavaScript
- ถ้ารันทั้งสองแต่ MySQL ไม่ทำงาน หน้าเว็บจะเปิดได้ แต่การโหลดสินค้า การสมัครสมาชิก และการเข้าสู่ระบบจะล้มเหลว

ดังนั้นในขณะใช้งานปกติต้องมีอย่างน้อย 3 อย่างทำงานพร้อมกัน คือ **MySQL, Back-End (3031) และ Front-End (3030)**

### 2.6 ขอบเขตการติดตั้ง: Local Machine เท่านั้น

ระบบนี้ออกแบบและทดสอบสำหรับการใช้งานบนเครื่องเดียว โดยมีข้อจำกัดดังนี้

- Front-End Server ผูกกับ `localhost` ตามค่าเริ่มต้น
- Back-End อนุญาต CORS เฉพาะ `http://localhost:3030`
- MySQL ใช้ผู้ใช้ที่สร้างขึ้นสำหรับเครื่องนี้
- ไม่มี HTTPS, ระบบ Session, Token หรือการป้องกันการเข้าถึง API
- รหัสผ่านถูกเก็บเป็นข้อความธรรมดา

**ห้ามเปิดพอร์ต 3030, 3031 หรือ 3306 ออกสู่อินเทอร์เน็ต** และห้ามนำระบบนี้ขึ้น Public Hosting จนกว่าจะปรับปรุงด้านความปลอดภัยตามหัวข้อที่ 12

### 2.7 คำศัพท์พื้นฐานที่ควรรู้

| คำศัพท์ | ความหมายแบบง่าย |
|---|---|
| Terminal | หน้าต่างสำหรับพิมพ์คำสั่งให้คอมพิวเตอร์ทำงาน |
| Command | คำสั่งที่พิมพ์ใน Terminal เช่น `npm start` |
| Directory / Folder | โฟลเดอร์ |
| Current Directory | โฟลเดอร์ที่ Terminal กำลังทำงานอยู่ |
| Node.js | โปรแกรมที่ทำให้คอมพิวเตอร์รัน JavaScript นอกเบราว์เซอร์ได้ |
| npm | ตัวจัดการแพ็กเกจที่มาพร้อม Node.js ใช้ติดตั้งไลบรารี |
| Package / Dependency | โค้ดที่โปรเจกต์นำมาใช้ ไม่ได้เขียนเองทั้งหมด |
| `node_modules` | โฟลเดอร์ที่ npm ติดตั้ง Package ไว้ |
| `package.json` | ไฟล์รายการ Package และคำสั่งของโปรเจกต์ |
| `package-lock.json` | ไฟล์ล็อกเวอร์ชัน Package ให้ทุกเครื่องติดตั้งตรงกัน |
| `.env` | ไฟล์เก็บค่าตั้งต้นและรหัสผ่านเฉพาะเครื่อง |
| Environment Variable | ค่าตั้งต้นที่โปรแกรมอ่านจาก Environment หรือไฟล์ `.env` |
| Database | ฐานข้อมูลที่เก็บข้อมูลอย่างเป็นระบบ |
| Table | ตารางในฐานข้อมูล คล้าย Sheet ใน Spreadsheet |
| SQL | ภาษาที่ใช้สั่งฐานข้อมูล |
| Dump / SQL Script | ไฟล์รวมคำสั่ง SQL สำหรับสร้างฐานข้อมูลและตาราง |
| REST API | ช่องทางให้ Front-End ขอข้อมูลจาก Back-End ผ่าน HTTP |
| JSON | รูปแบบข้อมูลที่อ่านง่าย เช่น `{"success": true}` |
| HTTP Status Code | รหัสผลลัพธ์ เช่น 200 สำเร็จ, 404 ไม่พบ, 500 ผิดพลาด |
| localhost | เครื่องคอมพิวเตอร์เครื่องนี้เอง |
| Port | เลขช่องทางของโปรแกรม เช่น 3030, 3031, 3306 |
| `localStorage` | พื้นที่เก็บข้อมูลขนาดเล็กในเบราว์เซอร์ |
| Git | โปรแกรมจัดการเวอร์ชันของโค้ด (ไม่บังคับสำหรับการรัน) |
| Repository | โฟลเดอร์โปรเจกต์ที่ Git ติดตามการเปลี่ยนแปลง |

---

## 3. สิ่งที่ต้องติดตั้งก่อนเริ่มต้น

### 3.1 รายการโปรแกรมที่ต้องมี

| ลำดับ | โปรแกรม | เวอร์ชันที่แนะนำ | จำเป็นหรือไม่ | ลิงก์ดาวน์โหลดอย่างเป็นทางการ |
|---|---|---|---|---|
| 1 | Visual Studio Code | เวอร์ชันล่าสุด | จำเป็น | <https://code.visualstudio.com/> |
| 2 | Node.js | **22 LTS** (22.x) | จำเป็น | <https://nodejs.org/en/download> |
| 3 | npm | มาพร้อม Node.js (แนะนำ 10.x) | จำเป็น | <https://docs.npmjs.com/downloading-and-installing-node-js-and-npm> |
| 4 | MySQL Community Server | 8.0 หรือ 8.4 | จำเป็น | <https://dev.mysql.com/downloads/mysql/> |
| 5 | MySQL Workbench | เวอร์ชันล่าสุดที่เข้ากับ MySQL | จำเป็น | <https://dev.mysql.com/downloads/workbench/> |
| 6 | Git | เวอร์ชันล่าสุด | ไม่บังคับ | <https://git-scm.com/downloads> |
| 7 | เว็บเบราว์เซอร์รุ่นใหม่ | Chrome / Edge / Firefox | จำเป็น | <https://www.google.com/chrome/> |

> **หมายเหตุ:** หากไม่ติดตั้ง Git สามารถดาวน์โหลดโปรเจกต์เป็นไฟล์ ZIP จาก GitHub แล้วแตกไฟล์ได้ แต่ถ้าต้องการอัปเดตโค้ดในอนาคต แนะนำให้ติดตั้ง Git

### 3.2 ตารางความเข้ากันได้ของเวอร์ชัน

| องค์ประกอบ | เวอร์ชันที่ตรวจสอบใน Repository | สถานะ |
|---|---|---|
| Node.js | 22.23.5 (LTS) | ✅ ใช้ทดสอบคำสั่งในเอกสารนี้ |
| npm | 10.9.9 | ✅ มาพร้อม Node.js 22 |
| Express | 5.3.0 | ✅ ระบุใน `backend/package.json` |
| mysql2 | 3.24.6 | ✅ ระบุใน `backend/package.json` |
| multer | 2.5.0 | ✅ ระบุใน `backend/package.json` |
| dotenv | 18.0.10 | ✅ ระบุใน `backend/package.json` |
| MySQL | 8.0 / 8.4 | ⚠️ ตรวจ Schema แล้ว แต่ยังไม่ได้รันบน MySQL 8 จริง |
| Node.js 20 หรือ 24 | — | ⚠️ ยังไม่ทดสอบ อาจทำงานได้ แต่ไม่รับประกัน |
| Node.js 16 หรือเก่ากว่า | — | ❌ ไม่แนะนำ Express 5 ต้องใช้ Node.js 18 ขึ้นไป |
| MySQL 5.7 | — | ⚠️ ไม่แนะนำ เพราะอาจไม่บังคับใช้ CHECK Constraint |
| MariaDB | 10.11 | ✅ ใช้ทดสอบ import ไฟล์ SQL ในสภาพแวดล้อมจัดทำเอกสาร แต่ระบบเป้าหมายคือ MySQL 8 |
| Windows 10/11 | — | ⚠️ คำสั่งในเอกสารเขียนไว้ แต่ไม่ได้รันบน Windows จริง |
| Ubuntu 22.04/24.04 | — | ⚠️ คำสั่งในเอกสารเขียนไว้ แต่ไม่ได้รันบน Ubuntu จริง |
| macOS | — | ⚠️ คำสั่งในเอกสารเขียนไว้ แต่ไม่ได้รันบน macOS จริง |

> **หลักการเลือกเวอร์ชัน:** ใช้ **Node.js 22 LTS** และ **MySQL 8.0 หรือ 8.4** ตามที่แนะนำ หากใช้เวอร์ชันอื่นแล้วพบปัญหา ให้เปลี่ยนกลับมาใช้เวอร์ชันที่ระบุไว้ก่อน

### 3.3 การติดตั้ง Visual Studio Code

#### Windows 10/11

1. เปิดเบราว์เซอร์ไปที่ <https://code.visualstudio.com/>
2. กดปุ่ม **Download for Windows**
3. เปิดไฟล์ติดตั้งที่ดาวน์โหลดมา เช่น `VSCodeUserSetup-x64-....exe`
4. กด **Next** ไปเรื่อย ๆ โดยคงค่าเริ่มต้นไว้
5. แนะนำให้ติ๊กตัวเลือก **Add to PATH** และ **Open with Code** หากมี
6. กด **Install** แล้วรอจนเสร็จ
7. กด **Finish** เพื่อเปิดโปรแกรม

#### Ubuntu Linux

เปิด Terminal แล้วพิมพ์

```bash
sudo apt update
sudo apt install -y wget gpg
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install -y code
```

หรือดาวน์โหลดไฟล์ `.deb` จากเว็บไซต์ทางการแล้วดับเบิลคลิกติดตั้งก็ได้

#### macOS

1. ไปที่ <https://code.visualstudio.com/>
2. ดาวน์โหลดเวอร์ชัน macOS
3. เปิดไฟล์ `.zip` แล้วลาก **Visual Studio Code** ไปไว้ในโฟลเดอร์ **Applications**
4. เปิดโปรแกรมจาก Launchpad

### 3.4 การติดตั้ง Node.js 22 LTS และ npm

npm จะติดตั้งมาพร้อม Node.js โดยอัตโนมัติ ไม่ต้องติดตั้งแยก

#### Windows 10/11

1. ไปที่ <https://nodejs.org/en/download>
2. เลือกแท็บ **LTS**
3. ดาวน์โหลดไฟล์ **Windows Installer (.msi)** สำหรับ 64-bit
4. เปิดไฟล์ติดตั้ง
5. กด **Next**
6. ยอมรับ License แล้วกด **Next**
7. ตรวจสอบว่า Install Path คือ `C:\Program Files\nodejs\`
8. ที่หน้า Custom Setup ให้คงค่าเริ่มต้น และตรวจสอบว่ามี **Add to PATH**
9. ที่หน้า Tools for Native Modules ไม่จำเป็นต้องติ๊ก (โปรเจกต์นี้ไม่ต้องคอมไพล์ Native Module)
10. กด **Install** แล้วรอจนเสร็จ
11. กด **Finish**
12. **ปิด Terminal ทุกหน้าต่างแล้วเปิดใหม่** เพื่อให้ระบบอ่าน PATH ใหม่

ตรวจสอบผลโดยเปิด **Command Prompt** หรือ **PowerShell** แล้วพิมพ์

```bash
node -v
npm -v
```

ผลลัพธ์ที่ควรเห็น

```text
v22.x.x
10.x.x
```

เลขเวอร์ชันอาจต่างจากตัวอย่างเล็กน้อย ขอให้ขึ้นต้นด้วย `v22.` และ npm ขึ้นต้นด้วย `10.` หรือสูงกว่า

หากขึ้นว่า `'node' is not recognized as an internal or external command` แปลว่ายังติดตั้งไม่สำเร็จหรือ PATH ยังไม่ถูกอัปเดต ให้ดูหัวข้อ 11.1

#### Ubuntu Linux

วิธีที่แนะนำคือใช้ NodeSource Repository สำหรับ Node.js 22

```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh
sudo -E bash /tmp/nodesource_setup.sh
sudo apt install -y nodejs
node -v
npm -v
```

ผลลัพธ์ที่ควรเห็นคือ `v22.x.x` และ `10.x.x`

#### macOS

วิธีที่ง่ายที่สุดคือดาวน์โหลด Installer จาก <https://nodejs.org/en/download> แล้วติดตั้งตามหน้าจอ

หรือใช้ Homebrew

```bash
brew install node@22
brew link --overwrite --force node@22
node -v
npm -v
```

### 3.5 การติดตั้ง MySQL Community Server และ MySQL Workbench

รายละเอียดการติดตั้งและตั้งค่าฐานข้อมูลอยู่ใน **ขั้นตอนที่ 1** (หัวข้อที่ 5) เพื่อไม่ให้ขั้นตอนกระจัดกระจาย โดยสรุปมีดังนี้

- Windows: ใช้ **MySQL Installer** ติดตั้งทั้ง MySQL Server และ MySQL Workbench
- Ubuntu: ติดตั้ง `mysql-server` ผ่าน `apt` และติดตั้ง Workbench เพิ่มหากต้องการหน้าจอ
- macOS: ใช้ Homebrew ติดตั้ง `mysql` และ `mysqlworkbench`
- ตั้งค่า MySQL ให้ฟังที่พอร์ต **3306**
- จำเป็นต้องจำรหัสผ่านของผู้ใช้ `root` ที่ตั้งระหว่างติดตั้งไว้ใช้ครั้งแรก

### 3.6 การติดตั้ง Git (ไม่บังคับ)

หากต้องการใช้ Git

1. ไปที่ <https://git-scm.com/downloads>
2. ดาวน์โหลดเวอร์ชันสำหรับระบบปฏิบัติการของคุณ
3. ติดตั้งโดยคงค่าเริ่มต้น
4. เปิด Terminal ใหม่ แล้วพิมพ์

```bash
git --version
```

ผลลัพธ์ตัวอย่าง

```text
git version 2.x.x
```

ถ้าไม่ติดตั้ง Git ให้ข้ามหัวข้อนี้และใช้วิธีดาวน์โหลด ZIP ในหัวข้อ 3.7

### 3.7 การเตรียมโปรเจกต์ลงเครื่อง

#### วิธีที่ 1: ใช้ Git (แนะนำ)

เปิด Terminal แล้วไปยังโฟลเดอร์ที่ต้องการเก็บโปรเจกต์ เช่น

```bash
cd ~
git clone https://github.com/Pimpawee007/lekhaFong.git
cd lekhaFong
```

บน Windows สามารถใช้

```bat
cd %USERPROFILE%
git clone https://github.com/Pimpawee007/lekhaFong.git
cd lekhaFong
```

> ถ้า Repository เป็นแบบ Private ต้องได้รับสิทธิ์จากเจ้าของ Repository ก่อน มิฉะนั้น Git จะขอ Username/Password หรือแสดง `Repository not found`

#### วิธีที่ 2: ดาวน์โหลด ZIP

1. เปิดหน้า Repository บน GitHub
2. กดปุ่มสีเขียว **Code**
3. เลือก **Download ZIP**
4. ดับเบิลคลิกไฟล์ ZIP เพื่อแตกไฟล์
5. จะได้โฟลเดอร์ เช่น `lekhaFong-main`
6. เปลี่ยนชื่อโฟลเดอร์เป็น `lekhaFong` ได้ตามต้องการ

> **สำคัญ:** ต้องแตกไฟล์ ZIP ก่อน ห้ามเปิดไฟล์จากในหน้าต่าง Preview ของ ZIP โดยตรง เพราะไฟล์จะยังไม่ถูกแตกออกมาครบ

---

## 4. แผนผังโครงสร้างโฟลเดอร์

### 4.1 โครงสร้างจริงของ Repository

```text
lekhaFong/
├── backend/
│   ├── database.js              ← Back-End REST API Server (พอร์ต 3031)
│   ├── package.json             ← รายการ Dependency และคำสั่ง npm start
│   ├── package-lock.json        ← ล็อกเวอร์ชัน Dependency
│   ├── .env                     ← ไฟล์ตั้งค่าเฉพาะเครื่อง (ผู้ใช้สร้างเอง)
│   ├── uploads/
│   │   ├── camera-catalog/      ← รูปกล้องและแมนนิเฟสต์เครดิต
│   │   ├── lens-catalog/        ← รูปเลนส์และแมนนิเฟสต์เครดิต
│   │   ├── lighting-catalog/    ← รูปไฟต่อเนื่อง
│   │   ├── microphone-catalog/  ← รูปไมโครโฟนไร้สาย
│   │   ├── filter-catalog/      ← รูปฟิลเตอร์
│   │   └── tripod-catalog/      ← รูปขาตั้งกล้อง
│   └── node_modules/            ← เกิดหลังรัน npm ci (ไม่ต้องคัดลอก)
│
├── frontend/
│   ├── frontserver.js           ← Front-End Static Server (พอร์ต 3030)
│   ├── index.html               ← โครงหน้าเว็บหลักเพียงไฟล์เดียว
│   ├── script.js                ← JavaScript หลัก: Navigation, API, Admin, Rental
│   ├── style.css                ← CSS ของเว็บไซต์
│   ├── camera-credits.js        ← เครดิตภาพกล้อง (สร้างจาก manifest)
│   ├── lens-credits.js          ← เครดิตภาพเลนส์ (สร้างจาก manifest)
│   ├── accessory-credits.js     ← เครดิตภาพอุปกรณ์เสริม (สร้างจาก manifest)
│   ├── camera-image-sources.json
│   ├── lens-image-sources.json
│   ├── accessory-image-sources.json
│   ├── lekhaFongLogo.png        ← โลโก้
│   ├── banner/                  ← รูปแบนเนอร์หน้าแรก
│   ├── pic_member/              ← รูปสมาชิกในหน้าทีมงาน
│   ├── package.json             ← รายการ Dependency ของ Front-End
│   ├── package-lock.json        ← ล็อกเวอร์ชัน Dependency
│   └── node_modules/            ← เกิดหลังรัน npm ci
│
├── lekhafong_production.sql     ← Fresh-install schema + ข้อมูลตัวอย่าง 8 ตาราง
├── LENS-COMPATIBILITY.md        ← ตารางความเข้ากันได้ของเมาท์เลนส์
├── LENS-IMAGE-SOURCES.md        ← แหล่งที่มาและลิขสิทธิ์ภาพเลนส์
├── ACCESSORY-IMAGE-SOURCES.md   ← แหล่งที่มาและลิขสิทธิ์ภาพอุปกรณ์เสริม
├── .gitignore                   ← รายการไฟล์ที่ไม่ควรCommit เช่น .env
└── README.md                    ← เอกสารนี้
```

> โฟลเดอร์ `node_modules` ไม่ใช่ Source Code และไม่ต้องคัดลอกไปเครื่องอื่น ให้สร้างใหม่ด้วย `npm ci`

### 4.2 ไฟล์สำคัญและหน้าที่

| ไฟล์ | หน้าที่ | สิ่งที่ต้องรู้ |
|---|---|---|
| `backend/database.js` | สร้าง Express App, เชื่อม MySQL, รับคำขอ REST API, จัดการอัปโหลดรูป | ไฟล์เริ่มต้นของ Back-End |
| `backend/package.json` | ระบุ `"start": "node database.js"` และ Dependency | **มีอยู่แล้ว ห้ามรัน `npm init`** |
| `backend/.env` | เก็บพอร์ตและรหัสฐานข้อมูลเฉพาะเครื่อง | **ไม่มีใน Git ต้องสร้างเอง** |
| `frontend/frontserver.js` | HTTP Server สำหรับส่งไฟล์ Static | พอร์ตเริ่มต้น 3030 |
| `frontend/index.html` | หน้า HTML หลักเพียงหน้าเดียว | โหลด `script.js` และ Modal Login |
| `frontend/script.js` | Logic ทั้งหมดของหน้าเว็บ | เปลี่ยนหน้าแบบ JavaScript ไม่มีไฟล์ HTML แยกทุกหน้า |
| `frontend/style.css` | รูปแบบหน้าตา สีสัน และ Responsive | ไม่ต้องแก้เพื่อติดตั้ง |
| `lekhafong_production.sql` | สร้างฐานข้อมูล ตาราง และข้อมูลตัวอย่าง 80 รายการ | ใช้สำหรับติดตั้งใหม่เท่านั้น ไม่มี `DROP DATABASE` |
| `LENS-COMPATIBILITY.md` | ตารางเมาท์เลนส์และกล้องที่รองรับ | ใช้ตรวจสอบความเข้ากันได้ |
| `LENS-IMAGE-SOURCES.md` | แหล่งที่มาและลิขสิทธิ์ภาพเลนส์ | ต้องคงไว้เมื่อเผยแพร่ภาพ |
| `ACCESSORY-IMAGE-SOURCES.md` | แหล่งที่มาและลิขสิทธิ์ภาพอุปกรณ์เสริม | ระบุภาพที่ยังไม่มี |

### 4.3 ข้อควรเข้าใจเกี่ยวกับการเปลี่ยนหน้า

โปรเจกต์นี้ใช้ **JavaScript-based Navigation** ไม่ได้มีไฟล์แยกเช่น `product.html`, `team.html` หรือ `admin.html` ทุกหน้าเรนเดอร์อยู่ใน `index.html` และเปลี่ยนเนื้อหาด้วย `script.js` โดยใช้ URL รูปแบบ

```text
http://localhost:3030/?page=home
http://localhost:3030/?page=search
http://localhost:3030/?page=detail&id=1
http://localhost:3030/?page=team
http://localhost:3030/?page=admin
```

ดังนั้นหากหาไฟล์ `search.html` หรือ `admin.html` จะไม่พบ และไม่ใช่ความผิดพลาด

---

## 5. ขั้นตอนที่ 1: การติดตั้งและเตรียมฐานข้อมูล MySQL

ในขั้นตอนนี้จะติดตั้ง MySQL เปิด MySQL Workbench สร้างผู้ใช้สำหรับแอปพลิเคชัน สร้างฐานข้อมูล และนำเข้าไฟล์ `lekhafong_production.sql`

> **อ่านให้จบก่อนลงมือ:** ไฟล์ SQL สร้างฐานข้อมูลด้วย `CREATE DATABASE IF NOT EXISTS` และไม่มี `DROP DATABASE` อย่างไรก็ตาม ไฟล์นี้ออกแบบสำหรับการติดตั้งใหม่ ถ้าฐานข้อมูลเดิมมีข้อมูลอยู่ คำสั่ง `INSERT` อาจหยุดเพราะ Primary Key ซ้ำ และจะไม่เขียนทับข้อมูลเดิม

### 5.1 การติดตั้ง MySQL บน Windows 10/11

1. เปิดเบราว์เซอร์ไปที่ <https://dev.mysql.com/downloads/installer/>
2. ดาวน์โหลด **MySQL Installer for Windows** (แบบ Full หรือ Web)
3. เปิดไฟล์ `mysql-installer-community-....msi`
4. ที่หน้า Choosing a Setup Type เลือก **Custom** หรือ **Developer Default**
5. ในรายการ Products ให้ตรวจสอบว่ามีอย่างน้อย
   - **MySQL Server**
   - **MySQL Workbench**
6. กด **Next** แล้ว **Execute** เพื่อติดตั้ง
7. เมื่อถึงหน้า Configuration ของ MySQL Server
   - Config Type: **Development Computer**
   - Port: **3306**
   - Authentication Method: **Use Strong Password Encryption** (ค่าเริ่มต้น)
8. ตั้งรหัสผ่านสำหรับผู้ใช้ `root` และจดจำไว้ให้ดี
9. สร้าง MySQL User เพิ่มเติมตามหน้าจอได้ หรือข้ามไปสร้างภายหลังใน Workbench
10. ตั้งชื่อ Windows Service เช่น `MySQL80` (ค่าเริ่มต้น)
11. กด **Execute** แล้ว **Finish**

หลังติดตั้ง ตรวจสอบว่า MySQL ทำงานอยู่โดย

1. กดปุ่ม **Start** ของ Windows
2. พิมพ์ `services.msc` แล้วกด Enter
3. หา Service ชื่อ **MySQL80** หรือ **MySQL**
4. ดูคอลัมน์ Status ต้องเป็น **Running**
5. หาก stopped ให้คลิกขวาแล้วเลือก **Start**

หรือเปิด **Command Prompt แบบ Administrator** แล้วพิมพ์

```bat
net start MySQL80
```

> ชื่อ Service อาจเป็น `MySQL80`, `MySQL84` หรือ `MySQL` ตามเวอร์ชัน ให้ดูจากหน้า Services

### 5.2 การติดตั้ง MySQL บน Ubuntu Linux

เปิด Terminal แล้วพิมพ์ทีละคำสั่ง

```bash
sudo apt update
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo systemctl status mysql
```

ผลลัพธ์ที่ควรเห็นมีคำว่า `active (running)`

จากนั้นตั้งค่าความปลอดภัยเบื้องต้น

```bash
sudo mysql_secure_installation
```

ตอบคำถามตามหน้าจอ แนะนำให้

- ตั้งรหัสผ่านสำหรับ root
- ลบ Anonymous User
- ไม่อนุญาตให้ root login จากระยะไกล
- ลบ Test Database
- Reload Privilege Tables

ตรวจสอบการเชื่อมต่อ

```bash
sudo mysql -u root -p
```

เมื่อเข้าสู่ MySQL Shell ได้ ให้พิมพ์ `exit` เพื่อออก

> หากต้องการ MySQL Workbench บน Ubuntu ให้ลอง `sudo apt install -y mysql-workbench` หาก Package ไม่มีใน Repository ของระบบ ให้ดาวน์โหลดจากเว็บไซต์ทางการ หรือใช้ MySQL Command Line แทน

### 5.3 การติดตั้ง MySQL บน macOS

ใช้ Homebrew

```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

ตรวจสอบสถานะ

```bash
brew services list
```

คำว่า `started` แปลว่า MySQL ทำงานอยู่

ติดตั้ง MySQL Workbench

```bash
brew install --cask mysqlworkbench
```

### 5.4 การเปิด MySQL Workbench และเชื่อมต่อ Local Server

1. เปิดโปรแกรม **MySQL Workbench**
2. ดูแถบด้านซ้ายหัวข้อ **MySQL Connections**
3. กดเครื่องหมาย **+** ข้างคำว่า MySQL Connections เพื่อสร้าง Connection ใหม่
4. กรอกข้อมูลดังนี้

| ช่อง | ค่าที่กรอก |
|---|---|
| Connection Name | `LeKhaFong Local` |
| Connection Method | Standard (TCP/IP) |
| Hostname | `127.0.0.1` |
| Port | `3306` |
| Username | `root` (เฉพาะครั้งแรกที่ตั้งค่า) |
| Password | รหัสผ่าน root ที่ตั้งไว้ตอนติดตั้ง |
| Default Schema | เว้นว่าง |

5. กด **Test Connection**
6. หากสำเร็จจะเห็นข้อความ

```text
Successfully made the MySQL connection
```

7. กด **OK** แล้ว **OK** อีกครั้ง
8. ดับเบิลคลิกการเชื่อมต่อ `LeKhaFong Local`
9. จะเห็นหน้าต่าง Query Tab พร้อมพื้นที่พิมพ์ SQL สีขาว

> หาก Test Connection ไม่ผ่าน ให้ดูหัวข้อ 11.3 และ 11.4 ก่อนดำเนินการต่อ

### 5.5 การสร้างผู้ใช้ MySQL สำหรับแอปพลิเคชัน

**ห้ามใช้บัญชี `root` เป็นบัญชีที่แอปพลิเคชันใช้ทำงานประจำ** เพราะ root มีสิทธิ์เกินความจำเป็น หากโค้ดมีช่องโหว่หรือรหัสผ่านรั่วไหล ความเสียหายจะครอบคลุมทั้ง MySQL Server

ให้สร้างผู้ใช้ใหม่ที่ได้รับสิทธิ์เฉพาะฐานข้อมูล `lekhafong_production`

ใน MySQL Workbench Query Tab ให้พิมพ์คำสั่งต่อไปนี้ **โดยเปลี่ยนค่าตัวพิมพ์ใหญ่ให้เป็นค่าของคุณเอง**

```sql
CREATE USER 'YOUR_MYSQL_USERNAME'@'localhost'
IDENTIFIED BY 'YOUR_MYSQL_PASSWORD';

CREATE DATABASE IF NOT EXISTS lekhafong_production
CHARACTER SET utf8mb4;

GRANT ALL PRIVILEGES ON lekhafong_production.*
TO 'YOUR_MYSQL_USERNAME'@'localhost';

FLUSH PRIVILEGES;
```

ความหมายของแต่ละบรรทัด

| คำสั่ง | ความหมาย |
|---|---|
| `CREATE USER` | สร้างบัญชีผู้ใช้ MySQL ใหม่ |
| `'YOUR_MYSQL_USERNAME'@'localhost'` | ชื่อผู้ใช้และอนุญาตให้เชื่อมต่อจากเครื่องนี้เท่านั้น |
| `IDENTIFIED BY` | กำหนดรหัสผ่าน |
| `CREATE DATABASE IF NOT EXISTS` | สร้างฐานข้อมูลหากยังไม่มี |
| `CHARACTER SET utf8mb4` | รองรับภาษาไทยและอักขระ Unicode |
| `GRANT ALL PRIVILEGES ON lekhafong_production.*` | ให้สิทธิ์ทั้งหมดเฉพาะฐานข้อมูลนี้ |
| `FLUSH PRIVILEGES` | โหลดสิทธิ์ใหม่ทันที |

**ตัวอย่างการแทนที่ (ตัวอย่างเท่านั้น ห้ามใช้รหัสผ่านนี้จริง)**

```sql
CREATE USER 'lekha_app'@'localhost'
IDENTIFIED BY 'ChangeThisPassword_2026!';

CREATE DATABASE IF NOT EXISTS lekhafong_production
CHARACTER SET utf8mb4;

GRANT ALL PRIVILEGES ON lekhafong_production.*
TO 'lekha_app'@'localhost';

FLUSH PRIVILEGES;
```

> `YOUR_MYSQL_USERNAME` และ `YOUR_MYSQL_PASSWORD` เป็นเพียงตัวแทนข้อความ ต้องแทนที่ด้วยชื่อและรหัสผ่านที่คุณคิดขึ้นเอง ห้ามคัดลอกตัวอย่าง `lekha_app` หรือ `ChangeThisPassword_2026!` ไปใช้จริง
>
> รหัสผ่านควรมีความยาวอย่างน้อย 8–12 ตัวอักษร มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ และไม่ควรเหมือนรหัสผ่านอีเมลหรือระบบอื่น

> **หาก MySQL ปฏิเสธรหัสผ่าน:** MySQL 8.0 อาจเปิด `validate_password` ไว้ ทำให้รหัสผ่านง่ายเกินไปถูกปฏิเสธด้วย `ERROR 1819` ให้ใช้รหัสผ่านที่ยาวและซับซ้อนขึ้น เช่น มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และสัญลักษณ์ครบ

หลังรันคำสั่ง ตรวจสอบสิทธิ์

```sql
SHOW GRANTS FOR 'YOUR_MYSQL_USERNAME'@'localhost';
```

ผลลัพธ์ที่ควรเห็นมีลักษณะ

```text
GRANT ALL PRIVILEGES ON `lekhafong_production`.* TO `YOUR_MYSQL_USERNAME`@`localhost`
```

#### หากชื่อผู้ใช้มีอยู่แล้ว

หากขึ้นข้อผิดพลาด `ERROR 1396 (HY000): Operation CREATE USER failed` แปลว่าชื่อนี้มีอยู่แล้ว ให้เลือกชื่อใหม่ หรือถ้าเป็นบัญชีที่คุณสร้างเองและต้องการเปลี่ยนรหัสผ่าน ให้ใช้

```sql
ALTER USER 'YOUR_MYSQL_USERNAME'@'localhost'
IDENTIFIED BY 'YOUR_NEW_MYSQL_PASSWORD';
```

### 5.6 การทดสอบเชื่อมต่อด้วยบัญชีแอปพลิเคชัน

1. กลับไปหน้า Home ของ MySQL Workbench
2. กด **+** สร้าง Connection ใหม่
3. ตั้งชื่อ เช่น `LeKhaFong App`
4. Hostname: `127.0.0.1`
5. Port: `3306`
6. Username: ชื่อผู้ใช้ที่สร้างในหัวข้อ 5.5
7. กด **Test Connection** แล้วใส่รหัสผ่าน
8. ต้องเห็นข้อความ Successfully made the MySQL connection
9. กด **OK** ทั้งสองครั้ง

หากเชื่อมต่อด้วยบัญชีแอปพลิเคชันได้ แสดงว่าชื่อผู้ใช้ รหัสผ่าน และสิทธิ์พื้นฐานถูกต้อง

### 5.7 ความปลอดภัยของไฟล์ SQL (ไม่มี `DROP DATABASE`)

ไฟล์ `lekhafong_production.sql` เริ่มต้นด้วยคำสั่งที่ปลอดภัยดังนี้

```sql
CREATE DATABASE IF NOT EXISTS lekhafong_production
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE lekhafong_production;
```

ไฟล์นี้ **ไม่มี** `DROP DATABASE` และ **ไม่มี** `DROP TABLE` ดังนั้นการนำเข้าจะไม่ลบฐานข้อมูลหรือตารางเดิม

**สิ่งที่ต้องเข้าใจ**

1. ไฟล์นี้ออกแบบสำหรับ **การติดตั้งใหม่ (fresh installation)** เท่านั้น
2. ถ้าฐานข้อมูลมีอยู่แล้วและมีข้อมูลเดิม คำสั่ง `INSERT` จะหยุดเพราะ Primary Key ซ้ำ และจะไม่เขียนทับข้อมูลเดิม
3. ไฟล์นี้ไม่ใช่ migration สำหรับอัปเดตฐานข้อมูลรุ่นเก่าโดยอัตโนมัติ
4. ถ้าต้องการเริ่มใหม่ ให้สำรองข้อมูลก่อนและสร้างฐานข้อมูลทดสอบแยก ไม่ควรลบฐานข้อมูลที่ใช้งานอยู่
5. ห้ามใช้ไฟล์นี้กับฐานข้อมูลที่ใช้งานจริง (Production)

### 5.8 การตรวจสอบว่าฐานข้อมูลมีอยู่แล้วหรือไม่

ก่อนนำเข้า ให้รันคำสั่งนี้ใน MySQL Workbench

```sql
SHOW DATABASES LIKE 'lekhafong_production';
```

- ถ้า **ไม่มีผลลัพธ์** แปลว่ายังไม่มีฐานข้อมูลนี้ เหมาะสำหรับการติดตั้งครั้งแรก
- ถ้า **มีผลลัพธ์ 1 แถว** แปลว่ามีฐานข้อมูลอยู่แล้ว ให้ตรวจสอบข้อมูลเดิมก่อน ถ้าเป็นฐานข้อมูลที่ต้องการใช้งานอยู่ **ห้ามนำเข้าไฟล์นี้ทับ** เพราะอาจเกิด Primary Key ซ้ำ

หากมีอยู่แล้วและเป็นข้อมูลที่ต้องการ ให้สำรองก่อนด้วยคำสั่ง (รันใน Terminal/Command Prompt ไม่ใช่ใน Workbench)

```bash
mysqldump -u root -p lekhafong_production > lekhafong_backup.sql
```

จากนั้นเก็บไฟล์ `lekhafong_backup.sql` ไว้ในที่ปลอดภัย

### 5.9 วิธีนำเข้าไฟล์ SQL อย่างปลอดภัยสำหรับการติดตั้งครั้งแรก

#### วิธีที่ 1: ใช้ MySQL Workbench (แนะนำสำหรับผู้เริ่มต้น)

1. เปิด MySQL Workbench
2. เชื่อมต่อด้วยบัญชีแอปพลิเคชัน `LeKhaFong App` หรือบัญชี root สำหรับติดตั้ง
3. ไปที่เมนู **File > Open SQL Script...**
4. เลือกไฟล์ `lekhafong_production.sql` จากโฟลเดอร์โปรเจกต์
5. ไฟล์จะเปิดในแท็บใหม่
6. กดปุ่มรูป **สายฟ้า (Execute)** ที่แถบเครื่องมือ หรือกด `Ctrl + Shift + Enter`
7. ไฟล์นี้ไม่มีคำสั่งลบฐานข้อมูล ให้รอจนคำสั่งทั้งหมดทำงานเสร็จ
8. รอจนคำสั่งทั้งหมดทำงานเสร็จ
9. ที่แถบ **Output** ด้านล่าง ต้องไม่มีข้อความสีแดงขึ้นต้นด้วย `ERROR`

ผลลัพธ์ที่ถือว่าสำเร็จ

- มีข้อความ `1 row(s) affected` หรือ `Query OK` หลายบรรทัด
- ไม่มี `ERROR 1044`, `ERROR 1045`, `ERROR 1064`
- แถบ Schemas ด้านซ้ายแสดงฐานข้อมูล `lekhafong_production`

#### วิธีที่ 2: ใช้ Command Prompt บน Windows

> วิธีนี้ใช้ **Command Prompt (cmd.exe)** ไม่ใช่ PowerShell เพราะ PowerShell ไม่รองรับเครื่องหมาย `<` ในลักษณะนี้ในเวอร์ชันเก่า

1. กด Start แล้วพิมพ์ `cmd`
2. เปิด Command Prompt
3. ไปที่โฟลเดอร์โปรเจกต์

```bat
cd C:\path\to\lekhaFong
```

4. ตรวจสอบว่าเห็นไฟล์ SQL

```bat
dir lekhafong_production.sql
```

5. รันคำสั่งนำเข้า (แก้ Path ของ mysql.exe ตามเวอร์ชันที่ติดตั้ง)

```bat
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u YOUR_MYSQL_USERNAME -p < lekhafong_production.sql
```

6. ระบบจะถามรหัสผ่าน ให้พิมพ์รหัสผ่านของผู้ใช้ MySQL แล้วกด Enter (ตัวอักษรจะไม่แสดงบนหน้าจอ เป็นเรื่องปกติ)
7. รอจนกลับมาที่ Prompt `C:\...>` โดยไม่มี ERROR

#### วิธีที่ 3: ใช้ Terminal บน Ubuntu / macOS

```bash
cd ~/lekhaFong
mysql -u YOUR_MYSQL_USERNAME -p < lekhafong_production.sql
```

หาก MySQL ไม่ได้อยู่ใน PATH ให้ใช้ Path เต็ม เช่น

```bash
/usr/local/mysql/bin/mysql -u YOUR_MYSQL_USERNAME -p < lekhafong_production.sql
```

### 5.10 การตรวจสอบว่ามีครบ 8 ตาราง

หลังนำเข้าสำเร็จ ให้รันคำสั่งต่อไปนี้ใน MySQL Workbench

```sql
USE lekhafong_production;
SHOW TABLES;
```

ผลลัพธ์ที่ต้องเห็นมี **8 แถว** ดังนี้

```text
+---------------------------+
| Tables_in_lekhafong_production |
+---------------------------+
| ADMIN                     |
| CONTRACT                  |
| CUSTOMER                  |
| EQUIPMENT                 |
| ITEM                      |
| LOGIN                     |
| RENTAL                    |
| USER_ACCOUNT              |
+---------------------------+
8 rows in set
```

ตรวจสอบจำนวนข้อมูลตัวอย่าง

```sql
SELECT COUNT(*) AS total_equipment FROM EQUIPMENT;
SELECT COUNT(*) AS total_accounts FROM USER_ACCOUNT;
```

ผลลัพธ์ที่ควรได้จากไฟล์ SQL ที่ให้มา

```text
total_equipment
80

total_accounts
2
```

ตรวจสอบจำนวนอุปกรณ์แยกตามประเภท

```sql
SELECT type, COUNT(*) AS total FROM EQUIPMENT GROUP BY type ORDER BY type;
```

ผลลัพธ์ที่ควรได้

```text
Camera                12
Camera Filter          9
Cinema Camera          1
Compact Camera         1
Continuous Light       9
Lens                  30
Tripod                 9
Wireless Microphone    9
```

ตรวจสอบว่าโครงสร้างตาราง `EQUIPMENT` มีคอลัมน์รูปภาพและสต็อก

```sql
DESCRIBE EQUIPMENT;
```

ต้องเห็นคอลัมน์ `main_image`, `detail_images` และ `stock` อยู่ในผลลัพธ์

ตรวจสอบว่าข้อมูลถูกเก็บในฐานข้อมูลที่ถูกต้อง

```sql
SELECT DATABASE();
```

ผลลัพธ์ต้องเป็น

```text
lekhafong_production
```

### 5.11 ข้อมูลตัวอย่างและบัญชีสาธิตในไฟล์ SQL

ไฟล์ `lekhafong_production.sql` มีข้อมูลตัวอย่างเพื่อให้หน้าเว็บแสดงผลได้ทันที ได้แก่

- บัญชีผู้ใช้ตัวอย่าง 2 บัญชี (Admin 1 บัญชี และ Customer 1 บัญชี)
- ข้อมูลผู้ดูแลระบบ 1 แถว
- ข้อมูลลูกค้า 1 แถว
- อุปกรณ์ตัวอย่าง 80 รายการ
  - กล้อง 14 รายการ (Camera 12, Cinema Camera 1, Compact Camera 1)
  - เลนส์ 30 รายการ ครอบคลุม 5 ระบบเมาท์
  - ไฟต่อเนื่อง 9 รายการ (Aputure, amaran, Nanlite)
  - ไมโครโฟนไร้สาย 9 รายการ (RØDE, DJI, Hollyland)
  - ฟิลเตอร์ 9 รายการ (NiSi, K&F Concept, Tiffen) ขนาด 82mm
  - ขาตั้งกล้อง 9 รายการ (Manfrotto, Benro, SmallRig)

**บัญชีสาธิตสำหรับการทดสอบบนเครื่อง Local**

| บทบาท | Username | Password | ใช้ทดสอบ |
|---|---|---|---|
| Admin | `admin_demo` | `DemoAdmin123` | หน้า Admin, การจัดการสินค้าและผู้ใช้ |
| Customer | `customer_demo` | `DemoCustomer123` | Login, ส่งคำขอเช่า |

> **เรื่องรหัสผ่าน:** รหัสผ่านข้างต้นเป็นรหัสสำหรับการสาธิตในเครื่อง Local เท่านั้น ไฟล์ SQL เก็บเป็นข้อความธรรมดา (Plaintext) ตามพฤติกรรมของระบบรุ่นนี้ ห้ามนำไปใช้กับระบบจริงหรือฐานข้อมูลที่เปิดให้บุคคลภายนอกเข้าถึง
>
> หลังเข้าสู่ระบบได้แล้ว ให้เปลี่ยนรหัสผ่านบัญชี Admin และ Customer ทันทีผ่านหน้า Admin หรือคำสั่ง SQL ที่คุณสร้างเอง

### 5.12 สิ่งที่ไม่ควรทำในขั้นตอนนี้

- ❌ ห้ามนำไฟล์ `lekhafong_production.sql` ไปรันทับฐานข้อมูลที่มีข้อมูลอยู่แล้ว
- ❌ ห้ามใช้บัญชี `root` ในไฟล์ `.env` ของแอปพลิเคชัน
- ❌ ห้ามใช้รหัสผ่านเดียวกับอีเมลหรือบัญชีธนาคาร
- ❌ ห้ามCommit ไฟล์ `.env` ขึ้น Git
- ❌ ห้ามแก้ไขข้อมูลในตารางโดยไม่สำรองข้อมูล
- ❌ ห้ามลบฐานข้อมูลเพื่อ “เริ่มใหม่” หากยังไม่ได้สำรองข้อมูลที่ต้องการ

### 5.13 การทดสอบการติดตั้งบน Windows 11 และ MySQL

โปรเจกต์นี้ได้รับการทดสอบการติดตั้งบนเครื่อง Windows 11 ด้วย MySQL Server โดยผู้จัดทำ ผลที่ยืนยันแล้วมีดังนี้

- Clone repository จาก GitHub สำเร็จ
- ไฟล์โปรเจกต์เวอร์ชันล่าสุดอยู่ครบ
- รูปภาพกล้องครบ 62 ไฟล์
- รูปภาพเลนส์ครบ 64 ไฟล์
- นำเข้าไฟล์ `lekhafong_production.sql` ชุด 44 รายการเข้า MySQL สำเร็จ
- ฐานข้อมูลมี 8 ตารางครบ
- ฐานข้อมูลที่ทดสอบมีอุปกรณ์ 44 รายการ (กล้อง 14 รายการ และเลนส์ 30 รายการ)

> หลังการทดสอบบน Windows ครั้งนั้น แคตตาล็อกได้เพิ่มอุปกรณ์เสริมอีก 36 รายการ รวมเป็น **80 รายการ** และ SQL ถูกอัปเดตแล้ว แต่การนำเข้า SQL ชุด 80 รายการบน Windows 11 ยังไม่ได้ทดสอบซ้ำในสภาพแวดล้อมนี้

**การตั้งค่าฐานข้อมูลบน Windows**

ผู้ใช้งานต้องสร้าง MySQL username และ password ของตนเอง แล้วนำไปใส่ใน `backend/.env` เช่น

```env
PORT=3031
DB_HOST=localhost
DB_PORT=3306
DB_USER=YOUR_MYSQL_USERNAME
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=lekhafong_production
```

ห้ามใช้บัญชี `root` ในไฟล์ `.env` ของแอปพลิเคชัน และห้าม Commit ไฟล์ `.env` ขึ้น Git

**MySQL กับ MariaDB**

ระบบรองรับ MySQL สำหรับการติดตั้งบนเครื่อง Local และ **ไม่จำเป็นต้องใช้ MariaDB** ไฟล์ SQL ถูกออกแบบให้ใช้กับ MySQL 8.0 ขึ้นไป ในสภาพแวดล้อมจัดทำเอกสารนี้ ผู้จัดทำใช้ MariaDB 10.11 สำหรับทดสอบ import แยก แต่ผลการติดตั้งบน Windows 11 ที่ระบุด้านบนใช้ MySQL Server ตามที่ผู้ใช้งานยืนยัน

**สถานะการตรวจสอบบน Windows 11**

| รายการ | สถานะ |
|---|---|
| ไฟล์โปรเจกต์หลัง Clone | ✅ ยืนยันแล้ว |
| รูปภาพกล้องและเลนส์ | ✅ ยืนยันแล้ว |
| รูปภาพอุปกรณ์เสริม | ⚠️ มีเพียงบางรายการ; 34 รายการยังไม่มีภาพ |
| การนำเข้า SQL ชุด 44 รายการเข้า MySQL | ✅ ยืนยันแล้ว |
| การนำเข้า SQL ชุด 80 รายการบน Windows | ⚠️ ยังไม่ได้ทดสอบซ้ำ |
| โครงสร้าง 8 ตาราง | ✅ ยืนยันแล้ว |
| จำนวนอุปกรณ์ 44 รายการ ณ เวลาทดสอบ | ✅ ยืนยันแล้ว |
| จำนวนอุปกรณ์ 80 รายการในแคตตาล็อกปัจจุบัน | ✅ ตรวจสอบในฐานข้อมูลทดสอบแยกแล้ว |
| การทดสอบ API ทั้งหมดบน Windows | ⚠️ ยังไม่ได้ทดสอบครบทุกกรณี |
| การทำงานของ Frontend และ Cross-browser บน Windows | ⚠️ ยังไม่ได้ทดสอบครบทุกกรณี |

> ข้อความในหัวข้อนี้ยืนยันเฉพาะรายการที่ระบุว่ายืนยันแล้วเท่านั้น ไม่ได้หมายความว่า API, Frontend หรือ Browser ทุกตัวผ่านการทดสอบบน Windows 11 ครบทั้งหมด

---

## 6. ขั้นตอนที่ 2: การตั้งค่าและรัน Back-End REST API Server

### 6.1 เปิดโปรเจกต์ใน Visual Studio Code

1. เปิด **Visual Studio Code**
2. ไปที่เมนู **File > Open Folder...**
3. เลือกโฟลเดอร์โปรเจกต์ `lekhaFong` (โฟลเดอร์ที่มีทั้ง `backend`, `frontend` และ `lekhafong_production.sql`)
4. กด **Select Folder** หรือ **Open**
5. หากมีหน้าต่างถามว่า “Do you trust the authors of the files in this folder?” ให้เลือก **Yes, I trust the authors**
6. แถบด้านซ้าย (Explorer) ต้องเห็นโฟลเดอร์ `backend`, `frontend`, `tests` และไฟล์ `lekhafong_production.sql`

> **ข้อควรระวัง:** ต้องเปิดโฟลเดอร์ `lekhaFong` ไม่ใช่เปิดแค่ไฟล์ `database.js` เพราะคำสั่ง `npm` ต้องรันในโฟลเดอร์ที่ถูกต้อง

### 6.2 เปิด Terminal ใน VS Code

1. ไปที่เมนู **Terminal > New Terminal**
2. จะมีแผง Terminal เปิดที่ด้านล่าง
3. บน Windows ค่าเริ่มต้นมักเป็น **PowerShell**
4. บน Ubuntu/macOS ค่าเริ่มต้นมักเป็น **bash** หรือ **zsh**

สังเกต Prompt ด้านซ้าย ต้องลงท้ายด้วยชื่อโฟลเดอร์ `lekhaFong` เช่น

```text
PS C:\Users\YOUR_NAME\lekhaFong>
```

หรือ

```text
YOUR_NAME@computer:~/lekhaFong$
```

### 6.3 เข้าไปที่โฟลเดอร์ backend

พิมพ์คำสั่ง

```bash
cd backend
```

ความหมาย: เปลี่ยน Current Directory เข้าไปในโฟลเดอร์ `backend`

ตรวจสอบว่าอยู่ถูกที่

```bash
ls
```

บน Windows PowerShell ใช้

```powershell
dir
```

ต้องเห็นไฟล์อย่างน้อย

```text
database.js
package.json
package-lock.json
```

หากเห็น `Cannot find path ... because it does not exist` แปลว่าอยู่ผิดโฟลเดอร์ ให้พิมพ์ `cd ..` เพื่อย้อนกลับ แล้วเข้าใหม่

### 6.4 ติดตั้ง Dependency ด้วย `npm ci`

> **ห้ามรัน `npm init`** เพราะโปรเจกต์นี้มีไฟล์ `package.json` และ `package-lock.json` อยู่แล้ว การรัน `npm init` จะสร้างหรือแก้ไฟล์เหล่านี้โดยไม่จำเป็น

พิมพ์คำสั่ง

```bash
npm ci
```

#### `npm ci` ทำอะไร

1. อ่านรายการ Dependency จาก `package.json`
2. อ่านเวอร์ชันที่ล็อกไว้ใน `package-lock.json`
3. ลบโฟลเดอร์ `node_modules` เดิม (ถ้ามี)
4. ดาวน์โหลด Dependency ทุกตัวจาก npm Registry
5. ติดตั้งลงใน `backend/node_modules`

ข้อดีคือทุกเครื่องจะได้เวอร์ชันตรงกันตาม Lock File ไม่เกิดปัญหา “เครื่องหนึ่งใช้ได้ อีกเครื่องใช้ไม่ได้”

#### Dependency ของ Back-End

| Package | หน้าที่ |
|---|---|
| `express` | สร้าง Web Server และกำหนด REST API Routes |
| `cors` | อนุญาตให้ Front-End ที่พอร์ต 3030 เรียก Back-End |
| `mysql2` | เชื่อมต่อและส่งคำสั่ง SQL ไปยัง MySQL |
| `dotenv` | อ่านค่าจากไฟล์ `.env` |
| `multer` | รับไฟล์อัปโหลดรูปภาพ |

#### ผลลัพธ์ที่ควรเห็น

```text
added 85 packages, and audited 86 packages in 5s
found 0 vulnerabilities
```

จำนวน Package อาจไม่ตรงกับตัวอย่าง ขอให้ไม่มีคำว่า `npm error` และมีโฟลเดอร์ `node_modules` เกิดขึ้น

ตรวจสอบ

```bash
ls
```

ต้องเห็น `node_modules` เพิ่มขึ้นมา

#### ต้องใช้อินเทอร์เน็ตหรือไม่

ต้องใช้ในครั้งแรกที่รัน `npm ci` เพราะ npm ต้องดาวน์โหลด Package จากอินเทอร์เน็ต หากไม่มีอินเทอร์เน็ตจะขึ้น `network` หรือ `ENOTFOUND`

### 6.5 การสร้างไฟล์ `.env`

#### `.env` คืออะไร

`.env` เป็นไฟล์ข้อความธรรมดาที่เก็บค่าตั้งต้นเฉพาะเครื่อง เช่น พอร์ตของ Back-End และรหัสผ่าน MySQL โปรแกรม `dotenv` จะอ่านไฟล์นี้ตอนเริ่มระบบ

เหตุที่ต้องแยกไฟล์นี้เพราะ

- รหัสผ่านไม่ควรเขียนลงใน Source Code
- แต่ละเครื่องมี MySQL username/password ไม่เหมือนกัน
- ไฟล์ `.env` ถูกใส่ไว้ใน `.gitignore` จึงไม่ถูก Commit ขึ้น Git

#### ตำแหน่งและชื่อไฟล์

ไฟล์ต้องอยู่ที่

```text
lekhaFong/backend/.env
```

ชื่อไฟล์ต้องเป็น `.env` เท่านั้น ไม่มีนามสกุลต่อท้าย

#### วิธีสร้างใน VS Code

1. ใน Explorer คลิกขวาที่โฟลเดอร์ `backend`
2. เลือก **New File**
3. พิมพ์ชื่อไฟล์ `.env`
4. กด Enter
5. พิมพ์เนื้อหาดังนี้ **โดยแทนที่ค่าตัวพิมพ์ใหญ่ด้วยข้อมูลของคุณ**

```env
PORT=3031
DB_HOST=localhost
DB_PORT=3306
DB_USER=YOUR_MYSQL_USERNAME
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=lekhafong_production
```

6. กด `Ctrl + S` (Windows/Linux) หรือ `Cmd + S` (macOS) เพื่อบันทึก

> **ห้ามคัดลอกไฟล์ `.env` จากเครื่องอื่นหรือจาก Repository** เพราะอาจมีรหัสผ่านจริงติดมาด้วย ให้สร้างใหม่และกรอกค่าของคุณเองทุกครั้ง

#### ความหมายของแต่ละบรรทัด

| ตัวแปร | ตัวอย่าง | จำเป็น | ความหมาย |
|---|---|---|---|
| `PORT` | `3031` | แนะนำ | พอร์ตที่ Back-End ใช้ ถ้าเว้นว่างโค้ดจะใช้ 3031 |
| `DB_HOST` | `localhost` | ใช่ | ที่อยู่ของ MySQL ใช้ `localhost` เมื่ออยู่เครื่องเดียวกัน |
| `DB_PORT` | `3306` | ไม่บังคับ | พอร์ต MySQL ถ้าไม่ใส่โค้ดจะใช้ 3306 |
| `DB_USER` | `YOUR_MYSQL_USERNAME` | ใช่ | ชื่อผู้ใช้ MySQL ที่สร้างในหัวข้อ 5.5 |
| `DB_PASSWORD` | `YOUR_MYSQL_PASSWORD` | ใช่ | รหัสผ่าน MySQL ของผู้ใช้คนนั้น |
| `DB_NAME` | `lekhafong_production` | ใช่ | ชื่อฐานข้อมูล ต้องสะกดตรงกันทุกตัวอักษร |

#### หลักการเขียน `.env` ให้ถูกต้อง

- หนึ่งบรรทัดมีหนึ่งค่า
- ใช้เครื่องหมาย `=` คั่นชื่อตัวแปรกับค่า
- **ไม่ต้องใส่ช่องว่าง**รอบเครื่องหมาย `=` (เช่น `DB_USER=lekha_app` ไม่ใช่ `DB_USER = lekha_app`)
- ไม่ต้องใส่เครื่องหมายคำพูด หากรหัสผ่านไม่มีอักขระพิเศษ
- ถ้ารหัสผ่านมี `#`, ช่องว่าง หรืออักขระพิเศษ ให้ครอบด้วยเครื่องหมายคำพูดคู่

ตัวอย่าง

```env
DB_PASSWORD="My#Secret Password 2026"
```

- ห้ามใส่ `;` ปิดท้ายบรรทัด
- ห้ามตั้งชื่อไฟล์เป็น `.env.txt`, `.env.example.txt` หรือ `env`

#### การบันทึกไฟล์บน Windows ให้ไม่กลายเป็น `.env.txt`

Windows มักซ่อนนามสกุลไฟล์ ทำให้ผู้ใช้เผลอบันทึกเป็น `.env.txt`

วิธีตรวจสอบ

1. เปิด File Explorer
2. ไปที่แท็บ **View**
3. ติ๊ก **File name extensions**
4. กลับมาดูไฟล์ในโฟลเดอร์ `backend`
5. ต้องเห็นชื่อ `.env` ไม่ใช่ `.env.txt`

หากใช้ Notepad

1. ไปที่ **File > Save As**
2. ที่ช่อง **Save as type** เลือก **All Files (*.*)**
3. ที่ช่อง **File name** พิมพ์ `.env`
4. ที่ช่อง **Encoding** เลือก **UTF-8**
5. กด **Save**

ใน VS Code สามารถตรวจสอบชื่อไฟล์ที่แท็บด้านบนได้โดยตรง

#### หลังแก้ `.env` ต้องทำอะไร

ต้อง **หยุด Back-End แล้วเริ่มใหม่** ทุกครั้ง เพราะโปรแกรมอ่าน `.env` เพียงตอนเริ่มทำงาน

### 6.6 การเริ่มรัน Back-End

ตรวจสอบว่าอยู่ในโฟลเดอร์ `backend` และมีไฟล์ `.env` แล้ว จากนั้นพิมพ์

```bash
npm start
```

คำสั่งนี้จะอ่าน `package.json` แล้วรัน

```text
node database.js
```

#### ผลลัพธ์ที่ควรเห็น

```text
> backend@1.0.0 start
> node database.js

◇ injected env (6) from .env
Connected to MySQL database: lekhafong_production
LekhaFong Backend running at http://localhost:3031
```

บรรทัด `◇ injected env ...` เป็นข้อความจาก dotenv เวอร์ชันใหม่ อาจมีหรือไม่มีก็ได้ จำนวนตัวแปรอาจต่างจากตัวอย่าง

ลำดับของ `Connected to MySQL database` กับ `LekhaFong Backend running` อาจสลับกันได้ เพราะการเชื่อมต่อฐานข้อมูลทำงานแบบ Asynchronous

**สัญญาณว่าสำเร็จ**

- เห็น `LekhaFong Backend running at http://localhost:3031`
- ไม่มี `MySQL Connection Error`
- Terminal ยังค้างอยู่ ไม่กลับไปที่ Prompt แสดงว่า Server กำลังทำงาน

**สัญญาณว่ามีปัญหา**

```text
MySQL Connection Error: Access denied for user 'YOUR_USER'@'localhost' (using password: YES)
```

แปลว่ารหัสผ่านหรือสิทธิ์ MySQL ไม่ถูกต้อง ให้ดูหัวข้อ 11.4 และ 11.5

```text
MySQL Connection Error: Unknown database 'lekhafong_production'
```

แปลว่าฐานข้อมูลยังไม่ถูกสร้างหรือชื่อผิด ให้ดูหัวข้อ 11.6

> แม้เชื่อมต่อ MySQL ไม่ได้ Back-End อาจยังแสดงข้อความ `LekhaFong Backend running` และเปิด Server ได้ แต่ API ทุกตัวที่ต้องใช้ฐานข้อมูลจะตอบกลับ Status 500 ดังนั้นต้องแก้การเชื่อมต่อให้สำเร็จก่อน

#### ห้ามปิด Terminal นี้

เมื่อเริ่ม Back-End แล้ว **ห้ามปิด Terminal** หรือกด `Ctrl + C` จนกว่าจะเลิกใช้งาน เพราะจะทำให้ Server หยุดทำงาน

### 6.7 การทดสอบ Back-End ด้วยเบราว์เซอร์

1. เปิดเบราว์เซอร์ใหม่
2. พิมพ์ URL

```text
http://localhost:3031/api/products
```

3. กด Enter

ผลลัพธ์ที่ควรเห็นคือ JSON Array ของอุปกรณ์ เช่น

```json
[
  {
    "equipment_id": 1,
    "admin_id": 1,
    "name": "Example Camera X1",
    "type": "Camera",
    "brand": "ExampleBrand",
    "serial_number": "EX-CAM-001",
    "description": "กล้องตัวอย่างสำหรับเอกสาร",
    "image_url": null,
    "release_year": "2026-01-01T00:00:00.000Z",
    "model_series": "X Series",
    "status": "Available",
    "daily_rate": 1200,
    "main_image": null,
    "detail_images": "[]",
    "stock": 1
  }
]
```

> ข้อมูลข้างต้นเป็นเพียงตัวอย่างรูปแบบ ไม่ใช่ข้อมูลรับประกันว่าฐานข้อมูลของคุณจะมีค่าเหมือนกันทุกตัว

หากเห็น `[]` แปลว่าเชื่อมต่อฐานข้อมูลได้ แต่ตาราง `EQUIPMENT` ไม่มีข้อมูล ให้ตรวจสอบว่าตอน Import ไฟล์ SQL สำเร็จครบทุกคำสั่ง

หากเห็นข้อความ

```json
{"success":false,"message":"..."}
```

ให้จดข้อความ `message` ไว้ใช้ค้นหาสาเหตุในหัวข้อ 11

#### ทดสอบด้วย Command Line (ทางเลือก)

บน macOS/Linux หรือ Command Prompt

```bash
curl http://localhost:3031/api/products
```

บน PowerShell ให้ใช้ `curl.exe` ไม่ใช่ `curl` เพราะ `curl` เป็น Alias ของ `Invoke-WebRequest`

```powershell
curl.exe http://localhost:3031/api/products
```

### 6.8 โครงสร้างการเชื่อมต่อฐานข้อมูลใน Back-End

ในไฟล์ `backend/database.js` มีการสร้าง Connection Pool

```js
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: dbPort,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
```

ความหมาย

- `createPool` สร้างชุดการเชื่อมต่อที่นำกลับมาใช้ซ้ำได้ ลดเวลาการเชื่อมต่อใหม่ทุกคำขอ
- ค่าทั้งหมดอ่านจาก `.env`
- หาก `DB_PORT` ว่างหรือไม่ระบุ จะใช้ค่าเริ่มต้น 3306
- หาก `DB_PORT` ไม่ใช่ตัวเลขระหว่าง 1–65535 โปรแกรมจะหยุดทำงานและแจ้ง error

---

## 7. ขั้นตอนที่ 3: การตั้งค่าและรัน Front-End Server

### 7.1 เปิด Terminal ที่สอง

Front-End ต้องรันแยกจาก Back-End ใน Terminal อีกหน้าต่างหนึ่ง

1. ใน VS Code ไปที่เมนู **Terminal > New Terminal**
2. หรือกด `Ctrl + Shift + `` ` `` (ปุ่ม Backtick)
3. จะมี Terminal ใหม่เพิ่มขึ้นมา
4. Terminal เก่าที่รัน Back-End ต้องยังคงทำงานอยู่

### 7.2 เข้าไปที่โฟลเดอร์ frontend

หาก Terminal ใหม่เปิดที่โฟลเดอร์ `backend` ให้พิมพ์

```bash
cd ..
```

แล้วตามด้วย

```bash
cd frontend
```

หรือถ้าเปิดที่โฟลเดอร์ `lekhaFong` แล้ว ให้พิมพ์

```bash
cd frontend
```

ตรวจสอบว่าอยู่ถูกที่

```bash
ls
```

ต้องเห็น

```text
frontserver.js
index.html
script.js
style.css
package.json
package-lock.json
```

### 7.3 ติดตั้ง Dependency ของ Front-End

```bash
npm ci
```

ผลลัพธ์ที่ควรเห็น

```text
added 85 packages, and audited 86 packages in 5s
found 0 vulnerabilities
```

> แม้ `frontserver.js` จะใช้เพียง Module พื้นฐานของ Node.js (`http`, `fs`, `path`) แต่โปรเจกต์มี `package.json` และ `package-lock.json` ของ Front-End จึงควรรัน `npm ci` เพื่อให้สภาพแวดล้อมตรงกับทีม และเพื่อรองรับการพัฒนาในอนาคต

### 7.4 เริ่มรัน Front-End

```bash
npm start
```

คำสั่งนี้จะรัน

```text
node frontserver.js
```

ผลลัพธ์ที่ควรเห็น

```text
> frontend@1.0.0 start
> node frontserver.js

Frontend running at http://localhost:3030
```

**สัญญาณว่าสำเร็จ**

- เห็น `Frontend running at http://localhost:3030`
- Terminal ยังค้างอยู่ ไม่กลับไปที่ Prompt

**สัญญาณว่ามีปัญหา**

```text
Error: listen EADDRINUSE: address already in use 127.0.0.1:3030
```

แปลว่าพอร์ต 3030 ถูกโปรแกรมอื่นใช้อยู่ ให้ดูหัวข้อ 11.8

### 7.5 การเปิดเว็บไซต์

1. เปิดเบราว์เซอร์
2. พิมพ์

```text
http://localhost:3030
```

3. กด Enter
4. ต้องเห็นหน้าแรกของ LeKhaFong Production พร้อมโลโก้ แบนเนอร์ และเมนูภาษาไทย

> **ห้ามดับเบิลคลิกไฟล์ `frontend/index.html` เพื่อเปิดเว็บ** เพราะ URL จะขึ้นต้นด้วย `file://` ทำให้ JavaScript เรียก API ไม่ได้และอาจติด CORS ให้เปิดผ่าน `http://localhost:3030` เท่านั้น

### 7.6 เหตุใดต้องเปิดทั้งสอง Server

| ถ้าเปิดเฉพาะ... | ผลลัพธ์ |
|---|---|
| Front-End | หน้าเว็บแสดง แต่ไม่มีข้อมูลอุปกรณ์จาก MySQL |
| Back-End | เปิดเบราว์เซอร์ที่ 3030 ไม่ได้ เพราะไม่มี Static Server |
| MySQL | หน้าเว็บเปิดได้ แต่ Login, Products, Admin ล้มเหลว |
| Front-End + Back-End แต่ไม่เปิด MySQL | หน้าเว็บเปิดได้ แต่ API ตอบ Status 500 |
| ทั้งสามอย่าง | ใช้งานได้ครบ |

### 7.7 การเปลี่ยนพอร์ต Front-End (ไม่แนะนำ)

`frontserver.js` รองรับ Environment Variable

```text
FRONTEND_PORT
FRONTEND_HOST
```

แต่ **ไม่แนะนำให้เปลี่ยน** เพราะ

- `frontend/script.js` กำหนด API ไว้ตายตัวที่ `http://localhost:3031/api`
- `backend/database.js` อนุญาต CORS เฉพาะ `http://localhost:3030`
- หากเปลี่ยน Front-End เป็นพอร์ตอื่น เช่น 3032 จะเกิด CORS Error

หากจำเป็นต้องเปลี่ยนจริง ต้องแก้ทั้ง CORS ใน Back-End และ API URL ใน Front-End ซึ่งอยู่นอกขอบเขตคู่มือนี้

---

## 8. ขั้นตอนที่ 4: การเปิดใช้งานและทดสอบหน้าเว็บ

### 8.1 ภาพรวมการเปลี่ยนหน้า

เว็บไซต์เป็น Single Page Application (SPA) ที่ใช้ `index.html` ไฟล์เดียวและเปลี่ยนเนื้อหาด้วย JavaScript URL ที่รองรับมีดังนี้

| หน้า | URL | วิธีเปิด |
|---|---|---|
| หน้าแรก | `http://localhost:3030/?page=home` | เปิด `/` หรือกดโลโก้ |
| ค้นหา/แคตตาล็อก | `http://localhost:3030/?page=search` | เมนู กล้อง / เลนส์ / อุปกรณ์เสริม หรือช่องค้นหา |
| กรองตามประเภท | `http://localhost:3030/?page=search&type=0` | `type=0` กล้อง, `type=1` เลนส์, `type=2` อุปกรณ์เสริม |
| รายละเอียดอุปกรณ์ | `http://localhost:3030/?page=detail&id=1` | คลิกการ์ดสินค้า |
| ทีมงาน | `http://localhost:3030/?page=team` | เมนู ทีมงาน |
| เงื่อนไขการเช่า | `http://localhost:3030/?page=terms` | เมนู เงื่อนไข |
| Admin | `http://localhost:3030/?page=admin` | กดปุ่ม แอดมิน (ต้องเป็น Admin) |
| Login / Register | ไม่มี URL แยก | กดปุ่ม เข้าสู่ระบบ ที่มุมขวาบน |

> หน้า Admin ทั้ง 4 แท็บ (Users, Products, Admins, Profile) ใช้ URL เดียวกันคือ `?page=admin` และเปลี่ยนแท็บด้วย JavaScript ไม่มี URL แยกสำหรับแต่ละแท็บ

### 8.2 หน้าแรก (Home)

**วิธีเปิด**

- เปิด `http://localhost:3030`
- หรือ `http://localhost:3030/?page=home`
- หรือกดโลโก้ LeKhaFong ที่มุมซ้ายบน

**หน้าที่หลัก**

- แสดงแบนเนอร์โปรโมชันที่เปลี่ยนอัตโนมัติทุกประมาณ 4 วินาที
- แสดงช่องค้นหาอุปกรณ์และวันที่รับ–คืน
- แสดงหมวดหมู่แบรนด์กล้อง เลนส์ และอุปกรณ์เสริม
- เป็นจุดเริ่มต้นไปยังหน้าค้นหาและรายละเอียดสินค้า

**สิ่งที่ผู้ใช้ทำได้**

- คลิกแบนเนอร์เพื่อค้นหาด้วยคำสำคัญของแบนเนอร์นั้น
- พิมพ์คำค้นหาแล้วกด **ค้นหา**
- เลือกวันรับและวันคืน (เป็นเพียงการกรอกในฟอร์ม ยังไม่ถูกนำไปตรวจสอบการว่าง)
- กดหมวดหมู่แบรนด์เพื่อไปหน้ารายการที่กรองแล้ว

**ข้อมูลที่มาจาก MySQL**

- รายชื่อแบรนด์บางส่วนถูกนำมาจากข้อมูล `EQUIPMENT.brand` ผ่าน `GET /api/products`
- จำนวนรายการบนการ์ดแบรนด์เป็นค่าที่เขียนไว้ใน JavaScript ไม่ได้นับจากฐานข้อมูลจริง
- รูปแบนเนอร์และโลโก้เป็นไฟล์ใน `frontend/banner/` และ `frontend/lekhaFongLogo.png` ไม่ได้เก็บใน MySQL

**ข้อจำกัด**

- ตัวเลข “18 รายการ”, “24 รายการ” บนการ์ดแบรนด์เป็นข้อความตัวอย่าง ไม่ใช่จำนวนจริงในฐานข้อมูล
- ช่องวันที่รับ–คืนบนหน้าแรกยังไม่ถูกนำไปกรองสต็อกหรือตรวจการจองซ้อน
- แบนเนอร์และข้อความโปรโมชันเป็นข้อมูลStaticในโค้ด

### 8.3 หน้าค้นหาและกรองอุปกรณ์ (Search / Catalog)

**วิธีเปิด**

- กดเมนู **กล้อง**, **เลนส์** หรือ **อุปกรณ์เสริม**
- หรือเปิด `http://localhost:3030/?page=search`
- หรือพิมพ์คำค้นหาในหน้าแรกแล้วกด **ค้นหา**

**หน้าที่หลัก**

- แสดงการ์ดอุปกรณ์ทั้งหมดที่โหลดจาก MySQL (80 รายการ: กล้อง 14, เลนส์ 30 และอุปกรณ์เสริม 36)
- ค้นหาจากชื่อ ประเภท และรายละเอียด
- กรองตามหมวดหมู่ ยี่ห้อ ราคาสูงสุด และสถานะว่าง
- กดหมวด **เลนส์** หรือเปิด `?page=search&type=1` เพื่อดูเลนส์ทั้ง 30 รายการ
- กดหมวด **อุปกรณ์เสริม** หรือเปิด `?page=search&type=2` เพื่อดูไฟ ไมโครโฟน ฟิลเตอร์ และขาตั้ง
- แสดงเฉพาะรายการโปรด
- เรียงลำดับผลลัพธ์
- แสดงสถานะ `Available`, `In Use`, `Maintenance` และจำนวนสต็อก

**สิ่งที่ผู้ใช้ทำได้**

1. พิมพ์คำค้นหาในช่องค้นหา แล้วกด **ค้นหา**
2. กดปุ่มหมวด **ทั้งหมด / กล้อง / เลนส์ / อุปกรณ์เสริม**
3. กด **ค้นหาขั้นสูง** เพื่อเปิดตัวกรอง
   - ราคาสูงสุด
   - ยี่ห้อ
   - หมวดหมู่
   - ติ๊ก **ว่างพร้อมเช่า**
4. กด **ใช้ตัวกรอง**
5. กด **ล้างค่า** เพื่อล้างตัวกรอง
6. เลือกการเรียงลำดับจาก Dropdown
7. กดไอคอนหัวใจบนการ์ดเพื่อเพิ่ม/ลบรายการโปรด
8. คลิกการ์ดเพื่อเปิดหน้ารายละเอียด

**ตัวเลือกการเรียงลำดับ**

| ตัวเลือก | ลำดับ |
|---|---|
| เรียง: ค่าเริ่มต้น | ตามลำดับ `equipment_id` ที่ API ส่งมา |
| ราคาต่ำ → สูง | `daily_rate` น้อยไปมาก |
| ราคาสูง → ต่ำ | `daily_rate` มากไปน้อย |
| ชื่อ A–Z | ชื่อเรียงจากน้อยไปมากตามภาษาไทย |
| ชื่อ Z–A | ชื่อเรียงจากมากไปน้อย |

**ข้อมูลที่มาจาก MySQL**

- `EQUIPMENT.equipment_id`
- `EQUIPMENT.name`
- `EQUIPMENT.type`
- `EQUIPMENT.brand`
- `EQUIPMENT.description`
- `EQUIPMENT.status`
- `EQUIPMENT.daily_rate`
- `EQUIPMENT.stock`
- `EQUIPMENT.main_image`
- `EQUIPMENT.detail_images`

**ข้อจำกัด**

- ตัวกรองคำค้นหา ราคา และยี่ห้อถูกเก็บในหน่วยความจำของหน้าเว็บ ไม่ได้อยู่ใน URL ยกเว้น `type` เมื่อกด Refresh ตัวกรองจะกลับค่าเริ่มต้น
- วันที่รับ–คืนในช่องค้นหาไม่ถูกนำไปตรวจสอบกับตาราง `RENTAL` หรือสต็อกจริง
- ปุ่มเลขหน้า `1 2 3` ที่ด้านล่างเป็นเพียงองค์ประกอบหน้าจอ ยังไม่มีการแบ่งหน้าจริง อุปกรณ์ทั้งหมดจะแสดงในหน้าเดียว
- ข้อความ “กว่า 500 รายการ” เป็นข้อความโฆษณาในโค้ด ไม่ใช่จำนวนจริง

### 8.4 หน้ารายละเอียดอุปกรณ์ (Product Detail)

**วิธีเปิด**

- คลิกการ์ดอุปกรณ์จากหน้าแรกหรือหน้าค้นหา
- หรือเปิด `http://localhost:3030/?page=detail&id=1`
- เปลี่ยนเลข `1` เป็น `equipment_id` ของอุปกรณ์ที่ต้องการ

**หน้าที่หลัก**

- แสดงรูปหลักและรูปประกอบ (สูงสุด 1 + 4 รูป)
- แสดงลิงก์ **Photo credits** สำหรับภาพกล้องและเลนส์ พร้อมชื่อผู้สร้าง แหล่งที่มา และลิขสิทธิ์
- แสดงชื่อ ประเภท ยี่ห้อ รุ่น และรายละเอียด
- แสดงราคาเช่าต่อวัน
- แสดงสถานะและจำนวนสต็อก
- เลือกวันรับ–คืน
- เลือกวิธีรับ–คืนที่ร้าน หรือจัดส่งถึงที่
- คำนวณค่าเช่าและค่าจัดส่ง
- ส่งคำขอเช่าอุปกรณ์

**สิ่งที่ผู้ใช้ทำได้**

1. ดูรูปภาพและกดรูปขนาดเล็กเพื่อเปลี่ยนรูปหลัก
2. เลือกวันรับและวันคืน
3. เลือกวิธีรับ–คืน
4. ดูยอดประเมิน
5. กด **เช่าเลย**
6. หากยังไม่ Login ระบบจะเปิด Modal Login
7. หลัง Login ระบบจะแสดง Popup ยืนยันพร้อมเงื่อนไขการเช่า 5 ข้อ
8. กด **ยืนยัน** เพื่อส่งคำขอเช่า

**การคำนวณค่าเช่า**

```text
จำนวนวัน = ปัดเศษขึ้นของ (วันคืน - วันรับ) เป็นจำนวนวัน
ค่าเช่าอุปกรณ์ = ราคาต่อวัน × จำนวนวัน
ค่าจัดส่ง = 150 บาท (เฉพาะเลือกจัดส่งถึงที่)
ยอดรวม = ค่าเช่าอุปกรณ์ + ค่าจัดส่ง
เงินมัดจำ = 30% ของค่าเช่า แต่ไม่ต่ำกว่า 500 บาท
```

> เงินมัดจำถูกคำนวณใน Back-End และแสดงในผลลัพธ์การเช่า แต่หน้าจอประเมินก่อนยืนยันจะแสดงเฉพาะค่าเช่ากับค่าจัดส่ง

**ข้อมูลที่มาจาก MySQL**

- ข้อมูลอุปกรณ์ทั้งหมดจาก `EQUIPMENT`
- จำนวนสต็อกและสถานะล่าสุด
- ราคาต่อวัน
- รูปภาพ `main_image` และ `detail_images`

**ข้อจำกัด**

- ระบบไม่ได้ตรวจสอบว่าวันที่เลือกชนกับการเช่าของลูกค้าคนอื่นหรือไม่ ตรวจเพียง `status = 'Available'` และ `stock > 0`
- การยืนยันเช่าจะลด `stock` ลง 1 และเปลี่ยนสถานะเป็น `In Use` เมื่อสต็อกเหลือ 0 แต่ไม่ได้สร้างแถวในตาราง `RENTAL` หรือ `ITEM`
- ยังไม่มีหน้าคืนอุปกรณ์หรือการคืนสต็อกอัตโนมัติ
- หากกด Refresh ระหว่างเลือกวัน ค่าที่เลือกจะหายไป

### 8.5 หน้าเกี่ยวกับทีมงาน (Team)

**วิธีเปิด**

- กดเมนู **ทีมงาน**
- หรือ `http://localhost:3030/?page=team`

**หน้าที่หลัก**

- แสดงข้อมูลสมาชิกกลุ่ม 5 คน
- แสดงรูปภาพ ชื่อภาษาไทย และรหัสนักศึกษา

**ข้อมูลที่มาจากไหน**

- ข้อมูลสมาชิกอยู่ใน `frontend/script.js` โดยตรง
- รูปภาพอยู่ใน `frontend/pic_member/`
- **ไม่ได้มาจาก MySQL**

**ข้อจำกัด**

- ไม่มีลิงก์ GitHub หรือช่องทางติดต่อ
- ชื่อภาษาอังกฤษยังไม่มีในระบบ
- หากเพิ่มสมาชิกใหม่ต้องแก้โค้ด `script.js`

### 8.6 หน้าเข้าสู่ระบบและสมัครสมาชิก (Login / Register)

**วิธีเปิด**

- กดปุ่ม **เข้าสู่ระบบ** ที่มุมขวาบน
- ไม่มี URL แยก หน้า Login เป็น Modal ที่เปิดทับหน้าปัจจุบัน

**แท็บ Login**

| ช่อง | รายละเอียด |
|---|---|
| Email | กรอกอีเมลที่สมัครไว้ หรือ Username ของบัญชี |
| Password | รหัสผ่าน |
| Keep me signed in | แสดงในหน้าจอ แต่ยังไม่มีการทำงานจริง |
| Forgot password? | แสดงข้อความแนะนำให้ติดต่อ Admin ยังไม่มีระบบรีเซ็ต |

**แท็บ Sign up**

ต้องกรอก

- First name
- Last name
- Email
- Phone (เบอร์มือถือไทย 10 หลัก ขึ้นต้นด้วย 06, 08 หรือ 09)
- Address (ไม่บังคับ)
- Username
- Password

**สิ่งที่ระบบทำ**

- Login ตรวจสอบอีเมลใน `CUSTOMER` และ `ADMIN` ก่อน หากไม่พบจะตรวจ `USER_ACCOUNT.username`
- เมื่อตรวจพบบัญชี จะเปรียบเทียบรหัสผ่านกับ `USER_ACCOUNT.password`
- เมื่อพบบัญชี ระบบจะบันทึกผลลงตาราง `LOGIN` ทั้งกรณีสำเร็จ (`Success`) และรหัสผ่านผิด (`Failed`) แต่หากไม่พบบัญชีเลยจะไม่บันทึกแถวใหม่
- ส่งข้อมูลผู้ใช้กลับไปเก็บใน `localStorage` key `lekhafong_auth`
- Register สร้างแถวใหม่ใน `USER_ACCOUNT` และ `CUSTOMER`
- Register ไม่ได้ Login ให้อัตโนมัติ เมื่อสมัครสำเร็จจะสลับไปแท็บ Login

**ข้อมูลที่มาจาก MySQL**

- `USER_ACCOUNT` (username, password, role)
- `CUSTOMER` (ชื่อ, นามสกุล, email, address, phone)
- `ADMIN` (ชื่อ, นามสกุล, email, address)
- `LOGIN` (ประวัติการเข้าสู่ระบบ)

**ข้อจำกัด**

- รหัสผ่านถูกเก็บเป็นข้อความธรรมดา ไม่ได้ Hash
- ไม่มีระบบยืนยันอีเมล
- ไม่มีระบบลืมรหัสผ่านจริง
- Checkbox “Keep me signed in” ยังไม่ทำงาน
- บัญชีที่ Login อยู่ถูกเก็บใน Browser ไม่ใช่ Session ฝั่ง Server
- การป้องกันหน้า Admin เป็นเพียงการตรวจ `localStorage` ฝั่ง Front-End

### 8.7 หน้าจัดการสินค้า (Admin Products)

**วิธีเปิด**

1. Login ด้วยบัญชีที่มี role เป็น `Admin`
2. กดปุ่ม **แอดมิน** ที่มุมขวาบน
3. ไปที่ URL `http://localhost:3030/?page=admin`
4. กดแท็บ **Products**

**หน้าที่หลัก**

- แสดงตารางอุปกรณ์ทั้งหมด
- เพิ่มอุปกรณ์ใหม่
- แก้ไขข้อมูลอุปกรณ์
- ลบอุปกรณ์
- จัดการรูปภาพ 1 รูปหลัก + 4 รูปประกอบ
- กำหนดจำนวนสต็อกและสถานะ

**สิ่งที่ผู้ใช้ทำได้**

1. ดูรายการพร้อมรูป ขนาดราคา และสถานะ
2. กด **Add Product**
3. กรอกชื่อ ราคา ประเภท ยี่ห้อ Serial Number Stock สถานะ และรายละเอียด
4. กด **เพิ่มรูปภาพ**
5. เลือกไฟล์ JPG, PNG หรือ WEBP ขนาดไม่เกิน 5 MB
6. กด **บันทึกรูปภาพ** เพื่ออัปโหลด
7. กด **Save Product**
8. กด **ดูเพิ่มเติม** เพื่อแก้ไขหรือลบ

**ข้อมูลที่มาจาก MySQL**

- ทุกคอลัมน์ของ `EQUIPMENT`
- ประเภทอุปกรณ์จาก `GET /api/equipment-types` ซึ่งรวมค่าที่มีในฐานข้อมูลกับรายการพื้นฐาน
- รูปภาพถูกเก็บเป็น Path ใน `EQUIPMENT.main_image` และ `EQUIPMENT.detail_images`
- ไฟล์จริงอยู่ใน `backend/uploads/`

**ข้อจำกัด**

- การลบสินค้าที่มีรายการเช่าอ้างอิงอยู่ใน `ITEM` อาจล้มเหลวเพราะ Foreign Key
- เมื่อลบสินค้า ไฟล์รูปใน `backend/uploads/` ไม่ถูกลบตาม
- ขนาดไฟล์สูงสุด 5 MB ต่อรูป และรับเฉพาะ JPG/PNG/WEBP
- ยังไม่มีระบบจัดหมวดหมู่แบบกำหนดเอง นอกจากรายการ Type ที่มี
- หน้า Admin ไม่มี Pagination หรือช่องค้นหา

### 8.8 หน้าจัดการผู้ใช้ (Admin Users)

**วิธีเปิด**

1. Login เป็น Admin
2. ไปที่ `?page=admin`
3. กดแท็บ **Users**

**หน้าที่หลัก**

- แสดงรายชื่อลูกค้าทั้งหมด
- ค้นดูข้อมูล ชื่อ อีเมล เบอร์โทร
- แก้ไขข้อมูลลูกค้า
- ลบลูกค้า

**ข้อมูลที่มาจาก MySQL**

```sql
SELECT u.account_id, u.username, c.customer_id, c.first_name, c.last_name,
       c.email, c.address, c.phone
FROM USER_ACCOUNT u
JOIN CUSTOMER c ON u.account_id = c.account_id
WHERE u.role = 'Customer'
ORDER BY u.account_id ASC;
```

**สิ่งที่ผู้ใช้ทำได้**

- กด **ดูเพิ่มเติม** เพื่อเปิดฟอร์มแก้ไข
- แก้ Username, Email, ชื่อ, นามสกุล, เบอร์โทร, ที่อยู่
- กด **Update**
- กด **Delete** แล้วยืนยัน

**ข้อจำกัด**

- ไม่สามารถรีเซ็ตรหัสผ่านลูกค้าจากหน้านี้
- การลบลูกค้าที่มีประวัติการเช่าใน `RENTAL` จะล้มเหลวเพราะ Foreign Key
- ไม่มีระบบค้นหาหรือแบ่งหน้า
- การแก้ไข Username ซ้ำจะถูกปฏิเสธด้วย Status 400
- เบอร์โทรจะถูกตัดอักขระที่ไม่ใช่ตัวเลขออกก่อนบันทึก

### 8.9 หน้าจัดการผู้ดูแลระบบ (Admin Management)

**วิธีเปิด**

1. Login เป็น Admin
2. ไปที่ `?page=admin`
3. กดแท็บ **Admins**

**หน้าที่หลัก**

- แสดงรายชื่อ Admin
- เพิ่ม Admin ใหม่
- แก้ไขข้อมูล Admin
- เปลี่ยนรหัสผ่าน Admin
- ลบ Admin

**ข้อมูลที่มาจาก MySQL**

```sql
SELECT a.admin_id, a.account_id, u.username, a.first_name, a.last_name,
       a.email, a.address
FROM ADMIN a
JOIN USER_ACCOUNT u ON a.account_id = u.account_id
WHERE u.role = 'Admin'
ORDER BY a.admin_id ASC;
```

**สิ่งที่ผู้ใช้ทำได้**

- กด **Add Admin**
- กรอก Username, Email, ชื่อ, นามสกุล, Password, Confirm Password, Address
- กด **บันทึกข้อมูล Admin**
- กดแก้ไขเพื่อเปลี่ยนข้อมูลหรือรหัสผ่าน
- กดลบ

**ข้อจำกัด**

- ไม่สามารถลบ Admin คนสุดท้ายของระบบได้ (Back-End ตอบ Status 400)
- รหัสผ่านถูกเก็บเป็นข้อความธรรมดา
- ไม่มีการตรวจรูปแบบอีเมลใน Back-End สำหรับ Admin
- ไม่มีการบันทึก Audit Log ว่าใครแก้ไขใคร
- แท็บ **Profile** ใช้ดูข้อมูล Admin ปัจจุบันได้ แต่ไม่ใช่ระบบจัดการสิทธิ์แบบละเอียด

### 8.10 การเรียงลำดับ (Sorting)

การเรียงลำดับตามตัวเลือกของผู้ใช้ทำที่ฝั่ง Browser ทั้งหมด ไม่ได้ส่งค่าตัวเลือกการเรียงไปให้ MySQL (API ส่งข้อมูลมาเรียงตาม `equipment_id` ก่อน แล้ว Browser จึงเรียงใหม่ตามตัวเลือก)

ขั้นตอน

1. ระบบโหลดสินค้าทั้งหมดจาก `GET /api/products`
2. นำมาผ่านตัวกรอง
3. คัดลอก Array แล้วเรียงตามตัวเลือก
4. นำผลลัพธ์ไปแสดง

ผลคือการเรียงจะเปลี่ยนเฉพาะรายการที่แสดงอยู่ ไม่เปลี่ยนลำดับในฐานข้อมูล และจะรีเซ็ตเมื่อ Refresh

### 8.11 รายการโปรด (Favorites)

**วิธีใช้**

1. กดไอคอนหัวใจบนการ์ดสินค้า หรือบนหน้ารายละเอียด
2. ไอคอนจะเปลี่ยนเป็นหัวใจทึบ
3. กดไอคอนหัวใจที่แถบเมนูด้านบนเพื่อดูเฉพาะรายการโปรด
4. กด **ล้างตัวกรองรายการโปรด** เพื่อกลับมาดูทั้งหมด

**การจัดเก็บ**

- ใช้ `localStorage` key `lekhafong_favorites`
- เก็บเป็น JSON Array ของ `equipment_id`
- ไม่ได้ผูกกับบัญชีผู้ใช้
- ไม่ได้เก็บใน MySQL

**ผลกระทบ**

- เปลี่ยน Browser หรือใช้โหมดไม่ระบุตัวตน รายการโปรดจะหาย
- ล้างข้อมูลเว็บไซต์ (Clear browsing data) แล้วรายการโปรดจะหาย
- ใช้เครื่องอื่นแล้วไม่เห็นรายการโปรด
- หากข้อมูลใน localStorage เสียหาย ระบบจะล้างค่าและเริ่มใหม่ให้อัตโนมัติ

### 8.12 การอัปโหลดรูปภาพ (Image Upload)

**ขั้นตอน**

1. Login เป็น Admin
2. ไปที่ Products
3. กด **Add Product** หรือ **ดูเพิ่มเติม**
4. กด **เพิ่มรูปภาพ** หรือ **จัดการรูปภาพ**
5. เลือกรูปหลัก 1 รูป
6. เลือกรูปประกอบได้ไม่เกิน 4 รูป
7. กด **บันทึกรูปภาพ**
8. ระบบส่งไฟล์ไปที่ `POST /api/upload`
9. Back-End บันทึกไฟล์ลง `backend/uploads/` และตอบ URL กลับมา
10. กด **Save Product** เพื่อบันทึก Path ลงฐานข้อมูล

**ข้อกำหนดไฟล์**

| รายการ | ค่า |
|---|---|
| ประเภทไฟล์ | JPG, JPEG, PNG, WEBP |
| ขนาดสูงสุด | 5 MB ต่อไฟล์ |
| จำนวนรูปหลัก | 1 |
| จำนวนรูปประกอบ | ไม่เกิน 4 |
| ชื่อไฟล์ | ระบบสร้างให้อัตโนมัติ เช่น `eq-1730000000000-123456.jpg` |

**การแสดงผล**

- ฐานข้อมูลเก็บ Path เช่น `/uploads/eq-....jpg`
- Front-End เติม `http://localhost:3031` ให้อัตโนมัติ
- จึงต้องเปิด Back-End ไว้ตลอดเพื่อให้รูปแสดง

### 8.13 การคำนวณค่าจัดส่ง (Delivery Fee)

ค่าจัดส่งถูกกำหนดใน `frontend/script.js`

```js
const DELIVERY_FEE = 150;
```

**เงื่อนไข**

- เลือก **รับ–คืนที่ร้าน** → ค่าจัดส่ง 0 บาท
- เลือก **จัดส่งถึงที่** → ค่าจัดส่ง 150 บาท

**ข้อควรทราบ**

- ค่าจัดส่งคำนวณฝั่ง Front-End เท่านั้น
- ฟิลด์ `pickup_method` ถูกส่งไปใน Request `POST /api/rentals` แต่ Back-End ไม่ได้นำไปคำนวณหรือบันทึก
- ค่าจัดส่งไม่ถูกบันทึกใน MySQL
- ยอดที่ Back-End ส่งกลับคือค่าเช่าอุปกรณ์เท่านั้น
- Popup สำเร็จจะนำค่าเช่าจาก Back-End บวกค่าจัดส่งจาก Front-End เพื่อแสดงยอดรวม และมีข้อความกำกับว่าเป็นยอดประเมิน

### 8.14 หน้าเงื่อนไขการเช่า (Terms)

**วิธีเปิด**

- กดเมนู **เงื่อนไข**
- หรือ `http://localhost:3030/?page=terms`

หน้านี้แสดงขั้นตอนการเช่า 4 ขั้นและนโยบาย 5 ข้อ ได้แก่ เงินมัดจำ การคืนล่าช้า การยกเลิก ความเสียหาย และเอกสารยืนยันตัวตน ข้อมูลทั้งหมดเป็นข้อความ Static ใน `script.js` ไม่ได้มาจาก MySQL

### 8.15 การทดสอบแคตตาล็อกกล้อง เลนส์ และอุปกรณ์เสริม

หลังนำเข้า `lekhafong_production.sql` และมีไฟล์ภาพครบ ให้ทดสอบตามลำดับนี้

1. เปิด `http://localhost:3030/?page=search`
2. ตรวจสอบว่าหน้าค้นหานับ **80 รายการ**
3. กดหมวด **กล้อง** ต้องเห็นกล้อง 14 รายการ
4. กดหมวด **เลนส์** ต้องเห็นเลนส์ 30 รายการ
5. กดหมวด **อุปกรณ์เสริม** ต้องเห็นอุปกรณ์เสริม 36 รายการ
6. ตรวจสอบหมวดย่อยในตัวกรองขั้นสูง: ไฟสตูดิโอ 9, ไมค์ & เสียง 9, ฟิลเตอร์ 9, ขาตั้งกล้อง 9
7. พิมพ์คำค้นหาเพื่อทดสอบ เช่น `16-35`, `NIKKOR Z`, `Lumix S`, `STORM`, `LARK` หรือ `Manfrotto`
8. เปิดรายละเอียดสินค้าและตรวจสอบรูปหลัก รูปประกอบ และลิงก์ **Photo credits**
9. เข้าสู่ระบบด้วย `admin_demo` และเปิดหน้า Admin > Products ต้องเห็นสินค้าครบ 80 แถว และเปิดตัวแก้ไขรูปภาพได้

**การกระจายของอุปกรณ์เสริม**

| หมวด | จำนวน | แบรนด์ |
|---|---:|---|
| Continuous Light | 9 | Aputure 3, amaran 3, Nanlite 3 |
| Wireless Microphone | 9 | RØDE 3, DJI 3, Hollyland 3 |
| Camera Filter | 9 | NiSi 3, K&F Concept 3, Tiffen 3 |
| Tripod | 9 | Manfrotto 3, Benro 3, SmallRig 3 |

**การกระจายของเลนส์ตามระบบเมาท์**

| เมาท์ | จำนวนเลนส์ | กล้องในแคตตาล็อกที่ใช้เมาท์นี้ |
|---|---:|---|
| Sony E | 6 | Sony A7 IV, A7S III, A7C II, FX3, ZV-E10 II |
| Canon RF | 6 | Canon EOS R5, R6 Mark II, R8 |
| Nikon Z | 6 | Nikon Z8, Nikon Zf |
| Fujifilm X | 6 | Fujifilm X-T5, X-S20 |
| Leica L | 6 | Panasonic Lumix S5 IIX |

> Fujifilm X100VI เป็นกล้องเลนส์ติดตัว (fixed lens) จึงไม่นับเป็นกล้องที่เปลี่ยนเลนส์ได้ และไม่ถูกนับในตารางเมาท์

**ไฟล์ภาพที่ต้องมี**

ไฟล์ SQL เก็บเฉพาะ Path ไม่ได้เก็บไฟล์ภาพไว้ในฐานข้อมูล จึงต้องมีโฟลเดอร์และไฟล์ต่อไปนี้ในเครื่อง

```text
backend/uploads/camera-catalog/      ← รูปกล้อง 62 ไฟล์
backend/uploads/lens-catalog/        ← รูปเลนส์ 64 ไฟล์
backend/uploads/lighting-catalog/    ← รูปไฟต่อเนื่อง (มี 1 ภาพ)
backend/uploads/microphone-catalog/  ← รูปไมโครโฟน (มี 4 ภาพ)
backend/uploads/filter-catalog/      ← รูปฟิลเตอร์ (ยังไม่มีภาพ)
backend/uploads/tripod-catalog/      ← รูปขาตั้ง (ยังไม่มีภาพ)
```

ภาพที่ยืนยันและเผยแพร่แล้วรวม **131 ภาพ** ครอบคลุมสินค้า **46 จาก 80 รายการ** (กล้อง 14, เลนส์ 30 และอุปกรณ์เสริม 2) ส่วนอุปกรณ์เสริมอีก 34 รายการยังไม่มีภาพที่ยืนยันรุ่นและลิขสิทธิ์ได้ ระบบจะแสดงไอคอนแทนรูป และรายการที่ยังไม่มีภาพถูกระบุไว้ใน `ACCESSORY-IMAGE-SOURCES.md`

> รายละเอียดแหล่งที่มาและลิขสิทธิ์ของภาพกล้องอยู่ใน `CAMERA-IMAGE-SOURCES.md` ภาพเลนส์อยู่ใน `LENS-IMAGE-SOURCES.md` และภาพอุปกรณ์เสริมอยู่ใน `ACCESSORY-IMAGE-SOURCES.md`

หากเปิดหน้าเว็บแล้วรูปไม่แสดง ให้ตรวจสอบว่าได้คัดลอกโฟลเดอร์ภาพจากชุดไฟล์ที่ได้รับมาวางใน `backend/uploads/` แล้วหรือยัง จากนั้นกด Refresh

---

## 9. ขั้นตอนที่ 5: คู่มือทดสอบ REST API

### 9.1 ข้อมูลพื้นฐานของ API

| รายการ | ค่า |
|---|---|
| Base URL | `http://localhost:3031/api` |
| รูปแบบข้อมูล | JSON (`application/json`) |
| รูปแบบไฟล์อัปโหลด | `multipart/form-data` |
| Authentication | **ไม่มี** (ทุก Endpoint เปิดให้เรียกได้) |
| CORS | อนุญาตเฉพาะ `http://localhost:3030` |
| จำนวน Endpoint ที่มีจริง | 16 รายการ |

> **คำเตือน:** เนื่องจากไม่มีระบบ Authentication หรือ Authorization ผู้ที่เข้าถึงพอร์ต 3031 ได้สามารถเรียก Endpoint สำหรับเพิ่ม แก้ไข หรือลบข้อมูลได้ทั้งหมด ห้ามเปิดพอร์ตนี้สู่สาธารณะ

### 9.2 HTTP Status Code ที่ใช้บ่อย

| Status | ความหมาย | เกิดเมื่อใด |
|---|---|---|
| `200 OK` | สำเร็จ | การอ่าน เพิ่ม แก้ไข ลบ ส่วนใหญ่ตอบ 200 |
| `400 Bad Request` | ข้อมูลไม่ครบหรือไม่ถูกต้อง | ลืมฟิลด์, ราคา ≤ 0, เบอร์โทรผิด, อัปโหลดไฟล์ผิดประเภท |
| `401 Unauthorized` | ยืนยันตัวตนไม่สำเร็จ | ไม่พบบัญชี หรือรหัสผ่านผิด |
| `404 Not Found` | ไม่พบข้อมูล | ไม่พบอุปกรณ์ที่ระบุใน `PUT /api/products/:id` หรือ `POST /api/rentals` |
| `409 Conflict` | ข้อมูลขัดแย้ง | Username/Email ซ้ำ, อุปกรณ์ไม่พร้อมให้เช่า |
| `500 Internal Server Error` | Server หรือฐานข้อมูลผิดพลาด | SQL Error, Foreign Key, การเชื่อมต่อหลุด |
| `503 Service Unavailable` | ระบบไม่ว่างชั่วคราว | Registration Lock ไม่ได้หรือ Lock Timeout |

### 9.3 สรุป Endpoint ทั้งหมด

| ลำดับ | Method | Endpoint | หน้าที่ | เขียนข้อมูล |
|---|---|---|---|---|
| 1 | `POST` | `/api/upload` | อัปโหลดรูปภาพ | ✅ |
| 2 | `POST` | `/api/auth/login` | เข้าสู่ระบบ | ✅ (บันทึก LOGIN) |
| 3 | `POST` | `/api/auth/register` | สมัครสมาชิก | ✅ |
| 4 | `GET` | `/api/users` | ดูรายชื่อลูกค้า | ❌ |
| 5 | `PUT` | `/api/users/:accountId` | แก้ไขลูกค้า | ✅ |
| 6 | `DELETE` | `/api/users/:accountId` | ลบลูกค้า | ✅ |
| 7 | `GET` | `/api/equipment-types` | ดูประเภทอุปกรณ์ | ❌ |
| 8 | `GET` | `/api/products` | ดูอุปกรณ์ทั้งหมด | ❌ |
| 9 | `POST` | `/api/products` | เพิ่มอุปกรณ์ | ✅ |
| 10 | `PUT` | `/api/products/:id` | แก้ไขอุปกรณ์ | ✅ |
| 11 | `DELETE` | `/api/products/:id` | ลบอุปกรณ์ | ✅ |
| 12 | `POST` | `/api/rentals` | ส่งคำขอเช่า | ✅ (ลดสต็อก) |
| 13 | `GET` | `/api/admins` | ดูรายชื่อ Admin | ❌ |
| 14 | `POST` | `/api/admins` | เพิ่ม Admin | ✅ |
| 15 | `PUT` | `/api/admins/:accountId` | แก้ไข Admin | ✅ |
| 16 | `DELETE` | `/api/admins/:accountId` | ลบ Admin | ✅ |

> Endpoint ที่ไม่มีในตารางนี้ **ไม่มีอยู่ในระบบ** เช่น ไม่มี `GET /api/rentals`, ไม่มี `/api/orders`, ไม่มี `/api/payments`

### 9.4 วิธีทดสอบด้วย curl

ตัวอย่างคำสั่งในเอกสารนี้ใช้ **Single Quote (`'`)** ครอบ JSON ซึ่งใช้ได้บน **macOS, Linux และ Git Bash** เท่านั้น

- **Windows Command Prompt (`cmd.exe`)** ไม่ตีความ Single Quote เป็นตัวครอบข้อความ จึงอาจส่ง JSON ผิดรูปแบบ
- **Windows PowerShell** ใช้ `curl.exe` แทน `curl` เพราะ `curl` เป็น Alias ของ `Invoke-WebRequest` และการ Escape เครื่องหมายคำพูดค่อนข้างซับซ้อน

สำหรับผู้ใช้ Windows ที่ไม่คุ้นเคยกับ Command Line **แนะนำให้ใช้ Postman หรือ Insomnia** โดยตั้งค่า

1. Method เป็น `POST`, `PUT` หรือ `DELETE` ตาม Endpoint
2. URL เป็น `http://localhost:3031/api/...`
3. แท็บ **Headers** ตั้ง `Content-Type: application/json`
4. แท็บ **Body** เลือก **raw** แล้วเลือก **JSON**
5. วาง JSON จากตัวอย่างในเอกสาร
6. กด **Send**

หากต้องการใช้ Command Prompt จริง ให้เปลี่ยน Single Quote เป็น Double Quote และ Escape เครื่องหมายคำพูดภายใน เช่น

```bat
curl -X POST http://localhost:3031/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"customer01@example.com\",\"password\":\"ChangeMe_1234\"}"
```

> ตัวอย่างทั้งหมดใช้ค่าสมมติ เช่น `customer01@example.com`, `ChangeMe_1234`, `Example Camera X1` ซึ่ง **ไม่ใช่ข้อมูลจริง** และ **ไม่ใช่รหัสผ่านที่ใช้งานได้** ต้องเปลี่ยนเป็นข้อมูลในฐานข้อมูลของคุณเอง

### 9.5 การเข้าสู่ระบบ (Login)

| รายการ | ค่า |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3031/api/auth/login` |
| Content-Type | `application/json` |
| เขียนข้อมูล | บันทึกแถวใน `LOGIN` |

**Request Body**

```json
{
  "email": "customer01@example.com",
  "password": "ChangeMe_1234"
}
```

`email` รับได้ทั้งอีเมลและ Username

**ตัวอย่าง curl**

```bash
curl -X POST http://localhost:3031/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer01@example.com","password":"ChangeMe_1234"}'
```

**Response สำเร็จ (200)**

```json
{
  "success": true,
  "user": {
    "id": 3,
    "admin_id": null,
    "customer_id": 2,
    "username": "cust_customer01",
    "role": "Customer",
    "first_name": "Example",
    "last_name": "Customer",
    "email": "customer01@example.com"
  }
}
```

**Response กรณีไม่พบอีเมล (401)**

```json
{
  "success": false,
  "message": "ไม่พบบัญชีผู้ใช้งานนี้ในระบบ"
}
```

**Response กรณีรหัสผ่านผิด (401)**

```json
{
  "success": false,
  "message": "รหัสผ่านไม่ถูกต้อง"
}
```

**Response กรณีลืมฟิลด์ (400)**

```json
{
  "success": false,
  "message": "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน"
}
```

### 9.6 การสมัครสมาชิก (Registration)

| รายการ | ค่า |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3031/api/auth/register` |
| Content-Type | `application/json` |
| เขียนข้อมูล | เพิ่มใน `USER_ACCOUNT` และ `CUSTOMER` |

**Request Body**

```json
{
  "first_name": "Example",
  "last_name": "Customer",
  "email": "customer02@example.com",
  "phone": "0800000000",
  "address": "123 Example Road, Bangkok 10110",
  "username": "cust_customer02",
  "password": "ChangeMe_1234"
}
```

**ตัวอย่าง curl**

```bash
curl -X POST http://localhost:3031/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name":"Example",
    "last_name":"Customer",
    "email":"customer02@example.com",
    "phone":"0800000000",
    "address":"123 Example Road, Bangkok 10110",
    "username":"cust_customer02",
    "password":"ChangeMe_1234"
  }'
```

**Response สำเร็จ (200)**

```json
{
  "success": true,
  "message": "สมัครสมาชิกสำเร็จ"
}
```

**Response Username ซ้ำ (409)**

```json
{
  "success": false,
  "message": "ชื่อผู้ใช้งาน (Username) นี้ถูกใช้งานแล้ว"
}
```

**Response Email ซ้ำ (409)**

```json
{
  "success": false,
  "message": "อีเมลนี้ถูกใช้งานแล้ว"
}
```

**Response เบอร์โทรผิด (400)**

```json
{
  "success": false,
  "message": "กรุณากรอกเบอร์โทรศัพท์มือถือให้ถูกต้อง เช่น 0812345678 หรือ 081-234-5678"
}
```

**Response รหัสผ่านว่าง (400)**

```json
{
  "success": false,
  "message": "กรุณากำหนดรหัสผ่านก่อนสมัครสมาชิก"
}
```

**เงื่อนไขเบอร์โทรที่รับ**

- 10 หลัก
- ขึ้นต้นด้วย `06`, `08` หรือ `09`
- รับทั้ง `0800000000` และ `080-000-0000`
- ตัวอักษรหรือเครื่องหมายอื่นจะถูกปฏิเสธ

### 9.7 การดูรายการอุปกรณ์ (Product Listing)

| รายการ | ค่า |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3031/api/products` |
| เขียนข้อมูล | ❌ |

**ตัวอย่าง curl**

```bash
curl http://localhost:3031/api/products
```

**Response สำเร็จ (200)**

```json
[
  {
    "equipment_id": 1,
    "admin_id": 1,
    "name": "Example Camera X1",
    "type": "Camera",
    "brand": "ExampleBrand",
    "serial_number": "EX-CAM-001",
    "description": "กล้องตัวอย่างสำหรับเอกสาร",
    "image_url": null,
    "release_year": "2026-01-01T00:00:00.000Z",
    "model_series": "X Series",
    "status": "Available",
    "daily_rate": 1200,
    "main_image": "/uploads/eq-example-main.jpg",
    "detail_images": "[\"/uploads/eq-example-detail-1.jpg\"]",
    "stock": 2
  }
]
```

> `detail_images` ถูกส่งกลับเป็น **String ที่มี JSON อยู่ข้างใน** ไม่ใช่ Array โดยตรง Front-End จะเป็นผู้ Parse เอง

### 9.8 การเพิ่มอุปกรณ์ (Product Creation)

| รายการ | ค่า |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3031/api/products` |
| Content-Type | `application/json` |
| เขียนข้อมูล | ✅ เพิ่มแถวใน `EQUIPMENT` |

**Request Body**

```json
{
  "admin_id": 1,
  "name": "Example Camera X1",
  "type": "Camera",
  "brand": "ExampleBrand",
  "serial_number": "EX-CAM-001",
  "description": "กล้องตัวอย่างสำหรับเอกสาร",
  "model_series": "X Series",
  "status": "Available",
  "daily_rate": 1200,
  "stock": 2,
  "main_image": "/uploads/eq-example-main.jpg",
  "detail_images": [
    "/uploads/eq-example-detail-1.jpg",
    "/uploads/eq-example-detail-2.jpg"
  ]
}
```

**ตัวอย่าง curl**

```bash
curl -X POST http://localhost:3031/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "admin_id":1,
    "name":"Example Camera X1",
    "type":"Camera",
    "brand":"ExampleBrand",
    "serial_number":"EX-CAM-001",
    "description":"กล้องตัวอย่างสำหรับเอกสาร",
    "model_series":"X Series",
    "status":"Available",
    "daily_rate":1200,
    "stock":2,
    "main_image":"/uploads/eq-example-main.jpg",
    "detail_images":["/uploads/eq-example-detail-1.jpg"]
  }'
```

**Response สำเร็จ (200)**

```json
{
  "success": true,
  "message": "เพิ่มอุปกรณ์ใหม่สำเร็จ"
}
```

**Validation ที่ Back-End ตรวจ**

- `name` ต้องมีค่า
- `daily_rate` ต้องมากกว่า 0
- `type` ต้องมีค่า
- `stock` ถ้าไม่ส่งมาจะใช้ 1 เมื่อ `status = Available` หรือ 0 เมื่อสถานะอื่น
- `admin_id` ถ้าไม่ส่งมาจะใช้ 1
- `brand` ถ้าไม่ส่งมาจะใช้ `Sony`
- `serial_number` ถ้าไม่ส่งมาจะสร้างจากเวลา
- `detail_images` รับได้ไม่เกิน 4 รายการ

**Response ข้อมูลไม่ครบ (400)**

```json
{
  "success": false,
  "message": "กรุณาระบุชื่ออุปกรณ์และราคาเช่าที่มากกว่า 0"
}
```

### 9.9 การแก้ไขอุปกรณ์ (Product Editing)

| รายการ | ค่า |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3031/api/products/:id` |
| Content-Type | `application/json` |
| เขียนข้อมูล | ✅ แก้ไขแถวใน `EQUIPMENT` |

ตัวอย่าง `:id` คือ `1`

```bash
curl -X PUT http://localhost:3031/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Example Camera X1 Updated",
    "type":"Camera",
    "brand":"ExampleBrand",
    "serial_number":"EX-CAM-001",
    "description":"แก้ไขรายละเอียดตัวอย่าง",
    "model_series":"X Series",
    "status":"Available",
    "daily_rate":1350,
    "stock":3,
    "main_image":"/uploads/eq-example-main.jpg",
    "detail_images":["/uploads/eq-example-detail-1.jpg"]
  }'
```

**Response สำเร็จ (200)**

```json
{
  "success": true,
  "message": "อัปเดตข้อมูลอุปกรณ์สำเร็จ"
}
```

**Response ไม่พบอุปกรณ์ (404)**

```json
{
  "success": false,
  "message": "ไม่พบอุปกรณ์นี้ในระบบ"
}
```

**พฤติกรรมสำคัญ**

- หากไม่ส่ง `main_image` หรือ `detail_images` มา ระบบจะ **คงรูปเดิมไว้** ไม่ลบ
- หากส่ง `detail_images` มาเป็น Array ว่าง รูปประกอบจะถูกล้าง
- หาก `stock` เหลือ 0 แต่ส่ง `status = Available` ระบบจะเปลี่ยนสถานะเป็น `In Use`

### 9.10 การลบอุปกรณ์ (Product Deletion)

> ⚠️ **Endpoint นี้ลบข้อมูลถาวรและไม่สามารถย้อนกลับได้**

| รายการ | ค่า |
|---|---|
| Method | `DELETE` |
| URL | `http://localhost:3031/api/products/:id` |
| เขียนข้อมูล | ✅ ลบแถวใน `EQUIPMENT` |

```bash
curl -X DELETE http://localhost:3031/api/products/99
```

**Response สำเร็จ (200)**

```json
{
  "success": true,
  "message": "ลบอุปกรณ์ออกจากระบบแล้ว"
}
```

**Response กรณีมี Foreign Key (500)**

```json
{
  "success": false,
  "message": "ไม่สามารถลบอุปกรณ์ได้ (อาจมีรายการเช่าอ้างอิงอยู่)"
}
```

> หาก `id` ไม่มีอยู่จริง Back-End ยังตอบ 200 เพราะไม่ได้ตรวจจำนวนแถวที่ถูกลบ ผู้ใช้จึงควรตรวจรายการหลังลบทุกครั้ง

### 9.11 การจัดการลูกค้า (Customer Management)

#### ดูรายชื่อลูกค้า

```bash
curl http://localhost:3031/api/users
```

**Response (200)**

```json
[
  {
    "account_id": 2,
    "username": "cust_customer01",
    "customer_id": 1,
    "first_name": "Example",
    "last_name": "Customer",
    "email": "customer01@example.com",
    "address": "123 Example Road, Bangkok 10110",
    "phone": "0800000000"
  }
]
```

#### แก้ไขลูกค้า

| รายการ | ค่า |
|---|---|
| Method | `PUT` |
| URL | `http://localhost:3031/api/users/:accountId` |
| เขียนข้อมูล | ✅ |

```bash
curl -X PUT http://localhost:3031/api/users/2 \
  -H "Content-Type: application/json" \
  -d '{
    "username":"cust_customer01",
    "email":"customer01@example.com",
    "first_name":"Example",
    "last_name":"CustomerUpdated",
    "phone":"0800000000",
    "address":"456 Example Road, Bangkok 10200"
  }'
```

**Response (200)**

```json
{
  "success": true,
  "message": "อัปเดตข้อมูลผู้ใช้สำเร็จ"
}
```

**Response Username ซ้ำ (400)**

```json
{
  "success": false,
  "message": "Username นี้มีผู้ใช้งานแล้ว"
}
```

#### ลบลูกค้า

> ⚠️ **ลบข้อมูลถาวร**

```bash
curl -X DELETE http://localhost:3031/api/users/2
```

**Response (200)**

```json
{
  "success": true,
  "message": "ลบผู้ใช้งานเรียบร้อยแล้ว"
}
```

**Response กรณีมีประวัติเช่า (500)**

```json
{
  "success": false,
  "message": "ไม่สามารถลบผู้ใช้ได้ (อาจมีประวัติการเช่าค้างอยู่)"
}
```

### 9.12 การจัดการผู้ดูแลระบบ (Administrator Management)

#### ดูรายชื่อ Admin

```bash
curl http://localhost:3031/api/admins
```

**Response (200)**

```json
[
  {
    "admin_id": 1,
    "account_id": 1,
    "username": "admin_example",
    "first_name": "Example",
    "last_name": "Admin",
    "email": "admin01@example.com",
    "address": "Bangkok"
  }
]
```

#### เพิ่ม Admin

| รายการ | ค่า |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3031/api/admins` |
| เขียนข้อมูล | ✅ เพิ่มใน `USER_ACCOUNT` และ `ADMIN` |

```bash
curl -X POST http://localhost:3031/api/admins \
  -H "Content-Type: application/json" \
  -d '{
    "username":"admin_example02",
    "password":"ChangeMe_1234",
    "first_name":"Example",
    "last_name":"Admin",
    "email":"admin02@example.com",
    "address":"Bangkok"
  }'
```

**Response (200)**

```json
{
  "success": true,
  "message": "เพิ่มผู้ดูแลระบบ (Admin) สำเร็จ"
}
```

**Response ข้อมูลไม่ครบ (400)**

```json
{
  "success": false,
  "message": "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน"
}
```

#### แก้ไข Admin

```bash
curl -X PUT http://localhost:3031/api/admins/1 \
  -H "Content-Type: application/json" \
  -d '{
    "username":"admin_example",
    "password":"NewPassword_1234",
    "first_name":"Example",
    "last_name":"AdminUpdated",
    "email":"admin01@example.com",
    "address":"Bangkok"
  }'
```

- ถ้าไม่ส่ง `password` หรือส่งเป็นค่าว่าง ระบบจะคงรหัสผ่านเดิม
- ถ้าส่ง `password` ใหม่ ระบบจะเปลี่ยนรหัสผ่านทันที

**Response (200)**

```json
{
  "success": true,
  "message": "อัปเดตข้อมูล Admin สำเร็จ"
}
```

#### ลบ Admin

> ⚠️ **ลบข้อมูลถาวร และไม่สามารถลบ Admin คนสุดท้ายได้**

```bash
curl -X DELETE http://localhost:3031/api/admins/2
```

**Response (200)**

```json
{
  "success": true,
  "message": "ลบ Admin เรียบร้อยแล้ว"
}
```

**Response กรณีเป็น Admin คนสุดท้าย (400)**

```json
{
  "success": false,
  "message": "ไม่สามารถลบ Admin คนสุดท้ายของระบบได้"
}
```

### 9.13 การอัปโหลดรูปภาพ (Image Upload)

| รายการ | ค่า |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3031/api/upload` |
| Content-Type | `multipart/form-data` |
| ชื่อฟิลด์ไฟล์ | `image` |
| เขียนข้อมูล | ✅ บันทึกไฟล์ใน `backend/uploads/` |

**ตัวอย่าง curl บน macOS/Linux**

```bash
curl -X POST http://localhost:3031/api/upload \
  -F "image=@/home/YOUR_NAME/Pictures/camera.jpg"
```

**ตัวอย่าง curl บน Windows Command Prompt**

```bat
curl -X POST http://localhost:3031/api/upload -F "image=@C:\Users\YOUR_NAME\Pictures\camera.jpg"
```

**Response สำเร็จ (200)**

```json
{
  "success": true,
  "url": "/uploads/eq-1730000000000-123456.jpg"
}
```

**Response ไฟล์ผิดประเภท (400)**

```json
{
  "success": false,
  "message": "รองรับเฉพาะไฟล์รูปภาพ JPG, PNG หรือ WEBP เท่านั้น"
}
```

**Response ไฟล์ใหญ่เกิน 5 MB (400)**

```json
{
  "success": false,
  "message": "File too large"
}
```

**Response ไม่ได้แนบไฟล์ (400)**

```json
{
  "success": false,
  "message": "ไม่พบไฟล์รูปภาพที่อัปโหลด"
}
```

### 9.14 การส่งคำขอเช่า (Rental Requests)

> ⚠️ **Endpoint นี้เปลี่ยนข้อมูลถาวร:** ลด `EQUIPMENT.stock` ลง 1 และอาจเปลี่ยน `status` เป็น `In Use`

| รายการ | ค่า |
|---|---|
| Method | `POST` |
| URL | `http://localhost:3031/api/rentals` |
| Content-Type | `application/json` |
| เขียนข้อมูล | ✅ อัปเดต `EQUIPMENT` |

**Request Body**

```json
{
  "account_id": 3,
  "equipment_id": 1,
  "start_date": "2026-12-01",
  "return_date": "2026-12-03",
  "pickup_method": "จัดส่งถึงที่"
}
```

**ตัวอย่าง curl**

```bash
curl -X POST http://localhost:3031/api/rentals \
  -H "Content-Type: application/json" \
  -d '{
    "account_id":3,
    "equipment_id":1,
    "start_date":"2026-12-01",
    "return_date":"2026-12-03",
    "pickup_method":"จัดส่งถึงที่"
  }'
```

**Response สำเร็จ (200)**

```json
{
  "success": true,
  "message": "ทำรายการเช่าสำเร็จ",
  "rental": {
    "rental_id": 482913,
    "product_name": "Example Camera X1",
    "start_date": "2026-12-01",
    "return_date": "2026-12-03",
    "rental_days": 2,
    "daily_rate": 1200,
    "total_price": 2400,
    "deposit": 720,
    "status": "Confirmed"
  }
}
```

**Response ข้อมูลไม่ครบ (400)**

```json
{
  "success": false,
  "message": "ข้อมูลการเช่าไม่ครบถ้วน กรุณาตรวจสอบอีกครั้ง"
}
```

**Response วันที่ผิด (400)**

```json
{
  "success": false,
  "message": "วันคืนอุปกรณ์ต้องอยู่หลังวันรับอุปกรณ์อย่างน้อย 1 วัน"
}
```

**Response ไม่พบอุปกรณ์ (404)**

```json
{
  "success": false,
  "message": "ไม่พบอุปกรณ์นี้ในระบบ"
}
```

**Response อุปกรณ์ไม่ว่าง (409)**

```json
{
  "success": false,
  "message": "อุปกรณ์นี้ไม่พร้อมให้เช่าในช่วงวันที่เลือก"
}
```

**สิ่งที่ Endpoint นี้ทำจริง**

1. เริ่ม Transaction
2. `SELECT ... FOR UPDATE` อุปกรณ์เพื่อล็อกแถว
3. ตรวจ `status = 'Available'` และ `stock > 0`
4. ลด `stock` ลง 1
5. ถ้า `stock` เหลือ 0 เปลี่ยน `status` เป็น `In Use`
6. Commit Transaction
7. คำนวณ `total_price = daily_rate × rental_days`
8. คำนวณ `deposit = max(500, 30% ของ total_price)`
9. สร้าง `rental_id` แบบสุ่มเพื่อตอบกลับ

**สิ่งที่ Endpoint นี้ยังไม่ได้ทำ**

- ไม่ได้ INSERT ลงตาราง `RENTAL`
- ไม่ได้ INSERT ลงตาราง `ITEM`
- ไม่ได้สร้างแถวในตาราง `CONTRACT`
- ไม่ได้บันทึก `pickup_method`
- ไม่ได้บันทึกค่าจัดส่ง
- ไม่ได้ตรวจการจองทับซ้อนตามช่วงวันที่
- `rental_id` ที่ตอบกลับเป็นค่าสุ่ม ไม่ใช่ค่าจากฐานข้อมูล

### 9.15 การดูประเภทอุปกรณ์ (Equipment Types)

| รายการ | ค่า |
|---|---|
| Method | `GET` |
| URL | `http://localhost:3031/api/equipment-types` |
| เขียนข้อมูล | ❌ |

```bash
curl http://localhost:3031/api/equipment-types
```

**Response (200)**

```json
[
  "Camera",
  "Cinema Camera",
  "Compact Camera",
  "Lens",
  "Microphone",
  "Audio",
  "Lighting",
  "Computer",
  "Speaker",
  "Accessory"
]
```

รายการนี้เกิดจาก union ระหว่างค่าที่มีจริงใน `EQUIPMENT.type` (เรียงตามตัวอักษรจาก SQL) กับรายการพื้นฐานที่กำหนดใน Back-End โดยค่าที่มีอยู่แล้วจะไม่ถูกเพิ่มซ้ำ ลำดับจึงอาจต่างกันตามข้อมูลจริงในฐานข้อมูล

---

## 10. ขั้นตอนที่ 6: การปิดและเริ่มระบบใหม่

### 10.1 การหยุด Front-End และ Back-End

1. คลิกใน Terminal ที่รัน Front-End
2. กด `Ctrl + C` หนึ่งครั้ง
3. หาก Windows ถาม `Terminate batch job (Y/N)?` ให้พิมพ์ `Y` แล้ว Enter
4. ทำแบบเดียวกันกับ Terminal ที่รัน Back-End
5. Terminal จะกลับไปที่ Prompt แสดงว่า Server หยุดแล้ว

> การปิด Terminal โดยตรงก็ทำให้ Server หยุดเช่นกัน แต่การกด `Ctrl + C` เป็นวิธีที่สะอาดกว่า

### 10.2 การเริ่มระบบใหม่

1. ตรวจสอบก่อนว่า MySQL ทำงานอยู่ (หัวข้อ 10.4)
2. เปิด VS Code และโฟลเดอร์โปรเจกต์
3. เปิด Terminal ที่ 1

```bash
cd backend
npm start
```

4. รอจนเห็น `LekhaFong Backend running at http://localhost:3031`
5. เปิด Terminal ที่ 2

```bash
cd frontend
npm start
```

6. รอจนเห็น `Frontend running at http://localhost:3030`
7. เปิดเบราว์เซอร์ที่ `http://localhost:3030`

ไม่จำเป็นต้องรัน `npm ci` ใหม่ทุกครั้ง

### 10.3 การตรวจสอบว่า MySQL ทำงานอยู่

#### Windows

วิธีที่ 1: เปิด **Services**

1. กด Start
2. พิมพ์ `services.msc`
3. หา `MySQL80` หรือ `MySQL`
4. Status ต้องเป็น **Running**

วิธีที่ 2: Command Prompt แบบ Administrator

```bat
sc query MySQL80
```

มองหา `STATE` ต้องเป็น `RUNNING`

หรือทดสอบเชื่อมต่อ

```bat
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u YOUR_MYSQL_USERNAME -p -e "SELECT 1;"
```

#### Ubuntu

```bash
sudo systemctl status mysql
```

ต้องเห็น `active (running)`

#### macOS

```bash
brew services list
```

ต้องเห็น `mysql started`

หรือ

```bash
mysqladmin -u YOUR_MYSQL_USERNAME -p ping
```

ผลลัพธ์

```text
mysqld is alive
```

### 10.4 เหตุใดการ Restart จึงไม่ลบข้อมูล

ข้อมูลของระบบถูกเก็บใน **MySQL Data Directory** ซึ่งเป็นโฟลเดอร์ข้อมูลของ MySQL บนดิสก์ ไม่ได้อยู่ในหน่วยความจำของ Node.js

- การกด `Ctrl + C` หยุดเฉพาะ Node.js Process
- การปิด VS Code ไม่ได้สั่งลบฐานข้อมูล
- การรีสตาร์ทคอมพิวเตอร์ไม่ลบข้อมูล
- ข้อมูลจะหายก็ต่อเมื่อมีคำสั่ง `DROP DATABASE`, `DELETE`, `TRUNCATE` หรือไฟล์ข้อมูล MySQL เสียหาย

ดังนั้นการเริ่ม Back-End และ Front-End ใหม่จึงไม่ทำให้สินค้า ผู้ใช้ หรือประวัติหายไป

### 10.5 เหตุใดไม่ต้องรัน `npm ci` ทุกครั้ง

`npm ci` มีหน้าที่ดาวน์โหลด Dependency ลงโฟลเดอร์ `node_modules` ซึ่งเก็บอยู่บนดิสก์แล้ว

ต้องรัน `npm ci` ใหม่เมื่อ

- เพิ่ง Clone โปรเจกต์ลงเครื่องใหม่
- มีการแก้ `package.json` หรือ `package-lock.json`
- ลบโฟลเดอร์ `node_modules` โดยไม่ตั้งใจ
- ย้ายโปรเจกต์ไปเครื่องอื่น
- พบว่า Dependency เสียหาย

ไม่ต้องรันเมื่อ

- เปิดเครื่องใหม่แล้วจะเริ่ม Server
- แก้ไขเฉพาะไฟล์ HTML/CSS/JavaScript
- แก้ไข `.env`
- รีสตาร์ท Server

### 10.6 Checklist การเริ่มใช้งานประจำวัน

| ลำดับ | สิ่งที่ต้องตรวจ | วิธีตรวจ | ผ่านเมื่อ |
|---|---|---|---|
| 1 | MySQL ทำงาน | Services / `systemctl status mysql` | Running |
| 2 | ฐานข้อมูลมีอยู่ | Workbench `SHOW DATABASES` | เห็น `lekhafong_production` |
| 3 | อยู่ในโฟลเดอร์ backend | `pwd` หรือ Prompt | ลงท้าย `backend` |
| 4 | เริ่ม Back-End | `npm start` | เห็น `http://localhost:3031` |
| 5 | ทดสอบ API | เปิด `/api/products` | เห็น JSON Array |
| 6 | อยู่ในโฟลเดอร์ frontend | Terminal ที่ 2 | ลงท้าย `frontend` |
| 7 | เริ่ม Front-End | `npm start` | เห็น `http://localhost:3030` |
| 8 | เปิดเว็บ | เบราว์เซอร์ | เห็นหน้าแรกและสินค้า |
| 9 | ทดสอบ Login | เข้าสู่ระบบ | เข้าได้โดยไม่ Error |
| 10 | เลิกใช้ | `Ctrl + C` ทั้งสอง Terminal | Prompt กลับมา |

---

## 11. ขั้นตอนที่ 7: การแก้ไขปัญหาที่พบบ่อย

### 11.1 Node.js ยังไม่ได้ติดตั้ง

**อาการ**

```text
'node' is not recognized as an internal or external command
```

หรือบน macOS/Linux

```text
command not found: node
```

**ความหมาย:** ระบบหาโปรแกรม Node.js ไม่พบ

**สาเหตุที่เป็นไปได้**

- ยังไม่ได้ติดตั้ง Node.js
- ติดตั้งแล้วแต่ยังไม่ได้เปิด Terminal ใหม่
- PATH ของระบบยังไม่รวมโฟลเดอร์ Node.js
- ติดตั้งไม่สำเร็จ

**วิธีแก้**

1. เปิด Terminal ใหม่แล้วพิมพ์ `node -v` อีกครั้ง
2. หากยังไม่พบ ให้ดาวน์โหลด Node.js 22 LTS จาก <https://nodejs.org/en/download> แล้วติดตั้งใหม่
3. บน Windows ตรวจสอบว่า `C:\Program Files\nodejs\` อยู่ใน PATH
   - กด Start > พิมพ์ `environment variables`
   - เปิด **Edit the system environment variables**
   - กด **Environment Variables**
   - ใน `Path` ต้องมี `C:\Program Files\nodejs\`
4. ปิด Terminal และ VS Code ทั้งหมด แล้วเปิดใหม่
5. ตรวจสอบด้วย `where node` (Windows) หรือ `which node` (macOS/Linux)

**ตรวจสอบว่าหายแล้ว:** `node -v` แสดง `v22.x.x`

### 11.2 npm ไม่รู้จัก (npm not recognized)

**อาการ**

```text
'npm' is not recognized as an internal or external command
```

หรือ PowerShell แสดง

```text
npm.ps1 cannot be loaded because running scripts is disabled on this system
```

**ความหมาย:** ระบบหา npm ไม่พบ หรือ PowerShell ไม่อนุญาตให้รัน Script

**สาเหตุ**

- Node.js ติดตั้งไม่ครบ
- PATH ไม่ถูกต้อง
- PowerShell Execution Policy ปิดการรัน `.ps1`
- ยังไม่ได้เปิด Terminal ใหม่หลังติดตั้ง

**วิธีแก้**

1. ตรวจสอบ `node -v` ก่อน หาก node ใช้ไม่ได้ ให้แก้ตามหัวข้อ 11.1
2. เปิด Terminal ใหม่
3. บน Windows ให้ลองใช้ **Command Prompt** แทน PowerShell
4. หรือเรียก `npm.cmd` โดยตรง

```bat
npm.cmd -v
```

5. หากเป็นปัญหา PowerShell Execution Policy ให้เปิด PowerShell แบบ Administrator แล้วพิมพ์

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

จากนั้นพิมพ์ `Y` เพื่อยืนยัน แล้วเปิด Terminal ใหม่

6. หากยังไม่หาย ให้ Repair Node.js จาก Control Panel > Programs > Node.js > Change > Repair

**ตรวจสอบว่าหายแล้ว:** `npm -v` แสดงเลขเวอร์ชัน

### 11.3 MySQL ไม่ทำงาน (MySQL not running)

**อาการ**

- MySQL Workbench ขึ้น `Can't connect to MySQL server on '127.0.0.1:3306'`
- Back-End ขึ้น `connect ECONNREFUSED 127.0.0.1:3306`
- `mysqladmin ping` ไม่ตอบ

**ความหมาย:** ไม่มีโปรแกรม MySQL รับการเชื่อมต่อที่พอร์ต 3306

**สาเหตุ**

- MySQL Service ยังไม่เริ่ม
- MySQL หยุดทำงานกะทันหัน
- พอร์ต 3306 ถูกเปลี่ยน
- ติดตั้ง MySQL ไม่สำเร็จ

**วิธีแก้ Windows**

1. กด Start > พิมพ์ `services.msc`
2. หา `MySQL80` หรือ `MySQL`
3. คลิกขวา > **Start**
4. กลับไปทดสอบใน Workbench

หรือเปิด Command Prompt แบบ Administrator

```bat
net start MySQL80
```

**วิธีแก้ Ubuntu**

```bash
sudo systemctl start mysql
sudo systemctl status mysql
```

**วิธีแก้ macOS**

```bash
brew services start mysql
brew services list
```

**ตรวจสอบว่าหายแล้ว:** Workbench Test Connection สำเร็จ หรือ `mysqladmin ping` ตอบ `mysqld is alive`

### 11.4 MySQL Access Denied

**อาการ**

```text
Access denied for user 'YOUR_USER'@'localhost' (using password: YES)
```

หรือ

```text
ERROR 1045 (28000): Access denied for user 'YOUR_USER'@'localhost'
```

**ความหมาย:** MySQL ปฏิเสธชื่อผู้ใช้ รหัสผ่าน หรือ Host ที่ใช้เชื่อมต่อ

**สาเหตุ**

- รหัสผ่านใน `.env` ไม่ตรงกับ MySQL
- ชื่อผู้ใช้สะกดผิด
- ผู้ใช้ถูกสร้างเป็น `'user'@'127.0.0.1'` แต่โปรแกรมเชื่อมต่อด้วย `localhost`
- ผู้ใช้ยังไม่ได้รับสิทธิ์ฐานข้อมูล
- มีช่องว่างหรือเครื่องหมายคำพูดติดมาใน `.env`

**วิธีแก้**

1. เปิด MySQL Workbench แล้ว Login ด้วยบัญชีแอปพลิเคชันโดยตรง
2. หาก Login ไม่ได้ ให้ Login ด้วย root แล้วตรวจสอบผู้ใช้

```sql
SELECT user, host FROM mysql.user;
```

3. ตรวจสอบว่ามีชื่อของคุณและ Host ตรงกับที่ใช้
4. หากใช้ `localhost` แล้วไม่พบ ให้สร้างผู้ใช้สำหรับ `127.0.0.1` เพิ่ม

```sql
CREATE USER 'YOUR_MYSQL_USERNAME'@'127.0.0.1'
IDENTIFIED BY 'YOUR_MYSQL_PASSWORD';

GRANT ALL PRIVILEGES ON lekhafong_production.*
TO 'YOUR_MYSQL_USERNAME'@'127.0.0.1';

FLUSH PRIVILEGES;
```

5. ตรวจสอบ `.env` ว่าไม่มีช่องว่างหน้า/หลังค่า
6. หยุดและเริ่ม Back-End ใหม่

**ตรวจสอบว่าหายแล้ว:** เปิด `http://localhost:3031/api/products` ได้ JSON Array ไม่ใช่ Access Denied

### 11.5 ข้อมูลใน `.env` ไม่ถูกต้อง

**อาการ**

- Back-End ขึ้น `MySQL Connection Error`
- API ตอบ 500 พร้อมข้อความเกี่ยวกับฐานข้อมูล
- Login ไม่ได้ทั้งที่รหัสผ่านถูก

**ความหมาย:** ค่าที่โปรแกรมอ่านจาก `.env` ไม่ตรงกับฐานข้อมูลจริง

**สาเหตุ**

- `DB_USER` หรือ `DB_PASSWORD` ผิด
- `DB_NAME` สะกดผิด
- ไฟล์ชื่อ `.env.txt`
- ไฟล์อยู่ผิดโฟลเดอร์
- แก้ `.env` แล้วแต่ยังไม่ Restart Back-End
- รหัสผ่านมี `#` หรือช่องว่างแต่ไม่ได้ใส่เครื่องหมายคำพูด

**วิธีแก้**

1. ตรวจสอบตำแหน่งไฟล์ต้องเป็น `backend/.env`
2. เปิดไฟล์และตรวจทีละบรรทัด

```env
PORT=3031
DB_HOST=localhost
DB_PORT=3306
DB_USER=YOUR_MYSQL_USERNAME
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=lekhafong_production
```

3. ตรวจว่าไม่มี `.env.txt` ซ่อนอยู่
4. ทดสอบ Login MySQL ด้วยค่าเดียวกันใน Workbench
5. หากรหัสผ่านมีอักขระพิเศษ ให้ใส่เครื่องหมายคำพูดคู่

```env
DB_PASSWORD="My#Password 2026"
```

6. บันทึกไฟล์
7. กด `Ctrl + C` หยุด Back-End แล้ว `npm start` ใหม่

**ตรวจสอบว่าหายแล้ว:** เห็น `Connected to MySQL database: lekhafong_production`

### 11.6 Unknown Database

**อาการ**

```text
MySQL Connection Error: Unknown database 'lekhafong_production'
```

หรือ

```text
ER_BAD_DB_ERROR: Unknown database 'lekhafong_production'
```

**ความหมาย:** MySQL เชื่อมต่อได้ แต่ไม่พบฐานข้อมูลชื่อนี้

**สาเหตุ**

- ยังไม่ได้ Import ไฟล์ SQL
- `DB_NAME` สะกดผิด
- Import ลงฐานข้อมูลชื่ออื่น
- ฐานข้อมูลถูกลบ

**วิธีแก้**

1. เปิด Workbench แล้วรัน

```sql
SHOW DATABASES LIKE 'lekhafong_production';
```

2. หากไม่มีผลลัพธ์ ให้ Import ไฟล์ SQL ตามหัวข้อ 5.9
3. หากมีชื่ออื่น ให้แก้ `DB_NAME` ใน `.env` ให้ตรง
4. Restart Back-End

**ตรวจสอบว่าหายแล้ว:** `SHOW TABLES` เห็น 8 ตาราง และ API โหลดสินค้าได้

### 11.7 ตารางในฐานข้อมูลไม่ครบ

**อาการ**

```text
ER_NO_SUCH_TABLE: Table 'lekhafong_production.EQUIPMENT' doesn't exist
```

**ความหมาย:** มีฐานข้อมูลแต่ไม่มีตารางที่โปรแกรมต้องใช้

**สาเหตุ**

- Import SQL ไม่จบ
- Import ผิดฐานข้อมูล
- มี ERROR ระหว่าง Import แล้วข้ามคำสั่งที่เหลือ
- ฐานข้อมูลถูกสร้างใหม่แต่ยังไม่ได้ใส่ Schema

**วิธีแก้**

1. เปิด Workbench แล้วรัน

```sql
USE lekhafong_production;
SHOW TABLES;
```

2. ต้องเห็นครบ 8 ตาราง
3. หากไม่ครบ ให้ตรวจ Output ตอน Import ว่ามี ERROR หรือไม่
4. หากเป็นเครื่องทดสอบที่ยังไม่มีข้อมูลจริง และยืนยันแล้วว่าไม่ต้องการข้อมูลเดิม ให้สร้างฐานข้อมูลทดสอบใหม่หรือลบฐานข้อมูลทดสอบนั้นด้วยตนเองก่อน Import ใหม่ทั้งไฟล์
5. หากมีข้อมูลที่ต้องเก็บแล้ว **ห้ามลบฐานข้อมูล** ให้สำรองข้อมูลและสร้างตารางที่ขาดด้วยคำสั่ง `CREATE TABLE` จากไฟล์ SQL เฉพาะส่วนที่ต้องการ
6. หากไม่แน่ใจ ให้ปรึกษาทีมงานก่อน

**ตรวจสอบว่าหายแล้ว:** `SHOW TABLES` เห็น 8 ตาราง

### 11.8 พอร์ต 3030 หรือ 3031 ถูกใช้งานอยู่

**อาการ**

```text
Error: listen EADDRINUSE: address already in use 127.0.0.1:3030
```

หรือ

```text
Backend server error: listen EADDRINUSE: address already in use :::3031
```

**ความหมาย:** มีโปรแกรมอื่นใช้พอร์ตนี้อยู่แล้ว

**สาเหตุ**

- เปิด Server ค้างไว้จากรอบก่อน
- เปิด Terminal หลายหน้าต่างแล้วรันซ้ำ
- โปรแกรมอื่นใช้พอร์ตเดียวกัน

**วิธีแก้ Windows**

1. เปิด Command Prompt แล้วพิมพ์

```bat
netstat -ano | findstr :3031
```

2. ดูเลข PID คอลัมน์สุดท้าย
3. หยุด Process

```bat
taskkill /PID <PID> /F
```

4. ทำแบบเดียวกันกับพอร์ต 3030

**วิธีแก้ Ubuntu/macOS**

```bash
lsof -i :3031
```

หรือ

```bash
lsof -i :3030
```

แล้วหยุด Process

```bash
kill -9 <PID>
```

**วิธีที่ปลอดภัยกว่า:** ปิด Terminal เก่าให้หมด แล้วเริ่มใหม่

> **ห้าม** ไป Kill Process ของ MySQL ที่พอร์ต 3306 เพราะจะทำให้ฐานข้อมูลหยุด

**ตรวจสอบว่าหายแล้ว:** `npm start` ไม่ขึ้น EADDRINUSE

### 11.9 Back-End เชื่อมต่อฐานข้อมูลไม่ได้

**อาการ**

- หน้าเว็บโหลดได้ แต่สินค้าไม่ขึ้น
- API ตอบ 500
- Terminal แสดง `MySQL Connection Error`

**ความหมาย:** Back-End ทำงานแต่ติดต่อ MySQL ไม่ได้

**สาเหตุ**

- MySQL ไม่ได้เปิด
- `.env` ผิด
- ฐานข้อมูลไม่มี
- สิทธิ์ผู้ใช้ไม่พอ
- พอร์ต 3306 ถูกเปลี่ยน
- Firewall หรือ Antivirus บล็อก Local Port

**วิธีแก้**

1. ตรวจ MySQL ตามหัวข้อ 11.3
2. ตรวจ `.env` ตามหัวข้อ 11.5
3. ตรวจฐานข้อมูลตามหัวข้อ 11.6
4. ทดสอบ Login MySQL ใน Workbench ด้วยค่าเดียวกัน
5. ปิดและเปิด Back-End ใหม่
6. ดูข้อความ Error แบบเต็มใน Terminal

**ตรวจสอบว่าหายแล้ว:** Terminal แสดง `Connected to MySQL database: lekhafong_production`

### 11.10 หน้าเว็บเปิดได้แต่ไม่มีอุปกรณ์

**อาการ**

- หน้าแรกแสดง แต่การ์ดสินค้าว่าง
- หน้าค้นหาขึ้น “ไม่พบอุปกรณ์”
- Admin Products ว่าง

**ความหมาย:** Front-End โหลดได้ แต่ไม่ได้ข้อมูลจาก API หรือฐานข้อมูลว่าง

**สาเหตุ**

- Back-End ไม่ได้รัน
- เปิดเว็บผ่าน `file://`
- CORS Error
- API ตอบ 500
- ตาราง `EQUIPMENT` ว่าง
- ตัวกรองเข้มเกินไป
- ยังกรองเฉพาะรายการโปรด

**วิธีแก้**

1. ตรวจว่า Back-End รันอยู่ที่ 3031
2. เปิด `http://localhost:3031/api/products` โดยตรง
3. หากเห็น JSON Array แสดงว่า API ปกติ ให้กลับไปที่หน้าเว็บ
4. กด `F12` เปิด Developer Tools > แท็บ **Console** และ **Network**
5. ดูว่ามีคำว่า `CORS` หรือ `Failed to fetch` หรือไม่
6. ตรวจว่าเปิดเว็บผ่าน `http://localhost:3030` ไม่ใช่ `file://`
7. กด **ล้างค่า** ในตัวกรอง
8. กดไอคอนหัวใจเพื่อออกจากโหมดรายการโปรด
9. ตรวจจำนวนแถวใน MySQL

```sql
SELECT COUNT(*) FROM EQUIPMENT;
```

**ตรวจสอบว่าหายแล้ว:** การ์ดสินค้าแสดงครบตามจำนวนในฐานข้อมูล

### 11.11 รูปภาพสินค้าโหลดไม่ขึ้น

**อาการ**

- การ์ดสินค้าแสดงไอคอนแทนรูป
- รูปขึ้นเป็น Broken Image
- รูปในหน้า Detail ไม่แสดง

**ความหมาย:** เบราว์เซอร์หาไฟล์รูปไม่พบ หรือ Path ผิด

**สาเหตุ**

- ไฟล์ไม่ได้อยู่ใน `backend/uploads/`
- `main_image` ในฐานข้อมูลเป็น Path ผิด
- Back-End ไม่ได้รัน จึงโหลด `/uploads/...` ไม่ได้
- ไฟล์ถูกย้ายหรือลบ
- รูปจากเว็บภายนอกโหลดไม่ได้เพราะไม่มีอินเทอร์เน็ต

**วิธีแก้**

1. ตรวจว่า Back-End รันอยู่
2. คัดลอก Path จากฐานข้อมูล เช่น `/uploads/eq-....jpg`
3. เปิดในเบราว์เซอร์

```text
http://localhost:3031/uploads/eq-....jpg
```

4. หาก 404 ให้ตรวจว่าไฟล์มีอยู่ใน `backend/uploads/`
5. หากไฟล์หาย ให้ Login เป็น Admin แล้วอัปโหลดใหม่
6. ตรวจว่า `main_image` ขึ้นต้นด้วย `/uploads/` หรือเป็น URL ที่ถูกต้อง
7. รูปแบรนด์บางรูปโหลดจากอินเทอร์เน็ต หากไม่มีเน็ตอาจไม่แสดง แต่ไม่กระทบการทำงานหลัก

**ตรวจสอบว่าหายแล้ว:** เปิด URL รูปโดยตรงเห็นรูป และหน้าเว็บแสดงรูป

### 11.12 npm ติดตั้งไม่สำเร็จ

**อาการ**

```text
npm ERR! network request failed
```

หรือ

```text
npm ERR! code EACCES
```

หรือ

```text
npm ERR! Cannot read properties of null
```

**ความหมาย:** npm ดาวน์โหลดหรือเขียนไฟล์ Dependency ไม่สำเร็จ

**สาเหตุ**

- ไม่มีอินเทอร์เน็ต
- Proxy หรือ Firewall บล็อก npm Registry
- สิทธิ์เขียนโฟลเดอร์ไม่พอ
- ใช้ Node.js เวอร์ชันเก่า
- `node_modules` หรือ Cache เสียหาย
- รันผิดโฟลเดอร์

**วิธีแก้**

1. ตรวจอินเทอร์เน็ตโดยเปิด <https://registry.npmjs.org/>
2. ตรวจว่าอยู่ในโฟลเดอร์ที่มี `package.json`

```bash
ls package.json
```

3. ลองใหม่

```bash
npm ci
```

4. หากยังไม่หาย ให้ลบ `node_modules` แล้วรันใหม่

**Windows Command Prompt**

```bat
rmdir /s /q node_modules
npm ci
```

**macOS/Linux**

```bash
rm -rf node_modules
npm ci
```

5. ตรวจ Cache

```bash
npm cache verify
```

6. หากมี Proxy ให้ตั้งค่า npm ตาม Proxy ขององค์กร
7. หลีกเลี่ยงการรัน `sudo npm` บน macOS/Linux เพราะอาจทำให้สิทธิ์ไฟล์ผิด
8. ตรวจว่าใช้ Node.js 22

**ตรวจสอบว่าหายแล้ว:** `npm ci` จบด้วย `found 0 vulnerabilities` และมี `node_modules`

### 11.13 เบราว์เซอร์ขึ้น Connection Refused

**อาการ**

```text
This site can't be reached
localhost refused to connect
ERR_CONNECTION_REFUSED
```

**ความหมาย:** ไม่มีโปรแกรมรับการเชื่อมต่อที่ URL/พอร์ตนั้น

**สาเหตุ**

- Front-End ไม่ได้รัน
- พิมพ์พอร์ตผิด
- พิมพ์ `https://` แทน `http://`
- Server หยุดเพราะ Error
- เปิด Terminal แล้วปิดไปแล้ว

**วิธีแก้**

1. ตรวจ Terminal ว่าเห็น `Frontend running at http://localhost:3030`
2. ตรวจ URL ต้องเป็น `http://localhost:3030`
3. ห้ามใช้ `https://localhost:3030`
4. หาก Terminal มี Error ให้แก้ตาม Error นั้น
5. เริ่ม Front-End ใหม่

```bash
cd frontend
npm start
```

6. หากเป็น Back-End ให้ตรวจ `http://localhost:3031/api/products`

**ตรวจสอบว่าหายแล้ว:** หน้าเว็บโหลดได้ Status 200

### 11.14 ปัญหา Terminal บน Windows

**อาการ**

- คำสั่ง `cd` ขึ้น error
- Path มีช่องว่างแล้วใช้งานไม่ได้
- `curl` ไม่ทำงาน
- ไฟล์ `.env` กลายเป็น `.env.txt`
- ภาษาไทยใน Terminal เป็นตัวประหลาด

**ความหมาย:** ความแตกต่างระหว่าง PowerShell, Command Prompt และการตั้งค่าภาษา

**วิธีแก้**

1. **Path มีช่องว่าง** ให้ครอบด้วยเครื่องหมายคำพูด

```bat
cd "C:\Users\Your Name\Documents\lekhaFong"
```

2. **`curl` ใน PowerShell** ให้ใช้

```powershell
curl.exe http://localhost:3031/api/products
```

3. **`<` ไม่ทำงานใน PowerShell** ให้ใช้ Command Prompt หรือ MySQL Workbench สำหรับ Import SQL

4. **ไฟล์ `.env.txt`** ให้เปิด File name extensions และ Rename เป็น `.env`

5. **ภาษาไทยเพี้ยน** ให้พิมพ์

```bat
chcp 65001
```

และตั้ง Font ของ Terminal เป็น Font ที่รองรับภาษาไทย

6. **รัน Script ไม่ได้** ให้ดูหัวข้อ 11.2

7. **อยากใช้ bash บน Windows** สามารถติดตั้ง Git Bash หรือ WSL ได้ แต่ไม่จำเป็นสำหรับโปรเจกต์นี้

### 11.15 ลืมรหัสผ่าน MySQL

**อาการ:** Login MySQL ไม่ได้ และไม่มีรหัสผ่านใด ๆ ที่จำได้

**ความหมาย:** ต้องรีเซ็ตรหัสผ่านผ่านบัญชี root หรือผู้ดูแลระบบ

**วิธีแก้**

1. หากยังจำรหัสผ่าน root ได้ ให้ Login ด้วย root แล้วรัน

```sql
ALTER USER 'YOUR_MYSQL_USERNAME'@'localhost'
IDENTIFIED BY 'YOUR_NEW_PASSWORD';
FLUSH PRIVILEGES;
```

2. แก้ `.env` ให้เป็นรหัสผ่านใหม่
3. Restart Back-End
4. หากลืมรหัสผ่าน root ด้วย ต้องใช้ขั้นตอน Reset Password ของ MySQL ซึ่งแตกต่างตามระบบปฏิบัติการ แนะนำให้ค้นหาคู่มือทางการหรือปรึกษาผู้ดูแลระบบ
5. ห้ามลบฐานข้อมูลเพียงเพราะลืมรหัสผ่าน

**ตรวจสอบว่าหายแล้ว:** Login Workbench และ Back-End ได้

### 11.16 หน้า Admin เด้งกลับหน้าแรก

**อาการ:** กดปุ่มแอดมินหรือเปิด `?page=admin` แล้วกลับไปหน้า Home พร้อมข้อความให้เข้าสู่ระบบ

**ความหมาย:** Front-End ไม่เห็นว่าผู้ใช้ปัจจุบันเป็น Admin

**สาเหตุ**

- ยังไม่ได้ Login
- Login ด้วยบัญชี Customer
- `localStorage` ถูกล้าง
- Login แล้วแต่ข้อมูล role ไม่ถูกต้อง

**วิธีแก้**

1. Login ด้วยบัญชี Admin
2. ตรวจว่าเมนูด้านบนแสดงชื่อผู้ใช้และปุ่มออกจากระบบ
3. กด `F12` > Application > Local Storage > `http://localhost:3030`
4. ดู key `lekhafong_auth` ว่ามี `"role":"Admin"`
5. หากไม่มี ให้ Logout แล้ว Login ใหม่
6. ตรวจใน MySQL ว่า `USER_ACCOUNT.role = 'Admin'`

```sql
SELECT account_id, username, role FROM USER_ACCOUNT;
```

**ตรวจสอบว่าหายแล้ว:** เปิดหน้า Admin ได้และเห็นแท็บ Users/Products/Admins/Profile

---

## 12. ข้อจำกัดและข้อควรระวัง

> ⚠️ **คำเตือนสำคัญ:** ระบบนี้เหมาะสำหรับการทดสอบบนเครื่อง Local และการสาธิตในชั้นเรียนเท่านั้น **ห้ามเปิดให้เข้าถึงจากอินเทอร์เน็ตหรือใช้เก็บข้อมูลจริงของลูกค้า** จนกว่าจะแก้ไขข้อจำกัดด้านล่างทั้งหมด

### 12.1 สรุปข้อจำกัด

| ลำดับ | ข้อจำกัด | สิ่งที่เกิดขึ้นในโค้ด | ผลกระทบ | แนวทางแก้ไขในอนาคต |
|---|---|---|---|---|
| 1 | เก็บรหัสผ่านแบบ Plaintext | `USER_ACCOUNT.password` เก็บข้อความตรง ๆ และ Login เปรียบเทียบตรง ๆ | หากฐานข้อมูลรั่ว รหัสผ่านทั้งหมดถูกอ่านได้ทันที | ใช้ bcrypt หรือ Argon2 และเพิ่ม Salt |
| 2 | Back-End ไม่มี Authorization | ไม่มี Middleware ตรวจ Token/Session ในทุก `/api/*` | ใครเข้าถึงพอร์ต 3031 ได้สามารถเพิ่ม/แก้/ลบข้อมูลได้ | เพิ่ม JWT/Session และตรวจ Role ทุก Endpoint |
| 3 | การเช่าไม่ถูกบันทึกถาวร | `/api/rentals` อัปเดตสต็อก แต่ไม่ INSERT `RENTAL`, `ITEM`, `CONTRACT` | ไม่มีประวัติการเช่า ลูกค้าไม่เห็นรายการของตน | เพิ่ม Transaction INSERT ครบทุกตาราง |
| 4 | ค่าจัดส่งไม่ถูกบันทึก | `DELIVERY_FEE = 150` อยู่ฝั่ง Front-End และ Back-End ไม่รับไปใช้ | ยอดในฐานข้อมูลไม่รวมค่าจัดส่ง และตรวจสอบย้อนหลังไม่ได้ | เพิ่มคอลัมน์/ตารางและคำนวณฝั่ง Server |
| 5 | รายการโปรดเก็บใน Browser | `localStorage` key `lekhafong_favorites` | เปลี่ยนเครื่อง/ล้าง Browser แล้วหาย | สร้างตาราง FAVORITE และ API ผูกกับบัญชี |
| 6 | ใช้งานได้เฉพาะ Localhost | Front-End ผูก `localhost`, CORS อนุญาตเฉพาะ 3030 | ผู้อื่นในเครือข่ายเข้าถึงไม่ได้ | ออกแบบ Deployment, HTTPS, Reverse Proxy |
| 7 | ไม่มีระบบ Session/Token | ใช้ `localStorage` เก็บข้อมูลผู้ใช้ | ปลอมแปลง role ฝั่ง Client ได้ | ใช้ HttpOnly Cookie หรือ Token ที่ลงนาม |
| 8 | ไม่มี Rate Limiting | Login และ Register เรียกได้ไม่จำกัด | เสี่ยงต่อการเดารหัสผ่าน | เพิ่ม Rate Limit และ Lockout |
| 9 | ไม่มี CSRF Protection | ใช้ JSON API และ CORS แต่ไม่มี CSRF Token | เสี่ยงเมื่อเปิด Public | เพิ่ม CSRF Protection ตามรูปแบบ Session |
| 10 | ไม่มี Email Verification | สมัครแล้วใช้ได้ทันที | สมัครด้วยอีเมลปลอมได้ | เพิ่มระบบยืนยันอีเมล |
| 11 | ไม่มีระบบลืมรหัสผ่าน | ปุ่ม Forgot Password แสดงเพียง Toast | ผู้ใช้ต้องให้ Admin เปลี่ยนรหัสผ่าน | เพิ่ม Reset Token ทางอีเมล |
| 12 | ไม่มี Pagination จริง | ปุ่ม 1 2 3 เป็นเพียง UI | สินค้าจำนวนมากจะโหลดช้า | เพิ่ม LIMIT/OFFSET และ API Pagination |
| 13 | การค้นหาวันที่ไม่มีผล | ช่องวันที่ไม่ถูกนำไปกรอง | ผู้ใช้อาจเข้าใจผิดว่าวันนั้นว่าง | เชื่อมกับการตรวจสต็อก/การจอง |
| 14 | ไม่มีการคืนสต็อก | ไม่มีหน้าคืนอุปกรณ์ | สต็อกลดแล้วไม่เพิ่มกลับอัตโนมัติ | เพิ่มสถานะการคืนและ Transaction คืนสต็อก |
| 15 | ไฟล์อัปโหลดไม่ถูกลบตามสินค้า | ลบแถว `EQUIPMENT` แต่ไฟล์ใน `uploads/` ยังอยู่ | เปลืองพื้นที่และอาจมีไฟล์กำพร้า | ลบไฟล์เมื่อลบสินค้า หรือทำ Cleanup Job |
| 16 | ข้อมูลตัวอย่างใน SQL | มีบัญชีและอุปกรณ์ตัวอย่าง | อาจเผลอใช้รหัสผ่านตัวอย่าง | เปลี่ยนรหัสผ่านและลบข้อมูลตัวอย่างก่อนใช้งานจริง |
| 17 | ไม่มี Audit Log | ไม่บันทึกว่าใครแก้ไขข้อมูล | ตรวจสอบย้อนหลังไม่ได้ | เพิ่มตาราง Audit Log |
| 18 | การแสดงผลใช้ `innerHTML` | ข้อมูลจาก DB ถูกแทรกใน HTML หลายจุด | เสี่ยง Stored XSS หากมีผู้ป้อน HTML อันตราย | Escape ข้อมูลก่อนแสดงผล |

### 12.2 รายละเอียดข้อจำกัดด้านความปลอดภัย

#### 12.2.1 รหัสผ่านแบบ Plaintext

ในตาราง `USER_ACCOUNT`

```sql
password VARCHAR(255) NOT NULL
```

โค้ด Login เปรียบเทียบ

```sql
SELECT * FROM USER_ACCOUNT
WHERE account_id = ? AND password = ?
```

และ Register/Admin  Insert ค่าที่รับมาตรง ๆ

ผลคือ

- ผู้ดูแลฐานข้อมูลอ่านรหัสผ่านทุกคนได้
- หาก Backup หลุด รหัสผ่านหลุด
- ผู้ใช้มักใช้รหัสผ่านซ้ำกับระบบอื่น จึงกระทบระบบอื่นด้วย
- ไม่มีการบังคับความแข็งแรงของรหัสผ่านใน Back-End นอกจากความยาวไม่เกิน 255

**สิ่งที่ต้องทำก่อนใช้งานจริง:** เปลี่ยนไปใช้ `bcrypt` หรือ `argon2` และไม่ส่งรหัสผ่านกลับไปใน Response

#### 12.2.2 Back-End ไม่มีการตรวจสิทธิ์

ทุก Endpoint ต่อไปนี้เรียกได้โดยไม่ต้อง Login

- `GET /api/users`
- `PUT /api/users/:accountId`
- `DELETE /api/users/:accountId`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/admins`
- `POST /api/admins`
- `PUT /api/admins/:accountId`
- `DELETE /api/admins/:accountId`

การป้องกันหน้า Admin มีเพียง `enforceAdminGuard()` ใน Front-End ซึ่งตรวจ `localStorage` และสามารถแก้ไขได้จาก Browser

**สิ่งที่ต้องทำก่อนใช้งานจริง:** เพิ่ม Authentication Middleware และตรวจ Role ใน Back-End ทุก Endpoint ที่สำคัญ

#### 12.2.3 การเช่าไม่สมบูรณ์

ตาราง `RENTAL`, `ITEM` และ `CONTRACT` ถูกสร้างไว้ แต่ Endpoint `POST /api/rentals` ไม่ได้เขียนข้อมูลลงตารางเหล่านี้

ผลที่ตามมา

- ไม่มีประวัติการเช่าในฐานข้อมูล
- ไม่สามารถดูรายการเช่าของลูกค้าแต่ละคน
- ไม่สามารถคำนวณรายได้ย้อนหลัง
- `rental_id` ที่แสดงเป็นเพียงเลขสุ่ม
- การลดสต็อกเกิดขึ้นทันทีแม้ยังไม่ได้ชำระเงิน

**สิ่งที่ต้องทำก่อนใช้งานจริง:** สร้าง `RENTAL`, `ITEM`, `CONTRACT` ใน Transaction เดียวกับการลดสต็อก และเพิ่มสถานะการชำระเงิน/การคืน

#### 12.2.4 ค่าจัดส่งไม่ถูกบันทึก

ค่าจัดส่ง 150 บาทเป็นค่าคงที่ใน Front-End

- ไม่มีในฐานข้อมูล
- ไม่ถูกส่งไปคำนวณฝั่ง Server
- ไม่ปรากฏในยอด `total_price` ที่ Back-End ตอบกลับ
- ไม่สามารถตรวจสอบย้อนหลังได้

**สิ่งที่ต้องทำก่อนใช้งานจริง:** กำหนดค่าจัดส่งในฐานข้อมูลหรือ Server และบันทึกเป็นส่วนหนึ่งของรายการเช่า

#### 12.2.5 รายการโปรดไม่ผูกกับบัญชี

การใช้ `localStorage` ทำให้

- ไม่ Sync ข้ามอุปกรณ์
- ไม่ Sync ข้าม Browser
- หายเมื่อล้างข้อมูล
- ไม่สามารถวิเคราะห์ความสนใจของลูกค้าได้

**สิ่งที่ต้องทำก่อนใช้งานจริง:** สร้างตาราง `FAVORITE` ที่มี `account_id` และ `equipment_id`

#### 12.2.6 การติดตั้งเฉพาะ Localhost

- Front-End Server ตั้งค่า `HOST = process.env.FRONTEND_HOST || 'localhost'`
- Back-End CORS อนุญาตเฉพาะ `http://localhost:3030`
- ไม่มี HTTPS
- ไม่มี Reverse Proxy
- ไม่มี Firewall Configuration
- ไม่มี Environment สำหรับ Production

**สิ่งที่ต้องทำก่อน Deploy:** ออกแบบสถาปัตยกรรม Production, ใช้ HTTPS, ตั้ง Reverse Proxy, จำกัด CORS, ใช้ Secrets Manager และตรวจสอบช่องโหว่ทั้งหมด

### 12.3 ข้อควรระวังในการใช้งานฐานข้อมูล

1. ห้ามรัน `lekhafong_production.sql` ซ้ำบนฐานข้อมูลที่มีข้อมูลอยู่
2. สำรองข้อมูลก่อนทดสอบคำสั่ง `DELETE` หรือ `UPDATE`
3. ห้ามใช้บัญชี root ใน `.env`
4. เก็บไฟล์ `.env` เป็นความลับ
5. อย่า Commit ไฟล์ Backup ขึ้น Git
6. ตรวจสอบชื่อฐานข้อมูลก่อนรัน SQL ทุกครั้ง
7. หลีกเลี่ยงการทดสอบกับฐานข้อมูลของเพื่อนร่วมทีม
8. ใช้ฐานข้อมูลแยก เช่น `lekhafong_test` สำหรับชุดทดสอบที่เขียนข้อมูล

### 12.4 ข้อควรระวังในการทดสอบ

- ใช้ฐานข้อมูลแยกสำหรับการทดสอบที่เขียนข้อมูล
- ก่อนทดสอบคำสั่ง `POST`, `PUT` หรือ `DELETE` ให้สำรองข้อมูลและตรวจสอบชื่อฐานข้อมูลให้แน่ใจ
- ห้ามชี้ Back-End หรือเครื่องมือทดสอบไปยังฐานข้อมูลพัฒนาที่มีข้อมูลจริง
- การทดสอบด้วย `curl` ที่มี `POST`, `PUT`, `DELETE` จะเปลี่ยนข้อมูลจริงในฐานข้อมูลที่เชื่อมต่ออยู่
- หลังทดสอบ ให้ตรวจสอบจำนวนอุปกรณ์และข้อมูลที่เกี่ยวข้องว่ายังถูกต้อง

---

## 13. คำถามที่พบบ่อย (FAQ)

### 13.1 ต้องใช้บัญชี root ของ MySQL สำหรับแอปพลิเคชันหรือไม่

ไม่ต้อง และ **ไม่ควรใช้** ให้ใช้ root เฉพาะตอนติดตั้งหรือสร้างผู้ใช้ครั้งแรก จากนั้นสร้างผู้ใช้เฉพาะเช่น `lekha_app` ที่มีสิทธิ์เพียงฐานข้อมูล `lekhafong_production`

### 13.2 ต้องใช้รหัสผ่าน MySQL อะไรในไฟล์ `.env`

ใช้รหัสผ่านของ Users ที่คุณสร้างในหัวข้อ 5.5 ไม่ใช่รหัสผ่าน root และไม่ใช่รหัสผ่านตัวอย่างในเอกสารนี้

### 13.3 ต้องรัน `npm ci` ทุกวันหรือไม่

ไม่ต้อง รันเมื่อติดตั้งครั้งแรกหรือเมื่อ Dependency เปลี่ยนเท่านั้น การเริ่มระบบปกติใช้ `npm start`

### 13.4 ถ้าปิดคอมพิวเตอร์ ข้อมูลจะหายหรือไม่

ไม่หาย ข้อมูลอยู่ใน MySQL Data Directory บนดิสก์ การปิดเครื่องหรือ Restart Server ไม่ลบข้อมูล

### 13.5 ถ้าลบโฟลเดอร์ `node_modules` ข้อมูลจะหายหรือไม่

ไม่หาย `node_modules` เก็บเฉพาะไลบรารีของโปรแกรม ไม่ใช่ข้อมูลธุรกิจ ให้รัน `npm ci` ใหม่เพื่อสร้างกลับ

### 13.6 ต้องใช้อินเทอร์เน็ตหรือไม่

- ครั้งแรกที่ `npm ci`: **ต้องใช้**
- การใช้งานปกติบน localhost: ไม่ต้องใช้สำหรับการเชื่อมต่อ API แต่หน้าเว็บโหลด Tailwind, Google Fonts, Font Awesome และโลโก้แบรนด์บางส่วนจากอินเทอร์เน็ต หากไม่มีเน็ต หน้าตาอาจไม่สมบูรณ์
- รูปที่อัปโหลดเอง: โหลดจาก Back-End ในเครื่อง ไม่ต้องใช้อินเทอร์เน็ต

### 13.7 `localhost` กับ `127.0.0.1` ต่างกันอย่างไร

ทั้งสองหมายถึงเครื่องเดียวกัน แต่ MySQL อาจแยกบัญชีผู้ใช้ตาม Host หากสร้างผู้ใช้เป็น `'user'@'localhost'` แล้วเชื่อมต่อด้วย `127.0.0.1` อาจเจอ Access Denied ให้สร้างผู้ใช้ให้ตรง Host หรือใช้ค่าเดียวกันทั้งสองฝั่ง

### 13.8 ทำไมต้องเปิดสอง Terminal

เพราะ Front-End และ Back-End เป็นคนละ Process และใช้คนละพอร์ต หากเปิดใน Terminal เดียว คำสั่งที่สองจะรอคำสั่งแรกจบ ซึ่งจะไม่เกิดขึ้นจนกว่าจะหยุด Server

### 13.9 ทำไมหน้าเว็บขึ้นแต่สินค้าไม่ขึ้น

สาเหตุที่พบบ่อยที่สุดคือ Back-End ไม่ได้รัน หรือ MySQL ไม่ได้เชื่อมต่อ ให้เปิด `http://localhost:3031/api/products` ตรวจก่อน หาก API ใช้ได้แต่หน้าเว็บไม่ขึ้น ให้ดู Console ของ Browser

### 13.10 ทำไม Login ด้วยอีเมลไม่ได้

ตรวจสอบว่า

- สมัครสำเร็จแล้ว
- อีเมลสะกดตรงกับในฐานข้อมูล
- รหัสผ่านถูกต้อง
- ใช้บัญชีที่อยู่ใน `CUSTOMER` หรือ `ADMIN`
- หากใช้ Username ให้ลองพิมพ์ Username แทนอีเมล

### 13.11 ทำไมสมัครสมาชิกแล้ว Login ไม่ได้ทันที

ระบบไม่ได้ Login อัตโนมัติหลังสมัคร เมื่อสมัครสำเร็จจะสลับไปแท็บ Login ให้กรอกอีเมล/Username และรหัสผ่านอีกครั้ง

### 13.12 ทำไมลบลูกค้าไม่ได้

อาจมีแถวใน `RENTAL` ที่อ้างถึง `customer_id` นั้นอยู่ Foreign Key จะป้องกันการลบ ให้ลบหรือย้ายข้อมูลการเช่าที่เกี่ยวข้องก่อน หรือเปลี่ยนสถานะแทนการลบ

### 13.13 ทำไมลบ Admin คนสุดท้ายไม่ได้

Back-End มีการป้องกันไม่ให้ระบบเหลือ Admin เป็นศูนย์ เพื่อไม่ให้ไม่มีใครจัดการระบบได้ หากต้องการเปลี่ยน Admin ให้เพิ่ม Admin ใหม่ก่อนแล้วค่อยลบคนเก่า

### 13.14 ทำไมรูปสินค้าไม่ขึ้น

ตรวจว่า

- Back-End รันอยู่
- ไฟล์อยู่ใน `backend/uploads/`
- Path ในฐานข้อมูลขึ้นต้นด้วย `/uploads/`
- เปิด URL รูปโดยตรงได้
- ไฟล์ไม่ใหญ่เกิน 5 MB และเป็น JPG/PNG/WEBP

### 13.15 ค่าจัดส่งถูกเก็บในฐานข้อมูลหรือไม่

ไม่ถูกเก็บ เป็นเพียงการคำนวณฝั่ง Front-End เพื่อแสดงยอดประเมิน ระบบบันทึกเฉพาะค่าเช่าอุปกรณ์ในผลลัพธ์การเช่า

### 13.16 รายการโปรดจะติดไปกับบัญชีหรือไม่

ไม่ รายการโปรดเก็บใน `localStorage` ของ Browser ที่ใช้อยู่ ไม่ผูกกับบัญชีและไม่ Sync ข้ามเครื่อง

### 13.17 เปลี่ยนพอร์ตได้หรือไม่

ทางทฤษฎีเปลี่ยน `PORT` ของ Back-End ได้ แต่ Front-End เรียก API ที่ 3031 ตายตัว และ CORS อนุญาตเฉพาะ 3030 จึงไม่แนะนำให้เปลี่ยนหากไม่แก้โค้ดทั้งสองฝั่ง

### 13.18 เปิดเว็บจากมือถือในวง LAN ได้หรือไม่

โดยค่าเริ่มต้นไม่ได้ เพราะ Front-End ผูก `localhost` และ CORS จำกัดเฉพาะ `http://localhost:3030` การเปิดให้เครื่องอื่นเข้าถึงต้องแก้ HOST, CORS, API URL และ Firewall ซึ่งอยู่นอกขอบเขตและยังไม่ปลอดภัยพอ

### 13.19 ต้องติดตั้ง Git หรือไม่

ไม่จำเป็น สามารถดาวน์โหลด ZIP ได้ แต่ Git ช่วยให้อัปเดตโค้ดและทำงานร่วมกับทีมได้สะดวกขึ้น

### 13.20 ทำไมมีไฟล์ SQL แค่ไฟล์เดียวแต่มี 8 ตาราง

ไฟล์เดียวรวมคำสั่ง `CREATE DATABASE`, `CREATE TABLE` ทั้ง 8 ตาราง, `ALTER TABLE`, `INSERT` ข้อมูลตัวอย่าง และ `UPDATE` สต็อกไว้ด้วยกัน เมื่อรันทั้งไฟล์จึงได้ฐานข้อมูลครบในครั้งเดียว

### 13.21 ทำไมไม่มีไฟล์ `search.html` หรือ `admin.html`

เพราะใช้ JavaScript-based Navigation เรนเดอร์ทุกหน้าอยู่ใน `index.html` ผ่าน `script.js` URL ใช้ Query String เช่น `?page=search` และ `?page=admin`

### 13.22 ระบบนี้ใช้จริงกับลูกค้าได้หรือยัง

ยังไม่ได้ เนื่องจากข้อจำกัดด้าน Plaintext Password, ไม่มี Authorization, การเช่าไม่ถูกบันทึก และค่าจัดส่งไม่ถูกจัดเก็บ ต้องแก้ไขตามหัวข้อ 12 ก่อน

---

## 14. ภาคผนวก

### 14.1 Command Cheat Sheet

| งาน | Windows (Command Prompt) | Windows (PowerShell) | Ubuntu / macOS |
|---|---|---|---|
| ดูเวอร์ชัน Node | `node -v` | `node -v` | `node -v` |
| ดูเวอร์ชัน npm | `npm -v` | `npm -v` | `npm -v` |
| เข้าโฟลเดอร์ | `cd backend` | `cd backend` | `cd backend` |
| ย้อนกลับหนึ่งชั้น | `cd ..` | `cd ..` | `cd ..` |
| ดูไฟล์ | `dir` | `dir` หรือ `ls` | `ls` |
| ติดตั้ง Dependency | `npm ci` | `npm ci` | `npm ci` |
| เริ่ม Back-End | `npm start` | `npm start` | `npm start` |
| หยุด Server | `Ctrl + C` | `Ctrl + C` | `Ctrl + C` |
| ดูพอร์ตที่ถูกใช้ | `netstat -ano \| findstr :3031` | `netstat -ano \| findstr :3031` | `lsof -i :3031` |
| เริ่ม MySQL | `net start MySQL80` | `net start MySQL80` | `sudo systemctl start mysql` |
| ดูสถานะ MySQL | `sc query MySQL80` | `sc query MySQL80` | `sudo systemctl status mysql` |
| ทดสอบ API | `curl.exe http://localhost:3031/api/products` | `curl.exe http://localhost:3031/api/products` | `curl http://localhost:3031/api/products` |

### 14.2 Port Summary

| บริการ | พอร์ต | URL | ต้องเปิดตลอดหรือไม่ |
|---|---|---|---|
| Front-End | 3030 | `http://localhost:3030` | ใช่ |
| Back-End | 3031 | `http://localhost:3031` | ใช่ |
| MySQL | 3306 | `127.0.0.1:3306` | ใช่ |
| MySQL Workbench | — | เชื่อมต่อ 3306 | เปิดเมื่อจัดการฐานข้อมูล |

### 14.3 File and Folder Checklist

ก่อนเริ่มระบบ ตรวจสอบว่ามีรายการต่อไปนี้

- [ ] `backend/database.js`
- [ ] `backend/package.json`
- [ ] `backend/package-lock.json`
- [ ] `backend/.env` (สร้างเอง)
- [ ] `backend/node_modules/` (หลัง `npm ci`)
- [ ] `frontend/frontserver.js`
- [ ] `frontend/index.html`
- [ ] `frontend/script.js`
- [ ] `frontend/style.css`
- [ ] `frontend/package.json`
- [ ] `frontend/package-lock.json`
- [ ] `frontend/node_modules/` (หลัง `npm ci`)
- [ ] `lekhafong_production.sql`
- [ ] ฐานข้อมูล `lekhafong_production` พร้อม 8 ตาราง

### 14.4 Database Table Summary

| ตาราง | หน้าที่ | ใช้งานโดยหน้าเว็บ |
|---|---|---|
| `USER_ACCOUNT` | บัญชีผู้ใช้และ Role | Login, Register, Admin |
| `CUSTOMER` | ข้อมูลลูกค้า | Register, Admin Users |
| `ADMIN` | ข้อมูลผู้ดูแลระบบ | Login, Admin Admins |
| `LOGIN` | ประวัติการเข้าสู่ระบบ | Login |
| `EQUIPMENT` | ข้อมูลอุปกรณ์และสต็อก | Home, Search, Detail, Admin Products |
| `CONTRACT` | สัญญาเช่า | ยังไม่ถูกใช้งานโดย API |
| `RENTAL` | รายการเช่า | ยังไม่ถูกใช้งานโดย API |
| `ITEM` | รายการอุปกรณ์ในสัญญา | ยังไม่ถูกใช้งานโดย API |

### 14.5 Seed Data Summary

| รายการ | จำนวนโดยประมาณจากไฟล์ SQL |
|---|---|
| บัญชีผู้ใช้ | 2 |
| Admin | 1 |
| Customer | 1 |
| Equipment | 14 |
| Contract | 0 |
| Rental | 0 |
| Item | 0 |

> จำนวนอาจเปลี่ยนหากมีการเพิ่มหรือลบข้อมูลระหว่างการทดสอบ

### 14.6 สรุปขั้นตอนแบบเร็ว (Quick Start)

สำหรับผู้ที่ติดตั้งโปรแกรมครบแล้วและมีฐานข้อมูลแล้ว

```bash
# Terminal 1
cd lekhaFong/backend
npm ci
npm start
```

```bash
# Terminal 2
cd lekhaFong/frontend
npm ci
npm start
```

เปิด `http://localhost:3030`

### 14.7 เอกสารอ้างอิง

- Visual Studio Code: <https://code.visualstudio.com/docs>
- Node.js: <https://nodejs.org/en/docs>
- npm CLI: <https://docs.npmjs.com/cli/v10>
- Express: <https://expressjs.com/>
- mysql2: <https://github.com/sidorares/node-mysql2>
- MySQL Community Server: <https://dev.mysql.com/doc/refman/8.0/en/>
- MySQL Workbench: <https://dev.mysql.com/doc/workbench/en/>
- dotenv: <https://github.com/motdotla/dotenv>
- Multer: <https://github.com/expressjs/multer>
- SQL Injection Prevention: <https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html>
- Password Storage: <https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html>

---

## สรุป

LeKhaFong Production เป็นเว็บแอปพลิเคชันเช่าอุปกรณ์ถ่ายทำที่แบ่งระบบออกเป็น Front-End (พอร์ต 3030), Back-End REST API (พอร์ต 3031) และ MySQL (พอร์ต 3306) อย่างชัดเจน การใช้งานต้องเปิดทั้งสามส่วนพร้อมกันและต้องสร้างไฟล์ `backend/.env` ด้วยข้อมูล MySQL ของผู้ใช้เอง

เอกสารนี้ครอบคลุมการติดตั้งตั้งแต่เริ่มต้น การสร้างฐานข้อมูล การนำเข้า SQL การตั้งค่า Environment Variables การรัน Server การทดสอบหน้าเว็บทั้ง 8 ส่วน การทดสอบ REST API การแก้ไขปัญหา และข้อจำกัดของระบบ โดยเน้นการใช้งานบนเครื่อง Local เพื่อการทดสอบและการศึกษาเท่านั้น

หากพบปัญหาที่ไม่อยู่ในหัวข้อ 11 ให้ตรวจสอบข้อความ Error ใน Terminal และ Browser Console แล้วบันทึกข้อความนั้นไว้ก่อนสอบถามทีมงาน
