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
        const DEFAULT_FILTERS = { keyword: '', maxPrice: 3000, brand: 'ทุกยี่ห้อ', category: '', onlyAvailable: false, onlyFavorites: false };

        // สถานะปัจจุบันของแอปพลิเคชัน
        const state = {
            p: 'home',
            slide: 0,
            item: 0,
            type: -1,
            sort: 'default',
            isAdmin: false,
            currentUser: null,
            advOpen:false,
            filters: { keyword: '', pickupDate: '', returnDate: '', maxPrice: 50000, brand: 'ทุกยี่ห้อ', category: '', onlyAvailable: false, onlyFavorites: false }
        };

        const FAVORITES_STORAGE_KEY = 'lekhafong_favorites';
        const DELIVERY_FEE = 150;
        const DELIVERY_PICKUP_METHOD = 'จัดส่งถึงที่';
        let favoriteIds = new Set();

        // Favorites are browser-local (localStorage), not account-synchronised.
        function loadFavorites() {
            favoriteIds = new Set();
            try {
                const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
                if (!raw) return;
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    parsed.forEach(id => {
                        if (id !== undefined && id !== null && String(id).trim() !== '') {
                            favoriteIds.add(String(id));
                        }
                    });
                }
            } catch {
                // Corrupted or unreadable storage: reset safely instead of breaking the UI.
                favoriteIds = new Set();
                try { localStorage.removeItem(FAVORITES_STORAGE_KEY); } catch { /* ignore */ }
            }
        }

        function saveFavorites() {
            try {
                localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favoriteIds]));
            } catch {
                showToast('ไม่สามารถบันทึกรายการโปรดในเบราว์เซอร์ได้', 'warning');
            }
        }

        function isFavorite(productId) {
            return favoriteIds.has(String(productId));
        }

        function getFavoriteCount() {
            return favoriteIds.size;
        }

        function syncFavoriteButtons() {
            document.querySelectorAll('[data-fav-id]').forEach(btn => {
                const on = isFavorite(btn.dataset.favId);
                btn.classList.toggle('on', on);
                btn.setAttribute('aria-pressed', on ? 'true' : 'false');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-solid', on);
                    icon.classList.toggle('fa-regular', !on);
                }
            });
        }

        function clearFavoritesFilter() {
            state.filters.onlyFavorites = false;
            render();
        }

        function openFavoritesView() {
            state.filters.onlyFavorites = true;
            state.type = -1;
            state.filters.keyword = '';
            goToPage('search', { type: -1, keepFavorites: true });
        }

        /* ============================================================================
        2. MYSQL & BACKEND API PLACEHOLDERS (เว้นจุดเชื่อมต่อ Database MySQL)
        หมายเหตุ: เปลี่ยน API_BASE_URL ให้ตรงกับ Backend Server (Node.js / PHP / Python)
        ============================================================================ */
        const API_BASE_URL = 'http://localhost:3031/api';

        let adminUsersCache = [];
        let adminProductsCache = [];
        let adminListCache = [];
        const BACKEND_ORIGIN = 'http://localhost:3031';
        let equipmentTypesCache = [];
        let pendingRentalDraft = null;

        const BRAND_LOGOS = {
            'Canon':      'https://upload.wikimedia.org/wikipedia/commons/3/3f/Canon_logo_vector.png',
            'Sony':       'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
            'Nikon':      'https://upload.wikimedia.org/wikipedia/commons/4/4d/Nikon_logo3.jpg',
            'Fujifilm':   'https://upload.wikimedia.org/wikipedia/commons/7/74/Fujifilm_old_logo.png',
            'Panasonic':  'https://upload.wikimedia.org/wikipedia/commons/9/95/Panasonic_logo.svg',
            'Blackmagic': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Blackmagic_Design_logo.png',
            'DJI':        'https://upload.wikimedia.org/wikipedia/commons/d/d2/DJI_logo.png',
            'Sigma':      'https://www.sigma-global.com/common/images/symbol.svg',
            'Tamron':     'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Tamron_Logo.svg/1920px-Tamron_Logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20140815162822',
            'Leica':      'https://upload.wikimedia.org/wikipedia/commons/e/ec/Leica_Camera_logo.svg',
            'Rode':       'https://upload.wikimedia.org/wikipedia/commons/0/0e/R%C3%B8de_Microphones_logo.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail_unscaled&_=20170325212451',
            'Godox':      'https://cdn.simpleicons.org/godox',
            'SmallRig':   'https://logowik.com/content/uploads/images/smallrig-new9704.logowik.com.webp',
            'Zhiyun':     'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Zhiyun-tech_logo.svg/1280px-Zhiyun-tech_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20191111193915',
            'Aputure':    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Aperture_Science.svg/1280px-Aperture_Science.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20230906174513'
        };

        function renderBrandLogo(brandName, fallbackIcon = 'camera') {
            const matchedKey = Object.keys(BRAND_LOGOS).find(
                k => k.toLowerCase() === String(brandName || '').trim().toLowerCase()
            );
            const logoSrc = matchedKey ? BRAND_LOGOS[matchedKey] : '';

            if (logoSrc) {
                return `<img src="${logoSrc}" alt="${brandName}"
                    style="width:100%; height:100%; object-fit:contain; background:#ffffff; padding:0.5px; box-sizing:border-box; display:block;"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
                    <span style="display:none; align-items:center; justify-content:center;">${ic(fallbackIcon)}</span>`;
            }
            return ic(fallbackIcon);
        }

        (function injectBrandSliderStyle() {
            const old = document.getElementById('brand-slider-style');
            if (old) old.remove();
            const style = document.createElement('style');
            style.id = 'brand-slider-style';
            style.textContent = `
                .brands.brand-carousel {
                    display: flex !important;
                    flex-wrap: nowrap !important;
                    grid-template-columns: none !important;
                    gap: 24px !important;
                    overflow-x: auto !important;
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    padding-bottom: 4px;
                }
                .brands.brand-carousel::-webkit-scrollbar { display: none; }
                .brands.brand-carousel .brand {
                    flex: 0 0 calc((100% - 72px) / 4) !important;
                    min-width: 240px !important;
                }
                .brand-nav-group { display: inline-flex; align-items: center; gap: 8px; }
                .brand-nav-btn {
                    width: 38px; height: 38px; border-radius: 9999px;
                    border: 1px solid #D5B2B6; background: #FFF9F9; color: #7D3B42;
                    display: inline-flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s ease;
                }
                .brand-nav-btn:hover { background: #7D3B42; color: #ffffff; border-color: #7D3B42; }
            `;
            document.head.appendChild(style);
        })();

        // Single implementation used by both data-scroll-track handlers and any
        // legacy inline callers. Accepts "b1" or "track-b1".
        function scrollBrands(trackId, direction) {
            if (!trackId) return;
            const rawId = String(trackId);
            const id = rawId.startsWith('track-') ? rawId : `track-${rawId}`;
            const track = document.getElementById(id);
            if (!track) return;
            const dir = Number(direction) || 1;
            track.scrollBy({ left: dir * Math.max(260, track.clientWidth * 0.75), behavior: 'smooth' });
        }
        window.scrollBrands = scrollBrands;
        function getBrandCount(brandName, targetCategory) {
            const list = (typeof P !== 'undefined' && Array.isArray(P)) ? P : [];
            const targetBrand = String(brandName || '').trim().toLowerCase();

            return list.filter(item => {
                const itemBrand = String(item.brand || '').trim().toLowerCase();
                if (itemBrand !== targetBrand) return false;

                if (typeof typeOf === 'function') {
                    const t = typeOf(item);
                    if (targetCategory === 'camera') return t === 0;
                    if (targetCategory === 'lens') return t === 1;
                    if (targetCategory === 'accessories') return t === 2;
                }

                const cat = String(item.c || '').trim();
                if (targetCategory === 'camera') return cat === 'กล้อง';
                if (targetCategory === 'lens') return cat === 'เลนส์';
                if (targetCategory === 'accessories') return cat === 'อุปกรณ์เสริม';
                return false;
            }).length;
        }

        function renderStatusPill(p) {
            const rawStatus = (p?.status ?? p?.equipment_status ?? p?.b ?? '').toString().trim();
            if (!rawStatus) return '';

            const lower = rawStatus.toLowerCase();
            let bgStyle = '';
            if (lower === 'available') {
                bgStyle = 'background:#2E6F56; color:#ffffff;'; // สีเขียว (พร้อมเช่า)
            } else if (lower === 'in use') {
                bgStyle = 'background:#7D3B42; color:#ffffff;'; // สีแดงเบอร์กันดี (กำลังใช้งาน)
            } else if (lower === 'maintenance') {
                bgStyle = 'background:#A6633C; color:#ffffff;'; // สีส้มอิฐ (ซ่อมบำรุง)
            }

            return `<span class="badge" style="${bgStyle}">${rawStatus}</span>`;
        }

        // แปลงข้อมูล detail_images จาก MySQL (รองรับทั้ง JSON String และ Array)
        function parseDetailImages(raw) {
            if (Array.isArray(raw)) return raw.filter(Boolean);
            if (typeof raw === 'string' && raw.trim()) {
                try {
                    const parsed = JSON.parse(raw);
                    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
                } catch {
                    return [];
                }
            }
            return [];
        }

        // แปลง Path รูปภาพให้เรียกจาก Backend Storage ได้ถูกต้อง
        function resolveImageUrl(imgPath) {
            if (!imgPath) return '';
            const value = String(imgPath).trim();
            if (!value) return '';
            if (/^(https?:|blob:|data:)/i.test(value)) {
                return value;
            }
            // Already an absolute backend URL: never prepend the origin twice.
            if (value.startsWith(BACKEND_ORIGIN)) {
                return value;
            }
            return `${BACKEND_ORIGIN}${value.startsWith('/') ? '' : '/'}${value}`;
        }

        // Keep uploads as root-relative paths in the database. Absolute URLs that
        // point at our own backend are converted back to "/uploads/...".
        function normalizeImagePath(imgPath) {
            if (imgPath === undefined || imgPath === null) return '';
            const value = String(imgPath).trim();
            if (!value) return '';
            if (/^(https?:|blob:|data:)/i.test(value)) {
                try {
                    const url = new URL(value);
                    if (`${url.protocol}//${url.host}` === BACKEND_ORIGIN) {
                        return `${url.pathname}${url.search}${url.hash}`;
                    }
                } catch { /* keep the original absolute URL */ }
                return value;
            }
            return value.startsWith('/') ? value : `/${value}`;
        }

        function mapEquipmentToProduct(row) {
            const typeLower = (row.type || '').toLowerCase();
            let catTh = 'อุปกรณ์เสริม';
            let icon = 'bulb';
            if (typeLower.includes('camera') || typeLower.includes('กล้อง')) {
                catTh = 'กล้อง';
                icon = typeLower.includes('cinema') ? 'video' : 'camera';
            } else if (typeLower.includes('lens') || typeLower.includes('เลนส์')) {
                catTh = 'เลนส์';
                icon = 'lens';
            } else if (typeLower.includes('mic') || typeLower.includes('audio') || typeLower.includes('ไมค์') || typeLower.includes('เสียง')) {
                catTh = 'ไมค์ & เสียง';
                icon = 'mic';
            } else if (typeLower.includes('light') || typeLower.includes('ไฟ')) {
                catTh = 'ไฟสตูดิโอ';
                icon = 'bulb';
            } else if (typeLower.includes('comp') || typeLower.includes('laptop') || typeLower.includes('คอม')) {
                catTh = 'คอมพิวเตอร์';
                icon = 'laptop';
            } else if (typeLower.includes('speak') || typeLower.includes('ลำโพง')) {
                catTh = 'ลำโพง';
                icon = 'speaker';
            }

            const stockCount = row.stock !== undefined && row.stock !== null
                ? Number(row.stock)
                : (row.status === 'Available' ? 1 : 0);

            return {
                id: String(row.equipment_id),
                n: row.name,
                c: catTh,
                brand: row.brand || 'Other',
                i: icon,
                p: Number(row.daily_rate) || 0,
                b: (row.status || '').trim(),
                s: row.description || `${row.brand} · ${row.model_series || row.type}`,
                stock: stockCount,
                equipment_id: row.equipment_id,
                admin_id: row.admin_id,
                name: row.name,
                type: row.type,
                serial_number: row.serial_number,
                description: row.description || '',
                model_series: row.model_series || '',
                status: row.status,
                daily_rate: Number(row.daily_rate) || 0,
                main_image: row.main_image || '',
                detail_images: parseDetailImages(row.detail_images)
            };
        }

        async function apiFetchEquipmentTypes() {
            try {
                const res = await fetch(`${API_BASE_URL}/equipment-types`);
                if (!res.ok) throw new Error('Failed to load types');
                equipmentTypesCache = await res.json();
            } catch {
                equipmentTypesCache = ['Camera', 'Cinema Camera', 'Lens', 'Microphone', 'Audio', 'Lighting', 'Computer', 'Speaker', 'Accessory'];
            }
            return equipmentTypesCache;
        }

        async function apiUploadImageFile(file) {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'อัปโหลดรูปภาพไม่สำเร็จ');
            }
            return data.url;
        }

        async function apiSubmitRental(payload) {
            const res = await fetch(`${API_BASE_URL}/rentals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'ไม่สามารถทำรายการเช่าได้');
            }
            return data.rental;
        }

        // ---------------- ระบบ Custom Toast Notification ----------------
        function showToast(message, type = 'success') {
            let container = document.getElementById('toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container';
                container.className = 'toast-container';
                document.body.appendChild(container);
            }

            const icons = {
                success: 'fa-circle-check',
                error: 'fa-circle-xmark',
                warning: 'fa-triangle-exclamation'
            };

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <i class="fa-solid ${icons[type] || icons.success}"></i>
                <span class="toast-msg">${message}</span>
                <button type="button" class="toast-close" aria-label="ปิด">&times;</button>
            `;

            toast.querySelector('.toast-close').onclick = () => toast.remove();
            container.appendChild(toast);

            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 4000);
        }

        function showForgotPasswordHelp() {
            showToast('หากลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบเพื่อดำเนินการรีเซ็ตรหัสผ่าน', 'warning');
        }

        // ---------------- ระบบ Custom Confirmation Modal ----------------
        function showConfirmModal(title, message, onConfirm) {
            const existing = document.getElementById('custom-confirm-modal');
            if (existing) existing.remove();

            const modal = document.createElement('div');
            modal.id = 'custom-confirm-modal';
            modal.className = 'fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-4';
            modal.innerHTML = `
                <div class="bg-[#FFF5F5] border border-[#D9B5BA] w-full max-w-md rounded-2xl p-6 shadow-2xl text-[#4A4A4A]">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 rounded-full bg-[#F9E3EA] text-[#BF4B72] flex items-center justify-center">
                            <i class="fa-solid fa-triangle-exclamation text-lg"></i>
                        </div>
                        <h3 class="text-lg font-bold">${title}</h3>
                    </div>
                    <p class="text-sm text-[#6F6262] mb-6 leading-relaxed">${message}</p>
                    <div class="flex justify-end gap-3">
                        <button type="button" id="confirm-cancel-btn" class="px-5 py-2 rounded-full border border-[#D9B5BA] bg-white hover:bg-[#F2D4CE]/50 text-sm font-medium transition">
                            Cancel
                        </button>
                        <button type="button" id="confirm-ok-btn" class="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow transition">
                            Delete
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('#confirm-cancel-btn').onclick = () => modal.remove();
            modal.querySelector('#confirm-ok-btn').onclick = async () => {
                modal.remove();
                await onConfirm();
            };
        }

        // ---------------- ระบบ Authentication & Guard ----------------
        function syncAuthFromStorage() {
            const saved = localStorage.getItem('lekhafong_auth');
            if (saved) {
                try {
                    const user = JSON.parse(saved);
                    state.currentUser = user.username;
                    state.userProfile = user;
                    state.isAdmin = user.role === 'Admin';
                } catch {
                    localStorage.removeItem('lekhafong_auth');
                    state.currentUser = null;
                    state.userProfile = null;
                    state.isAdmin = false;
                }
            } else {
                state.currentUser = null;
                state.userProfile = null;
                state.isAdmin = false;
            }
        }

        function enforceAdminGuard() {
            syncAuthFromStorage();
            if (state.p === 'admin' && !state.isAdmin) {
                state.p = 'home';
                history.replaceState({ page: 'home', type: -1, item: 0, depth: 0 }, '', '?page=home');
                showToast('กรุณาเข้าสู่ระบบด้วยบัญชี Admin ก่อนเข้าใช้งาน', 'warning');
            }
        }

        async function apiLoginUser(email, password) {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    showToast(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error');
                    return null;
                }
                localStorage.setItem('lekhafong_auth', JSON.stringify(data.user));
                syncAuthFromStorage();
                showToast(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${data.user.username}`, 'success');
                return data.user;
            } catch (err) {
                showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบ Backend Server', 'error');
                return null;
            }
        }

        async function apiRegisterUser(userData) {
            try {
                const res = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.success) {
                    showToast(data.message || 'สมัครสมาชิกไม่สำเร็จ', 'error');
                    return false;
                }
                showToast('สมัครสมาชิกสำเร็จ สามารถเข้าสู่ระบบได้ทันที', 'success');
                switchAuthTab('login');
                return true;
            } catch (err) {
                showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
                return false;
            }
        }

        // ---------------- API จัดการสินค้า / อุปกรณ์ (EQUIPMENT) ----------------
        async function apiFetchProducts() {
            try {
                const res = await fetch(`${API_BASE_URL}/products`);
                if (!res.ok) throw new Error('Failed to load products');
                const rows = await res.json();
                adminProductsCache = rows;
                P = rows.map(mapEquipmentToProduct);
                return P;
            } catch (err) {
                console.error('Error fetching products:', err);
                showToast('ไม่สามารถโหลดข้อมูลอุปกรณ์จากฐานข้อมูลได้', 'error');
                return P;
            }
        }

        async function apiFetchProductDetail(productId) {
            return P.find(x => x.id === String(productId));
        }

        async function apiCreateBooking(bookingPayload) {
            if (!state.currentUser) {
                showToast('กรุณาเข้าสู่ระบบก่อนทำการจองอุปกรณ์', 'warning');
                toggleModal('login-modal');
                return;
            }
            showToast(`ส่งคำขอจอง "${bookingPayload.productName}" เรียบร้อยแล้ว`, 'success');
        }

        async function apiToggleFavorite(productId) {
            if (productId === undefined || productId === null || String(productId).trim() === '') return;
            const id = String(productId);
            const wasFavorite = favoriteIds.has(id);
            if (wasFavorite) {
                favoriteIds.delete(id);
            } else {
                favoriteIds.add(id);
            }
            saveFavorites();
            syncFavoriteButtons();
            showToast(wasFavorite ? 'นำออกจากรายการโปรดแล้ว' : 'เพิ่มในรายการโปรดแล้ว', 'success');
            // When viewing the favourites-only catalog, refresh the result list.
            if (state.p === 'search' && state.filters.onlyFavorites) {
                render();
            }
        }

        async function apiAdminAddProduct(productData) {
            try {
                const res = await fetch(`${API_BASE_URL}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...productData,
                        admin_id: state.userProfile?.admin_id || 1
                    })
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    showToast(data.message || 'ไม่สามารถเพิ่มอุปกรณ์ได้', 'error');
                    return;
                }
                showToast(data.message || 'เพิ่มอุปกรณ์ใหม่สำเร็จ', 'success');
                await apiFetchProducts();
                renderAdminProductsTable();
                backToProductList();
            } catch (err) {
                showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
            }
        }

        async function apiAdminUpdateProduct(equipmentId, productData) {
            try {
                const res = await fetch(`${API_BASE_URL}/products/${equipmentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    showToast(data.message || 'ไม่สามารถอัปเดตข้อมูลได้', 'error');
                    return;
                }
                showToast(data.message || 'อัปเดตข้อมูลอุปกรณ์สำเร็จ', 'success');
                await apiFetchProducts();
                renderAdminProductsTable();
                backToProductList();
            } catch (err) {
                showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
            }
        }

        function apiAdminDeleteProduct(equipmentId, productName) {
            showConfirmModal(
                'ยืนยันการลบอุปกรณ์',
                `คุณต้องการลบอุปกรณ์ "${productName || equipmentId}" ออกจากฐานข้อมูลหรือไม่?`,
                async () => {
                    try {
                        const res = await fetch(`${API_BASE_URL}/products/${equipmentId}`, { method: 'DELETE' });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                            showToast(data.message || 'ลบอุปกรณ์ไม่สำเร็จ', 'error');
                            return;
                        }
                        showToast(data.message || 'ลบอุปกรณ์เรียบร้อยแล้ว', 'success');
                        await apiFetchProducts();
                        renderAdminProductsTable();
                        backToProductList();
                    } catch (err) {
                        showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
                    }
                }
            );
        }

        // ---------------- API จัดการผู้ใช้งาน (CUSTOMER) ----------------
        async function apiAdminFetchUsers() {
            try {
                const res = await fetch(`${API_BASE_URL}/users`);
                if (!res.ok) throw new Error('Failed to fetch users');
                adminUsersCache = await res.json();
                renderAdminUsersTable();
            } catch (err) {
                showToast('ไม่สามารถดึงข้อมูลผู้ใช้งานจากฐานข้อมูลได้', 'error');
            }
        }

        async function apiAdminUpdateUser(accountId, payload) {
            try {
                const res = await fetch(`${API_BASE_URL}/users/${accountId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    showToast(data.message || 'ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง', 'error');
                    return;
                }
                showToast(data.message || 'อัปเดตข้อมูลผู้ใช้สำเร็จ', 'success');
                await apiAdminFetchUsers();
                backToUserList();
            } catch (err) {
                showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
            }
        }

        function apiAdminDeleteUser(accountId, username) {
            showConfirmModal(
                'ยืนยันการลบผู้ใช้งาน',
                `คุณต้องการลบผู้ใช้ "${username}" ออกจากระบบหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
                async () => {
                    try {
                        const res = await fetch(`${API_BASE_URL}/users/${accountId}`, { method: 'DELETE' });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                            showToast(data.message || 'ลบผู้ใช้งานไม่สำเร็จ', 'error');
                            return;
                        }
                        showToast(data.message || 'ลบผู้ใช้งานเรียบร้อยแล้ว', 'success');
                        await apiAdminFetchUsers();
                        backToUserList();
                    } catch (err) {
                        showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
                    }
                }
            );
        }

        // ---------------- API จัดการผู้ดูแลระบบ (ADMIN) ----------------
        async function apiAdminFetchAdmins() {
            try {
                const res = await fetch(`${API_BASE_URL}/admins`);
                if (!res.ok) throw new Error('Failed to fetch admins');
                adminListCache = await res.json();
                renderAdminListTable();
            } catch (err) {
                showToast('ไม่สามารถดึงข้อมูล Admin ได้', 'error');
            }
        }

        async function apiAdminAddAdmin(payload) {
            if (payload.password !== payload.confirmPassword) {
                showToast('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน', 'warning');
                return;
            }
            try {
                const res = await fetch(`${API_BASE_URL}/admins`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    showToast(data.message || 'ไม่สามารถเพิ่ม Admin ได้', 'error');
                    return;
                }
                showToast(data.message || 'เพิ่มผู้ดูแลระบบสำเร็จ', 'success');
                await apiAdminFetchAdmins();
                backToAdminList();
            } catch (err) {
                showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
            }
        }

        async function apiAdminUpdateAdmin(accountId, payload) {
            if (payload.password && payload.password !== payload.confirmPassword) {
                showToast('รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน', 'warning');
                return;
            }
            try {
                const res = await fetch(`${API_BASE_URL}/admins/${accountId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    showToast(data.message || 'ไม่สามารถอัปเดตข้อมูล Admin ได้', 'error');
                    return;
                }
                showToast(data.message || 'อัปเดตข้อมูล Admin สำเร็จ', 'success');
                await apiAdminFetchAdmins();
                backToAdminList();
            } catch (err) {
                showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
            }
        }

        function apiAdminDeleteAdmin(accountId, username) {
            showConfirmModal(
                'ยืนยันการลบ Admin',
                `คุณต้องการลบสิทธิ์ผู้ดูแลระบบของ "${username}" ใช่หรือไม่?`,
                async () => {
                    try {
                        const res = await fetch(`${API_BASE_URL}/admins/${accountId}`, { method: 'DELETE' });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                            showToast(data.message || 'ไม่สามารถลบ Admin ได้', 'error');
                            return;
                        }
                        showToast(data.message || 'ลบ Admin เรียบร้อยแล้ว', 'success');
                        await apiAdminFetchAdmins();
                    } catch (err) {
                        showToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
                    }
                }
            );
        }

        /* ============================================================================
        3. HISTORY STACK & NAVIGATION (ระบบเปลี่ยนหน้า รองรับ Back / Forward และตัด Stack เมื่อกลับ Home)
        ============================================================================ */
        let currentDepth = 0;
        let resetForwardStack = false;

        function buildPageQuery(page, item) {
            return (page === 'detail' && item !== undefined && item !== null && String(item) !== '' && String(item) !== '0')
                ? `?page=detail&id=${encodeURIComponent(item)}`
                : `?page=${page}`;
        }

        // ฟังก์ชันเปลี่ยนหน้าหลักของเว็บไซต์ (รองรับทั้งชื่อหน้า 'home' และ ID 'home-view')
        function goToPage(pageInput, options = {}, addHistory = true) {
            const page = String(pageInput || 'home').replace('-view', '');

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
            // Favorites-only is a transient mode: entering the catalog through
            // normal menu/search/brand navigation leaves it.
            if (page === 'search' && !options.keepFavorites) {
                state.filters.onlyFavorites = false;
            }
            if (options.type !== undefined) state.type = options.type;
            if (options.item !== undefined) state.item = options.item;

            if (addHistory && page !== 'home') {
                currentDepth++;
                const nextQuery = buildPageQuery(state.p, state.item);
                history.pushState(
                    { page: state.p, type: state.type, item: state.item, depth: currentDepth },
                    '',
                    nextQuery
                );
            }

            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Alias เพื่อความเข้ากันได้กับโค้ดเดิมที่เรียก switchView('home-view')
        function switchView(viewId, addHistory = true) {
            goToPage(viewId, {}, addHistory);
        }

        // Single popstate dispatcher: closes the rental modal first, then applies
        // the browser-history navigation state. This removes the old race between
        // two separate popstate listeners.
        window.addEventListener('popstate', (event) => {
            if (document.getElementById('rental-confirm-popup')) {
                cancelRentalPopup(true);
            }

            const st = event.state || { page: 'home', type: -1, item: 0, depth: 0 };
            currentDepth = Number.isFinite(Number(st.depth)) ? Number(st.depth) : 0;
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

        // ตั้งค่าหน้าเริ่มต้นเวลาโหลดเว็บหรือกด Refresh (รองรับ deep link ?page=detail&id=...)
        window.addEventListener('DOMContentLoaded', async () => {
            syncAuthFromStorage();
            loadFavorites();
            await apiFetchProducts();
            const params = new URLSearchParams(window.location.search);
            const initialPage = params.get('page') || 'home';
            const initialId = params.get('id') || '';
            const initialType = params.get('type');
            currentDepth = 0;
            state.p = initialPage;
            state.item = initialId || state.item;
            if (initialType !== null && initialType !== '' && Number.isFinite(Number(initialType))) {
                state.type = Number(initialType);
            }
            enforceAdminGuard();
            history.replaceState(
                { page: state.p, type: state.type, item: state.item, depth: 0 },
                '',
                buildPageQuery(state.p, state.item)
            );
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
                <h2 class="bran-pulse font-bold">LekhaFong</h2>
            </a>
        `;

        /* ---------- [COMPONENT 2] NAVBAR (แถบเมนูด้านบน) ---------- */
        function nav() {
            const detailItem = P.find(x => String(x.id) === String(state.item)) || P[0];
            const active = state.p === 'home' ? 0
                : state.p === 'terms' ? 4
                : state.p === 'team' ? 5
                : state.p === 'detail' ? 1 + typeOf(detailItem)
                : state.type >= 0 ? 1 + state.type : -1;

            const adminBtnHtml = state.isAdmin
                ? `<button id="nav-admin-link" type="button" onclick="goToPage('admin')" class="btn btn-ink btn-sm"><i class="fa-solid fa-shield-halved"></i> แอดมิน</button>`
                : `<button id="nav-admin-link" type="button" onclick="goToPage('admin')" class="btn btn-ink btn-sm hidden"><i class="fa-solid fa-shield-halved"></i> แอดมิน</button>`;

            const loginBtnHtml = state.isAdmin
                ? `<button type="button" class="btn btn-sm" style="border:1px solid #8c3b55; background:#fff; color:#8c3b55;" onclick="logoutUser()">ออกจากระบบ</button>`
                : state.currentUser
                    ? `<span class="btn btn-accent" style="cursor:default;">${ic('user')}${state.currentUser}</span>
                    <button type="button" class="btn btn-sm" style="border:1px solid #8c3b55; background:#fff; color:#8c3b55;" onclick="logoutUser()">ออกจากระบบ</button>`
                    : `<button id="nav-login-btn" type="button" class="btn btn-accent" onclick="toggleModal('login-modal')">${ic('user')}เข้าสู่ระบบ</button>`;

            return `
            <!-- ==================== NAVBAR ==================== -->
            <header class="nav dnav">
                <div class="nav-in">
                    ${logo()}
                    <div class="dicons">
                        ${adminBtnHtml}
                        <button type="button" class="icon-btn ${state.p === 'search' && state.filters.onlyFavorites ? 'on' : ''}" aria-label="รายการโปรด (${getFavoriteCount()})" aria-pressed="${state.p === 'search' && state.filters.onlyFavorites ? 'true' : 'false'}" title="รายการโปรด" onclick="openFavoritesView()">${ic('heart')}</button>
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

        function logoutUser() {
            state.currentUser = null;
            state.user = null;
            state.userProfile = null;
            state.isAdmin = false;
            // Keep unrelated browser-local data (notably favourites) intact.
            try { localStorage.removeItem('lekhafong_auth'); } catch { /* ignore */ }
            if (state.p === 'admin') state.p = 'home';
            render();
        }

        /* ---------- [COMPONENT 3] SEARCH BAR & ADVANCE SEARCH PANEL (ช่องค้นหา + ตัวกรองขั้นสูง) ---------- */
        function advPanel(open = false) {
            const f = state.filters;
            const brands = ['ทุกยี่ห้อ', ...new Set(P.map(x => x.brand).filter(Boolean))].sort();

            return `
            <div class="adv-panel" ${state.advOpen ? '' : 'hidden'}>
                <div class="adv-grid">
                    <div>
                        <span class="t">หมวดหมู่</span>
                        <div class="chips">${CATS.map(c => `<button type="button" class="chip ${f.category === c[0] ? 'on' : ''}" onclick="setFilter('category', '${c[0]}')">${c[0]}</button>`).join('')}</div>
                    </div>
                    <div>
                        <span class="t">ราคาต่อวัน</span>
                        <div class="range-row">
                            <input type="range" min="0" max="3000" step="50" value="${f.maxPrice}" oninput="state.filters.maxPrice=+this.value; this.nextElementSibling.textContent='฿'+(+this.value).toLocaleString()">
                            <span class="range-val">฿${f.maxPrice.toLocaleString()}</span>
                        </div>
                    </div>
                    <div>
                        <span class="t">ยี่ห้อ</span>
                        <select class="field" onchange="state.filters.brand=this.value">
                            ${brands.map(b => `<option value="${b}" ${f.brand === b ? 'selected' : ''}>${b}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <span class="t">สถานะ</span>
                        <div class="checks">
                            <label><input type="checkbox" ${f.onlyAvailable ? 'checked' : ''} onchange="state.filters.onlyAvailable=this.checked">ว่างพร้อมเช่า</label>
                        </div>
                    </div>
                </div>
                <div class="adv-actions">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="state.filters={...DEFAULT_FILTERS}; state.type=-1; render()">ล้างค่า</button>
                    <button type="button" class="btn btn-accent btn-sm" onclick="goToPage('search', {type: -1})">ใช้ตัวกรอง</button>
                </div>
            </div>`;
        }

        // ฟังก์ชันสลับการเลือกหมวดหมู่ (กดซ้ำเพื่อยกเลิก)
        const setFilter = (key, val) => {
            state.filters[key] = state.filters[key] === val ? '' : val;
            render();
        };

        window.submitSearchBar = function(e) {
            if (e) e.preventDefault();
            const kwEl = document.getElementById('sb-keyword');
            const pickupEl = document.getElementById('sb-pickup');
            const returnEl = document.getElementById('sb-return');

            if (kwEl) state.filters.keyword = kwEl.value.trim();
            if (pickupEl) state.filters.pickup = pickupEl.value;
            if (returnEl) state.filters.return = returnEl.value;

            goToPage('search', { type: state.type >= 0 ? state.type : -1 });
        };

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
                <button type="button" class="adv-btn" onclick="state.advOpen = !state.advOpen; render()" aria-expanded="${state.advOpen}">${ic('sliders')}ค้นหาขั้นสูง</button>
            </div>`;
        }

        /* ---------- [COMPONENT 4] PRODUCT CARD (การ์ดแสดงสินค้าแต่ละชิ้น) ---------- */
        const card = (p, i, cls = '') => `
            <article class="card ${cls}" data-detail="${p.id}">
                <div class="card-img t${i % 3}" style="overflow:hidden;">
                    ${p.main_image
                        ? `<img src="${resolveImageUrl(p.main_image)}" alt="${p.n}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
                            <span style="display:none;">${ic(p.i)}</span>`
                        : ic(p.i)
                    }
                    ${renderStatusPill(p)}
                    <button type="button" class="fav ${isFavorite(p.id) ? 'on' : ''}" data-fav-id="${p.id}" aria-label="บันทึก ${p.n}" aria-pressed="${isFavorite(p.id) ? 'true' : 'false'}" onclick="event.stopPropagation(); apiToggleFavorite('${p.id}')">${ic('heart')}</button>
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

        const BANNERS = [
            { img: 'banner/1.png', label: 'Lumix S5IIX', kw: 'S5' },
            { img: 'banner/2.png', label: 'Canon R6 II', kw: 'R6' },
            { img: 'banner/3.png', label: 'Sony ZV-E10 II', kw: 'ZV-E10' }
        ];

        function heroHome() {
            const b = BANNERS[state.slide % BANNERS.length];
            return `
            <div class="wrap">
                <div class="live-banner" onmouseenter="clearInterval(window._bTimer)" onmouseleave="startBannerTimer()">
                    <img src="${b.img}" alt="${b.label}" onclick="state.filters.keyword='${b.kw}'; goToPage('search', {type: -1})">
                </div>
            </div>`;
        }

        function startBannerTimer() {
            clearInterval(window._bTimer);
            window._bTimer = setInterval(() => {
                const img = document.querySelector('.live-banner img');
                if (!img) return; // ถ้าไม่ได้อยู่หน้าแรก (ไม่มีแบนเนอร์) ให้ข้ามไป
                
                state.slide = (state.slide + 1) % BANNERS.length;
                const b = BANNERS[state.slide];
                img.src = b.img;
                img.alt = b.label;
                img.onclick = () => { state.filters.keyword = b.kw; goToPage('search', { type: -1 }); };
            }, 4000);
        }
        startBannerTimer();

        const BRANDS = ['Canon', 'Sony', 'Nikon', 'Fujifilm'];
        const CAM_N = [18, 24, 12, 9], LENS_N = [21, 26, 14, 11];
        const ACCS = [['Flash', 'แฟลช', 'sparkles', 15], ['Microphone', 'ไมโครโฟน', 'mic', 22], ['Stand', 'ขาตั้ง', 'stand', 17]];
        const brandTile = (name, n, icon, typeIdx = 0) => `<a class="brand" href="#" data-go="search" data-type="${typeIdx}" data-brand="${name}"><div class="br-top"><span class="bi" style="width:64px; height:64px; overflow:hidden; padding:0;">${renderBrandLogo(name, icon)}</span><span class="pill">${n} รายการ</span></div><div class="br-name serif">${name}</div><span class="br-go">ดูอุปกรณ์${ic('arrow')}</span></a>`;
        const accTile = ([n, th, icon, c], i) => `<a class="brand acc t${i}" href="#" data-go="search" data-type="2"><div class="br-top"><span class="bi">${ic(icon)}</span><span class="pill">${c} รายการ</span></div><div><div class="br-name serif">${n}</div><small>${th}</small></div><span class="br-go">ดูอุปกรณ์${ic('arrow')}</span></a>`;
        const band = (cls, eye, title, type, inner) => {
            const isBrandSlider = (cls === 'b1' || cls === 'b2' || cls === 'b3');
            let headHtml = secHead(eye, title, 'ดูทั้งหมด', type);
            if (isBrandSlider) {
                const navBtns = `<div class="brand-nav-group">
                    <button type="button" class="brand-nav-btn" data-scroll-track="track-${cls}" data-scroll-dir="-1" aria-label="เลื่อนซ้าย">
                        <span style="display:inline-flex; transform:rotate(180deg);">${ic('arrow')}</span>
                    </button>
                    <button type="button" class="brand-nav-btn" data-scroll-track="track-${cls}" data-scroll-dir="1" aria-label="เลื่อนขวา">
                        ${ic('arrow')}
                    </button>
                </div>`;
                headHtml = headHtml.replace(/<a[\s\S]*?<\/a>/, navBtns);
            }
            return `<section class="band ${cls}"><div class="wrap">${headHtml}${inner}</div></section>`;
        };

        function home() {
            const baseBrands = ['Canon', 'Sony', 'Nikon', 'Fujifilm', 'Panasonic', 'Blackmagic', 'DJI', 'Sigma', 'Tamron', 'Leica', 'Rode', 'Godox', 'SmallRig', 'Zhiyun', 'Aputure'];
            const allBrands = Array.from(new Set([
                ...(typeof P !== 'undefined' && Array.isArray(P) ? P.map(x => x.brand).filter(Boolean) : []),
                ...(typeof BRAND_LOGOS !== 'undefined' ? Object.keys(BRAND_LOGOS) : []),
                ...baseBrands
            ]));

            const renderBrandRow = (catKey, iconName, typeIdx) => {
                const sorted = [...allBrands].sort((a, b) => getBrandCount(b, catKey) - getBrandCount(a, catKey));
                return sorted.map(b => brandTile(b, getBrandCount(b, catKey), iconName, typeIdx)).join('');
            };

            return `
            <style>
                .brands.brand-carousel {
                    display: flex !important;
                    flex-wrap: nowrap !important;
                    gap: 1.25rem;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    padding: 0.25rem 0 0.75rem;
                }
                .brands.brand-carousel::-webkit-scrollbar {
                    display: none;
                }
                .brands.brand-carousel > * {
                    flex: 0 0 calc(25% - 0.94rem);
                    min-width: 220px;
                }
                @media (max-width: 900px) {
                    .brands.brand-carousel > * {
                        flex: 0 0 calc(50% - 0.625rem);
                    }
                }
                @media (max-width: 540px) {
                    .brands.brand-carousel > * {
                        flex: 0 0 80%;
                    }
                }
                .brand-nav-group {
                    display: inline-flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                .brand-nav-btn {
                    width: 38px;
                    height: 38px;
                    border-radius: 9999px;
                    border: 1px solid #D9B5BA;
                    background: #FFFFFF;
                    color: #4A4A4A;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s, border-color 0.2s;
                }
                .brand-nav-btn:hover {
                    background: #F9E3EA;
                    border-color: #BF4B72;
                    color: #BF4B72;
                }
            </style>
            <main>
                ${heroHome()}
                <!-- ==================== SEARCH SECTION (ช่องค้นหาหลักบนหน้าแรก) ==================== -->
                <div class="wrap sb-after">
                    <div class="searchwrap">${searchBlock()}${advPanel()}</div>
                </div>
                <!-- ==================== BRAND CATEGORIES (หมวดหมู่แบรนด์กล้อง เลนส์ และอุปกรณ์เสริม) ==================== -->
                ${band('b1', 'Camera', 'Camera <em>Brands</em>', 0, `<div id="track-b1" class="brands brand-carousel">${renderBrandRow('camera', 'camera', 0)}</div>`)}
                ${band('b2', 'Lens', 'Lens <em>Brands</em>', 1, `<div id="track-b2" class="brands brand-carousel">${renderBrandRow('lens', 'lens', 1)}</div>`)}
                ${band('b3', 'Accessories', 'Add-ons &amp; <em>Accessories</em>', 2, `<div id="track-b3" class="brands brand-carousel">${renderBrandRow('accessories', 'mic', 2)}</div>`)}
            </main>`;
        }

        /* ---------- [COMPONENT 6] SEARCH / CATALOG VIEW (หน้าค้นหาและแสดงรายการอุปกรณ์) ---------- */
        const SORT_OPTIONS = [
            ['default', 'เรียง: ค่าเริ่มต้น'],
            ['price-asc', 'ราคาต่ำ → สูง'],
            ['price-desc', 'ราคาสูง → ต่ำ'],
            ['name-asc', 'ชื่อ A–Z'],
            ['name-desc', 'ชื่อ Z–A']
        ];

        // Sort a copy so the canonical product array (P) is never mutated.
        function sortCatalogList(list) {
            const sorted = [...list];
            switch (state.sort) {
                case 'price-asc':
                    return sorted.sort((a, b) => (Number(a.p) || 0) - (Number(b.p) || 0));
                case 'price-desc':
                    return sorted.sort((a, b) => (Number(b.p) || 0) - (Number(a.p) || 0));
                case 'name-asc':
                    return sorted.sort((a, b) => String(a.n || '').localeCompare(String(b.n || ''), 'th', { sensitivity: 'base', numeric: true }));
                case 'name-desc':
                    return sorted.sort((a, b) => String(b.n || '').localeCompare(String(a.n || ''), 'th', { sensitivity: 'base', numeric: true }));
                default:
                    return sorted;
            }
        }

        function setCatalogSort(value) {
            state.sort = SORT_OPTIONS.some(([key]) => key === value) ? value : 'default';
            render();
        }

        function catalog() {
            const head = pageHead('Equipment', 'Find your <em>gear</em>.', 'ค้นหาจากอุปกรณ์กว่า 500 รายการ กรองตามหมวด ราคา และวันที่ว่าง');
            const chips = `<div class="chips filters" role="group" aria-label="หมวดหมู่">${['ทั้งหมด', ...TYPES].map((c, i) => `<button type="button" class="chip ${state.type === i - 1 ? 'on' : ''}" data-type-chip="${i - 1}" aria-pressed="${state.type === i - 1}">${c}</button>`).join('')}</div>`;

            // กรองสินค้าตามหมวดหมู่ คำค้นหา ราคา ยี่ห้อ และรายการโปรด
            const kw = String(state.filters.keyword || '').trim().toLowerCase();
            const filtered = P.filter(p => {
                const matchType = state.type < 0 || typeOf(p) === state.type;
                const matchCategory = !state.filters.category || p.c === state.filters.category;
                const matchKw = !kw || String(p.n || '').toLowerCase().includes(kw) || String(p.c || '').toLowerCase().includes(kw) || String(p.s || '').toLowerCase().includes(kw);
                const matchPrice = p.p <= state.filters.maxPrice;
                const matchBrand = state.filters.brand === 'ทุกยี่ห้อ' || String(p.brand || '').trim().toLowerCase() === String(state.filters.brand || '').trim().toLowerCase();
                const matchStatus = !state.filters.onlyAvailable || (p.status === 'Available' && Number(p.stock) > 0);
                const matchFavorite = !state.filters.onlyFavorites || isFavorite(p.id);
                return matchType && matchCategory && matchKw && matchPrice && matchBrand && matchStatus && matchFavorite;
            });
            const list = sortCatalogList(filtered);

            const selectedSort = SORT_OPTIONS.some(([key]) => key === state.sort) ? state.sort : 'default';
            const bar = `<div class="res-bar"><div class="count serif">พบ ${list.length} รายการ</div><label><span class="sr-only">เรียงตาม</span><select class="field" id="catalog-sort" onchange="setCatalogSort(this.value)">${SORT_OPTIONS.map(([value, label]) => `<option value="${value}" ${selectedSort === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label></div>`;
            const favoriteFilter = state.filters.onlyFavorites
                ? `<div class="chips filters" role="status" aria-live="polite"><span class="chip on">รายการโปรด (${getFavoriteCount()})</span><button type="button" class="chip" onclick="clearFavoritesFilter()">ล้างตัวกรองรายการโปรด</button></div>`
                : '';
            const emptyMessage = state.filters.onlyFavorites
                ? 'ยังไม่มีอุปกรณ์ในรายการโปรด กดไอคอนหัวใจที่การ์ดสินค้าเพื่อบันทึกไว้'
                : 'ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไขการค้นหา';
            const pager = `<div class="pager"><button type="button" class="on">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="ถัดไป">${ic('arrow')}</button></div>`;

            return `
            <!-- ==================== CATALOG / SEARCH RESULTS VIEW ==================== -->
            <main class="wrap">
                ${head}
                <div class="searchwrap">${searchBlock()}${advPanel()}</div>
                ${chips}
                ${favoriteFilter}
                ${bar}
                <div class="grid">${list.length ? list.map((p, i) => card(p, i)).join('') : `<p class="muted">${emptyMessage}</p>`}</div>
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
                                <p class="text-[#A8727F] font-medium">ID: 6887032</p>
                                <a href="https://www.instagram.com/b._.oww06" target="_blank" rel="noopener noreferrer" class="team-ig-link">
                                    <i class="fa-brands fa-instagram"></i> 
                                    <h6 class="team-rgb-name ">b._.oww06</h6>
                                </a>
                            </div>
                        </div>

                        <!-- Member 2 -->
                        <div class="team-card">
                            <div>
                                <img class="team-img drop-shadow-md" src="/pic_member/mk039.png" alt="พิมพ์ปวีณ์" style="width: 200px;"><br>
                                <h2 class="font-bold text-lg text-[#4A4A4A]">พิมพ์ปวีณ์ เพชรเจริญ</h2>
                                <p class="text-[#A8727F] font-medium">ID: 6887039</p>
                                <a href="https://www.instagram.com/mhiyoklnwza888/" target="_blank" rel="noopener noreferrer" class="team-ig-link">
                                    <i class="fa-brands fa-instagram"></i>
                                    <h6 class="team-rgb-name ">mhiyoklnwza888</h6>
                                </a>
                            </div>
                        </div>

                        <!-- Member 3 -->
                        <div class="team-card">
                            <div>
                                <img class="team-img drop-shadow-md" src="/pic_member/guy042.png" alt="พีร์ระพี" style="width: 200px;"><br>
                                <h2 class="font-bold text-lg text-[#4A4A4A]">พีร์ระพี คำฟอง</h2>
                                <p class="text-[#A8727F] font-medium">ID: 6887042</p>
                                <a href="https://www.instagram.com/peerapeek/" target="_blank" rel="noopener noreferrer" class="team-ig-link">
                                    <i class="fa-brands fa-instagram"></i>
                                    <h6 class="team-rgb-name ">peerapeek</h6>
                                </a>
                            </div>
                        </div>

                        <!-- Member 4 -->
                        <div class="team-card">
                            <div>
                                <img class="team-img drop-shadow-md" src="/pic_member/sun053.png" alt="วริทธิ์ธวัฒน์" style="width: 300px;"><br>
                                <h2 class="font-bold text-lg text-[#4A4A4A]">วริทธิ์ธวัฒน์ ศรีตระกูลชัย</h2>
                                <p class="text-[#A8727F] font-medium">ID: 6887053</p>
                                <a href="https://www.instagram.com/warittawat/" target="_blank" rel="noopener noreferrer" class="team-ig-link">
                                    <i class="fa-brands fa-instagram"></i>
                                    <h6 class="team-rgb-name ">warittawat</h6>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Member 5 (จัดให้อยู่ตรงกลางด้านล่าง) -->
                    <div class="flex justify-center items-center w-full">
                        <div class="team-card team-member5">
                            <div>
                                <img class="team-img drop-shadow-md" src="/pic_member/fn066.png" alt="อรปรียา" style="width: 200px;"><br>
                                <h2 class="font-bold text-lg text-[#4A4A4A]">อรปรียา ร่มโพธิ์</h2>
                                <p class="text-[#A8727F] font-medium">ID: 6887066</p>
                                <a href="https://www.instagram.com/bambilalarain/" target="_blank" rel="noopener noreferrer" class="team-ig-link">
                                    <i class="fa-brands fa-instagram"></i>
                                    <h6 class="team-rgb-name ">bambilalarain</h6>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>`;
        }

        /* ---------- [COMPONENT 9] PRODUCT DETAIL VIEW (หน้ารายละเอียดอุปกรณ์และการจอง) ---------- */
        function detail() {
            const urlParams = new URLSearchParams(window.location.search);
            const urlId = urlParams.get('id');
            const targetId = (state.item !== undefined && state.item !== null && state.item !== 0 && state.item !== '0')
                ? state.item
                : (urlId || state.item);

            const p = P.find(x => String(x.id) === String(targetId)) || P[0];

            if (!p) {
                return `<main class="wrap py-16 text-center text-[#6F6262]">ไม่พบข้อมูลอุปกรณ์</main>`;
            }

            // อัปเดต URL ให้มี &id= เสมอ (กด F5 รีเฟรชแล้วไม่หลุดไปตัวแรก)
            if (window.location.search.includes('page=detail') && urlParams.get('id') !== String(p.id)) {
                const nextUrl = `${window.location.pathname}${buildPageQuery('detail', p.id)}`;
                window.history.replaceState(
                    { ...(history.state || {}), page: 'detail', item: p.id, depth: currentDepth },
                    '',
                    nextUrl
                );
            }

            const galleryImages = [p.main_image, ...(p.detail_images || [])].filter(Boolean);
            const hasImages = galleryImages.length > 0;
            const isAvailable = p.status === 'Available' && Number(p.stock) > 0;
            const todayStr = new Date().toISOString().split('T')[0];

            return `
            <main class="wrap py-8">
                <div class="text-xs text-[#6F6262] mb-6 flex items-center gap-2 flex-wrap">
                    <button type="button" onclick="goToPage('home')" class="hover:text-[#BF4B72]">Home</button>
                    <span>/</span>
                    <button type="button" onclick="goToPage('search')" class="hover:text-[#BF4B72]">${p.c}</button>
                    <span>/</span>
                    <span class="font-semibold text-[#4A4A4A]">${p.n}</span>
                </div>

                <div class="pd-detail-grid">
                    <!-- ฝั่งซ้าย: Main Image + Thumbnails เฉพาะรูปที่มีจริง -->
                    <div class="space-y-4">
                        <div class="relative aspect-square rounded-3xl bg-[#E8D5D5]/70 border border-[#EBD3D1] overflow-hidden flex items-center justify-center shadow-sm">
                            ${hasImages
                                ? `<img id="pd-main-preview" src="${resolveImageUrl(galleryImages[0])}" alt="${p.n}" class="pd-real-img">`
                                : `<div class="w-32 h-32 text-[#6F6262]">${ic(p.i)}</div>`
                            }
                            <button type="button" data-fav-id="${p.id}" aria-pressed="${isFavorite(p.id) ? 'true' : 'false'}" onclick="apiToggleFavorite('${p.id}')" class="fav-toggle ${isFavorite(p.id) ? 'on' : ''} absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#BF4B72] flex items-center justify-center shadow transition" aria-label="รายการโปรด">
                                <i class="${isFavorite(p.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                            </button>
                        </div>

                        ${hasImages ? `
                        <div class="grid grid-cols-5 gap-3">
                            ${galleryImages.map((imgUrl, idx) => `
                                <button type="button" onclick="switchProductDetailImage('${resolveImageUrl(imgUrl)}', this)" class="pd-thumb-btn ${idx === 0 ? 'active' : ''}">
                                    <img src="${resolveImageUrl(imgUrl)}" alt="${p.n} ${idx + 1}" class="w-full h-full object-cover">
                                </button>
                            `).join('')}
                        </div>
                        ` : ''}

                        <div class="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs text-[#6F6262]">
                            <div class="flex gap-2 flex-wrap">
                                <span class="px-3 py-1 rounded-full bg-[#F9E3EA] text-[#BF4B72] font-semibold">${p.c}</span>
                                <span class="px-3 py-1 rounded-full bg-white border border-[#EBD3D1]">${p.type || p.c}</span>
                            </div>
                            <span><i class="fa-solid fa-location-dot text-[#BF4B72] mr-1"></i> แหล่งที่มา: คลังอุปกรณ์ LekhaFong Studio</span>
                        </div>
                    </div>

                    <!-- ฝั่งขวา: ข้อมูลสินค้าและฟอร์มเลือกวันเช่า -->
                    <div class="bg-white rounded-3xl border border-[#EBD3D1] p-6 md:p-8 shadow-sm">
                        <span class="text-xs font-semibold uppercase tracking-wider text-[#BF4B72]">${p.c}</span>
                        <h1 class="font-serif italic text-3xl md:text-4xl text-[#4A4A4A] mt-1 mb-3 leading-tight">${p.n}</h1>
                        <p class="text-sm text-[#6F6262] leading-relaxed mb-6">${p.description || p.s}</p>

                        <div class="grid grid-cols-3 gap-4 py-4 border-y border-[#EBD3D1] mb-6 text-sm">
                            <div>
                                <div class="text-[11px] text-[#6F6262]">ยี่ห้อ</div>
                                <div class="font-bold text-[#4A4A4A]">${p.brand || '-'}</div>
                            </div>
                            <div>
                                <div class="text-[11px] text-[#6F6262]">ซีรีส์</div>
                                <div class="font-bold text-[#4A4A4A]">${p.model_series || '-'}</div>
                            </div>
                            <div>
                                <div class="text-[11px] text-[#6F6262]">รหัส / สถานะ</div>
                                <div class="font-bold ${isAvailable ? 'text-green-700' : 'text-red-600'}">
                                    ${isAvailable ? `ว่าง (${p.stock} ชิ้น)` : p.status}
                                </div>
                            </div>
                        </div>

                        <div class="flex items-baseline gap-2 mb-6">
                            <span class="font-serif text-4xl font-bold text-[#BF4B72]">฿${Number(p.p).toLocaleString()}</span>
                            <span class="text-xs text-[#6F6262]">/ วัน · มัดจำ 30% ของค่าเช่า (ขั้นต่ำ ฿500)</span>
                        </div>

                        <!-- วิธีรับ-คืนอุปกรณ์ -->
                        <div class="mb-5">
                            <label class="block text-xs font-semibold text-[#6F6262] mb-2">วิธีรับ-คืนอุปกรณ์</label>
                            <div class="space-y-2.5" id="pickup-method-group">
                                <label class="flex items-center gap-3 p-3.5 rounded-2xl border border-[#BF4B72] bg-[#F9E3EA]/60 cursor-pointer">
                                    <input type="radio" name="pickup_method" value="รับ-คืนที่ร้าน" checked class="accent-[#BF4B72]">
                                    <div>
                                        <div class="text-sm font-bold text-[#4A4A4A]">รับ-คืนที่ร้าน</div>
                                        <div class="text-xs text-[#6F6262]">ฟรี · ตรวจสภาพร่วมกันที่หน้าร้าน</div>
                                    </div>
                                </label>
                                <label class="flex items-center gap-3 p-3.5 rounded-2xl border border-[#EBD3D1] bg-white hover:bg-[#FFF5F5] cursor-pointer">
                                    <input type="radio" name="pickup_method" value="จัดส่งถึงที่" class="accent-[#BF4B72]">
                                    <div>
                                        <div class="text-sm font-bold text-[#4A4A4A]">จัดส่งถึงที่</div>
                                        <div class="text-xs text-[#6F6262]">เริ่ม ฿150 · ทั่วกรุงเทพฯ</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- วันรับ - วันคืน -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label for="rent-start-date" class="block text-xs font-semibold text-[#6F6262] mb-1.5">วันรับ</label>
                                <input type="date" id="rent-start-date" min="${todayStr}" class="w-full bg-white border border-[#D9B5BA] rounded-xl px-3.5 py-2.5 text-sm text-[#4A4A4A]">
                            </div>
                            <div>
                                <label for="rent-return-date" class="block text-xs font-semibold text-[#6F6262] mb-1.5">วันคืน</label>
                                <input type="date" id="rent-return-date" min="${todayStr}" class="w-full bg-white border border-[#D9B5BA] rounded-xl px-3.5 py-2.5 text-sm text-[#4A4A4A]">
                            </div>
                        </div>

                        <div id="rental-estimate" data-product-id="${p.id}" class="text-xs bg-[#FFF5F5] border border-[#EBD3D1] rounded-xl px-3.5 py-2.5 mb-5 text-[#6F6262]">
                            เลือกวันรับ–คืนเพื่อดูยอดรวมโดยประมาณ
                        </div>

                        <div class="flex items-center gap-3">
                            <button type="button" onclick="handleRentNowClick('${p.id}')" ${!isAvailable ? 'disabled' : ''} class="flex-1 py-3.5 px-6 rounded-full font-bold text-white shadow transition flex items-center justify-center gap-2 ${isAvailable ? 'bg-[#9E4763] hover:bg-[#863852]' : 'bg-gray-400 cursor-not-allowed'}">
                                <span>${isAvailable ? 'เช่าเลย' : 'ไม่พร้อมให้เช่า'}</span>
                                <i class="fa-solid fa-arrow-right text-xs"></i>
                            </button>
                            <button type="button" data-fav-id="${p.id}" aria-pressed="${isFavorite(p.id) ? 'true' : 'false'}" onclick="apiToggleFavorite('${p.id}')" class="fav-toggle ${isFavorite(p.id) ? 'on' : ''} w-12 h-12 rounded-full border border-[#D9B5BA] bg-white hover:bg-[#FFF5F5] text-[#4A4A4A] flex items-center justify-center transition" aria-label="บันทึก">
                                <i class="${isFavorite(p.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                            </button>
                        </div>

                        <p class="text-xs text-[#6F6262] mt-4">
                            <i class="fa-solid fa-check text-[#BF4B72] mr-1"></i> ยกเลิกหรือเลื่อนวันฟรีล่วงหน้า 48 ชม.
                        </p>
                    </div>
                </div>
            </main>`;
        }

        /* ---------- [COMPONENT 10] ADMIN VIEW (แผงจัดการผู้ใช้และสินค้าสำหรับแอดมิน) ---------- */
        function admin() {
            setTimeout(async () => {
                await apiFetchEquipmentTypes();
                apiAdminFetchUsers();
                apiFetchProducts().then(() => renderAdminProductsTable());
                apiAdminFetchAdmins();
            }, 0);

            const me = state.userProfile || {};
            const typeOptionsHtml = (equipmentTypesCache.length
                ? equipmentTypesCache
                : ['Camera', 'Cinema Camera', 'Lens', 'Microphone', 'Audio', 'Lighting', 'Computer', 'Speaker', 'Accessory']
            ).map(t => `<option value="${t}">${t}</option>`).join('');

            return `
            <main class="admin-shell mt-6">
                <section id="admin-view" class="bg-white rounded-3xl border border-[#EBD3D1] shadow-md overflow-hidden">
                    <div class="w-full bg-[#F2D4CE]/60 px-6 py-4 border-b border-[#EBD3D1] flex justify-between items-center flex-wrap gap-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#BF4B72] shadow-sm">
                                <i class="fa-solid fa-shield-halved"></i>
                            </div>
                            <div>
                                <h2 class="font-bold text-[#4A4A4A] text-lg leading-tight">Administrator Management</h2>
                                <p class="text-xs text-[#6F6262]">เข้าสู่ระบบในฐานะ: <b>${me.username || 'Admin'}</b></p>
                            </div>
                        </div>
                        <button type="button" onclick="logoutAdmin()" class="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full shadow transition flex items-center gap-2 font-medium text-sm">
                            <i class="fa-solid fa-right-from-bracket"></i> Logout
                        </button>
                    </div>

                    <div class="admin-layout-grid">
                        <aside class="bg-[#FFF5F5] border-b md:border-b-0 md:border-r border-[#EBD3D1] p-4 flex md:flex-col gap-2 overflow-x-auto">
                            <button type="button" onclick="openAdminTab('admin-users')" id="btn-admin-users" class="admin-tab-btn flex items-center gap-3 px-4 py-3 bg-[#D9B5BD] rounded-xl transition font-bold text-[#4A4A4A] shadow-sm whitespace-nowrap">
                                <i class="fa-solid fa-users w-4"></i> Users
                            </button>
                            <button type="button" onclick="openAdminTab('admin-products')" id="btn-admin-products" class="admin-tab-btn flex items-center gap-3 px-4 py-3 hover:bg-[#F2D4CE]/50 rounded-xl transition text-[#6F6262] whitespace-nowrap">
                                <i class="fa-solid fa-camera w-4"></i> Products
                            </button>
                            <button type="button" onclick="openAdminTab('admin-admins')" id="btn-admin-admins" class="admin-tab-btn flex items-center gap-3 px-4 py-3 hover:bg-[#F2D4CE]/50 rounded-xl transition text-[#6F6262] whitespace-nowrap">
                                <i class="fa-solid fa-user-shield w-4"></i> Admins
                            </button>
                            <button type="button" onclick="openAdminTab('admin-profile')" id="btn-admin-profile" class="admin-tab-btn flex items-center gap-3 px-4 py-3 hover:bg-[#F2D4CE]/50 rounded-xl transition text-[#6F6262] whitespace-nowrap">
                                <i class="fa-regular fa-circle-user w-4"></i> Profile
                            </button>
                        </aside>

                        <div class="p-6 md:p-8 bg-white min-w-0">
                            <!-- TAB 1: Users (คงเดิม) -->
                            <div id="admin-users" class="admin-tab-content block">
                                <div class="bg-[#F2D4CE]/50 px-5 py-3 mb-6 rounded-xl text-[#4A4A4A] font-bold flex justify-between items-center">
                                    <span>ระบบจัดการผู้ใช้งาน (Customers)</span>
                                    <span id="user-count-badge" class="text-xs bg-white px-3 py-1 rounded-full text-[#BF4B72]">0 รายการ</span>
                                </div>
                                <div id="user-list-view" class="overflow-x-auto rounded-xl border border-[#EBD3D1]">
                                    <table class="w-full text-left border-collapse bg-white">
                                        <thead>
                                            <tr class="bg-[#4A4A4A] text-white text-sm">
                                                <th class="p-4">ID</th>
                                                <th class="p-4">Username</th>
                                                <th class="p-4">ชื่อ-นามสกุล</th>
                                                <th class="p-4">Email</th>
                                                <th class="p-4">เบอร์โทร</th>
                                                <th class="p-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody id="admin-users-tbody" class="text-sm divide-y divide-[#EBD3D1]">
                                            <tr><td colspan="6" class="p-6 text-center text-[#6F6262]">กำลังโหลดข้อมูล...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div id="user-detail-view" class="hidden">
                                    <button type="button" onclick="backToUserList()" class="mb-4 text-[#BF4B72] hover:underline font-medium inline-flex items-center gap-2">
                                        <i class="fa-solid fa-arrow-left"></i> กลับหน้ารายชื่อผู้ใช้
                                    </button>
                                    <div class="bg-[#FFF5F5] border border-[#EBD3D1] p-6 md:p-8 rounded-2xl shadow-sm w-full">
                                        <h3 class="text-xl font-bold text-[#4A4A4A] mb-6 border-b border-[#EBD3D1] pb-3">รายละเอียดและแก้ไขข้อมูลผู้ใช้งาน</h3>
                                        <input type="hidden" id="dt-account-id">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Username</label>
                                                <input type="text" id="dt-username" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Email</label>
                                                <input type="email" id="dt-email" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">ชื่อ (First Name)</label>
                                                <input type="text" id="dt-fname" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">นามสกุล (Last Name)</label>
                                                <input type="text" id="dt-lname" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">เบอร์โทรติดต่อ</label>
                                                <input type="text" id="dt-phone" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div class="md:col-span-2">
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">ที่อยู่ (Address)</label>
                                                <textarea id="dt-address" rows="2" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm"></textarea>
                                            </div>
                                        </div>
                                        <div class="flex flex-wrap gap-3 mt-8 pt-4 border-t border-[#EBD3D1]">
                                            <button type="button" onclick="submitUserUpdate()" class="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 rounded-full font-bold shadow transition text-sm">Update</button>
                                            <button type="button" onclick="apiAdminDeleteUser(document.getElementById('dt-account-id').value, document.getElementById('dt-username').value)" class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold shadow transition text-sm">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- TAB 2: Products -->
                            <div id="admin-products" class="admin-tab-content hidden">
                                <div class="bg-[#F2D4CE]/50 px-5 py-3 mb-6 rounded-xl text-[#4A4A4A] font-bold flex justify-between items-center flex-wrap gap-3">
                                    <span>ระบบจัดการอุปกรณ์ให้เช่า (Equipment)</span>
                                    <button type="button" onclick="showAddProduct()" class="px-4 py-2 bg-[#BF4B72] hover:bg-[#A63C61] text-white rounded-full font-bold shadow transition flex items-center gap-2 text-xs">
                                        <i class="fa-solid fa-plus"></i> Add Product
                                    </button>
                                </div>

                                <div id="product-list-view" class="overflow-x-auto rounded-xl border border-[#EBD3D1]">
                                    <table class="w-full text-left border-collapse bg-white">
                                        <thead>
                                            <tr class="bg-[#4A4A4A] text-white text-sm">
                                                <th class="p-4">ID</th>
                                                <th class="p-4">รูป</th>
                                                <th class="p-4">Product Name</th>
                                                <th class="p-4">Brand / Type</th>
                                                <th class="p-4">Daily Rate</th>
                                                <th class="p-4">Stock / Status</th>
                                                <th class="p-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody id="admin-products-tbody" class="text-sm divide-y divide-[#EBD3D1]">
                                            <tr><td colspan="7" class="p-6 text-center text-[#6F6262]">กำลังโหลดข้อมูล...</td></tr>
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Edit Product -->
                                <div id="product-detail-view" class="hidden">
                                    <button type="button" onclick="backToProductList()" class="mb-4 text-[#BF4B72] hover:underline font-medium inline-flex items-center gap-2">
                                        <i class="fa-solid fa-arrow-left"></i> กลับหน้ารายการอุปกรณ์
                                    </button>
                                    <div class="bg-[#FFF5F5] border border-[#EBD3D1] p-6 md:p-8 rounded-2xl shadow-sm w-full">
                                        <div class="flex justify-between items-center flex-wrap gap-3 mb-6 border-b border-[#EBD3D1] pb-3">
                                            <h3 class="text-xl font-bold text-[#4A4A4A]">แก้ไขข้อมูลอุปกรณ์ (Edit Equipment)</h3>
                                            <button type="button" onclick="openProductImageModal('edit')" class="px-4 py-2 rounded-full bg-white border border-[#BF4B72] text-[#BF4B72] hover:bg-[#F9E3EA] text-xs font-bold shadow-sm transition inline-flex items-center gap-2">
                                                <i class="fa-regular fa-images"></i> จัดการรูปภาพ (1 Main + 4 Detail)
                                            </button>
                                        </div>

                                        <div id="edit-pd-img-summary" class="mb-5"></div>

                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Equipment ID</label>
                                                <input type="text" id="pd-id" readonly class="bg-gray-100 border border-[#D9B5BA] rounded-xl p-2.5 text-sm text-gray-500">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Product Name *</label>
                                                <input type="text" id="pd-name" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Type (ประเภท) *</label>
                                                <select id="pd-type" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                                    ${typeOptionsHtml}
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Brand (ยี่ห้อ)</label>
                                                <input type="text" id="pd-brand" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Serial Number</label>
                                                <input type="text" id="pd-serial" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Model Series</label>
                                                <input type="text" id="pd-series" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Daily Rate (ราคาเช่า/วัน) *</label>
                                                <input type="number" id="pd-price" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Stock (จำนวนสต็อก)</label>
                                                <input type="number" id="pd-stock" min="0" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Status (สถานะ)</label>
                                                <select id="pd-status" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                                    <option value="Available">Available</option>
                                                    <option value="In Use">In Use</option>
                                                    <option value="Maintenance">Maintenance</option>
                                                </select>
                                            </div>
                                            <div class="md:col-span-3">
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Description</label>
                                                <textarea id="pd-desc" rows="2" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm"></textarea>
                                            </div>
                                        </div>
                                        <div class="flex flex-wrap gap-3 mt-8 pt-4 border-t border-[#EBD3D1]">
                                            <button type="button" onclick="submitProductUpdate()" class="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold rounded-full shadow transition text-sm">Update</button>
                                            <button type="button" onclick="apiAdminDeleteProduct(document.getElementById('pd-id').value, document.getElementById('pd-name').value)" class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full shadow transition text-sm">Delete</button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Add Product -->
                                <div id="product-add-view" class="hidden">
                                    <button type="button" onclick="backToProductList()" class="mb-4 text-[#BF4B72] hover:underline font-medium inline-flex items-center gap-2">
                                        <i class="fa-solid fa-arrow-left"></i> ยกเลิก
                                    </button>
                                    <div class="bg-[#FFF5F5] border border-[#EBD3D1] p-6 md:p-8 rounded-2xl shadow-sm w-full">
                                        <div class="flex justify-between items-center flex-wrap gap-3 mb-6 border-b border-[#EBD3D1] pb-3">
                                            <h3 class="text-xl font-bold text-[#4A4A4A]">เพิ่มอุปกรณ์ใหม่ (Add Equipment)</h3>
                                            <button type="button" onclick="openProductImageModal('add')" class="px-4 py-2 rounded-full bg-white border border-[#BF4B72] text-[#BF4B72] hover:bg-[#F9E3EA] text-xs font-bold shadow-sm transition inline-flex items-center gap-2">
                                                <i class="fa-solid fa-plus"></i> เพิ่มรูปภาพ (1 Main + 4 Detail)
                                            </button>
                                        </div>

                                        <div id="add-pd-img-summary" class="mb-5"></div>

                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Product Name *</label>
                                                <input type="text" id="new-pd-name" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm" placeholder="เช่น Sony A7V Mirrorless">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Daily Rate (บาท/วัน) *</label>
                                                <input type="number" id="new-pd-price" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm" placeholder="เช่น 1500">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Type (ประเภท) *</label>
                                                <select id="new-pd-type" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                                    ${typeOptionsHtml}
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Brand (ยี่ห้อ)</label>
                                                <input type="text" id="new-pd-brand" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm" value="Sony">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Serial Number</label>
                                                <input type="text" id="new-pd-serial" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm" placeholder="เช่น SNY-A75-001">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Stock (จำนวนสต็อก)</label>
                                                <input type="number" id="new-pd-stock" min="0" value="1" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Status</label>
                                                <select id="new-pd-status" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                                    <option value="Available">Available</option>
                                                    <option value="In Use">In Use</option>
                                                    <option value="Maintenance">Maintenance</option>
                                                </select>
                                            </div>
                                            <div class="md:col-span-2">
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Description</label>
                                                <textarea id="new-pd-desc" rows="2" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm" placeholder="รายละเอียดสเปกอุปกรณ์"></textarea>
                                            </div>
                                        </div>
                                        <div class="flex justify-end mt-8 pt-4 border-t border-[#EBD3D1]">
                                            <button type="button" onclick="submitNewProduct()" class="px-8 py-2.5 text-white bg-[#BF4B72] hover:bg-[#A63C61] font-bold rounded-full shadow transition text-sm">Save Product</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- TAB 3: Admins (คงเดิม) -->
                            <div id="admin-admins" class="admin-tab-content hidden">
                                <div class="bg-[#F2D4CE]/50 px-5 py-3 mb-6 rounded-xl text-[#4A4A4A] font-bold flex justify-between items-center flex-wrap gap-3">
                                    <span>ระบบจัดการผู้ดูแลระบบ (Admins)</span>
                                    <button type="button" onclick="showAddAdminForm()" class="px-4 py-2 bg-[#BF4B72] hover:bg-[#A63C61] text-white rounded-full font-bold shadow transition flex items-center gap-2 text-xs">
                                        <i class="fa-solid fa-user-plus"></i> Add Admin
                                    </button>
                                </div>
                                <div id="admin-list-view" class="overflow-x-auto rounded-xl border border-[#EBD3D1]">
                                    <table class="w-full text-left border-collapse bg-white">
                                        <thead>
                                            <tr class="bg-[#4A4A4A] text-white text-sm">
                                                <th class="p-4">Admin ID</th>
                                                <th class="p-4">Username</th>
                                                <th class="p-4">ชื่อ-นามสกุล</th>
                                                <th class="p-4">Email</th>
                                                <th class="p-4 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody id="admin-list-tbody" class="text-sm divide-y divide-[#EBD3D1]">
                                            <tr><td colspan="5" class="p-6 text-center text-[#6F6262]">กำลังโหลดข้อมูล...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div id="admin-form-view" class="hidden">
                                    <button type="button" onclick="backToAdminList()" class="mb-4 text-[#BF4B72] hover:underline font-medium inline-flex items-center gap-2">
                                        <i class="fa-solid fa-arrow-left"></i> กลับหน้ารายชื่อ Admin
                                    </button>
                                    <div class="bg-[#FFF5F5] border border-[#EBD3D1] p-6 md:p-8 rounded-2xl shadow-sm w-full">
                                        <h3 id="admin-form-title" class="text-xl font-bold text-[#4A4A4A] mb-6 border-b border-[#EBD3D1] pb-3">เพิ่มผู้ดูแลระบบ (Add Admin)</h3>
                                        <input type="hidden" id="adm-edit-account-id">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Username *</label>
                                                <input type="text" id="adm-username" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Email *</label>
                                                <input type="email" id="adm-email" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">ชื่อ (First Name) *</label>
                                                <input type="text" id="adm-fname" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">นามสกุล (Last Name)</label>
                                                <input type="text" id="adm-lname" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Password*</label>
                                                <input type="password" id="adm-password" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm" placeholder="เว้นว่างหากไม่เปลี่ยนรหัส (ตอนแก้ไข)">
                                            </div>
                                            <div>
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Confirm Password</label>
                                                <input type="password" id="adm-confirm-password" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                            <div class="md:col-span-2">
                                                <label class="block text-xs font-semibold text-[#6F6262] mb-1.5">Address</label>
                                                <input type="text" id="adm-address" class="bg-white border border-[#D9B5BA] rounded-xl p-2.5 text-sm">
                                            </div>
                                        </div>
                                        <div class="flex justify-end mt-8 pt-4 border-t border-[#EBD3D1]">
                                            <button type="button" onclick="submitAdminForm()" class="px-8 py-2.5 text-white bg-[#BF4B72] hover:bg-[#A63C61] font-bold rounded-full shadow transition text-sm">บันทึกข้อมูล Admin</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- TAB 4: Profile (คงเดิม) -->
                            <div id="admin-profile" class="admin-tab-content hidden">
                                <div class="bg-[#F2D4CE]/50 px-5 py-3 mb-6 rounded-xl text-[#4A4A4A] font-bold">ข้อมูลแอดมินปัจจุบัน (Profile)</div>
                                <div class="bg-[#FFF5F5] border border-[#EBD3D1] p-8 rounded-2xl shadow-sm max-w-2xl space-y-4 text-[#4A4A4A]">
                                    <div class="flex items-center gap-4 mb-4">
                                        <div class="w-16 h-16 rounded-full bg-[#F9E3EA] text-[#BF4B72] flex items-center justify-center text-2xl">
                                            <i class="fa-solid fa-user-tie"></i>
                                        </div>
                                        <div>
                                            <h3 class="text-xl font-bold">${me.first_name || me.username || 'Administrator'} ${me.last_name || ''}</h3>
                                            <span class="text-xs px-3 py-1 rounded-full bg-[#D9B5BD] font-semibold">Role: ${me.role || 'Admin'}</span>
                                        </div>
                                    </div>
                                    <p class="border-b border-[#EBD3D1] pb-2"><strong class="w-36 inline-block">Account ID:</strong> ${me.id || '-'}</p>
                                    <p class="border-b border-[#EBD3D1] pb-2"><strong class="w-36 inline-block">Username:</strong> ${me.username || '-'}</p>
                                    <p><strong class="w-36 inline-block">Email:</strong> ${me.email || '-'}</p>
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

        function logoutAdmin() {
            localStorage.removeItem('lekhafong_auth');
            syncAuthFromStorage();
            showToast('ออกจากระบบเรียบร้อยแล้ว', 'success');
            goToPage('home');
        }

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

        function renderAdminUsersTable() {
            const tbody = document.getElementById('admin-users-tbody');
            const badge = document.getElementById('user-count-badge');
            if (badge) badge.textContent = `${adminUsersCache.length} รายการ`;
            if (!tbody) return;

            if (!adminUsersCache.length) {
                tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-[#6F6262]">ยังไม่มีข้อมูลผู้ใช้งาน</td></tr>';
                return;
            }
            tbody.innerHTML = adminUsersCache.map(u => `
                <tr class="hover:bg-[#FFF5F5]/60 transition">
                    <td class="p-4 font-medium">${u.account_id}</td>
                    <td class="p-4 font-semibold text-[#4A4A4A]">${u.username}</td>
                    <td class="p-4">${u.first_name || ''} ${u.last_name || ''}</td>
                    <td class="p-4">${u.email}</td>
                    <td class="p-4">${u.phone || '-'}</td>
                    <td class="p-4 text-center">
                        <button type="button" onclick="openUserDetailById(${u.account_id})" class="text-[#BF4B72] hover:underline font-semibold">ดูเพิ่มเติม</button>
                    </td>
                </tr>
            `).join('');
        }

        function openUserDetailById(accountId) {
            const u = adminUsersCache.find(x => x.account_id === accountId);
            if (!u) return;
            document.getElementById('user-list-view').classList.add('hidden');
            document.getElementById('user-detail-view').classList.remove('hidden');
            document.getElementById('dt-account-id').value = u.account_id;
            document.getElementById('dt-username').value = u.username || '';
            document.getElementById('dt-email').value = u.email || '';
            document.getElementById('dt-fname').value = u.first_name || '';
            document.getElementById('dt-lname').value = u.last_name || '';
            document.getElementById('dt-phone').value = u.phone || '';
            document.getElementById('dt-address').value = u.address || '';
        }

        function submitUserUpdate() {
            const accountId = document.getElementById('dt-account-id').value;
            apiAdminUpdateUser(accountId, {
                username: document.getElementById('dt-username').value.trim(),
                email: document.getElementById('dt-email').value.trim(),
                first_name: document.getElementById('dt-fname').value.trim(),
                last_name: document.getElementById('dt-lname').value.trim(),
                phone: document.getElementById('dt-phone').value.trim(),
                address: document.getElementById('dt-address').value.trim()
            });
        }

        function backToUserList() {
            document.getElementById('user-detail-view').classList.add('hidden');
            document.getElementById('user-list-view').classList.remove('hidden');
        }

        function renderAdminListTable() {
            const tbody = document.getElementById('admin-list-tbody');
            if (!tbody) return;
            if (!adminListCache.length) {
                tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-[#6F6262]">ยังไม่มีข้อมูล Admin</td></tr>';
                return;
            }
            tbody.innerHTML = adminListCache.map(a => `
                <tr class="hover:bg-[#FFF5F5]/60 transition">
                    <td class="p-4 font-medium">#${a.admin_id}</td>
                    <td class="p-4 font-semibold text-[#4A4A4A]">${a.username}</td>
                    <td class="p-4">${a.first_name || ''} ${a.last_name || ''}</td>
                    <td class="p-4">${a.email}</td>
                    <td class="p-4 text-center space-x-3">
                        <button type="button" onclick="openEditAdminForm(${a.account_id})" class="text-[#BF4B72] hover:underline font-semibold">Edit</button>
                        <button type="button" onclick="apiAdminDeleteAdmin(${a.account_id}, '${a.username}')" class="text-red-500 hover:underline font-semibold">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        function showAddAdminForm() {
            document.getElementById('admin-list-view').classList.add('hidden');
            document.getElementById('admin-form-view').classList.remove('hidden');
            document.getElementById('admin-form-title').textContent = 'เพิ่มผู้ดูแลระบบ (Add Admin)';
            document.getElementById('adm-edit-account-id').value = '';
            ['adm-username', 'adm-email', 'adm-fname', 'adm-lname', 'adm-password', 'adm-confirm-password', 'adm-address']
                .forEach(id => document.getElementById(id).value = '');
        }

        function openEditAdminForm(accountId) {
            const a = adminListCache.find(x => x.account_id === accountId);
            if (!a) return;
            document.getElementById('admin-list-view').classList.add('hidden');
            document.getElementById('admin-form-view').classList.remove('hidden');
            document.getElementById('admin-form-title').textContent = `แก้ไขข้อมูล Admin (${a.username})`;
            document.getElementById('adm-edit-account-id').value = a.account_id;
            document.getElementById('adm-username').value = a.username || '';
            document.getElementById('adm-email').value = a.email || '';
            document.getElementById('adm-fname').value = a.first_name || '';
            document.getElementById('adm-lname').value = a.last_name || '';
            document.getElementById('adm-address').value = a.address || '';
            document.getElementById('adm-password').value = '';
            document.getElementById('adm-confirm-password').value = '';
        }

        function submitAdminForm() {
            const editId = document.getElementById('adm-edit-account-id').value;
            const payload = {
                username: document.getElementById('adm-username').value.trim(),
                email: document.getElementById('adm-email').value.trim(),
                first_name: document.getElementById('adm-fname').value.trim(),
                last_name: document.getElementById('adm-lname').value.trim(),
                password: document.getElementById('adm-password').value,
                confirmPassword: document.getElementById('adm-confirm-password').value,
                address: document.getElementById('adm-address').value.trim()
            };
            if (editId) {
                apiAdminUpdateAdmin(editId, payload);
            } else {
                apiAdminAddAdmin(payload);
            }
        }

        function backToAdminList() {
            document.getElementById('admin-form-view').classList.add('hidden');
            document.getElementById('admin-list-view').classList.remove('hidden');
        }
        // ---------------- 1. ล้างฟอร์ม Login ทุกครั้งที่เปิด/ปิด ----------------
        function resetLoginFormState() {
            const form = document.getElementById('login-form');
            if (form) form.reset();
            const emailInput = document.getElementById('login-email');
            const passInput = document.getElementById('login-password');
            if (emailInput) emailInput.value = '';
            if (passInput) {
                passInput.value = '';
                passInput.type = 'password';
            }
            const errEl = document.getElementById('login-error-msg');
            if (errEl) errEl.remove();
            const submitBtn = form?.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
            }
        }

        function toggleModal(modalId) {
            const el = document.getElementById(modalId);
            if (!el) return;
            if (modalId === 'login-modal') {
                resetLoginFormState();
                setTimeout(resetLoginFormState, 20);
            }
            const willOpen = el.classList.contains('hidden');
            el.classList.toggle('hidden');
            if (willOpen) {
                el.classList.add('flex', 'items-center', 'justify-center');
            } else {
                el.classList.remove('flex');
            }
        }

        async function handleLoginSubmit(event) {
            event.preventDefault();
            const email = document.getElementById('login-email')?.value.trim() || '';
            const password = document.getElementById('login-password')?.value || '';

            const user = await apiLoginUser(email, password);
            if (!user) return;

            resetLoginFormState();
            toggleModal('login-modal');

            if (user.role === 'Admin') {
                pendingRentalDraft = null;
                goToPage('admin');
                return;
            }

            render();
            if (pendingRentalDraft) {
                const draft = { ...pendingRentalDraft };
                pendingRentalDraft = null;
                openRentalPopup(draft.productId, draft.startDate, draft.returnDate, draft.pickupMethod);
            }
        }

        // จัดการการกด Submit ฟอร์ม Sign up
        async function handleSignupSubmit(event) {
            event.preventDefault();
            const password = document.getElementById('su-password')?.value || '';
            const phoneInput = document.getElementById('su-phone')?.value.trim() || '';
            const phoneDigits = phoneInput.replace(/[^0-9]/g, '');

            if (!password || !password.trim()) {
                showToast('กรุณากำหนดรหัสผ่านก่อนสมัครสมาชิก', 'error');
                document.getElementById('su-password')?.focus();
                return;
            }
            if (!/^[0-9\s-]+$/.test(phoneInput) || !/^0[689][0-9]{8}$/.test(phoneDigits)) {
                showToast('กรุณากรอกเบอร์โทรศัพท์มือถือให้ถูกต้อง เช่น 0812345678 หรือ 081-234-5678', 'error');
                document.getElementById('su-phone')?.focus();
                return;
            }

            const payload = {
                first_name: document.getElementById('su-first')?.value.trim() || '',
                last_name: document.getElementById('su-last')?.value.trim() || '',
                email: document.getElementById('su-email')?.value.trim() || '',
                phone: phoneDigits,
                address: document.getElementById('su-address')?.value.trim() || '',
                username: document.getElementById('su-username')?.value.trim() || '',
                password: password
            };

            const success = await apiRegisterUser(payload);
            // Keep the entered values when registration fails so the user can fix them.
            if (success) event.target.reset();
        }

        // ---------------- 2. ระบบ Popup อัปโหลดรูปภาพ (1 Main + 4 Detail) ----------------
        let activeProductImages = { productId: null, main_image: '', detail_images: ['', '', '', ''] };
        let imageModalDraft = { mode: 'add', productId: null, main: '', mainFile: null, details: ['', '', '', ''], detailFiles: [null, null, null, null] };

        function emptyImageSet(productId = null) {
            return { productId, main_image: '', detail_images: ['', '', '', ''] };
        }

        // Initialise the editor's image state from one specific product.
        function setActiveProductImagesFromProduct(item) {
            const parsedDetails = parseDetailImages(item?.detail_images);
            activeProductImages = {
                productId: item && item.equipment_id !== undefined ? String(item.equipment_id) : null,
                main_image: normalizeImagePath(item?.main_image || ''),
                detail_images: [0, 1, 2, 3].map(i => normalizeImagePath(parsedDetails[i] || ''))
            };
        }

        function renderProductImageSummary(targetId) {
            const box = document.getElementById(targetId);
            if (!box) return;
            const details = activeProductImages.detail_images.map(normalizeImagePath).filter(Boolean);
            if (!activeProductImages.main_image && details.length === 0) {
                box.innerHTML = `<div class="text-xs text-[#6F6262] bg-white border border-dashed border-[#D9B5BA] rounded-xl px-4 py-3">ยังไม่ได้เลือกรูปภาพ (หากไม่เพิ่ม ระบบจะใช้ไอคอน Placeholder เดิม)</div>`;
                return;
            }
            box.innerHTML = `
                <div class="flex items-center gap-3 flex-wrap bg-white border border-[#EBD3D1] rounded-2xl p-3">
                    ${activeProductImages.main_image ? `
                        <div class="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#BF4B72]">
                            <img src="${resolveImageUrl(activeProductImages.main_image)}" class="w-full h-full object-cover">
                            <span class="absolute bottom-0 inset-x-0 bg-[#BF4B72] text-white text-[9px] text-center">Main</span>
                        </div>
                    ` : ''}
                    ${details.map((u, i) => `
                        <div class="relative w-14 h-14 rounded-xl overflow-hidden border border-[#D9B5BA]">
                            <img src="${resolveImageUrl(u)}" class="w-full h-full object-cover">
                            <span class="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center">#${i + 1}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function releaseDraftPreview(slotType, index) {
            const value = slotType === 'main' ? imageModalDraft.main : imageModalDraft.details[index];
            if (value && String(value).startsWith('blob:')) {
                try { URL.revokeObjectURL(value); } catch { /* ignore */ }
            }
        }

        function discardImageDraft() {
            releaseDraftPreview('main', 0);
            [0, 1, 2, 3].forEach(i => releaseDraftPreview('detail', i));
            imageModalDraft = { mode: 'add', productId: null, main: '', mainFile: null, details: ['', '', '', ''], detailFiles: [null, null, null, null] };
        }

        function openProductImageModal(mode) {
            const currentId = document.getElementById('pd-id')?.value || '';
            const ownerId = activeProductImages.productId || (mode === 'edit' && currentId ? String(currentId) : null);
            imageModalDraft = {
                mode,
                productId: ownerId,
                main: normalizeImagePath(activeProductImages.main_image || ''),
                mainFile: null,
                details: [0, 1, 2, 3].map(i => normalizeImagePath(activeProductImages.detail_images[i] || '')),
                detailFiles: [null, null, null, null]
            };
            renderProductImageModal();
        }

        function renderProductImageModal() {
            const existing = document.getElementById('product-image-modal');
            if (existing) existing.remove();

            const modal = document.createElement('div');
            modal.id = 'product-image-modal';
            modal.className = 'lf-modal-backdrop';
            modal.innerHTML = `
                <div class="lf-modal-card">
                    <div class="lf-modal-body">
                        <div class="flex justify-between items-center mb-5 pb-3 border-b border-[#EBD3D1]">
                            <div>
                                <h3 class="text-lg font-bold text-[#4A4A4A]">จัดการรูปภาพอุปกรณ์</h3>
                                <p class="text-xs text-[#6F6262]">รองรับไฟล์ JPG, PNG, WEBP ขนาดไม่เกิน 5MB ต่อรูป</p>
                            </div>
                            <button type="button" onclick="closeProductImageModal()" class="w-8 h-8 rounded-full hover:bg-[#FFF5F5] text-[#6F6262]">&times;</button>
                        </div>

                        <div class="img-upload-layout">
                            <!-- Main Image -->
                            <div>
                                <div class="text-sm font-bold text-[#4A4A4A] mb-2">Main <span class="text-xs font-normal text-[#BF4B72]">(รูปหลัก)</span></div>
                                <div class="img-drop-slot" onclick="triggerImageSlotInput('main', 0)">
                                    ${imageModalDraft.main ? `
                                        <img src="${resolveImageUrl(imageModalDraft.main)}" alt="Main Preview">
                                        <div class="img-slot-actions" onclick="event.stopPropagation()">
                                            <button type="button" onclick="triggerImageSlotInput('main', 0)" class="px-3 py-1.5 rounded-full bg-white text-[#4A4A4A] text-xs font-bold shadow">เปลี่ยน</button>
                                            <button type="button" onclick="removeImageSlot('main', 0)" class="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold shadow">ลบ</button>
                                        </div>
                                    ` : `<i class="fa-solid fa-plus text-2xl text-[#6F6262]"></i>`}
                                </div>
                            </div>

                            <!-- 4 Detail Images -->
                            <div>
                                <div class="text-sm font-bold text-[#4A4A4A] mb-2">Detail <span class="text-xs font-normal text-[#6F6262]">(รูปเพิ่มเติมสูงสุด 4 รูป)</span></div>
                                <div class="img-detail-grid">
                                    ${[0, 1, 2, 3].map(idx => `
                                        <div class="img-drop-slot" onclick="triggerImageSlotInput('detail', ${idx})">
                                            ${imageModalDraft.details[idx] ? `
                                                <img src="${resolveImageUrl(imageModalDraft.details[idx])}" alt="Detail ${idx + 1}">
                                                <div class="img-slot-actions" onclick="event.stopPropagation()">
                                                    <button type="button" onclick="triggerImageSlotInput('detail', ${idx})" class="px-2.5 py-1 rounded-full bg-white text-[#4A4A4A] text-[11px] font-bold shadow">เปลี่ยน</button>
                                                    <button type="button" onclick="removeImageSlot('detail', ${idx})" class="px-2.5 py-1 rounded-full bg-red-500 text-white text-[11px] font-bold shadow">ลบ</button>
                                                </div>
                                            ` : `<i class="fa-solid fa-plus text-lg text-[#6F6262]"></i>`}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <input type="file" id="hidden-img-picker" accept="image/jpeg,image/png,image/webp" class="hidden">

                        <div class="lf-modal-actions flex justify-end gap-3 mt-7 pt-4 border-t border-[#EBD3D1]">
                            <button type="button" onclick="closeProductImageModal()" class="px-6 py-2.5 rounded-full border border-[#D9B5BA] bg-white hover:bg-[#FFF5F5] text-sm font-semibold text-[#6F6262] transition">
                                ยกเลิก
                            </button>
                            <button type="button" id="btn-confirm-upload-images" onclick="confirmProductImageModal()" class="px-7 py-2.5 rounded-full bg-[#BF4B72] hover:bg-[#A63C61] text-white text-sm font-bold shadow transition">
                                บันทึกรูปภาพ
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        function triggerImageSlotInput(slotType, index) {
            const picker = document.getElementById('hidden-img-picker');
            if (!picker) return;
            picker.value = '';
            picker.onchange = (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    showToast('กรุณาเลือกไฟล์รูปภาพ JPG, PNG หรือ WEBP เท่านั้น', 'error');
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    showToast('ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB', 'error');
                    return;
                }
                const previewUrl = URL.createObjectURL(file);
                if (slotType === 'main') {
                    releaseDraftPreview('main', 0);
                    imageModalDraft.main = previewUrl;
                    imageModalDraft.mainFile = file;
                } else {
                    releaseDraftPreview('detail', index);
                    imageModalDraft.details[index] = previewUrl;
                    imageModalDraft.detailFiles[index] = file;
                }
                renderProductImageModal();
            };
            picker.click();
        }

        function removeImageSlot(slotType, index) {
            if (slotType === 'main') {
                releaseDraftPreview('main', 0);
                imageModalDraft.main = '';
                imageModalDraft.mainFile = null;
            } else {
                releaseDraftPreview('detail', index);
                imageModalDraft.details[index] = '';
                imageModalDraft.detailFiles[index] = null;
            }
            renderProductImageModal();
        }

        function closeProductImageModal() {
            const modal = document.getElementById('product-image-modal');
            if (modal) modal.remove();
            // Cancelling never writes draft changes into activeProductImages.
            discardImageDraft();
        }

        async function confirmProductImageModal() {
            const btn = document.getElementById('btn-confirm-upload-images');
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'กำลังอัปโหลด...';
            }
            try {
                // Guard against a stale modal that belongs to a previous product.
                if (imageModalDraft.mode === 'edit') {
                    const currentId = String(document.getElementById('pd-id')?.value || '');
                    if (imageModalDraft.productId && currentId && String(imageModalDraft.productId) !== currentId) {
                        throw new Error('สินค้าที่กำลังแก้ไขเปลี่ยนไปแล้ว กรุณาเปิดหน้าจัดการรูปภาพใหม่');
                    }
                }

                let finalMain = imageModalDraft.main;
                if (imageModalDraft.mainFile) {
                    finalMain = await apiUploadImageFile(imageModalDraft.mainFile);
                }
                const finalDetails = [...imageModalDraft.details];
                for (let i = 0; i < 4; i++) {
                    if (imageModalDraft.detailFiles[i]) {
                        finalDetails[i] = await apiUploadImageFile(imageModalDraft.detailFiles[i]);
                    }
                }

                const safeMain = normalizeImagePath(finalMain);
                const safeDetails = finalDetails.map(normalizeImagePath).slice(0, 4);
                const hasTemporaryPreview = [safeMain, ...safeDetails].some(v => v.startsWith('blob:') || v.startsWith('data:'));
                if (hasTemporaryPreview) {
                    throw new Error('รูปภาพยังอัปโหลดไม่สำเร็จ กรุณาเลือกไฟล์และลองใหม่อีกครั้ง');
                }

                activeProductImages = {
                    productId: imageModalDraft.productId || activeProductImages.productId || null,
                    main_image: safeMain || '',
                    detail_images: safeDetails
                };
                renderProductImageSummary(imageModalDraft.mode === 'edit' ? 'edit-pd-img-summary' : 'add-pd-img-summary');
                closeProductImageModal();
                showToast('อัปโหลดรูปภาพเรียบร้อยแล้ว กดบันทึกสินค้าเพื่อยืนยันข้อมูล', 'success');
            } catch (err) {
                showToast(err.message, 'error');
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'บันทึกรูปภาพ';
                }
            }
        }

        // อัปเดตฟังก์ชัน Admin Products ให้ส่งรูปภาพและ Stock ไปบันทึกจริง
        function renderAdminProductsTable() {
            const tbody = document.getElementById('admin-products-tbody');
            if (!tbody) return;
            if (!adminProductsCache.length) {
                tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-[#6F6262]">ยังไม่มีข้อมูลอุปกรณ์</td></tr>';
                return;
            }
            tbody.innerHTML = adminProductsCache.map(item => `
                <tr class="hover:bg-[#FFF5F5]/60 transition">
                    <td class="p-4 font-medium">#${item.equipment_id}</td>
                    <td class="p-4">
                        ${item.main_image
                            ? `<img src="${resolveImageUrl(item.main_image)}" class="w-11 h-11 rounded-xl object-cover border border-[#EBD3D1]">`
                            : `<div class="w-11 h-11 rounded-xl bg-[#FFF5F5] border border-[#EBD3D1] flex items-center justify-center text-[#6F6262]"><i class="fa-solid fa-camera"></i></div>`
                        }
                    </td>
                    <td class="p-4 font-semibold text-[#4A4A4A]">${item.name}</td>
                    <td class="p-4">${item.brand} · ${item.type}</td>
                    <td class="p-4 font-semibold text-[#BF4B72]">฿${Number(item.daily_rate).toLocaleString()}</td>
                    <td class="p-4">
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'Available' && Number(item.stock ?? 1) > 0 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">
                            ${item.status} (${item.stock ?? 1})
                        </span>
                    </td>
                    <td class="p-4 text-center">
                        <button type="button" onclick="openProductDetailById(${item.equipment_id})" class="text-[#BF4B72] hover:underline font-semibold">ดูเพิ่มเติม</button>
                    </td>
                </tr>
            `).join('');
        }

        function openProductDetailById(equipmentId) {
            const item = adminProductsCache.find(x => String(x.equipment_id) === String(equipmentId));
            if (!item) return;
            document.getElementById('product-list-view').classList.add('hidden');
            document.getElementById('product-add-view').classList.add('hidden');
            document.getElementById('product-detail-view').classList.remove('hidden');

            document.getElementById('pd-id').value = item.equipment_id;
            document.getElementById('pd-name').value = item.name || '';
            document.getElementById('pd-type').value = item.type || 'Camera';
            document.getElementById('pd-brand').value = item.brand || '';
            document.getElementById('pd-serial').value = item.serial_number || '';
            document.getElementById('pd-series').value = item.model_series || '';
            document.getElementById('pd-price').value = item.daily_rate || 0;
            document.getElementById('pd-stock').value = item.stock ?? 1;
            document.getElementById('pd-status').value = item.status || 'Available';
            document.getElementById('pd-desc').value = item.description || '';

            // Always rebuild the image state from this product. Never reuse the
            // previous product's activeProductImages.
            discardImageDraft();
            setActiveProductImagesFromProduct(item);
            renderProductImageSummary('edit-pd-img-summary');
        }

        function showAddProduct() {
            document.getElementById('product-list-view').classList.add('hidden');
            document.getElementById('product-detail-view').classList.add('hidden');
            document.getElementById('product-add-view').classList.remove('hidden');
            discardImageDraft();
            activeProductImages = emptyImageSet(null);
            const summary = document.getElementById('add-pd-img-summary');
            if (summary) summary.innerHTML = '';
            renderProductImageSummary('add-pd-img-summary');
        }

        function backToProductList() {
            closeProductImageModal();
            activeProductImages = emptyImageSet(null);
            document.getElementById('product-detail-view').classList.add('hidden');
            document.getElementById('product-add-view').classList.add('hidden');
            document.getElementById('product-list-view').classList.remove('hidden');
        }

        function getSafeActiveImagePayload() {
            const main = normalizeImagePath(activeProductImages.main_image || '');
            const details = activeProductImages.detail_images
                .map(normalizeImagePath)
                .filter(Boolean)
                .slice(0, 4);
            const hasTemporaryPreview = [main, ...details].some(v => v.startsWith('blob:') || v.startsWith('data:'));
            if (hasTemporaryPreview) {
                throw new Error('รูปภาพยังอัปโหลดไม่สำเร็จ กรุณากดบันทึกรูปภาพก่อนบันทึกสินค้า');
            }
            return { main_image: main || null, detail_images: details };
        }

        function submitProductUpdate() {
            const id = document.getElementById('pd-id').value;
            // If the form somehow points at another product than the image state,
            // rebuild the image state from that product before saving.
            if (activeProductImages.productId && String(activeProductImages.productId) !== String(id)) {
                const item = adminProductsCache.find(x => String(x.equipment_id) === String(id));
                if (item) {
                    setActiveProductImagesFromProduct(item);
                    renderProductImageSummary('edit-pd-img-summary');
                }
            }

            let images;
            try {
                images = getSafeActiveImagePayload();
            } catch (err) {
                showToast(err.message, 'error');
                return;
            }

            apiAdminUpdateProduct(id, {
                name: document.getElementById('pd-name').value.trim(),
                type: document.getElementById('pd-type').value,
                brand: document.getElementById('pd-brand').value.trim(),
                serial_number: document.getElementById('pd-serial').value.trim(),
                model_series: document.getElementById('pd-series').value.trim(),
                daily_rate: document.getElementById('pd-price').value,
                stock: document.getElementById('pd-stock').value,
                status: document.getElementById('pd-status').value,
                description: document.getElementById('pd-desc').value.trim(),
                main_image: images.main_image,
                detail_images: images.detail_images
            });
        }

        function submitNewProduct() {
            let images;
            try {
                images = getSafeActiveImagePayload();
            } catch (err) {
                showToast(err.message, 'error');
                return;
            }

            apiAdminAddProduct({
                name: document.getElementById('new-pd-name').value.trim(),
                daily_rate: document.getElementById('new-pd-price').value,
                type: document.getElementById('new-pd-type').value,
                brand: document.getElementById('new-pd-brand').value.trim(),
                serial_number: document.getElementById('new-pd-serial').value.trim(),
                stock: document.getElementById('new-pd-stock').value,
                status: document.getElementById('new-pd-status').value,
                description: document.getElementById('new-pd-desc').value.trim(),
                main_image: images.main_image,
                detail_images: images.detail_images
            });
        }

        // ---------------- 3. สลับรูปภาพในหน้า Product Detail ----------------
        function switchProductDetailImage(fullUrl, thumbBtn) {
            const mainImg = document.getElementById('pd-main-preview');
            if (mainImg) mainImg.src = fullUrl;
            document.querySelectorAll('.pd-thumb-btn').forEach(b => b.classList.remove('active'));
            if (thumbBtn) thumbBtn.classList.add('active');
        }

        // ---------------- 4. ระบบกด "เช่าเลย" -> Rental Popup -> Policy Accordion -> Confirmation ----------------
        const RENTAL_POLICIES = [
            {
                title: 'ค่ามัดจำและการคืนเงิน',
                body: 'วางมัดจำ 30% ของค่าเช่า (ขั้นต่ำ ฿500) เพื่อยืนยันการจอง เมื่อคืนอุปกรณ์และตรวจสภาพเรียบร้อยแล้ว ระบบจะคืนเงินมัดจำเต็มจำนวนภายใน 24 ชั่วโมง'
            },
            {
                title: 'ระยะเวลาเช่าและการคืนล่าช้า',
                body: 'คิดค่าเช่าเป็นรายวัน (24 ชั่วโมง) ขั้นต่ำ 1 วัน หากคืนล่าช้าเกิน 2 ชั่วโมง คิดเพิ่ม 50% ของค่าเช่ารายวัน และเกินกว่า 1 วันคิดเต็มวัน'
            },
            {
                title: 'การยกเลิกและเลื่อนวัน',
                body: 'ยกเลิกหรือเลื่อนวันได้ฟรีล่วงหน้า 48 ชั่วโมง หลังจากนั้นหักค่าธรรมเนียม 20% ของค่าเช่า กรณีฝนตกหนักหรือเหตุสุดวิสัย ติดต่อทีมงานเพื่อเลื่อนวันได้'
            },
            {
                title: 'ความเสียหายและการสูญหาย',
                body: 'ตรวจสภาพร่วมกันทุกครั้งตอนรับและคืน หากเกิดความเสียหายจากการใช้งาน ผู้เช่ารับผิดชอบตามค่าซ่อมจริง กรณีสูญหายคิดตามราคาตลาดของอุปกรณ์'
            },
            {
                title: 'เอกสารยืนยันตัวตน',
                body: 'แสดงบัตรประชาชนตัวจริง (หรือหนังสือเดินทาง) ที่มีชื่อตรงกับผู้จองในวันรับอุปกรณ์ พร้อมลงนามในสัญญาเช่าและตรวจสภาพอุปกรณ์ร่วมกับเจ้าหน้าที่'
            }
        ];

        function calculateRentalDays(startStr, returnStr) {
            if (!startStr || !returnStr) return 0;
            const s = new Date(startStr);
            const r = new Date(returnStr);
            if (isNaN(s.getTime()) || isNaN(r.getTime())) return 0;
            return Math.ceil((r.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
        }

        // Shared pricing helper so the detail estimate and the confirmation
        // popup can never disagree. Delivery is a UI-side charge only.
        function calculateRentalQuote({ dailyRate, startDate, returnDate, pickupMethod }) {
            const rate = Number(dailyRate) || 0;
            const days = calculateRentalDays(startDate, returnDate);
            const equipmentFee = days > 0 ? days * rate : 0;
            const deliveryFee = pickupMethod === DELIVERY_PICKUP_METHOD ? DELIVERY_FEE : 0;
            return {
                days,
                dailyRate: rate,
                equipmentFee,
                deliveryFee,
                total: equipmentFee + deliveryFee,
                pickupMethod: pickupMethod || 'รับ-คืนที่ร้าน'
            };
        }

        function updateRentalEstimate() {
            const box = document.getElementById('rental-estimate');
            if (!box) return;
            const productId = box.dataset.productId || state.item;
            const p = P.find(x => String(x.id) === String(productId));
            if (!p) return;

            const startDate = document.getElementById('rent-start-date')?.value || '';
            const returnDate = document.getElementById('rent-return-date')?.value || '';
            const pickupMethod = document.querySelector('input[name="pickup_method"]:checked')?.value || 'รับ-คืนที่ร้าน';
            const quote = calculateRentalQuote({ dailyRate: p.p, startDate, returnDate, pickupMethod });

            if (!startDate || !returnDate || quote.days <= 0) {
                box.innerHTML = '<span class="text-[#6F6262]">เลือกวันรับ–คืนเพื่อดูยอดรวมโดยประมาณ</span>';
                return;
            }
            box.innerHTML = `
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>ค่าเช่า ${quote.days} วัน: <b class="text-[#4A4A4A]">฿${quote.equipmentFee.toLocaleString()}</b></span>
                    <span>ค่าจัดส่ง: <b class="text-[#4A4A4A]">${quote.deliveryFee ? `฿${quote.deliveryFee.toLocaleString()}` : 'ฟรี'}</b></span>
                    <span>รวม: <b class="text-[#BF4B72]">฿${quote.total.toLocaleString()}</b></span>
                </div>`;
        }

        function formatDateThaiSlash(dateStr) {
            if (!dateStr) return '-';
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }

        function handleRentNowClick(productId) {
            const p = P.find(x => x.id === String(productId));
            if (!p) return;

            if (p.status !== 'Available' || Number(p.stock) <= 0) {
                showToast('อุปกรณ์นี้ไม่พร้อมให้เช่าในช่วงวันที่เลือก', 'error');
                return;
            }

            const startDate = document.getElementById('rent-start-date')?.value || '';
            const returnDate = document.getElementById('rent-return-date')?.value || '';
            const pickupMethod = document.querySelector('input[name="pickup_method"]:checked')?.value || 'รับ-คืนที่ร้าน';

            if (!startDate || !returnDate) {
                showToast('กรุณาเลือกวันรับและวันคืนอุปกรณ์ก่อนกดเช่าเลย', 'warning');
                document.getElementById('rent-start-date')?.focus();
                return;
            }

            const days = calculateRentalDays(startDate, returnDate);
            if (days <= 0) {
                showToast('วันคืนอุปกรณ์ต้องอยู่หลังวันรับอุปกรณ์อย่างน้อย 1 วัน', 'error');
                document.getElementById('rent-return-date')?.focus();
                return;
            }

            syncAuthFromStorage();
            if (!state.currentUser || !state.userProfile) {
                pendingRentalDraft = { productId: p.id, startDate, returnDate, pickupMethod };
                showToast('กรุณาเข้าสู่ระบบก่อนทำรายการเช่าอุปกรณ์', 'warning');
                toggleModal('login-modal');
                return;
            }

            openRentalPopup(p.id, startDate, returnDate, pickupMethod);
        }

        function openRentalPopup(productId, startDate, returnDate, pickupMethod) {
            const p = P.find(x => x.id === String(productId));
            if (!p) return;

            const quote = calculateRentalQuote({
                dailyRate: p.p,
                startDate,
                returnDate,
                pickupMethod
            });
            const { days, dailyRate, equipmentFee, deliveryFee, total: totalPrice } = quote;

            const existing = document.getElementById('rental-confirm-popup');
            if (existing) existing.remove();

            // บันทึก state ร่วมกับ History API เพื่อรองรับ Browser Back
            history.pushState({ ...history.state, modal: 'rental' }, '', window.location.search);

            const modal = document.createElement('div');
            modal.id = 'rental-confirm-popup';
            modal.className = 'lf-modal-backdrop';
            modal.innerHTML = `
                <div class="lf-modal-card">
                    <div class="lf-modal-body text-center">
                        <span class="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#F9E3EA] text-[#BF4B72] mb-2">ยืนยันรายการเช่าอุปกรณ์</span>
                        <h3 class="font-serif text-2xl md:text-3xl font-bold text-[#4A4A4A] mb-2">${p.n}</h3>
                        <div class="text-2xl md:text-3xl font-bold text-[#4A4A4A] my-3">
                            เช่า <span class="text-[#BF4B72]">${String(days).padStart(2, '0')}</span> วัน ยอดรวม <span class="text-[#BF4B72]">${totalPrice.toLocaleString()}</span> บาท
                        </div>

                        <div class="bg-[#FFF5F5] border border-[#EBD3D1] rounded-2xl p-4 my-4 text-left text-xs md:text-sm space-y-1.5 text-[#6F6262]">
                            <div class="flex justify-between"><span>สินค้า:</span><strong class="text-[#4A4A4A]">${p.n}</strong></div>
                            <div class="flex justify-between"><span>ราคาต่อวัน:</span><strong class="text-[#4A4A4A]">฿${dailyRate.toLocaleString()} / วัน</strong></div>
                            <div class="flex justify-between"><span>ช่วงวันที่เช่า:</span><strong class="text-[#4A4A4A]">${formatDateThaiSlash(startDate)} - ${formatDateThaiSlash(returnDate)} (${days} วัน)</strong></div>
                            <div class="flex justify-between"><span>วิธีรับ-คืน:</span><strong class="text-[#4A4A4A]">${pickupMethod}</strong></div>
                            <div class="flex justify-between"><span>ค่าเช่าอุปกรณ์ (${days} วัน):</span><strong class="text-[#4A4A4A]">฿${equipmentFee.toLocaleString()}</strong></div>
                            <div class="flex justify-between"><span>ค่าจัดส่ง:</span><strong class="text-[#4A4A4A]">${deliveryFee ? `฿${deliveryFee.toLocaleString()}` : 'ฟรี (รับ-คืนที่ร้าน)'}</strong></div>
                            <div class="flex justify-between pt-1.5 border-t border-[#EBD3D1] text-sm"><span>ยอดรวมทั้งสิ้น:</span><strong class="text-[#BF4B72] text-base">฿${totalPrice.toLocaleString()}</strong></div>
                        </div>

                        <hr class="border-[#EBD3D1] my-4">

                        <!-- Policy Accordion 5 หัวข้อ -->
                        <div class="rental-policy-box text-left mb-6">
                            ${RENTAL_POLICIES.map((pol, idx) => `
                                <div class="rental-policy-item">
                                    <button type="button" onclick="toggleRentalPolicy(${idx})" class="rental-policy-trigger">
                                        <span>${pol.title}</span>
                                        <span id="pol-icon-${idx}" class="text-[#BF4B72] font-bold text-base">+</span>
                                    </button>
                                    <div id="pol-panel-${idx}" class="rental-policy-panel hidden">
                                        ${pol.body}
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="lf-modal-actions flex justify-center gap-4">
                            <button type="button" onclick="cancelRentalPopup()" class="px-8 py-3 rounded-full border border-[#D9B5BA] bg-[#F5EFEF] hover:bg-[#EAE0E0] text-[#4A4A4A] font-bold text-sm transition min-w-[130px]">
                                ยกเลิก
                            </button>
                            <button type="button" id="btn-confirm-rental-submit" onclick="confirmRentalBooking('${p.id}', '${startDate}', '${returnDate}', '${pickupMethod}')" class="px-8 py-3 rounded-full bg-[#BF4B72] hover:bg-[#A63C61] text-white font-bold text-sm shadow transition min-w-[130px]">
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        function toggleRentalPolicy(index) {
            const panel = document.getElementById(`pol-panel-${index}`);
            const icon = document.getElementById(`pol-icon-${index}`);
            if (!panel || !icon) return;
            const isHidden = panel.classList.contains('hidden');
            panel.classList.toggle('hidden');
            icon.textContent = isHidden ? '−' : '+';
        }

        function cancelRentalPopup(fromPopState = false) {
            const modal = document.getElementById('rental-confirm-popup');
            if (modal) modal.remove();
            // รีเซ็ตวันที่ในหน้า Product Detail เพื่อให้เลือกใหม่ได้สะอาดเมื่อเปิดครั้งถัดไป
            const sInput = document.getElementById('rent-start-date');
            const rInput = document.getElementById('rent-return-date');
            if (sInput) sInput.value = '';
            if (rInput) rInput.value = '';
            if (!fromPopState && history.state?.modal === 'rental') {
                history.back();
            }
        }

        async function confirmRentalBooking(productId, startDate, returnDate, pickupMethod) {
            const btn = document.getElementById('btn-confirm-rental-submit');
            if (btn) {
                btn.disabled = true;
                btn.textContent = 'กำลังบันทึก...';
            }

            try {
                const product = P.find(x => String(x.id) === String(productId));
                const quote = calculateRentalQuote({
                    dailyRate: product?.p || 0,
                    startDate,
                    returnDate,
                    pickupMethod
                });

                const rentalResult = await apiSubmitRental({
                    account_id: state.userProfile.id,
                    equipment_id: Number(productId),
                    start_date: startDate,
                    return_date: returnDate,
                    pickup_method: pickupMethod
                });

                const popup = document.getElementById('rental-confirm-popup');
                if (popup) popup.remove();

                // โหลดข้อมูลสินค้าล่าสุดจาก MySQL เพื่อให้ Stock อัปเดตทันที
                await apiFetchProducts();
                showRentalSuccessPopup(rentalResult, quote);
            } catch (err) {
                showToast(err.message, 'error');
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'ยืนยัน';
                }
            }
        }

        function showRentalSuccessPopup(rental, quote) {
            const existing = document.getElementById('rental-success-popup');
            if (existing) existing.remove();

            const equipmentFee = Number(rental.total_price) || 0;
            const deliveryFee = Number(quote?.deliveryFee) || 0;
            const grandTotal = equipmentFee + deliveryFee;
            const deliveryLabel = deliveryFee ? `฿${deliveryFee.toLocaleString()}` : 'ฟรี (รับ-คืนที่ร้าน)';

            const modal = document.createElement('div');
            modal.id = 'rental-success-popup';
            modal.className = 'lf-modal-backdrop';
            modal.innerHTML = `
                <div class="lf-modal-card compact">
                    <div class="lf-modal-body text-center py-8">
                        <div class="w-20 h-20 rounded-full bg-[#2E8B57] text-white flex items-center justify-center mx-auto mb-5 shadow-lg">
                            <i class="fa-solid fa-check text-4xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-[#4A4A4A] mb-1">ทำรายการเช่าสำเร็จ</h3>
                        <p class="text-sm text-[#6F6262] mb-5">ขอบคุณที่ไว้วางใจและใช้บริการ LekhaFong Production</p>

                        <div class="bg-[#FFF5F5] border border-[#EBD3D1] rounded-2xl p-4 mb-4 text-left text-xs space-y-1.5 text-[#6F6262]">
                            <div class="flex justify-between"><span>รหัสการเช่า (Rental ID):</span><strong class="text-[#BF4B72]">#${rental.rental_id}</strong></div>
                            <div class="flex justify-between"><span>สินค้า:</span><strong class="text-[#4A4A4A]">${rental.product_name}</strong></div>
                            <div class="flex justify-between"><span>จำนวน:</span><strong class="text-[#4A4A4A]">${rental.rental_days} วัน (${formatDateThaiSlash(rental.start_date)} - ${formatDateThaiSlash(rental.return_date)})</strong></div>
                            <div class="flex justify-between"><span>ค่าเช่าอุปกรณ์ (บันทึกในระบบ):</span><strong class="text-[#4A4A4A]">฿${equipmentFee.toLocaleString()}</strong></div>
                            <div class="flex justify-between"><span>ค่าจัดส่ง (ประเมิน):</span><strong class="text-[#4A4A4A]">${deliveryLabel}</strong></div>
                            <div class="flex justify-between pt-1.5 border-t border-[#EBD3D1]"><span>ยอดรวมที่แสดง:</span><strong class="text-[#BF4B72] text-base">฿${grandTotal.toLocaleString()}</strong></div>
                            <div class="flex justify-between"><span>สถานะ:</span><strong class="text-green-700">${rental.status}</strong></div>
                        </div>
                        ${deliveryFee ? '<p class="text-[11px] text-[#6F6262] mb-5 leading-relaxed">หมายเหตุ: ระบบฐานข้อมูลบันทึกเฉพาะค่าเช่าอุปกรณ์ ค่าจัดส่งเป็นยอดประเมินสำหรับหน้านี้และยังไม่ถูกบันทึกในฐานข้อมูล</p>' : '<div class="mb-5"></div>'}

                        <button type="button" onclick="finishRentalSuccess()" class="px-10 py-3 rounded-full bg-[#2E8B57] hover:bg-[#257247] text-white font-bold text-sm shadow transition">
                            เรียบร้อย
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        function finishRentalSuccess() {
            const modal = document.getElementById('rental-success-popup');
            if (modal) modal.remove();
            if (history.state?.modal === 'rental') {
                history.replaceState({ ...history.state, modal: null }, '', window.location.search);
            }
            render();
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
            enforceAdminGuard();
            const pages = { home, search: catalog, terms, team, detail, admin };
            const currentRenderer = pages[state.p] || home;
            const site = $('#site');
            site.className = 'site v-' + (PAGE_VARIANT[state.p] || 'a');
            site.innerHTML = nav() + currentRenderer() + footer();
            initCarousels();
            syncFavoriteButtons();
            if (state.p === 'detail') updateRentalEstimate();
        }

        // จัดการคลิกทั้งหมดบนหน้าเว็บผ่าน Event Delegation
        document.addEventListener('click', e => {
            const t = e.target;
            if (t.closest('a[href="#"]')) e.preventDefault();

            const navBtn = t.closest('[data-scroll-track]');
            if (navBtn) {
                e.preventDefault();
                const dir = Number(navBtn.dataset.scrollDir) || 1;
                window.scrollBrands(navBtn.dataset.scrollTrack, dir);
                return;
            }
            // เปลี่ยนหน้าจากลิงก์เมนู / การ์ดแบรนด์ / การ์ดสินค้า / Breadcrumb
            const go = t.closest('[data-go]');
            if (go) {
                const targetPage = go.dataset.go;
                const targetType = targetPage === 'search'
                    ? (go.dataset.type === undefined ? -1 : +go.dataset.type)
                    : state.type;
                state.filters.brand = (targetPage === 'search' && go.dataset.brand) ? go.dataset.brand : 'ทุกยี่ห้อ';

                const clickedItem = go.dataset.item ?? go.dataset.id;
                if (targetPage === 'detail' && clickedItem !== undefined) {
                    state.item = clickedItem;
                }

                goToPage(targetPage, { type: targetType, item: state.item });
                return;
            }

            // กรองหมวดหมู่ในหน้า Search
            const tc = t.closest('[data-type-chip]');
            if (tc) {
                state.type = +tc.dataset.typeChip;
                state.filters.onlyFavorites = false;
                if (state.type === -1) {
                    state.filters.brand = 'ทุกยี่ห้อ';
                    state.filters.keyword = '';
                }
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
            // เปิดหน้ารายละเอียดอุปกรณ์
            const det = t.closest('[data-detail]');
            if (det) {
                goToPage('detail', { item: det.dataset.detail });
                return;
            }

            // สลับสไลด์แบนเนอร์หน้าแรก
            const sl = t.closest('[data-slide]');
            if (sl) {
                state.slide = +sl.dataset.slide;
                render();
                return;
            }

            // เลือก Chip หมวดหมู่ใน Advance Search (เลือกได้ 1 หมวด หรือกดซ้ำเพื่อยกเลิก)
            const chip = t.closest('[data-chip]');
            if (chip) {
                const wasOn = chip.classList.contains('on');
                chip.parentElement.querySelectorAll('[data-chip]').forEach(c => c.classList.remove('on'));
                if (!wasOn) chip.classList.add('on');
                return;
            }
        });

        // อัปเดตตัวเลขราคาเมื่อเลื่อน Slider ใน Advance Search
        document.addEventListener('input', e => {
            if (e.target.type === 'range') {
                e.target.parentElement.querySelector('.range-val').textContent = '฿' + (+e.target.value).toLocaleString('en-US');
            }
        });

        // Keep the detail-page estimate in sync with dates and pickup method.
        document.addEventListener('change', e => {
            if (e.target.matches('#rent-start-date, #rent-return-date, input[name="pickup_method"]')) {
                updateRentalEstimate();
            }
        });
        document.addEventListener('input', e => {
            if (e.target.matches('#rent-start-date, #rent-return-date')) {
                updateRentalEstimate();
            }
        });