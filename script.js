const $ = (s, r = document) => r.querySelector(s);

        /* ============================================================================
           1. SVG ICONS & UI DATA (ข้อมูลเริ่มต้นสำหรับแสดงผล UI)
           ============================================================================ */
        const I = {
            search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
            sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
            user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
            calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
            camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
            lens: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3.5"/><path d="m4.9 4.9 4.2 4.2M14.9 14.9l4.2 4.2M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2"/>',
            mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
            bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
            laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
            speaker: '<rect width="16" height="20" x="4" y="2" rx="2"/><circle cx="12" cy="14" r="4"/><line x1="12" x2="12.01" y1="6" y2="6"/>',
            video: '<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
            arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
            arrowL: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
            shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
            clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
            truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
            mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
            chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
            stand: '<rect x="8.5" y="2.5" width="7" height="4" rx="1"/><path d="M12 6.5V12"/><path d="m12 12-6 9.5"/><path d="m12 12 6 9.5"/><path d="M12 12v9.5"/>',
            plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
            heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
            percent: '<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
            sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
            store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 12v8h14v-8"/><path d="M10 20v-5h4v5"/>',
            check: '<path d="M20 6 9 17l-5-5"/>',
            pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
        };
        const ic = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
        const baht = n => '฿' + n.toLocaleString('en-US');

        const MENU = [
            ['หน้าหลัก', 'home'],
            ['กล้อง', 'search', 0],
            ['เลนส์', 'search', 1],
            ['อุปกรณ์เสริม', 'search', 2],
            ['เงื่อนไข', 'terms'],
            ['ทีมงาน', 'team']
        ];
        const CATS = [
            ['กล้อง', 'camera'],
            ['เลนส์', 'lens'],
            ['ไฟสตูดิโอ', 'bulb'],
            ['ไมค์ & เสียง', 'mic'],
            ['คอมพิวเตอร์', 'laptop'],
            ['ลำโพง', 'speaker']
        ];

        // ข้อมูลสินค้าตัวอย่าง (เมื่อต่อ MySQL แล้วจะดึงจาก apiFetchProducts() มาทับตัวแปรนี้)
        let P = [
            { id: 'CAM-001', n: 'Sony A7 IV', c: 'กล้อง', brand: 'Sony', i: 'camera', p: 900, b: 'Popular', s: '33MP Full-frame · 4K60', stock: 3 },
            { id: 'CAM-002', n: 'Canon EOS R6', c: 'กล้อง', brand: 'Canon', i: 'camera', p: 850, s: '20MP · กันสั่น 8 stops', stock: 4 },
            { id: 'LNS-001', n: 'Sigma 24-70mm f/2.8', c: 'เลนส์', brand: 'Sigma', i: 'lens', p: 450, s: 'E-mount · Art series', stock: 5 },
            { id: 'MIC-001', n: 'DJI Mic 2', c: 'ไมค์ & เสียง', brand: 'DJI', i: 'mic', p: 300, b: 'New', s: 'ไร้สาย 2 ตัว · ไกล 250 ม.', stock: 6 },
            { id: 'LGT-001', n: 'Aputure 300D II', c: 'ไฟสตูดิโอ', brand: 'Aputure', i: 'bulb', p: 700, b: 'New', s: '300W Daylight · Bowens', stock: 2 },
            { id: 'CMP-001', n: 'MacBook Pro 14"', c: 'คอมพิวเตอร์', brand: 'Apple', i: 'laptop', p: 650, s: 'M3 Pro · RAM 18GB', stock: 3 },
            { id: 'SPK-001', n: 'JBL PartyBox 310', c: 'ลำโพง', brand: 'JBL', i: 'speaker', p: 800, s: '240W · แบต 18 ชม.', stock: 2 },
            { id: 'CAM-003', n: 'GoPro Hero 12', c: 'กล้อง', brand: 'GoPro', i: 'video', p: 350, b: '-20%', s: '5.3K · กันน้ำ 10 ม.', stock: 7 },
            { id: 'LGT-002', n: 'Godox SL60W', c: 'ไฟสตูดิโอ', brand: 'Godox', i: 'bulb', p: 350, s: '60W LED · Bowens', stock: 4 },
            { id: 'MIC-002', n: 'Rode NTG3', c: 'ไมค์ & เสียง', brand: 'Rode', i: 'mic', p: 400, s: 'Shotgun · กันความชื้น', stock: 3 },
            { id: 'CMP-002', n: 'Dell XPS 15', c: 'คอมพิวเตอร์', brand: 'Dell', i: 'laptop', p: 500, s: 'OLED 3.5K · RTX 4060', stock: 2 },
            { id: 'CAM-004', n: 'Sony FX3', c: 'กล้อง', brand: 'Sony', i: 'video', p: 1800, b: 'Hot', s: 'Cinema Line · 4K120', stock: 2 }
        ];

        const SL = [
            { tag: 'Recommendation', title: 'Pick of the <em>week</em>.', sub: 'Sony A7 IV พร้อมเลนส์ 24-70 ชุดยอดนิยมของช่างภาพงานแต่ง', cta: 'ดูอุปกรณ์', icon: 'camera', item: 0 },
            { tag: 'New update', title: 'Fresh in the <em>studio</em>.', sub: 'ไฟ Aputure และไมค์ไร้สาย DJI รุ่นใหม่ เพิ่งเข้าระบบวันนี้', cta: 'ดูของมาใหม่', icon: 'bulb', item: 4 },
            { tag: 'Promotion', title: 'Rent three, <em>pay two</em>.', sub: 'เช่า 3 วัน จ่ายเพียง 2 วัน สำหรับอุปกรณ์ทุกหมวด ถึงสิ้นเดือนนี้', cta: 'รับโปรโมชั่น', icon: 'percent', item: 7 }
        ];

        const STEPS = [
            ['เลือก & จองวัน', 'เลือกอุปกรณ์ ระบุวันรับ–คืน ระบบแสดงคิวว่างให้ทันที', 'search'],
            ['ชำระมัดจำ', 'มัดจำ 30% ของค่าเช่าเพื่อยืนยันการจอง จ่ายผ่าน PromptPay', 'shield'],
            ['รับอุปกรณ์', 'ตรวจสภาพร่วมกันที่ร้าน หรือให้จัดส่งถึงที่พร้อมเอกสารยืนยันตัวตน', 'truck'],
            ['คืนตรงเวลา', 'คืนภายในเวลาที่ตกลง ตรวจเช็กแล้วรับเงินมัดจำคืนภายใน 24 ชม.', 'clock']
        ];

        const POL = [
            ['ค่ามัดจำและการคืนเงิน', 'วางมัดจำ 30% ของค่าเช่า (ขั้นต่ำ ฿500) เพื่อยืนยันการจอง เมื่อคืนอุปกรณ์และตรวจสภาพเรียบร้อยแล้ว ระบบจะคืนเงินมัดจำเต็มจำนวนภายใน 24 ชั่วโมง'],
            ['ระยะเวลาเช่าและการคืนล่าช้า', 'คิดค่าเช่าเป็นรายวัน (24 ชั่วโมง) ขั้นต่ำ 1 วัน หากคืนล่าช้าเกิน 2 ชั่วโมง คิดเพิ่ม 50% ของค่าเช่ารายวัน และเกินกว่า 1 วันคิดเต็มวัน'],
            ['การยกเลิกและเลื่อนวัน', 'ยกเลิกหรือเลื่อนวันได้ฟรีล่วงหน้า 48 ชั่วโมง หลังจากนั้นหักค่าธรรมเนียม 20% ของค่าเช่า กรณีฝนตกหนักหรือเหตุสุดวิสัย ติดต่อทีมงานเพื่อเลื่อนวันได้'],
            ['ความเสียหายและการสูญหาย', 'ตรวจสภาพร่วมกันทุกครั้งตอนรับและคืน หากเกิดความเสียหายจากการใช้งาน ผู้เช่ารับผิดชอบตามค่าซ่อมจริง กรณีสูญหายคิดตามราคาตลาดของอุปกรณ์'],
            ['เอกสารยืนยันตัวตน', 'ใช้บัตรประชาชนหรือพาสปอร์ตพร้อมสลิปชำระมัดจำ สำหรับอุปกรณ์มูลค่าสูงอาจขอเอกสารเพิ่มเติม ข้อมูลทั้งหมดเก็บเป็นความลับตาม PDPA']
        ];

        const DET = [
            ['Sony', 'Alpha', 'ILCE-7M4', [['เซนเซอร์', 'Full-frame 33MP'], ['วิดีโอ', '4K60 10-bit'], ['กันสั่น', '5-axis IBIS'], ['เมาท์', 'Sony E'], ['แบตเตอรี่', 'NP-FZ100 × 2'], ['ในกล่อง', 'บอดี้ + ที่ชาร์จ + การ์ด 128GB']]],
            ['Canon', 'EOS R', 'R6', [['เซนเซอร์', 'Full-frame 20MP'], ['วิดีโอ', '4K60'], ['กันสั่น', 'IBIS 8 stops'], ['เมาท์', 'Canon RF'], ['แบตเตอรี่', 'LP-E6NH × 2'], ['ในกล่อง', 'บอดี้ + ที่ชาร์จ + การ์ด 128GB']]],
            ['Sigma', 'Art', '24-70mm f/2.8 DG DN', [['ช่วงเลนส์', '24–70 mm'], ['รูรับแสง', 'f/2.8 คงที่'], ['เมาท์', 'Sony E'], ['น้ำหนัก', '830 g'], ['ฟิลเตอร์', '82 mm'], ['ในกล่อง', 'เลนส์ + ฮูด + ฝาปิด']]],
            ['DJI', 'Mic', 'Mic 2 (2 TX + 1 RX)', [['ระบบ', 'ไร้สาย 2.4 GHz'], ['ระยะรับส่ง', 'สูงสุด 250 ม.'], ['แบตเตอรี่', 'ใช้งาน 18 ชม. พร้อมเคส'], ['บันทึกในตัว', '32-bit float'], ['การเชื่อมต่อ', 'USB-C / 3.5 mm / Lightning'], ['ในกล่อง', 'ตัวส่ง 2 + ตัวรับ 1 + เคสชาร์จ']]],
            ['Aputure', 'LS', 'LS 300d II', [['กำลังไฟ', '300W Daylight 5600K'], ['CRI / TLCI', '96+ / 97+'], ['เมาท์', 'Bowens'], ['ควบคุม', 'แอป Sidus Link'], ['ไฟเลี้ยง', 'AC / V-mount'], ['ในกล่อง', 'หัวไฟ + คอนโทรลบ็อกซ์ + รีเฟล็กเตอร์']]],
            ['Apple', 'MacBook Pro', '14" M3 Pro', [['ชิป', 'M3 Pro 11-core'], ['RAM', '18 GB'], ['SSD', '512 GB'], ['จอ', 'Liquid Retina XDR'], ['พอร์ต', '3 × Thunderbolt 4, HDMI, SD'], ['ในกล่อง', 'เครื่อง + อะแดปเตอร์ 70W']]],
            ['JBL', 'PartyBox', '310', [['กำลังขับ', '240W RMS'], ['แบตเตอรี่', 'สูงสุด 18 ชม.'], ['ไฟ', 'LED Light Show'], ['ช่องไมค์', 'Mic / Guitar × 2'], ['กันน้ำ', 'IPX4'], ['ในกล่อง', 'ลำโพง + สายชาร์จ + ล้อลาก']]],
            ['GoPro', 'Hero', 'HERO12 Black', [['วิดีโอ', '5.3K60 / 4K120'], ['กันสั่น', 'HyperSmooth 6.0'], ['กันน้ำ', '10 ม.'], ['แบตเตอรี่', 'Enduro 1720 mAh'], ['จอ', 'หน้า + หลัง'], ['ในกล่อง', 'กล้อง + เคส + เมาท์ 3 แบบ']]],
            ['Godox', 'SL', 'SL60W', [['กำลังไฟ', '60W LED 5600K'], ['CRI', '95+'], ['เมาท์', 'Bowens'], ['ปรับแสง', '10–100%'], ['ไฟเลี้ยง', 'AC'], ['ในกล่อง', 'หัวไฟ + รีเฟล็กเตอร์ + ขาไฟ']]],
            ['Rode', 'NTG', 'NTG3', [['รูปแบบ', 'Shotgun Supercardioid'], ['ความต้านทาน', 'ทนความชื้น'], ['พลังงาน', 'Phantom 48V'], ['ย่านความถี่', '40 Hz – 20 kHz'], ['ความยาว', '25 cm'], ['ในกล่อง', 'ไมค์ + ช็อกเมาท์ + ขนกันลม']]],
            ['Dell', 'XPS', 'XPS 15 9530', [['CPU', 'Intel Core i7 H-series'], ['GPU', 'RTX 4060'], ['RAM', '32 GB'], ['SSD', '1 TB'], ['จอ', 'OLED 3.5K'], ['ในกล่อง', 'เครื่อง + อะแดปเตอร์ 130W']]],
            ['Sony', 'Cinema Line', 'ILME-FX3', [['เซนเซอร์', 'Full-frame 12.1MP'], ['วิดีโอ', '4K120 10-bit'], ['ISO', 'Dual base 800 / 12800'], ['ระบายความร้อน', 'พัดลมในตัว'], ['เมาท์', 'Sony E'], ['ในกล่อง', 'บอดี้ + XLR handle + แบต 2']]]
        ];

        const TYPES = ['กล้อง', 'เลนส์', 'อุปกรณ์เสริม'];
        const typeOf = p => p.c === 'กล้อง' ? 0 : p.c === 'เลนส์' ? 1 : 2;
        const PAGE_VARIANT = { home: 'a', search: 'a', terms: 'd', team: 'd', detail: 'd', admin: 'd' };

        // สถานะปัจจุบันของแอปพลิเคชัน
        const state = {
            p: 'home',
            slide: 0,
            item: 0,
            type: -1,
            isAdmin: false,
            currentUser: null,
            filters: { keyword: '', pickupDate: '', returnDate: '', maxPrice: 3000, brand: 'ทุกยี่ห้อ' }
        };

        /* ============================================================================
           2. MYSQL & BACKEND API PLACEHOLDERS (เว้นจุดเชื่อมต่อ Database MySQL)
           หมายเหตุ: เปลี่ยน API_BASE_URL ให้ตรงกับ Backend Server (Node.js / PHP / Python)
           ============================================================================ */
        const API_BASE_URL = '/api';

        /**
         * [API 1] ดึงรายการอุปกรณ์ทั้งหมด / ค้นหา / กรองขั้นสูงจาก MySQL
         * Endpoint: GET /api/products?keyword=...&type=...&maxPrice=...&brand=...&start=...&end=...
         * MySQL Table: `products` LEFT JOIN `bookings` (เช็กคิวว่างตามวันที่รับ-คืน)
         */
        async function apiFetchProducts(filters = {}) {
            try {
                // TODO: เปิดใช้งานเมื่อเชื่อมต่อ Backend API จริง
                // const query = new URLSearchParams(filters).toString();
                // const res = await fetch(`${API_BASE_URL}/products?${query}`);
                // const data = await res.json();
                // P = data.products;
                // return data.products;
                console.log('[MySQL API Placeholder] apiFetchProducts:', filters);
                return P;
            } catch (err) {
                console.error('Error fetching products:', err);
                return P;
            }
        }

        /**
         * [API 2] ดึงรายละเอียดอุปกรณ์และตารางคิวว่างรายชิ้น
         * Endpoint: GET /api/products/:productId
         * MySQL Table: `products`, `product_specs`, `bookings`
         */
        async function apiFetchProductDetail(productId) {
            try {
                // TODO: เปิดใช้งานเมื่อเชื่อมต่อ Backend API จริง
                // const res = await fetch(`${API_BASE_URL}/products/${productId}`);
                // return await res.json();
                console.log('[MySQL API Placeholder] apiFetchProductDetail:', productId);
            } catch (err) {
                console.error('Error fetching product detail:', err);
            }
        }

        /**
         * [API 3] บันทึกคำสั่งจองเช่าอุปกรณ์ลงฐานข้อมูล MySQL
         * Endpoint: POST /api/bookings
         * Payload: { user_id, product_id, pickup_method, pickup_date, return_date, total_price, deposit_amount }
         * MySQL Table: `bookings`
         */
        async function apiCreateBooking(bookingPayload) {
            try {
                // TODO: ส่งข้อมูลการจองไปบันทึกใน MySQL
                // const res = await fetch(`${API_BASE_URL}/bookings`, {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(bookingPayload)
                // });
                // return await res.json();
                console.log('[MySQL API Placeholder] apiCreateBooking:', bookingPayload);
                alert(`บันทึกคำขอเช่า "${bookingPayload.productName}" เรียบร้อยแล้ว!
(พร้อมเชื่อมต่อ API: POST /api/bookings ลง MySQL)`);
            } catch (err) {
                console.error('Error creating booking:', err);
            }
        }

        /**
         * [API 4] บันทึก / ยกเลิก รายการโปรด (Favorite)
         * Endpoint: POST /api/favorites/toggle
         * Payload: { user_id, product_id }
         * MySQL Table: `user_favorites`
         */
        async function apiToggleFavorite(productId) {
            try {
                // TODO: บันทึกรายการโปรดลง MySQL
                // await fetch(`${API_BASE_URL}/favorites/toggle`, {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ user_id: state.currentUser?.id, product_id: productId })
                // });
                console.log('[MySQL API Placeholder] apiToggleFavorite:', productId);
            } catch (err) {
                console.error('Error toggling favorite:', err);
            }
        }

        /**
         * [API 5] ตรวจสอบการเข้าสู่ระบบ (Authentication) จากตาราง users ใน MySQL
         * Endpoint: POST /api/auth/login
         * Payload: { email, password }
         * Response: { success: true, user: { id, email, first_name, role: 'admin' | 'customer' }, token }
         */
        async function apiLoginUser(email, password) {
            try {
                // TODO: เชื่อมต่อ API Login จริงกับ MySQL
                // const res = await fetch(`${API_BASE_URL}/auth/login`, {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ email, password })
                // });
                // return await res.json();
                console.log('[MySQL API Placeholder] apiLoginUser:', { email });
                return null;
            } catch (err) {
                console.error('Login API error:', err);
                return null;
            }
        }

        /**
         * [API 6] สมัครสมาชิกใหม่ (Register) บันทึกลงตาราง users ใน MySQL
         * Endpoint: POST /api/auth/register
         * Payload: { first_name, last_name, email, phone, address, password }
         * MySQL Table: `users`
         */
        async function apiRegisterUser(userData) {
            try {
                // TODO: ส่งข้อมูลสมัครสมาชิกไปบันทึกใน MySQL
                // const res = await fetch(`${API_BASE_URL}/auth/register`, {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(userData)
                // });
                // return await res.json();
                console.log('[MySQL API Placeholder] apiRegisterUser:', userData);
                alert('สมัครสมาชิกสำเร็จ! (พร้อมเชื่อมต่อ API: POST /api/auth/register ลง MySQL)');
                switchAuthTab('login');
            } catch (err) {
                console.error('Register API error:', err);
            }
        }

        /**
         * [API 7 - 11] ระบบจัดการหลังบ้านสำหรับ Admin (CRUD Users & Products ใน MySQL)
         */
        async function apiAdminFetchUsers() {
            // GET /api/admin/users -> SELECT id, username, email, phone, address FROM users;
            console.log('[MySQL API Placeholder] GET /api/admin/users');
        }
        async function apiAdminUpdateUser(username, payload) {
            // PUT /api/admin/users/:username -> UPDATE users SET ... WHERE username = ?;
            console.log('[MySQL API Placeholder] PUT /api/admin/users/' + username, payload);
            alert(`อัปเดตข้อมูลผู้ใช้ ${username} สำเร็จ (พร้อมเชื่อม MySQL)`);
        }
        async function apiAdminDeleteUser(username) {
            // DELETE /api/admin/users/:username -> DELETE FROM users WHERE username = ?;
            console.log('[MySQL API Placeholder] DELETE /api/admin/users/' + username);
            alert(`ลบผู้ใช้ ${username} ออกจากระบบแล้ว (พร้อมเชื่อม MySQL)`);
            backToUserList();
        }
        async function apiAdminAddProduct(productData) {
            // POST /api/admin/products -> INSERT INTO products (product_id, name, rent_price, stock) VALUES (...);
            console.log('[MySQL API Placeholder] POST /api/admin/products', productData);
            alert(`เพิ่มสินค้าใหม่ "${productData.name}" ลงฐานข้อมูลสำเร็จ!`);
            backToProductList();
        }
        async function apiAdminUpdateProduct(productId, productData) {
            // PUT /api/admin/products/:id -> UPDATE products SET name=?, rent_price=?, stock=? WHERE product_id=?;
            console.log('[MySQL API Placeholder] PUT /api/admin/products/' + productId, productData);
            alert(`อัปเดตข้อมูลสินค้า ${productId} สำเร็จ!`);
        }
        async function apiAdminDeleteProduct(productId) {
            // DELETE /api/admin/products/:id -> DELETE FROM products WHERE product_id=?;
            console.log('[MySQL API Placeholder] DELETE /api/admin/products/' + productId);
            alert(`ลบสินค้า ${productId} ออกจากระบบแล้ว!`);
            backToProductList();
        }

        /* ============================================================================
           3. HISTORY STACK & NAVIGATION (ระบบเปลี่ยนหน้า รองรับ Back / Forward และตัด Stack เมื่อกลับ Home)
           ============================================================================ */
        let currentDepth = 0;
        let resetForwardStack = false;

        // ฟังก์ชันเปลี่ยนหน้าหลักของเว็บไซต์ (รองรับทั้งชื่อหน้า 'home' และ ID 'home-view')
        function goToPage(pageInput, options = {}, addHistory = true) {
            const page = pageInput.replace('-view', '');

            // หากกลับมาหน้า home ให้ถอย Stack กลับไปจุดเริ่มต้นและตัดหน้าเก่าใน Forward Stack ทิ้ง
            if (addHistory && page === 'home') {
                if (currentDepth > 0) {
                    resetForwardStack = true;
                    history.go(-currentDepth);
                    return;
                } else {
                    history.replaceState({ page: 'home', type: -1, item: 0, depth: 0 }, '', '?page=home');
                    addHistory = false;
                }
            }

            state.p = page;
            if (options.type !== undefined) state.type = options.type;
            if (options.item !== undefined) state.item = options.item;

            if (addHistory && page !== 'home') {
                currentDepth++;
                history.pushState(
                    { page: state.p, type: state.type, item: state.item, depth: currentDepth },
                    '',
                    `?page=${state.p}`
                );
            }

            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Alias เพื่อความเข้ากันได้กับโค้ดเดิมที่เรียก switchView('home-view')
        function switchView(viewId, addHistory = true) {
            goToPage(viewId, {}, addHistory);
        }

        // ดักจับการกดปุ่ม ย้อนกลับ (Backward) และ ไปข้างหน้า (Forward) ของเบราว์เซอร์
        window.addEventListener('popstate', (event) => {
            const st = event.state || { page: 'home', type: -1, item: 0, depth: 0 };
            currentDepth = st.depth || 0;
            state.p = st.page || 'home';
            state.type = st.type !== undefined ? st.type : -1;
            state.item = st.item !== undefined ? st.item : 0;

            render();

            // ตัดประวัติหน้าถัดไป (Forward Stack) ทิ้งเมื่อถอยกลับมาหน้า home
            if (resetForwardStack && state.p === 'home') {
                resetForwardStack = false;
                history.pushState({ page: 'home', type: -1, item: 0, depth: 0 }, '', '?page=home');
            }
        });

        // ตั้งค่าหน้าเริ่มต้นเวลาโหลดเว็บหรือกด Refresh
        window.addEventListener('DOMContentLoaded', () => {
            const params = new URLSearchParams(window.location.search);
            const initialPage = params.get('page') || 'home';
            currentDepth = 0;
            history.replaceState({ page: initialPage, type: state.type, item: state.item, depth: 0 }, '', `?page=${initialPage}`);
            state.p = initialPage;
            render();
        });

        /* ============================================================================
           4. UI COMPONENTS (ส่วนประกอบแต่ละโซนของหน้าเว็บพร้อม Comment)
           ============================================================================ */
        const eyebrow = t => `<span class="eyebrow">${t}</span>`;
        const goAttrs = (k, t) => `data-go="${k}"${t === undefined ? '' : ` data-type="${t}"`}`;

        /* ---------- [COMPONENT 1] LOGO & BLINKING BRAND NAME (โลโก้เดิม + ชื่อเว็บกระพริบ) ---------- */
        const logo = () => `
            <a class="logo" href="#" data-go="home" aria-label="LekhaFong หน้าแรก">
                <img src="lekhaFongLogo.png" alt="logo" width="46">
                <span class="animate-pulse brand-pulse" style="text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.745);">Lekha<b>Fong</b></span>
            </a>
        `;

        /* ---------- [COMPONENT 2] NAVBAR (แถบเมนูด้านบน) ---------- */
        function nav() {
            const active = state.p === 'home' ? 0
                : state.p === 'terms' ? 4
                : state.p === 'team' ? 5
                : state.p === 'detail' ? 1 + typeOf(P[state.item])
                : state.type >= 0 ? 1 + state.type : -1;

            const adminBtnHtml = state.isAdmin
                ? `<button id="nav-admin-link" type="button" onclick="goToPage('admin')" class="btn btn-ink btn-sm"><i class="fa-solid fa-shield-halved"></i> แอดมิน</button>`
                : `<button id="nav-admin-link" type="button" onclick="goToPage('admin')" class="btn btn-ink btn-sm hidden"><i class="fa-solid fa-shield-halved"></i> แอดมิน</button>`;

            const loginBtnHtml = state.isAdmin
                ? ``
                : `<button id="nav-login-btn" type="button" class="btn btn-accent" onclick="toggleModal('login-modal')">${ic('user')}${state.currentUser ? state.currentUser : 'เข้าสู่ระบบ'}</button>`;

            return `
            <!-- ==================== NAVBAR ==================== -->
            <header class="nav dnav">
                <div class="nav-in">
                    ${logo()}
                    <div class="dicons">
                        ${adminBtnHtml}
                        <button type="button" class="icon-btn" aria-label="รายการโปรด" onclick="goToPage('search', { type: -1 })">${ic('heart')}</button>
                        ${loginBtnHtml}
                    </div>
                </div>
                <div class="dsub">
                    <nav class="nav-links" aria-label="เมนูหลัก">
                        ${MENU.map(([l, k, t], i) => `<a href="#" ${goAttrs(k, t)} class="${i === active ? 'on' : ''}" ${i === active ? 'aria-current="page"' : ''}>${l}</a>`).join('')}
                    </nav>
                </div>
            </header>`;
        }

        /* ---------- [COMPONENT 3] SEARCH BAR & ADVANCE SEARCH PANEL (ช่องค้นหา + ตัวกรองขั้นสูง) ---------- */
        function advPanel(open = false) {
            return `
            <!-- แผงตัวกรองขั้นสูง (Advance Search Panel - ไม่เก็บลง History Stack) -->
            <div class="adv-panel" ${open ? '' : 'hidden'}>
                <div class="adv-grid">
                    <div>
                        <span class="t">หมวดหมู่</span>
                        <div class="chips">${CATS.map((c, i) => `<button type="button" class="chip ${i === 0 ? 'on' : ''}" data-chip>${c[0]}</button>`).join('')}</div>
                    </div>
                    <div>
                        <span class="t">ราคาต่อวัน</span>
                        <div class="range-row">
                            <input id="adv-max-price" type="range" min="0" max="3000" value="1800" aria-label="ราคาสูงสุดต่อวัน">
                            <span class="range-val">฿1,800</span>
                        </div>
                    </div>
                    <div>
                        <span class="t">ยี่ห้อ</span>
                        <select id="adv-brand" class="field" aria-label="ยี่ห้อ">
                            <option value="ทุกยี่ห้อ">ทุกยี่ห้อ</option>
                            <option value="Sony">Sony</option>
                            <option value="Canon">Canon</option>
                            <option value="DJI">DJI</option>
                            <option value="Aputure">Aputure</option>
                        </select>
                    </div>
                    <div>
                        <span class="t">สถานะ</span>
                        <div class="checks">
                            <label><input type="checkbox" checked>ว่างพร้อมเช่า</label>
                            <label><input type="checkbox">มีโปรโมชั่น</label>
                            <label><input type="checkbox">มาใหม่</label>
                        </div>
                    </div>
                </div>
                <div class="adv-actions">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="resetAdvanceFilters()">ล้างค่า</button>
                    <button type="button" class="btn btn-accent btn-sm" onclick="applyAdvanceSearch()">ใช้ตัวกรอง</button>
                </div>
            </div>`;
        }

        function searchBlock() {
            return `
            <!-- แถบค้นหาหลัก (Search Bar) -->
            <div class="sb-row sb-d">
                <form class="sb" role="search" onsubmit="submitSearchBar(event)">
                    <label class="sb-seg grow">
                        <span>อุปกรณ์</span>
                        <input id="sb-keyword" type="search" value="${state.filters.keyword}" placeholder="กล้อง ไฟ ไมค์...">
                    </label>
                    <label class="sb-seg">
                        <span>วันรับ</span>
                        <input id="sb-pickup" type="text" onfocus="(this.type='date')" onblur="if(!this.value)this.type='text'" placeholder="เพิ่มวันที่">
                    </label>
                    <label class="sb-seg">
                        <span>วันคืน</span>
                        <input id="sb-return" type="text" onfocus="(this.type='date')" onblur="if(!this.value)this.type='text'" placeholder="เพิ่มวันที่">
                    </label>
                    <button type="submit" class="btn btn-accent sb-go">${ic('search')}ค้นหา</button>
                </form>
                <button type="button" class="adv-btn" data-adv aria-expanded="false">${ic('sliders')}ค้นหาขั้นสูง</button>
            </div>`;
        }

        /* ---------- [COMPONENT 4] PRODUCT CARD (การ์ดแสดงสินค้าแต่ละชิ้น) ---------- */
        const card = (p, i, cls = '') => `
            <article class="card ${cls}" data-detail="${P.indexOf(p)}">
                <div class="card-img t${i % 3}">
                    ${ic(p.i)}
                    ${p.b ? `<span class="badge">${p.b}</span>` : ''}
                    <button type="button" class="fav" aria-label="บันทึก ${p.n}" onclick="event.stopPropagation(); this.classList.toggle('on'); apiToggleFavorite('${p.id}')">${ic('heart')}</button>
                </div>
                <div class="card-body">
                    <span class="card-cat">${p.c}</span>
                    <h3>${p.n}</h3>
                    <p class="card-spec">${p.s}</p>
                    <div class="card-foot">
                        <span class="price"><b>${baht(p.p)}</b><small>/วัน</small></span>
                        <a href="#" class="go" aria-label="เช่า ${p.n}">${ic('arrow')}</a>
                    </div>
                </div>
            </article>`;

        /* ---------- [COMPONENT 5] HOME VIEW (แบนเนอร์ + ค้นหา + หมวดหมู่แบรนด์) ---------- */
        const tabs = () => `<div class="slide-tabs" role="tablist" aria-label="แบนเนอร์">${SL.map((x, i) => `<button type="button" role="tab" aria-selected="${i === state.slide}" class="${i === state.slide ? 'on' : ''}" data-slide="${i}">${x.tag}</button>`).join('')}</div>`;
        const secHead = (eye, title, link, type) => `<div class="sec-head"><div>${eyebrow(eye)}<h2 class="serif">${title}</h2></div>${link ? `<a class="link-arrow" href="#" data-go="search"${type === undefined ? '' : ` data-type="${type}"`}>${link}${ic('arrow')}</a>` : ''}</div>`;
        const pageHead = (eye, title, sub) => `<div class="phead">${eyebrow(eye)}<h1 class="serif">${title}</h1><p>${sub}</p></div>`;

        function heroHome() {
            const s = SL[state.slide];
            return `
            <!-- ==================== HERO BANNER (ขยายเกือบเต็มจอ) ==================== -->
            <section class="hero">
                <div class="hero-wrap">
                    <div class="banner">
                        <div class="banner-inner">
                            <div class="banner-copy">
                                ${eyebrow(s.tag)}
                                <h1 class="serif">${s.title}</h1>
                                <p>${s.sub}</p>
                                <a class="btn btn-accent" href="#" data-go="search">${s.cta}${ic('arrow')}</a>
                                ${tabs()}
                            </div>
                        </div>
                    </div>
                </div>
            </section>`;
        }

        const BRANDS = ['Canon', 'Sony', 'Nikon', 'Fujifilm'];
        const CAM_N = [18, 24, 12, 9], LENS_N = [21, 26, 14, 11];
        const ACCS = [['Flash', 'แฟลช', 'sparkles', 15], ['Microphone', 'ไมโครโฟน', 'mic', 22], ['Stand', 'ขาตั้ง', 'stand', 17]];
        const brandTile = (name, n, icon) => `<a class="brand" href="#" data-go="search" data-type="${icon === 'camera' ? 0 : 1}"><div class="br-top"><span class="bi">${ic(icon)}</span><span class="pill">${n} รายการ</span></div><div class="br-name serif">${name}</div><span class="br-go">ดูอุปกรณ์${ic('arrow')}</span></a>`;
        const accTile = ([n, th, icon, c], i) => `<a class="brand acc t${i}" href="#" data-go="search" data-type="2"><div class="br-top"><span class="bi">${ic(icon)}</span><span class="pill">${c} รายการ</span></div><div><div class="br-name serif">${n}</div><small>${th}</small></div><span class="br-go">ดูอุปกรณ์${ic('arrow')}</span></a>`;
        const band = (cls, eye, title, type, inner) => `<section class="band ${cls}"><div class="wrap">${secHead(eye, title, 'ดูทั้งหมด', type)}${inner}</div></section>`;

        function home() {
            return `
            <main>
                ${heroHome()}
                <!-- ==================== SEARCH SECTION (ช่องค้นหาหลักบนหน้าแรก) ==================== -->
                <div class="wrap sb-after">
                    <div class="searchwrap">${searchBlock()}${advPanel()}</div>
                </div>
                <!-- ==================== BRAND CATEGORIES (หมวดหมู่แบรนด์กล้อง เลนส์ และอุปกรณ์เสริม) ==================== -->
                ${band('b1', 'Camera', 'Camera <em>Brands</em>', 0, `<div class="brands">${BRANDS.map((b, i) => brandTile(b, CAM_N[i], 'camera')).join('')}</div>`)}
                ${band('b2', 'Lens', 'Lens <em>Brands</em>', 1, `<div class="brands">${BRANDS.map((b, i) => brandTile(b, LENS_N[i], 'lens')).join('')}</div>`)}
                ${band('b3', 'Accessories', 'Add-ons &amp; <em>Accessories</em>', 2, `<div class="brands three">${ACCS.map(accTile).join('')}</div>`)}
            </main>`;
        }

        /* ---------- [COMPONENT 6] SEARCH / CATALOG VIEW (หน้าค้นหาและแสดงรายการอุปกรณ์) ---------- */
        function catalog() {
            const head = pageHead('Equipment', 'Find your <em>gear</em>.', 'ค้นหาจากอุปกรณ์กว่า 500 รายการ กรองตามหมวด ราคา และวันที่ว่าง');
            const chips = `<div class="chips filters" role="group" aria-label="หมวดหมู่">${['ทั้งหมด', ...TYPES].map((c, i) => `<button type="button" class="chip ${state.type === i - 1 ? 'on' : ''}" data-type-chip="${i - 1}" aria-pressed="${state.type === i - 1}">${c}</button>`).join('')}</div>`;

            // กรองสินค้าตามหมวดหมู่ คำค้นหา ราคา และยี่ห้อ
            const kw = state.filters.keyword.trim().toLowerCase();
            const list = P.filter(p => {
                const matchType = state.type < 0 || typeOf(p) === state.type;
                const matchKw = !kw || p.n.toLowerCase().includes(kw) || p.c.toLowerCase().includes(kw) || p.s.toLowerCase().includes(kw);
                const matchPrice = p.p <= state.filters.maxPrice;
                const matchBrand = state.filters.brand === 'ทุกยี่ห้อ' || p.brand === state.filters.brand;
                return matchType && matchKw && matchPrice && matchBrand;
            });

            const bar = `<div class="res-bar"><div class="count serif">พบ ${list.length} รายการ</div><label><span class="sr-only">เรียงตาม</span><select class="field"><option>เรียง: ยอดนิยม</option><option>ราคาต่ำ → สูง</option><option>ราคาสูง → ต่ำ</option><option>มาใหม่</option></select></label></div>`;
            const pager = `<div class="pager"><button type="button" class="on">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="ถัดไป">${ic('arrow')}</button></div>`;

            return `
            <!-- ==================== CATALOG / SEARCH RESULTS VIEW ==================== -->
            <main class="wrap">
                ${head}
                <div class="searchwrap">${searchBlock()}${advPanel()}</div>
                ${chips}
                ${bar}
                <div class="grid">${list.length ? list.map((p, i) => card(p, i)).join('') : '<p class="muted">ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไขการค้นหา</p>'}</div>
                ${pager}
            </main>`;
        }

        /* ---------- [COMPONENT 7] TERMS VIEW (หน้าเงื่อนไขการเช่าและขั้นตอน) ---------- */
        function terms() {
            const head = pageHead('Rental terms', 'Simple rules, <em>happy</em> rentals.', 'ทุกขั้นตอนโปร่งใส อ่านจบใน 2 นาที ก่อนกดจองอุปกรณ์');
            const acc = `<div class="acc">${POL.map((p, i) => `<details ${i === 0 ? 'open' : ''}><summary>${p[0]}${ic('plus')}</summary><p>${p[1]}</p></details>`).join('')}</div>`;
            return `
            <!-- ==================== RENTAL TERMS & TIMELINE VIEW ==================== -->
            <main class="wrap">
                ${head}
                <div class="timeline">
                    ${STEPS.map((s, i) => `<div class="tl"><span class="dot">${i + 1}</span><div class="box"><h3>${s[0]}</h3><p>${s[1]}</p></div></div>`).join('')}
                </div>
                <section class="sec">
                    ${secHead('Policies', 'The <em>fine print</em>')}
                    <div class="panel">${acc}</div>
                </section>
            </main>`;
        }

        /* ---------- [COMPONENT 8] TEAM VIEW (หน้าทีมงาน — รูปภาพและ Layout เดิม) ---------- */
        function team() {
            return `
            <!-- ==================== TEAM VIEW (สีธีมชมพู-ครีม + Layout รูปภาพเดิม) ==================== -->
            <main class="wrap">
                <section id="team-view" class="team-wrap">
                    <!-- Header -->
                    <div class="team-header">
                        <span class="eyebrow">LEKHAFONG CREW</span>
                        <h2 class="serif text-3xl text-[#4A4A4A] mt-1">Members | <em>สมาชิก</em></h2>
                    </div>

                    <!-- Grid 4 คนแรก -->
                    <div class="team-grid-4">
                        <!-- Member 1 -->
                        <div class="team-card">
                            <div>
                                <img class="team-img drop-shadow-md" src="/pic_member/bpw032.png" alt="นันท์นภัส" style="width: 200px;"><br>
                                <h2 class="font-bold text-lg text-[#4A4A4A]">นันท์นภัส ดาวดาษ</h2>
                                <p class="text-[#A8727F] font-medium">6887032</p>
                            </div>
                        </div>

                        <!-- Member 2 -->
                        <div class="team-card">
                            <div>
                                <img class="team-img drop-shadow-md" src="/pic_member/mk039.png" alt="พิมพ์ปวีณ์" style="width: 200px;"><br>
                                <h2 class="font-bold text-lg text-[#4A4A4A]">พิมพ์ปวีณ์ เพชรเจริญ</h2>
                                <p class="text-[#A8727F] font-medium">6887039</p>
                            </div>
                        </div>

                        <!-- Member 3 -->
                        <div class="team-card">
                            <div>
                                <img class="team-img drop-shadow-md" src="/pic_member/guy042.png" alt="พีร์ระพี" style="width: 200px;"><br>
                                <h2 class="font-bold text-lg text-[#4A4A4A]">พีร์ระพี คำฟอง</h2>
                                <p class="text-[#A8727F] font-medium">6887042</p>
                            </div>
                        </div>

                        <!-- Member 4 -->
                        <div class="team-card">
                            <div>
                                <img class="team-img drop-shadow-md" src="/pic_member/sun053.png" alt="วริทธิ์ธวัฒน์" style="width: 300px;"><br>
                                <h2 class="font-bold text-lg text-[#4A4A4A]">วริทธิ์ธวัฒน์ ศรีตระกูลชัย</h2>
                                <p class="text-[#A8727F] font-medium">6887053</p>
                            </div>
                        </div>
                    </div>

                    <!-- Member 5 (จัดให้อยู่ตรงกลางด้านล่าง) -->
                    <div class="flex justify-center items-center w-full">
                        <div class="team-card team-member5">
                            <div>
                                <img class="team-img drop-shadow-md" src="/pic_member/fn066.png" alt="อรปรียา" style="width: 200px;"><br>
                                <h2 class="font-bold text-lg text-[#4A4A4A]">อรปรียา ร่มโพธิ์</h2>
                                <p class="text-[#A8727F] font-medium">6887066</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>`;
        }

        /* ---------- [COMPONENT 9] PRODUCT DETAIL VIEW (หน้ารายละเอียดอุปกรณ์และการจอง) ---------- */
        function detail() {
            const i = state.item, p = P[i], d = DET[i], t = typeOf(p);
            const thumbs = [0, 1, 2, 1].map((k, n) => {
                const c = 't' + ((i + k) % 3);
                return `<button type="button" class="thumb ${c} ${n === 0 ? 'on' : ''}" data-thumb="${c}" aria-label="รูปที่ ${n + 1}">${ic(p.i)}</button>`;
            }).join('');
            const slots = [['19–21 พ.ย.', 0], ['22–23 พ.ย.', 1], ['24–27 พ.ย.', 0], ['1–5 ธ.ค.', 0]]
                .map(([l, off]) => `<span class="slot ${off ? 'off' : ''}">${l}</span>`).join('');
            const related = P.filter((_, k) => k !== i);

            return `
            <!-- ==================== PRODUCT DETAIL VIEW ==================== -->
            <main class="wrap dt">
                <nav class="crumbs" aria-label="เส้นทางหน้า">
                    <a href="#" data-go="home">Home</a><span>/</span>
                    <a href="#" ${goAttrs('search', t)}>${TYPES[t]}</a><span>/</span>
                    <b>${p.n}</b>
                </nav>

                <section class="dgrid">
                    <div class="dpic">
                        <div class="dpic-main t${i % 3}" id="dmain">
                            ${ic(p.i)}
                            ${p.b ? `<span class="badge">${p.b}</span>` : ''}
                            <button type="button" class="fav" aria-label="บันทึก ${p.n}" onclick="this.classList.toggle('on'); apiToggleFavorite('${p.id}')">${ic('heart')}</button>
                        </div>
                        <div class="thumbs" role="group" aria-label="รูปสินค้า">${thumbs}</div>
                        <div class="dtypes">
                            <div class="seg-t">${TYPES.map((x, k) => `<span class="${k === t ? 'on' : ''}">${x}</span>`).join('')}</div>
                            <span class="src">${ic('shield')}แหล่งที่มา: คลังอุปกรณ์ LekhaFong Studio</span>
                        </div>
                    </div>

                    <div class="dinfo">
                        ${eyebrow(p.c)}
                        <h1 class="serif">${p.n}</h1>
                        <p class="dline">${p.s}</p>
                        <dl class="bsm">
                            <div><dt>ยี่ห้อ</dt><dd>${d[0]}</dd></div>
                            <div><dt>ซีรีส์</dt><dd>${d[1]}</dd></div>
                            <div><dt>รุ่น</dt><dd>${d[2]}</dd></div>
                        </dl>
                        <div class="dprice">
                            <span class="price"><b>${baht(p.p)}</b><small>/วัน</small></span>
                            <span class="dep">มัดจำ 30% ของค่าเช่า ขั้นต่ำ ฿500</span>
                        </div>
                        <fieldset class="opts">
                            <legend>วิธีรับ–คืนอุปกรณ์</legend>
                            <label class="opt"><input type="radio" name="pk" value="store" checked><span class="oi">${ic('store')}</span><span><b>รับ–คืนที่ร้าน</b><small>ฟรี · ตรวจสภาพร่วมกันที่หน้าร้าน</small></span></label>
                            <label class="opt"><input type="radio" name="pk" value="delivery"><span class="oi">${ic('truck')}</span><span><b>จัดส่งถึงที่</b><small>เริ่ม ฿150 · ทั่วกรุงเทพฯ</small></span></label>
                        </fieldset>
                        <div class="dates">
                            <label class="df"><span>วันรับ</span><input id="detail-pickup" class="field" type="date"></label>
                            <label class="df"><span>วันคืน</span><input id="detail-return" class="field" type="date"></label>
                        </div>
                        <div class="dcta">
                            <button type="button" class="btn btn-accent btn-lg" onclick="handleRentNow()">เช่าเลย${ic('arrow')}</button>
                            <button type="button" class="icon-btn lg" aria-label="บันทึกรายการโปรด" onclick="this.classList.toggle('on'); apiToggleFavorite('${p.id}')">${ic('heart')}</button>
                        </div>
                        <p class="dnote">${ic('check')}ยกเลิกหรือเลื่อนวันฟรีล่วงหน้า 48 ชม.</p>
                    </div>
                </section>

                <section class="dmore" aria-label="รายละเอียดสินค้า">
                    <div class="dm-col">
                        ${eyebrow('Status')}
                        <h2 class="serif">สถานะ</h2>
                        <span class="status"><i></i>ว่างพร้อมเช่า (${p.stock} ชิ้น)</span>
                        <p class="muted">ช่วงที่ว่างเร็วที่สุด</p>
                        <div class="slots">${slots}</div>
                    </div>
                    <div class="dm-col">
                        ${eyebrow('Pickup / Return')}
                        <h2 class="serif">รับ–คืนอุปกรณ์</h2>
                        <ul class="plist">
                            <li><span class="oi">${ic('store')}</span><div><b>รับที่ร้าน</b><small>ทุกวัน 09:00 – 19:00</small></div></li>
                            <li><span class="oi">${ic('truck')}</span><div><b>จัดส่งถึงที่</b><small>ทั่วกรุงเทพฯ ตรงเวลาตามนัด</small></div></li>
                            <li><span class="oi">${ic('clock')}</span><div><b>คืนตรงเวลา</b><small>เกิน 2 ชม. คิดเพิ่ม 50% ของค่าเช่ารายวัน</small></div></li>
                        </ul>
                    </div>
                    <div class="dm-col wide">
                        ${eyebrow('Specification')}
                        <h2 class="serif">สเปก</h2>
                        <dl class="spec">${d[3].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
                    </div>
                </section>

                <section class="sec">
                    <div class="sec-head">
                        <div>${eyebrow('You may also like')}<h2 class="serif">Pairs <em>well with</em></h2></div>
                        <div class="car-nav" data-car-nav hidden>
                            <button type="button" class="car-btn" data-car="-1" aria-label="ก่อนหน้า">${ic('arrowL')}</button>
                            <button type="button" class="car-btn" data-car="1" aria-label="ถัดไป">${ic('arrow')}</button>
                        </div>
                    </div>
                    <div class="car" data-carousel tabindex="0" role="region" aria-label="สินค้าที่เข้ากัน">${related.map((r, n) => card(r, n)).join('')}</div>
                </section>
            </main>`;
        }

        /* ---------- [COMPONENT 10] ADMIN VIEW (แผงจัดการผู้ใช้และสินค้าสำหรับแอดมิน) ---------- */
        function admin() {
            return `
            <!-- ==================== ADMIN VIEW (ระบบจัดการแอดมินเดิม) ==================== -->
            <main class="wrap mt-8">
                <section id="admin-view" class="bg-white rounded-3xl border border-[#EBD3D1] shadow-md overflow-hidden">
                    <!-- Header แอดมิน -->
                    <div class="w-full bg-[#F2D4CE]/60 p-5 border-b border-[#EBD3D1] flex justify-between items-center flex-wrap gap-4">
                        <h2 class="font-bold text-[#4A4A4A] text-lg flex items-center gap-2">
                            <i class="fa-solid fa-shield-halved text-[#BF4B72]"></i>
                            User Management for Administrator
                        </h2>
                        <button type="button" onclick="logoutAdmin()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow transition flex items-center gap-2 font-medium text-sm">
                            <i class="fa-solid fa-right-from-bracket"></i> Logout
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[460px]">
                        <!-- Sidebar เมนูฝั่งซ้าย -->
                        <div class="bg-[#FFF5F5] border-r border-[#EBD3D1] p-4 flex flex-col gap-2">
                            <button type="button" onclick="openAdminTab('admin-profile')" id="btn-admin-profile" class="admin-tab-btn flex items-center gap-3 px-4 py-3 bg-[#D9B5BD] rounded-xl transition font-bold text-[#4A4A4A] shadow-sm">
                                <i class="fa-regular fa-circle-user"></i> Profile
                            </button>
                            <button type="button" onclick="openAdminTab('admin-users')" id="btn-admin-users" class="admin-tab-btn flex items-center gap-3 px-4 py-3 hover:bg-[#F2D4CE]/50 rounded-xl transition text-[#6F6262]">
                                <i class="fa-solid fa-users"></i> Users
                            </button>
                            <button type="button" onclick="openAdminTab('admin-products')" id="btn-admin-products" class="admin-tab-btn flex items-center gap-3 px-4 py-3 hover:bg-[#F2D4CE]/50 rounded-xl transition text-[#6F6262]">
                                <i class="fa-solid fa-box"></i> Products
                            </button>
                        </div>

                        <!-- เนื้อหาฝั่งขวา -->
                        <div class="p-6 md:p-8 bg-white">
                            <!-- TAB 1: Profile -->
                            <div id="admin-profile" class="admin-tab-content block">
                                <div class="bg-pink-100 text-center py-2.5 mb-6 rounded-xl text-pink-900 font-bold shadow-sm">ข้อมูลแอดมิน (Profile)</div>
                                <div class="bg-[#fcf3f6] border border-pink-200 p-8 rounded-2xl shadow-sm max-w-xl mx-auto space-y-4 text-gray-700">
                                    <div class="flex justify-center mb-6">
                                        <i class="fa-solid fa-user-tie text-6xl text-[#BF4B72]"></i>
                                    </div>
                                    <p class="border-b border-pink-200 pb-2"><strong class="text-gray-900 w-32 inline-block">ชื่อ-นามสกุล:</strong> พิมพ์ปวีณ์ เพชรเจริญ</p>
                                    <p class="border-b border-pink-200 pb-2"><strong class="text-gray-900 w-32 inline-block">รหัสประจำตัว:</strong> 6887039</p>
                                    <p class="border-b border-pink-200 pb-2"><strong class="text-gray-900 w-32 inline-block">อีเมล:</strong> admin@lekhafong.com</p>
                                    <p><strong class="text-gray-900 w-32 inline-block">Username:</strong> admin_pimpawee</p>
                                </div>
                            </div>

                            <!-- TAB 2: Users -->
                            <div id="admin-users" class="admin-tab-content hidden">
                                <div class="bg-[#F2D4CE]/50 text-center py-2.5 mb-6 rounded-xl text-[#4A4A4A] font-bold">ระบบจัดการผู้ใช้ (Users)</div>
                                <div id="user-list-view" class="overflow-x-auto">
                                    <table class="w-full text-left border-collapse bg-white shadow-sm rounded-xl overflow-hidden">
                                        <tr class="bg-[#4A4A4A] text-white">
                                            <th class="p-4">Username</th>
                                            <th class="p-4">Email</th>
                                            <th class="p-4 text-center">Action</th>
                                        </tr>
                                        <tr class="border-b hover:bg-gray-50 transition">
                                            <td class="p-4">customer_01</td>
                                            <td class="p-4">cust01@gmail.com</td>
                                            <td class="p-4 text-center">
                                                <button type="button" onclick="toggleUserDetails('customer_01', 'cust01@gmail.com')" class="text-[#BF4B72] hover:underline font-medium">ดูเพิ่มเติม</button>
                                            </td>
                                        </tr>
                                        <tr class="border-b hover:bg-gray-50 transition">
                                            <td class="p-4">photographer_x</td>
                                            <td class="p-4">photo.x@gmail.com</td>
                                            <td class="p-4 text-center">
                                                <button type="button" onclick="toggleUserDetails('photographer_x', 'photo.x@gmail.com')" class="text-[#BF4B72] hover:underline font-medium">ดูเพิ่มเติม</button>
                                            </td>
                                        </tr>
                                    </table>
                                </div>

                                <div id="user-detail-view" class="hidden">
                                    <button type="button" onclick="backToUserList()" class="mb-4 text-[#BF4B72] hover:underline font-medium"><i class="fa-solid fa-arrow-left mr-2"></i>กลับหน้ารายชื่อ</button>
                                    <div class="bg-[#FFF5F5] border border-[#EBD3D1] p-8 rounded-2xl shadow-sm space-y-4">
                                        <h3 class="text-xl font-bold text-gray-800 mb-4 border-b border-[#EBD3D1] pb-2">รายละเอียดผู้ใช้งาน</h3>
                                        <p><strong>Username:</strong> <span id="dt-user" class="text-gray-600"></span></p>
                                        <p><strong>Email:</strong> <span id="dt-email" class="text-gray-600"></span></p>
                                        <p><strong>ที่อยู่:</strong> 999 ถ.พุทธมณฑลสาย 4 ต.ศาลายา อ.พุทธมณฑล จ.นครปฐม</p>
                                        <p><strong>เบอร์โทรติดต่อ:</strong> 081-234-5678</p>
                                        <div class="flex gap-4 mt-8 pt-4 border-t border-[#EBD3D1]">
                                            <button type="button" onclick="apiAdminUpdateUser(document.getElementById('dt-user').innerText, {})" class="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-full font-bold shadow transition">Update</button>
                                            <button type="button" onclick="apiAdminDeleteUser(document.getElementById('dt-user').innerText)" class="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow transition">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- TAB 3: Products -->
                            <div id="admin-products" class="admin-tab-content hidden">
                                <div class="bg-[#F2D4CE]/50 text-center py-2.5 mb-6 rounded-xl text-[#4A4A4A] font-bold">ระบบจัดการสินค้า (Products)</div>
                                <div id="product-list-view" class="overflow-x-auto">
                                    <div class="flex justify-end mb-4">
                                        <button type="button" onclick="showAddProduct()" class="px-4 py-2 bg-[#BF4B72] hover:bg-[#A63C61] text-white rounded-full font-bold shadow transition flex items-center gap-2 text-sm">
                                            <i class="fa-solid fa-plus"></i> Add Product
                                        </button>
                                    </div>
                                    <table class="w-full text-left border-collapse bg-white shadow-sm rounded-xl overflow-hidden">
                                        <tr class="bg-[#4A4A4A] text-white">
                                            <th class="p-4">Product ID</th>
                                            <th class="p-4">Product Name</th>
                                            <th class="p-4">Stock</th>
                                            <th class="p-4 text-center">Action</th>
                                        </tr>
                                        <tr class="border-b hover:bg-gray-50 transition">
                                            <td class="p-4">CAM-001</td>
                                            <td class="p-4">Sony A7 IV</td>
                                            <td class="p-4">3</td>
                                            <td class="p-4 text-center">
                                                <button type="button" onclick="toggleProductDetails('CAM-001', 'Sony A7 IV', '3', '900')" class="text-[#BF4B72] hover:underline font-medium">ดูเพิ่มเติม</button>
                                            </td>
                                        </tr>
                                        <tr class="border-b hover:bg-gray-50 transition">
                                            <td class="p-4">CAM-002</td>
                                            <td class="p-4">Canon EOS R6</td>
                                            <td class="p-4">4</td>
                                            <td class="p-4 text-center">
                                                <button type="button" onclick="toggleProductDetails('CAM-002', 'Canon EOS R6', '4', '850')" class="text-[#BF4B72] hover:underline font-medium">ดูเพิ่มเติม</button>
                                            </td>
                                        </tr>
                                    </table>
                                </div>

                                <!-- Edit Product -->
                                <div id="product-detail-view" class="hidden">
                                    <button type="button" onclick="backToProductList()" class="mb-4 text-[#BF4B72] hover:underline font-medium"><i class="fa-solid fa-arrow-left mr-2"></i>กลับหน้ารายการสินค้า</button>
                                    <div class="bg-[#FFF5F5] border border-[#EBD3D1] p-8 rounded-2xl shadow-sm space-y-4">
                                        <h3 class="text-xl font-bold text-gray-800 mb-4 border-b border-[#EBD3D1] pb-2">รายละเอียดสินค้า (Edit Product)</h3>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div class="space-y-4">
                                                <div>
                                                    <label class="block text-xs mb-1 text-gray-500">Product ID</label>
                                                    <input type="text" id="pd-id" class="w-full bg-white border border-[#D9B5BA] rounded-lg p-2.5">
                                                </div>
                                                <div>
                                                    <label class="block text-xs mb-1 text-gray-500">Rent price (ราคาเช่า/วัน)</label>
                                                    <input type="number" id="pd-price" class="w-full bg-white border border-[#D9B5BA] rounded-lg p-2.5" value="900">
                                                </div>
                                            </div>
                                            <div class="space-y-4">
                                                <div>
                                                    <label class="block text-xs mb-1 text-gray-500">Product Name (ชื่อสินค้า)</label>
                                                    <input type="text" id="pd-name" class="w-full bg-white border border-[#D9B5BA] rounded-lg p-2.5">
                                                </div>
                                                <div>
                                                    <label class="block text-xs mb-1 text-gray-500">Stock (สต็อกคงเหลือ)</label>
                                                    <input type="number" id="pd-stock" class="w-full bg-white border border-[#D9B5BA] rounded-lg p-2.5">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex justify-center gap-6 mt-8 pt-4 border-t border-[#EBD3D1]">
                                            <button type="button" onclick="apiAdminUpdateProduct(document.getElementById('pd-id').value, { name: document.getElementById('pd-name').value, price: document.getElementById('pd-price').value, stock: document.getElementById('pd-stock').value })" class="px-8 py-2 text-yellow-900 bg-yellow-400 hover:bg-yellow-500 font-bold rounded-full shadow transition">Update</button>
                                            <button type="button" onclick="apiAdminDeleteProduct(document.getElementById('pd-id').value)" class="px-8 py-2 text-white bg-red-500 hover:bg-red-600 font-bold rounded-full shadow transition">Delete</button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Add Product -->
                                <div id="product-add-view" class="hidden">
                                    <button type="button" onclick="backToProductList()" class="mb-4 text-[#BF4B72] hover:underline font-medium"><i class="fa-solid fa-arrow-left mr-2"></i>ยกเลิก</button>
                                    <div class="bg-[#FFF5F5] border border-[#EBD3D1] p-8 rounded-2xl shadow-sm space-y-4">
                                        <h3 class="text-xl font-bold text-gray-800 mb-4 border-b border-[#EBD3D1] pb-2">เพิ่มสินค้าใหม่ (Add Product)</h3>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div class="space-y-4">
                                                <div>
                                                    <label class="block text-xs mb-1 text-gray-500">Product ID</label>
                                                    <input type="text" id="new-pd-id" class="w-full bg-white border border-[#D9B5BA] rounded-lg p-2.5" placeholder="e.g. CAM-005">
                                                </div>
                                                <div>
                                                    <label class="block text-xs mb-1 text-gray-500">Rent price (ราคาเช่า)</label>
                                                    <input type="number" id="new-pd-price" class="w-full bg-white border border-[#D9B5BA] rounded-lg p-2.5" placeholder="e.g. 1000">
                                                </div>
                                            </div>
                                            <div class="space-y-4">
                                                <div>
                                                    <label class="block text-xs mb-1 text-gray-500">Product Name (ชื่อสินค้า)</label>
                                                    <input type="text" id="new-pd-name" class="w-full bg-white border border-[#D9B5BA] rounded-lg p-2.5" placeholder="e.g. Fujifilm X-T5">
                                                </div>
                                                <div>
                                                    <label class="block text-xs mb-1 text-gray-500">Stock (สต็อกคงเหลือ)</label>
                                                    <input type="number" id="new-pd-stock" class="w-full bg-white border border-[#D9B5BA] rounded-lg p-2.5" placeholder="e.g. 2">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="flex justify-center mt-8 pt-4 border-t border-[#EBD3D1]">
                                            <button type="button" onclick="apiAdminAddProduct({ id: document.getElementById('new-pd-id').value, name: document.getElementById('new-pd-name').value, price: document.getElementById('new-pd-price').value, stock: document.getElementById('new-pd-stock').value })" class="px-8 py-2 text-white bg-[#BF4B72] hover:bg-[#A63C61] font-bold rounded-full shadow transition">Save / Add</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>`;
        }

        /* ---------- [COMPONENT 11] FOOTER (ส่วนท้ายเว็บไซต์) ---------- */
        function footer() {
            return `
            <!-- ==================== FOOTER (ส่วนท้ายเว็บไซต์) ==================== -->
            <footer class="footer ${state.p === 'home' ? 'flush' : ''}">
                <div class="wrap foot">
                    <div>
                        <h4>เมนู</h4>
                        <div class="foot-menu">
                            ${MENU.map(([l, k, t]) => `<a href="#" ${goAttrs(k, t)}>${l}</a>`).join('')}
                        </div>
                    </div>
                    <div>
                        <h4>ติดต่อ &amp; ที่ตั้ง</h4>
                        <a href="mailto:hello@lekhafong.example">${ic('mail')}hello@lekhafong.example</a>
                        <a href="#" onclick="event.preventDefault()">${ic('chat')}LINE @lekhafong</a>
                        <a class="addr" href="#" onclick="event.preventDefault()">${ic('pin')}<span>LekhaFong Studio<br>ซอยสุขุมวิท 55 เขตวัฒนา กรุงเทพฯ 10110</span></a>
                        <p>ทุกวัน 09:00 – 19:00</p>
                        <a class="maplink" href="#" onclick="event.preventDefault()">ดูแผนที่${ic('arrow')}</a>
                    </div>
                </div>
                <div class="wrap copy">
                    <hr class="dots">
                    <small>© 2026 LekhaFong. All rights reserved.</small>
                </div>
            </footer>`;
        }

        /* ============================================================================
           5. INTERACTIVE HANDLERS (ฟังก์ชันจัดการ Login, Search, Admin, Carousel)
           ============================================================================ */

        // เปิด / ปิด Modal (ไม่เก็บลง History Stack)
        function toggleModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            modal.classList.toggle('hidden');
            modal.classList.toggle('flex');
        }

        // สลับแท็บ Log in / Sign up ภายใน Modal เดิม
        function switchAuthTab(tab) {
            const isLogin = tab === 'login';
            document.getElementById('form-login').classList.toggle('hidden', !isLogin);
            document.getElementById('form-signup').classList.toggle('hidden', isLogin);

            const box = document.getElementById('auth-box');
            box.classList.toggle('max-w-md', isLogin);
            box.classList.toggle('max-w-2xl', !isLogin);

            [['tab-login', isLogin], ['tab-signup', !isLogin]].forEach(([id, active]) => {
                const el = document.getElementById(id);
                el.setAttribute('aria-selected', active);
                el.className = `relative pb-3 text-base font-semibold transition-colors ${active ? 'text-[#4A4A4A]' : 'text-[#7A6E70] hover:text-[#4A4A4A]'}`;
                const bar = el.querySelector('.auth-tab-bar');
                if (bar) bar.classList.toggle('opacity-0', !active);
            });
        }

        // จัดการการกด Submit ฟอร์ม Login
        async function handleLoginSubmit(event) {
            event.preventDefault();
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            // เรียก API Placeholder สำหรับเชื่อมต่อ MySQL
            await apiLoginUser(email, password);

            // ทำงานร่วมกับ simulateLogin เดิม
            simulateLogin(email);
        }

        // จำลองการล็อกอิน (รองรับทั้งโหมด Admin และผู้ใช้ทั่วไป)
        function simulateLogin(emailValue = '') {
            const email = emailValue || (document.getElementById('login-email')?.value || '');
            if (email.toLowerCase().includes('admin') || email === '') {
                state.isAdmin = true;
                state.currentUser = 'Admin';
                toggleModal('login-modal');
                goToPage('admin');
            } else {
                state.isAdmin = false;
                state.currentUser = email.split('@')[0];
                toggleModal('login-modal');
                render();
            }
        }

        // ออกจากระบบแอดมินและกลับหน้าแรกพร้อมล้าง Stack
        function logoutAdmin() {
            state.isAdmin = false;
            state.currentUser = null;
            goToPage('home');
        }

        // จัดการการกด Submit ฟอร์ม Sign up
        async function handleSignupSubmit(event) {
            event.preventDefault();
            const formData = {
                first_name: document.getElementById('su-first').value,
                last_name: document.getElementById('su-last').value,
                email: document.getElementById('su-email').value,
                phone: document.getElementById('su-phone').value,
                address: document.getElementById('su-address').value
            };
            await apiRegisterUser(formData);
        }

        // ฟังก์ชันค้นหาหลักและตัวกรองขั้นสูง
        async function submitSearchBar(event) {
            event.preventDefault();
            state.filters.keyword = document.getElementById('sb-keyword')?.value || '';
            state.filters.pickupDate = document.getElementById('sb-pickup')?.value || '';
            state.filters.returnDate = document.getElementById('sb-return')?.value || '';
            await apiFetchProducts(state.filters);
            goToPage('search');
        }

        async function applyAdvanceSearch() {
            state.filters.maxPrice = +(document.getElementById('adv-max-price')?.value || 3000);
            state.filters.brand = document.getElementById('adv-brand')?.value || 'ทุกยี่ห้อ';
            await apiFetchProducts(state.filters);
            goToPage('search');
        }

        function resetAdvanceFilters() {
            state.filters = { keyword: '', pickupDate: '', returnDate: '', maxPrice: 3000, brand: 'ทุกยี่ห้อ' };
            state.type = -1;
            render();
        }

        // ฟังก์ชันกดปุ่ม "เช่าเลย" ในหน้ารายละเอียดสินค้า
        async function handleRentNow() {
            const product = P[state.item];
            const pickupMethod = document.querySelector('input[name="pk"]:checked')?.value || 'store';
            const pickupDate = document.getElementById('detail-pickup')?.value || 'ยังไม่ระบุ';
            const returnDate = document.getElementById('detail-return')?.value || 'ยังไม่ระบุ';

            await apiCreateBooking({
                productId: product.id,
                productName: product.n,
                pickupMethod,
                pickupDate,
                returnDate,
                dailyPrice: product.p
            });
        }

        // ---------------- ฟังก์ชันระบบย่อยในหน้า Admin ----------------
        function openAdminTab(tabId) {
            document.querySelectorAll('.admin-tab-content').forEach(tab => {
                tab.classList.remove('block');
                tab.classList.add('hidden');
            });
            document.querySelectorAll('.admin-tab-btn').forEach(btn => {
                btn.classList.remove('bg-[#D9B5BD]', 'font-bold', 'text-[#4A4A4A]', 'shadow-sm');
                btn.classList.add('text-[#6F6262]', 'hover:bg-[#F2D4CE]/50');
            });

            document.getElementById(tabId).classList.remove('hidden');
            document.getElementById(tabId).classList.add('block');

            const activeBtn = document.getElementById('btn-' + tabId);
            activeBtn.classList.add('bg-[#D9B5BD]', 'font-bold', 'text-[#4A4A4A]', 'shadow-sm');
            activeBtn.classList.remove('text-[#6F6262]', 'hover:bg-[#F2D4CE]/50');
        }

        function toggleUserDetails(username, email) {
            document.getElementById('user-list-view').classList.add('hidden');
            document.getElementById('user-detail-view').classList.remove('hidden');
            document.getElementById('dt-user').innerText = username;
            document.getElementById('dt-email').innerText = email;
        }

        function backToUserList() {
            document.getElementById('user-detail-view').classList.add('hidden');
            document.getElementById('user-list-view').classList.remove('hidden');
        }

        function toggleProductDetails(id, name, stock, price = '900') {
            document.getElementById('product-list-view').classList.add('hidden');
            document.getElementById('product-add-view').classList.add('hidden');
            document.getElementById('product-detail-view').classList.remove('hidden');

            document.getElementById('pd-id').value = id;
            document.getElementById('pd-name').value = name;
            document.getElementById('pd-stock').value = stock;
            document.getElementById('pd-price').value = price;
        }

        function showAddProduct() {
            document.getElementById('product-list-view').classList.add('hidden');
            document.getElementById('product-detail-view').classList.add('hidden');
            document.getElementById('product-add-view').classList.remove('hidden');
        }

        function backToProductList() {
            document.getElementById('product-detail-view').classList.add('hidden');
            document.getElementById('product-add-view').classList.add('hidden');
            document.getElementById('product-list-view').classList.remove('hidden');
        }

        /* ============================================================================
           6. RENDER ENGINE & GLOBAL EVENT LISTENERS
           ============================================================================ */
        function initCarousels() {
            document.querySelectorAll('[data-carousel]').forEach(car => {
                const navEl = car.parentElement.querySelector('[data-car-nav]');
                if (!navEl) return;
                const prev = navEl.querySelector('[data-car="-1"]');
                const next = navEl.querySelector('[data-car="1"]');
                const sync = () => {
                    navEl.hidden = car.scrollWidth <= car.clientWidth + 2;
                    prev.disabled = car.scrollLeft <= 2;
                    next.disabled = car.scrollLeft + car.clientWidth >= car.scrollWidth - 2;
                };
                car.addEventListener('scroll', sync, { passive: true });
                new ResizeObserver(sync).observe(car);
                sync();
            });
        }

        function render() {
            const pages = { home, search: catalog, terms, team, detail, admin };
            const currentRenderer = pages[state.p] || home;
            const site = $('#site');
            site.className = 'site v-' + (PAGE_VARIANT[state.p] || 'a');
            site.innerHTML = nav() + currentRenderer() + footer();
            initCarousels();
        }

        // จัดการคลิกทั้งหมดบนหน้าเว็บผ่าน Event Delegation
        document.addEventListener('click', e => {
            const t = e.target;
            if (t.closest('a[href="#"]')) e.preventDefault();

            // เปลี่ยนหน้าจากลิงก์เมนู / การ์ดแบรนด์ / Breadcrumb
            const go = t.closest('[data-go]');
            if (go) {
                const targetPage = go.dataset.go;
                const targetType = targetPage === 'search'
                    ? (go.dataset.type === undefined ? -1 : +go.dataset.type)
                    : state.type;
                goToPage(targetPage, { type: targetType });
                return;
            }

            // กรองหมวดหมู่ในหน้า Search
            const tc = t.closest('[data-type-chip]');
            if (tc) {
                state.type = +tc.dataset.typeChip;
                render();
                return;
            }

            // เลื่อน Carousel สินค้าแนะนำ
            const cb = t.closest('[data-car]');
            if (cb) {
                const el = cb.closest('section').querySelector('[data-carousel]');
                el.scrollBy({ left: +cb.dataset.car * el.clientWidth * 0.9, behavior: 'smooth' });
                return;
            }

            // เปลี่ยนรูปย่อยในหน้า Detail
            const th = t.closest('[data-thumb]');
            if (th) {
                th.parentElement.querySelectorAll('.thumb').forEach(x => x.classList.toggle('on', x === th));
                $('#dmain').className = 'dpic-main ' + th.dataset.thumb;
                return;
            }

            // คลิกการ์ดสินค้าเพื่อเปิดหน้ารายละเอียด
            const det = t.closest('[data-detail]');
            if (det && !t.closest('.fav')) {
                const itemIndex = +det.dataset.detail;
                apiFetchProductDetail(P[itemIndex]?.id);
                goToPage('detail', { item: itemIndex });
                return;
            }

            // สลับสไลด์แบนเนอร์หน้าแรก
            const sl = t.closest('[data-slide]');
            if (sl) {
                state.slide = +sl.dataset.slide;
                render();
                return;
            }

            // เปิด/ปิดแผงค้นหาขั้นสูง (ไม่เก็บลง History Stack)
            const adv = t.closest('[data-adv]');
            if (adv) {
                const panel = adv.closest('.searchwrap').querySelector('.adv-panel');
                panel.hidden = !panel.hidden;
                adv.setAttribute('aria-expanded', String(!panel.hidden));
                adv.classList.toggle('open', !panel.hidden);
                return;
            }

            // เลือก Chip หมวดหมู่ใน Advance Search
            const chip = t.closest('[data-chip]');
            if (chip) chip.classList.toggle('on');
        });

        // อัปเดตตัวเลขราคาเมื่อเลื่อน Slider ใน Advance Search
        document.addEventListener('input', e => {
            if (e.target.type === 'range') {
                e.target.parentElement.querySelector('.range-val').textContent = '฿' + (+e.target.value).toLocaleString('en-US');
            }
        });