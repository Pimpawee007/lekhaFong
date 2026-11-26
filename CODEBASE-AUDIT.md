# LeKhaFong Production — Codebase Audit & Prioritized Fix Plan

**Audit date:** 2026-11-26  
**Repository:** `/home/bewithnn/lekhaFong` (remote: `Pimpawee007/lekhaFong`)  
**Audited revision:** `e61a9df` (`almost done`)  
**Audit mode:** read-only inspection + non-mutating runtime probes + database introspection  
**Application files changed:** none  
**Database rows changed:** none (only `SELECT` / `SHOW` statements were executed)  
**Deliverable:** this document only

> **Important:** No application behavior was modified. Every recommendation below is a plan, not an applied change. `.env` was read but not edited, and no database was dropped, reset, seeded, or migrated.

---

## 0. Executive Summary

LeKhaFong is a small two-process application: a vanilla-JavaScript single-page frontend served by a hand-written Node HTTP server on port `3030`, and an Express 5 REST API backed by MariaDB/MySQL on port `3031`. The feature set covers a public catalog, customer registration/login, rental checkout UI, and an admin CRUD console.

The code is understandable and the database schema is normalized at a basic level, but the application is **not safe to expose beyond an isolated development machine** and is **not internally consistent enough for reliable rental operations**.

### Severity counts

| Severity | Count | Meaning |
|---|---:|---|
| **P0 / Critical** | 6 | Credential disclosure, broken auth, XSS, destructive DB workflow, rental data loss |
| **P1 / High** | 8 | LAN access broken/exposed, DoS, upload abuse, schema races, validation gaps |
| **P2 / Medium** | 7 | Navigation bugs, dead UI controls, repo hygiene, performance, missing tests/CI |
| **P3 / Low** | 4 | Cleanup, privacy hardening, backups, production deployment |

### The six issues to fix first

1. **Secrets and default credentials are exposed** in git history and seed data; rotate them.
2. **`lekhafong_production.sql` begins with `DROP DATABASE IF EXISTS`** — running it destroys the live database.
3. **Passwords are stored and compared in plaintext**, including known seeded accounts.
4. **The API has no authentication or authorization at all**, and the admin UI is guarded only by editable `localStorage`.
5. **Stored XSS is systemic**: database/user strings are interpolated into `innerHTML` and inline `onclick` handlers.
6. **Rental checkout never writes `RENTAL`, `ITEM`, or `CONTRACT`.** It decrements stock, returns a random unused rental ID, and reports a status (`Confirmed`) that the schema's `CHECK` constraint does not allow.

### What is relatively good

- SQL queries use parameter binding for user values; no direct SQL injection was found in the normal paths.
- The rental stock decrement does use `SELECT ... FOR UPDATE` inside a transaction.
- Uploads have a MIME allowlist and a 5 MB size limit.
- The schema has foreign keys and `CHECK` constraints for roles, statuses, and prices.
- `npm audit` reported **0 known vulnerabilities** for the current lockfile at audit time.
- The UI is visually coherent and responsive across the main breakpoints.

---

## 1. Scope, Method, and Constraints

### 1.1 Files reviewed

All hand-written application files were read:

| File | Lines | Purpose |
|---|---:|---|
| `backend/database.js` | 581 | Entire Express API, auth, CRUD, upload, rental, DB pool |
| `frontend/frontserver.js` | 45 | Static file server for the SPA |
| `frontend/index.html` | 205 | Shell, auth modal, CDN dependencies |
| `frontend/script.js` | 2,780 | Entire SPA: state, renderer, API client, admin, rental |
| `frontend/style.css` | 713 | Theme, layout, responsive rules, modals |
| `lekhafong_production.sql` | 136 | Destructive schema + seed dump |
| `backend/package.json` / lock | — | API dependencies |
| `frontend/package.json` / lock | — | Static server dependencies |
| `.gitignore` | 3 | Ignore rules |

### 1.2 Runtime probes performed

The servers were started briefly, probed, and stopped. No mutating endpoint was called.

| Probe | Result |
|---|---|
| Node.js | `v22.23.5` |
| npm | `10.9.9` |
| Database server | MariaDB `10.11.14` (Ubuntu 24.04), not MySQL |
| Database client | `mysql Ver 15.1 Distrib 10.11.14-MariaDB` |
| Backend listener | `*:3031` (all interfaces) |
| Frontend listener | `127.0.0.1:3030` (loopback only) |
| LAN address of host | `192.168.1.182` |
| `GET /api/products` | `200`, data returned |
| `GET /api/users` without auth | `200`, customer PII returned |
| Request with `Origin: http://192.168.1.182:3030` | Response still set `Access-Control-Allow-Origin: http://localhost:3030` → browser would block |
| `GET http://192.168.1.182:3030/` | Connection failed (frontend not LAN-accessible) |
| `GET /package.json` on frontend | `200` |
| `GET /node_modules/express/package.json` | `200` |
| `GET /%` on frontend | Process crashed with `URIError: URI malformed`; confirmed DoS |
| Backend with missing `PORT` | Node listened on a random port on `::` (all interfaces) |
| `npm audit --omit=dev` | 0 known vulnerabilities |

### 1.3 Live database snapshot (read-only)

| Table | Rows |
|---|---:|
| `USER_ACCOUNT` | 2 |
| `ADMIN` | 1 |
| `CUSTOMER` | 1 |
| `EQUIPMENT` | 14 |
| `RENTAL` | 0 |
| `ITEM` | 0 |
| `CONTRACT` | 0 |
| `LOGIN` | 0 |

The live schema matches the supplied dump. `RENTAL`, `ITEM`, and `CONTRACT` are empty, which confirms that the UI's “successful” rental flow has never produced persistent rental records.

### 1.4 Constraints honored

- No database was dropped, reset, truncated, seeded, or migrated.
- No `.env` file was overwritten or edited.
- No development server was left running or exposed publicly.
- No application behavior was changed.
- Only `SELECT`/`SHOW` database statements were used.
- No secret values are reproduced in this document.

---

## 2. Architecture

### 2.1 Runtime topology (as implemented)

```
┌─────────────────────────────┐
│ Browser (same machine or LAN)│
└──────────────┬──────────────┘
               │ HTTP :3030
               ▼
┌─────────────────────────────┐        ┌──────────────────────────────┐
│ frontend/frontserver.js     │        │ External CDNs                │
│ - reads files from disk     │        │ - cdn.tailwindcss.com        │
│ - no proxy                  │        │ - Google Fonts               │
│ - binds 127.0.0.1 only      │        │ - cdnjs Font Awesome         │
└──────────────┬──────────────┘        └──────────────────────────────┘
               │ static HTML/CSS/JS
               ▼
┌─────────────────────────────┐
│ frontend/script.js          │
│ - fetch hardcoded to        │
│   http://localhost:3031/api │
└──────────────┬──────────────┘
               │ HTTP :3031 (cross-origin)
               ▼
┌─────────────────────────────┐
│ backend/database.js          │
│ - Express 5                  │
│ - binds *:3031 by default    │
│ - mysql2/promise pool        │
│ - multer disk uploads        │
│ - serves /uploads            │
└──────────────┬──────────────┘
               │ TCP 127.0.0.1:3306
               ▼
┌─────────────────────────────┐
│ MariaDB 10.11                │
│ lekhafong_production         │
│ 8 tables, utf8mb4            │
└─────────────────────────────┘
```

**Key architectural fact:** the frontend and backend are separate origins (`:3030` and `:3031`), there is no reverse proxy, and the frontend has no runtime configuration mechanism. Any access from another device breaks because `localhost` in the browser resolves to that device, not the server.

### 2.2 Component inventory

| Layer | Technology | Notes |
|---|---|---|
| Frontend | Vanilla ES2020+ JavaScript, no framework, no bundler | `script.js` is a 2,780-line IIFE-like global script |
| Rendering | Template literals + `innerHTML` | Full re-render on state change |
| Routing | `history.pushState` / `popstate`, query-string pages | `?page=home|search|detail|terms|team|admin` |
| Auth state | `localStorage['lekhafong_auth']` | Stores `{id, username, role, ...}` with no token or expiry |
| Styling | Custom CSS + Tailwind CDN + Font Awesome CDN | Tailwind runtime CDN is not production-grade |
| Backend | Node.js 22, Express 5, CommonJS | All routes in one file |
| DB driver | `mysql2/promise` pool | No pool tuning, no explicit timezone |
| Uploads | `multer` disk storage | `backend/uploads`, 5 MB, JPG/PNG/WEBP MIME filter |
| Database | MariaDB 10.11 / MySQL-compatible DDL | 8 tables, InnoDB, `utf8mb4_general_ci` |
| Process model | Two manual `npm start` processes | No PM2/systemd/Docker/CI |

### 2.3 Repository layout

```
/home/bewithnn/lekhaFong
├── .gitignore
├── CODEBASE-AUDIT.md          ← new audit document
├── lekhafong_production.sql   ← destructive bootstrap dump
├── backend/
│   ├── database.js            ← entire API
│   ├── package.json
│   ├── package-lock.json
│   ├── .env                   ← local only, not tracked at HEAD
│   ├── uploads/               ← runtime image files
│   └── node_modules/          ← 1,966 tracked files (repo hygiene issue)
├── frontend/
│   ├── frontserver.js
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   ├── banner/{1,2,3}.png
│   ├── pic_member/*.png
│   ├── lekhaFongLogo.png
│   ├── package.json
│   ├── package-lock.json
│   └── node_modules/
└── node_modules/              ← stray root dependencies with no root package.json
```

### 2.4 Request and data flows

**Public catalog**
1. Browser loads `index.html` and `script.js`.
2. `DOMContentLoaded` calls `apiFetchProducts()` → `GET /api/products`.
3. Backend returns all `EQUIPMENT` rows.
4. `mapEquipmentToProduct()` maps DB rows into UI objects (`P`).
5. `render()` rebuilds the entire page from `state` and `P`.

**Registration**
1. Signup form → `POST /api/auth/register`.
2. Backend opens a transaction, checks duplicate email **only in `CUSTOMER`**, allocates `MAX(id)+1`, inserts `USER_ACCOUNT`, inserts `CUSTOMER`, commits.
3. Frontend shows a toast and switches to login. No auto-login and no token is issued.

**Login**
1. Login form → `POST /api/auth/login` with `{email, password}`.
2. Backend searches `CUSTOMER.email`, then `ADMIN.email`, then `USER_ACCOUNT.username` to find an `account_id`.
3. Backend compares plaintext password in `USER_ACCOUNT.password`.
4. Backend inserts a `LOGIN` row (`Success` or `Failed`).
5. Backend returns the full profile object; frontend stores it in `localStorage`.
6. **No session, cookie, JWT, or server-side auth state is created.**

**Rental**
1. Product detail page collects dates and pickup method.
2. If logged out, the draft is placed in `pendingRentalDraft` and the login modal opens.
3. Confirmation popup → `POST /api/rentals` with `{account_id, equipment_id, start_date, return_date, pickup_method}`.
4. Backend locks one `EQUIPMENT` row with `FOR UPDATE`, checks `status === 'Available'` and `stock > 0`, decrements `stock`, flips status to `In Use` at zero, commits.
5. Backend returns a synthetic rental object with `Math.random()` ID and `status: 'Confirmed'`.
6. **Nothing is inserted into `RENTAL`, `ITEM`, or `CONTRACT`.**
7. Frontend refetches products and shows a success popup.

**Admin**
1. Admin logs in; frontend sees `role === 'Admin'` and navigates to `?page=admin`.
2. `render()` calls `enforceAdminGuard()`, which only reads `localStorage`.
3. Admin page fetches `/api/users`, `/api/products`, `/api/admins`, `/api/equipment-types`.
4. All mutating admin requests are accepted by the backend without any identity check.

---

## 3. Frontend Deep Dive

### 3.1 Application shell and rendering

- `index.html` contains only a `#site` container, an auth modal, CDN links, and `script.js`.
- `script.js` defines a global `state` object, a global product array `P`, and page renderer functions.
- `render()` concatenates `nav() + pageRenderer() + footer()` into `#site.innerHTML`.
- Every state change re-creates the entire DOM, including all inline event attributes.
- State is not persisted except the auth profile. `?page=` is used for navigation, and `?id=` only for detail.

**Implication:** The app is simple to deploy but has no component boundaries, no sanitizer, no module system, and no test seams.

### 3.2 UI pages

| Page | Renderer | Data source | Notes |
|---|---|---|---|
| `home` | `home()` | `P`, static banner/brand data | Banner rotates every 4 s |
| `search` | `catalog()` | `P` | Filtering is client-side only |
| `detail` | `detail()` | `P`, URL `id` | Deep links are fragile |
| `terms` | `terms()` | Static `POL`, `STEPS` | Duplicated policy content in rental popup |
| `team` | `team()` | Static image paths | Images served by frontend root |
| `admin` | `admin()` | Four API endpoints | Client-side guard only |

### 3.3 Authentication state

- `syncAuthFromStorage()` reads `localStorage['lekhafong_auth']` and accepts any JSON with a `role`.
- `state.isAdmin = user.role === 'Admin'` is entirely client-controlled.
- `enforceAdminGuard()` redirects only if the local object says non-admin.
- `logoutUser()` calls `localStorage.clear()` and `sessionStorage.clear()`, wiping unrelated origin data.
- The “Keep me signed in” checkbox is never read; the profile is always persisted.
- The “Forgot password?” link is a no-op.
- Auth has no expiry; deleting an admin in the database does not invalidate the stored browser profile.

**Impact:** Any user can open DevTools, set `{"role":"Admin"}`, and render the admin UI. More importantly, the backend accepts admin writes regardless, so the UI guard is cosmetic.

### 3.4 API client

- `API_BASE_URL` and `BACKEND_ORIGIN` are hardcoded to `http://localhost:3031`.
- `apiFetchProducts()` replaces `P`; on failure it keeps the previous in-memory sample data and shows an error toast.
- `apiFetchProductDetail()` just searches the in-memory array; no detail endpoint exists.
- `apiCreateBooking()` is a no-op toast; not used by the real rental path.
- `apiToggleFavorite()` is a no-op toast.
- Uploads use `POST /api/upload` with `FormData`.
- All requests assume `${API_BASE_URL}` is reachable from the browser.

### 3.5 Admin UI

The admin page has four tabs: Users, Products, Admins, Profile.

- Users: list, edit, delete customers by `account_id`.
- Products: list, add, edit, delete; image manager supports 1 main + 4 detail images.
- Admins: list, add, edit, delete; password fields exist.
- Profile: read-only display of the localStorage profile.

Key frontend issues:

- **Duplicate function definitions.** Later declarations silently override earlier ones:
  - `handleLoginSubmit` at lines 1797 and 2078
  - `renderAdminProductsTable` at lines 1893 and 2314
  - `openProductDetailById` at lines 1919 and 2345
  - `submitProductUpdate` at lines 1937 and 2379
  - `submitNewProduct` at lines 1951 and 2396
  - `showAddProduct` at lines 1963 and 2371
- The earlier versions are dead code, making future edits dangerous.
- Admin add-product form does not include `model_series`; backend defaults it to `General`.
- Stock and status can be set inconsistently (e.g. `Available` with stock 0), though backend normalizes some cases.
- Deleting the currently logged-in admin leaves the browser profile active until logout.

### 3.6 Rental UI

- `detail()` renders date inputs with `min` set from `new Date().toISOString()` (UTC; can be off by one near midnight in UTC+7).
- `handleRentNowClick()` validates dates client-side and gates on login.
- `openRentalPopup()` computes total as `days × dailyRate`; it does not show the deposit even though policy text mentions 30%.
- `confirmRentalBooking()` posts `account_id: state.userProfile.id`.
- On success it refetches products and shows `showRentalSuccessPopup()`.
- The pickup method is collected and sent but is not accepted by the backend schema.
- Browser Back integration is implemented with extra `history.pushState`/`popstate` handlers; there are two separate `popstate` listeners, which can race.

### 3.7 Assets and external dependencies

- `cdn.tailwindcss.com` is a runtime JIT compiler and is not intended for production.
- Google Fonts and cdnjs Font Awesome require internet access; offline LAN demos lose styling/icons.
- `lekhaFongLogo.png` is ~1.9 MB, `banner/3.png` ~751 KB, member images ~140–204 KB each.
- The custom static server sends no compression, cache, or security headers.
- Several CSS blocks for an older design remain (e.g. `.hero`, `.dplist`, `.slots`, `.thumbs`) and are unused.

---

## 4. Backend Deep Dive

### 4.1 Bootstrap and middleware

`backend/database.js`:

1. Loads `.env` from its own directory.
2. Enables CORS with a **fixed** origin `http://localhost:3030`, `credentials: true`.
3. Enables `express.json()` with the default 100 KB body limit.
4. Creates `backend/uploads` if missing and serves it statically.
5. Creates a MySQL pool from `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
6. Runs a one-shot connection check that only logs errors; the server starts even if the DB is unavailable.
7. Registers all routes in one file.
8. Listens on `process.env.PORT` with no host and no default.

### 4.2 Database helpers

`getNextId(connection, table, idColumn)` builds `SELECT COALESCE(MAX(id),0)+1` with string interpolation. The table and column values are internal constants, so this is not currently SQL-injectable, but it is fragile and racy:

- No `AUTO_INCREMENT`.
- Concurrent inserts can receive the same next ID.
- Login ID allocation happens **outside** the transaction, so concurrent logins can collide.
- Customer/account/admin IDs all use this pattern.

### 4.3 Error handling

- Nearly every route catches errors and returns `err.message` to the client.
- `NODE_ENV` is not set, so Express runs in development mode; default JSON parse errors can include stack traces.
- There is no central error middleware, no 404 handler, and no request logging.
- Several `db.getConnection()` calls occur before the `try` block, so pool failures become unhandled route rejections.
- No graceful shutdown (`SIGTERM`/`SIGINT`), no `pool.end()`.

### 4.4 Upload handling

- `multer.diskStorage` writes to `backend/uploads` with a randomized `eq-<timestamp>-<random>.<ext>` name.
- File type is checked only by the client-supplied MIME type, not file magic bytes.
- 5 MB limit and JPG/PNG/WEBP only.
- The upload route is **unauthenticated**.
- Uploaded files are served publicly from `/uploads`.
- There is no cleanup for orphans created by cancelled forms, failed multi-image uploads, or deleted products.
- No rate limit or per-user quota → trivial disk-fill DoS on the LAN.

### 4.5 Binding and lifecycle

- `app.listen(PORT)` with no host binds to all interfaces (observed `*:3031`).
- `frontserver.js` explicitly binds `localhost` (observed `127.0.0.1:3030`).
- This is the opposite of a safe local topology: the database-backed API is exposed to the LAN, while the UI is not.
- If `PORT` is missing from `.env`, Node listened on a random port on `::` in testing.
- The API has no `/health` or `/ready` endpoint.
- There is no `.env` validation; missing DB values become `undefined` in the pool config.

---

## 5. Database Schema (MariaDB / MySQL-Compatible)

### 5.1 Table catalog

All tables are InnoDB, `utf8mb4_general_ci`, with no `AUTO_INCREMENT` and no timestamps.

#### `USER_ACCOUNT`
| Column | Type | Constraints |
|---|---|---|
| `account_id` | INT | PK |
| `username` | VARCHAR(100) | NOT NULL |
| `password` | VARCHAR(255) | NOT NULL, **plaintext** |
| `role` | VARCHAR(10) | NOT NULL, CHECK `Admin`/`Customer` |

Missing: unique `username`, timestamps, password hash metadata, active/disabled flag, last login.

#### `ADMIN`
| Column | Type | Constraints |
|---|---|---|
| `admin_id` | INT | PK |
| `account_id` | INT | NOT NULL, FK → `USER_ACCOUNT` |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `preferences` | TEXT | NULL |
| `address` | VARCHAR(100) | NULL |
| `email` | VARCHAR(100) | NOT NULL, **not unique** |

Missing: unique `account_id`, unique `email`, timestamps.

#### `CUSTOMER`
| Column | Type | Constraints |
|---|---|---|
| `customer_id` | INT | PK |
| `account_id` | INT | NOT NULL, FK → `USER_ACCOUNT` |
| `id_card_number` | BIGINT | NULL |
| `first_name` | VARCHAR(100) | NOT NULL |
| `last_name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(100) | NOT NULL, **not unique** |
| `address` | VARCHAR(100) | NULL |
| `phone` | VARCHAR(15) | NOT NULL |

Missing: unique `account_id`, unique `email`, timestamps, address length appropriate for Thai addresses.

#### `EQUIPMENT`
| Column | Type | Constraints |
|---|---|---|
| `equipment_id` | INT | PK |
| `admin_id` | INT | NOT NULL, FK → `ADMIN` |
| `name` | VARCHAR(100) | NOT NULL |
| `type` | VARCHAR(20) | NOT NULL |
| `brand` | VARCHAR(20) | NOT NULL |
| `serial_number` | VARCHAR(20) | NOT NULL, **not unique** |
| `description` | TEXT | NULL |
| `image_url` | TEXT | NULL, **legacy/unused** |
| `release_year` | DATE | NULL, **misnamed/unused** |
| `model_series` | VARCHAR(10) | NULL, **too short** |
| `status` | VARCHAR(15) | NOT NULL, CHECK `Available`/`In Use`/`Maintenance` |
| `daily_rate` | INT | NOT NULL, CHECK `> 0` |
| `main_image` | VARCHAR(255) | NULL |
| `detail_images` | TEXT | NULL, JSON array |
| `stock` | INT | NOT NULL DEFAULT 1 |

Missing: unique `serial_number`, stock `>= 0` constraint, `created_at`/`updated_at`, `is_deleted`, rental availability model.

#### `LOGIN`
| Column | Type | Constraints |
|---|---|---|
| `login_id` | INT | PK |
| `account_id` | INT | NOT NULL, FK → `USER_ACCOUNT` |
| `login_time` | DATETIME | NOT NULL |
| `status` | VARCHAR(10) | NOT NULL, CHECK `Success`/`Failed` |

Missing: IP/user agent, failure reason, index on `(account_id, login_time)`.

#### `CONTRACT`
| Column | Type | Constraints |
|---|---|---|
| `contract_id` | INT | PK |
| `is_signed` | BOOLEAN | NOT NULL |
| `issued_date` | DATE | NOT NULL |
| `terms_version` | INT | NOT NULL |

Missing: customer/rental linkage, signature evidence, terms content/version table, timestamps.

#### `RENTAL`
| Column | Type | Constraints |
|---|---|---|
| `rental_id` | INT | PK |
| `customer_id` | INT | NOT NULL, FK → `CUSTOMER` |
| `contract_id` | INT | NOT NULL, FK → `CONTRACT` |
| `rental_date` | DATE | NOT NULL |
| `start_date` | DATE | NOT NULL |
| `end_date` | DATE | NOT NULL |
| `status` | VARCHAR(15) | NOT NULL, CHECK `Active`/`Completed`/`Cancelled` |

Missing: `pickup_method`, `total_price`, `deposit`, `returned_at`, `created_at`, cancellation reason, idempotency key, date-range indexes.

#### `ITEM`
| Column | Type | Constraints |
|---|---|---|
| `item_id` | INT | PK |
| `equipment_id` | INT | NOT NULL, FK → `EQUIPMENT` |
| `rental_id` | INT | NOT NULL, FK → `RENTAL` |
| `price_per_day` | DECIMAL(7,2) | NOT NULL, CHECK `> 0` |

Missing: quantity, line totals, deposit per item. No unique guard against duplicate equipment in one rental.

### 5.2 Live schema observations

- Live schema matches `lekhafong_production.sql`.
- All primary keys are manually assigned; no `AUTO_INCREMENT`.
- Foreign keys have no `ON DELETE`/`ON UPDATE` behavior (default `RESTRICT`).
- `CUSTOMER.email` and `ADMIN.email` are not unique, so login can resolve the wrong account if emails collide.
- `USER_ACCOUNT.username` is not unique, so registration can create duplicate usernames.
- The seeded phone `0812345678` was stored as `812345678` (leading zero lost in seed data).
- `EQUIPMENT.model_series VARCHAR(10)` cannot hold values such as `CinemaLine` comfortably and will truncate longer labels under strict mode.
- `EQUIPMENT.type VARCHAR(20)` is enough for current labels but brittle for new categories.

### 5.3 Schema vs. application mismatch

- The app's rental success status is `Confirmed`; the schema allows only `Active`, `Completed`, `Cancelled`.
- The app's rental request uses `return_date`; the schema uses `end_date`.
- The app sends `pickup_method`; no column exists.
- The app never creates a `CONTRACT`, but `RENTAL.contract_id` is `NOT NULL`.
- The app never inserts `ITEM`, so there is no permanent price record.
- The app computes and displays a deposit but never stores it.
- The app uses `account_id` for rentals; `RENTAL` requires `customer_id`.

---

## 6. API Route Inventory

All routes are defined in `backend/database.js`. **None have authentication or authorization middleware.**

| Method | Path | Auth | Validation | Writes | Notes |
|---|---|---|---|---|---|
| `POST` | `/api/upload` | ❌ | MIME + 5 MB | Disk file | Unauthenticated, no quota, no magic-byte check |
| `POST` | `/api/auth/login` | ❌ (public) | required fields | `LOGIN` | Plaintext compare, account enumeration, no rate limit |
| `POST` | `/api/auth/register` | ❌ (public) | required fields | `USER_ACCOUNT`, `CUSTOMER` | No unique username check; password fallback bug |
| `GET` | `/api/users` | ❌ | none | — | Returns customer PII to anyone |
| `PUT` | `/api/users/:accountId` | ❌ | partial | `USER_ACCOUNT`, `CUSTOMER` | IDOR; no ownership check |
| `DELETE` | `/api/users/:accountId` | ❌ | none | `LOGIN`, `CUSTOMER`, `USER_ACCOUNT` | IDOR; fails if rentals exist |
| `GET` | `/api/equipment-types` | ❌ | none | — | Merges DB types with hardcoded list |
| `GET` | `/api/products` | ❌ | none | — | Returns all equipment |
| `POST` | `/api/products` | ❌ | name/rate/type | `EQUIPMENT` | Trusts `equipment_id`, `admin_id` |
| `PUT` | `/api/products/:id` | ❌ | partial | `EQUIPMENT` | Omitting fields wipes images/description |
| `DELETE` | `/api/products/:id` | ❌ | none | `EQUIPMENT` | Fails if `ITEM` references exist |
| `POST` | `/api/rentals` | ❌ | required fields | `EQUIPMENT` only | Does **not** write rental records |
| `GET` | `/api/admins` | ❌ | none | — | Returns admin PII to anyone |
| `POST` | `/api/admins` | ❌ | required fields | `USER_ACCOUNT`, `ADMIN` | Anyone can create an admin |
| `PUT` | `/api/admins/:accountId` | ❌ | partial | `USER_ACCOUNT`, `ADMIN` | Anyone can change admin credentials |
| `DELETE` | `/api/admins/:accountId` | ❌ | last-admin guard | `LOGIN`, `ADMIN`, `USER_ACCOUNT` | Anyone can delete admins |

**Missing routes** that the product needs:

- `GET /api/rentals` (customer history / admin list)
- `GET /api/rentals/:id`
- `PATCH /api/rentals/:id/cancel`
- `PATCH /api/rentals/:id/return`
- `GET /api/availability?equipment_id=&start=&end=`
- `GET /api/me`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password` / reset
- `PATCH /api/auth/password`
- `GET /api/health`

---

## 7. Authentication and Authorization Assessment

### 7.1 Current flow

```
login input (email or username)
   ↓
lookup account_id:
   CUSTOMER.email → ADMIN.email → USER_ACCOUNT.username
   ↓
SELECT * FROM USER_ACCOUNT WHERE account_id=? AND password=?   ← plaintext
   ↓
INSERT LOGIN (Success/Failed)
   ↓
return { id, role, profile fields }
   ↓
browser localStorage
```

### 7.2 Findings

1. **No credential hashing.** `password` is `VARCHAR` and is compared with `String(password)`. Seed values are numeric plaintext.
2. **No sessions or tokens.** The API cannot identify a caller. Every request is anonymous.
3. **No authorization.** Admin CRUD, PII reads, and destructive operations are open. Client-side `localStorage` role checks are not security.
4. **No CSRF strategy** (currently no cookies, but this becomes relevant once sessions are added).
5. **No account lockout or rate limiting.** `LOGIN` can be filled indefinitely; failed attempts leak whether an account exists.
6. **Account enumeration.** “ไม่พบบัญชีผู้ใช้งานนี้ในระบบ” vs “รหัสผ่านไม่ถูกต้อง” reveals valid identifiers.
7. **Ambiguous identifier lookup.** If a customer email equals an admin email or a username, the wrong account can be selected.
8. **No password policy.** Signup accepts empty/short passwords; the server has a fallback to `123456`.
9. **No password reset or change flow** for customers.
10. **No token expiry/invalidation.** Deleting or demoting an admin does not revoke the browser's stored profile.
11. **Known seeded credentials** exist in the public dump (`admin_guy` / `123456`, `cust_mhiyok` / `654321`).
12. **Secrets existed in git history.** `backend/.env` appears in commits `894a556` and `e61a9df` and was deleted later. Treat the historical values as compromised, especially if the remote repository is public.

### 7.3 Recommended target design

- Hash passwords with **Argon2id** (preferred) or bcrypt cost ≥ 12. Migrate transparently on next successful login; force reset for seeded/unknown hashes.
- Use server-side sessions with an HttpOnly, `SameSite=Lax` (or `Strict`), `Secure`-in-production cookie backed by a MySQL session store. Rotate session ID on login and privilege change.
- Add `requireAuth` and `requireRole('Admin')` middleware to every non-public route.
- Add ownership checks: a customer may read/update only their own profile and rentals; an admin may act globally.
- Derive `account_id`/`customer_id` from the session, never from request bodies.
- Add CSRF tokens for cookie-authenticated state-changing requests.
- Add login/register rate limiting and generic error messages; log IP and outcome server-side.
- Add logout (destroy session), password change, and reset-token flows.
- Remove seed passwords from production; require an explicit bootstrap-admin procedure.
- Implement session revocation on admin deletion/role change.

---

## 8. Rental Workflow — Actual vs. Intended

### 8.1 Intended workflow (from UI copy)

1. Choose equipment and dates.
2. See availability.
3. Pay 30% deposit (minimum ฿500) via PromptPay.
4. Receive equipment and sign a contract.
5. Return on time; deposit refunded within 24 hours.

### 8.2 Implemented workflow

| Step | Frontend | Backend | Persistence |
|---|---|---|---|
| Choose dates | Yes, client validation | Re-validates positive day count | No |
| Availability | Only global `status`/`stock` | `status='Available'` and `stock > 0` | No date-range check |
| Deposit | Displayed in policy text; not in total | Computed but not returned in UI | No |
| Payment | None | None | No |
| Contract | None | None | No |
| Rental record | Expects `rental_id` | Returns random 6-digit number | **No** |
| Line item | None | None | **No** |
| Stock decrement | Refetches after success | Decrements inside transaction | Yes |
| Rental status | Shows `Confirmed` | Returns `Confirmed` | Invalid per schema |
| History | None | None | No |
| Cancel/return | None | None | No |
| Stock restore | None | None | No |

### 8.3 Critical gaps

1. **No rental is persisted.** The only durable effect is `EQUIPMENT.stock -= 1`. The success screen displays a random number that cannot be looked up.
2. **No contract.** `RENTAL.contract_id` is `NOT NULL`; a correct insert would need a contract first.
3. **No line item.** `ITEM` is never written, so there is no price audit trail.
4. **Invalid status.** `Confirmed` violates `chk_rental_status`.
5. **No date-range availability.** A future booking consumes current stock; two customers cannot book different future windows from the same unit pool.
6. **No ownership.** Any caller can pass any `account_id`.
7. **No idempotency.** A double-click or retry can decrement stock twice.
8. **No return path.** Stock never increases; eventually every item becomes `In Use`.
9. **No cancellation/refund/penalty logic** despite policy text.
10. **No admin rental view** despite the “Production” admin console.

---

## 9. Deployment and Configuration Assessment

### 9.1 Current configuration

`backend/.env` contains only:

```
PORT
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
```

No `HOST`, `NODE_ENV`, `CORS_ORIGINS`, session secret, upload directory, pool size, timezone, or log level. Frontend has no environment file at all.

### 9.2 Deployment gaps

- No `Dockerfile`, `docker-compose.yml`, reverse proxy, systemd unit, or process manager.
- No CI/CD, lint, test, or migration pipeline.
- No `README`, setup guide, or `.env.example`.
- No database bootstrap documentation; the user/grants were created manually.
- No production build step; Tailwind is compiled in the browser.
- No TLS; everything is plain HTTP.
- No health checks, metrics, or structured logs.
- No backup/restore procedure.
- No separation between development, test, and production databases.
- No `engines` field or `.nvmrc`; reproducibility depends on the developer's Node version.
- The frontend `package.json` lists `express`, `mysql2`, `multer`, `cors`, and `dotenv` but `frontserver.js` uses none of them.
- The repository tracks `node_modules` (1,966 files) and has a stray root `node_modules` with no root `package.json`.

### 9.3 LAN access problem

The requested local Linux + LAN browser workflow is currently broken in two directions:

1. **Frontend is loopback-only.** `frontserver.js` binds `'localhost'`, so phones/other PCs cannot connect.
2. **Backend is all-interfaces.** `app.listen(PORT)` binds `*:3031`, so API endpoints are reachable from the LAN, including unauthenticated admin writes.
3. **Frontend advertises loopback API.** On a phone, `http://localhost:3031/api` points to the phone itself.
4. **CORS is fixed.** Even if the frontend were reachable at `http://192.168.1.182:3030`, the API returns `Access-Control-Allow-Origin: http://localhost:3030`, which the browser rejects.

The correct target is a **single-origin LAN development topology**:

```
Phone/LAN browser → http://192.168.1.182:3030
                         │
                         ├── /            → static files
                         ├── /api/*       → proxy to 127.0.0.1:3031
                         └── /uploads/*   → proxy to 127.0.0.1:3031
```

Backend stays on `127.0.0.1:3031`; only frontend is LAN-bound. This removes CORS entirely and prevents direct API exposure.

---

## 10. Prioritized Findings

### P0 — Critical (fix before any shared/real use)

---

#### P0-01 — Secrets and default credentials are exposed

**Evidence**
- `lekhafong_production.sql:112-118` seeds `admin_guy` / `123456` and `cust_mhiyok` / `654321`.
- `git log --all -- backend/.env` shows commits `894a556` and `e61a9df` that contained `backend/.env`; HEAD no longer tracks it.
- Remote: `https://github.com/Pimpawee007/lekhaFong.git`.
- `backend/.env` currently uses a local dev DB user with `ALL PRIVILEGES` on `lekhafong_production.*` (observed via `SHOW GRANTS`).

**Impact**
- Anyone with repository history can obtain DB credentials and default login credentials.
- If the database port becomes reachable, the data is directly compromised.
- Even on a LAN, known admin credentials defeat the entire admin console.

**Fix**
1. Treat historical `.env` values as compromised; rotate the DB password and any reused secrets.
2. Remove/disable seeded accounts or force password reset on first login.
3. Do not seed passwords in versioned SQL; generate a one-time bootstrap admin from an operator-provided secret.
4. Scrub git history with `git filter-repo` **only after coordinating a forced push and re-clone**; otherwise rotation is the primary control.
5. Add secret scanning to CI (e.g. gitleaks).
6. Keep `.env` ignored; add `.env.example` with placeholders only.

**Acceptance**
- Old credentials no longer authenticate.
- No real secret exists in git history, or the repo is private and credentials rotated.
- CI blocks new secret commits.

**Effort:** S (ops) / M (history scrub)

---

#### P0-02 — The database bootstrap dump is destructive

**Evidence**
- `lekhafong_production.sql:1` — `DROP DATABASE IF EXISTS lekhafong_production;`
- `lekhafong_production.sql:2-4` — unconditional `CREATE DATABASE` / `USE`.
- No migration/version table, no `IF NOT EXISTS`, no backup step.

**Impact**
- A single `mysql < lekhafong_production.sql` destroys all live data, including customers, rentals, and uploads metadata.
- The file name (`production`) makes accidental execution more likely.
- It is the only documented schema source, so a developer may reasonably run it.

**Fix**
1. Do **not** run the dump against the existing database. Take a verified backup first.
2. Move schema to idempotent migrations (`database/migrations/001_init.sql`, etc.).
3. Replace the destructive header with guarded `CREATE DATABASE IF NOT EXISTS` and a separate dev-only reset script that refuses non-test database names.
4. Rename the dump to `database/legacy/lekhafong_production.dump.sql` and add a warning header; remove `DROP DATABASE`.
5. Document the restore procedure and test it on a separate restore DB.

**Acceptance**
- Standard setup never drops an existing database.
- Any reset/drop script aborts unless `DB_NAME` ends in `_dev` or `_test`.
- A restore from backup is demonstrated.

**Effort:** S–M

---

#### P0-03 — Passwords are stored and compared in plaintext

**Evidence**
- `lekhafong_production.sql:10` — `password VARCHAR(255) NOT NULL`.
- `backend/database.js:119-122` — `SELECT * FROM USER_ACCOUNT WHERE account_id = ? AND password = ?`.
- `backend/database.js:186-189` — registration inserts `finalPassword`.
- `backend/database.js:521` — admin creation inserts `String(password)`.
- `backend/database.js:541` — admin update uses `Number(password)`, corrupting non-numeric passwords.
- `backend/database.js:183` — `const finalPassword = String(password) || 123456;`.

**Impact**
- Any DB read, backup, log, or SQL dump exposes every password.
- Numeric conversion silently changes passwords (`000123` → `123`).
- Default fallback can create accounts with a known password.
- Password reuse on other services is compromised.

**Fix**
1. Add `password_hash` (and algorithm/cost metadata) or repurpose `password` to store a PHC string.
2. Hash with Argon2id/bcrypt; never log or return hashes.
3. Migrate existing users on next successful login, or force reset for seeded accounts.
4. Remove all default passwords; reject empty/short passwords server-side.
5. Fix admin update to hash the raw string, never `Number()` it.
6. Add a password-change and reset flow.

**Acceptance**
- No plaintext password is stored or compared.
- Legacy accounts cannot log in with seeded passwords.
- Password update preserves leading zeros and non-numeric characters.

**Effort:** M

---

#### P0-04 — API has no authentication or authorization; admin guard is client-only

**Evidence**
- No `app.use` auth middleware anywhere in `backend/database.js`.
- `GET /api/users`, `GET /api/admins`, `POST/PUT/DELETE /api/products`, `POST /api/admins`, `DELETE /api/admins/:accountId` are all open.
- `frontend/script.js:439-467` reads role from `localStorage`; `frontend/script.js:481` writes the entire profile.
- `frontend/script.js:1388-1751` renders the admin console; `enforceAdminGuard()` is only a redirect.
- Live probe: `GET /api/users` without any auth returned customer PII.

**Impact**
- Anyone on the LAN can read PII, create admins, edit/delete equipment, edit/delete users, and attempt admin deletion.
- Any browser user can make themselves “admin” in the UI by editing `localStorage`.
- IDOR: `PUT/DELETE /api/users/:accountId` accepts any account ID.
- `POST /api/rentals` trusts a caller-supplied `account_id`, so one user can rent as another.

**Fix**
1. Add server-side session authentication (see §7.3).
2. Add `requireAuth`, `requireRole('Admin')`, and ownership middleware to every route.
3. Derive user/customer IDs from the session.
4. Make the admin UI guard a UX convenience only; server remains authoritative.
5. Add explicit tests: unauthenticated → `401`, customer → `403`, owner → `200`, other user → `403/404`.
6. Replace `localStorage` profile with a `GET /api/me` call on load; never trust stored role for security.

**Acceptance**
- All non-public endpoints return `401` without a valid session.
- Customer tokens cannot access admin routes or other users' records.
- Tampering with `localStorage` grants no privileges.

**Effort:** L

---

#### P0-05 — Stored XSS across admin, profile, product, and toast rendering

**Evidence**
- `frontend/script.js:388-390` — toast `innerHTML` inserts server messages.
- `frontend/script.js:416-418` — confirm modal inserts `title`/`message`.
- `frontend/script.js:853` — nav inserts `state.currentUser` (from DB login response) into `innerHTML`.
- `frontend/script.js:1851-1856` — admin user table inserts `username`, names, email, phone.
- `frontend/script.js:1903-1905`, `2323-2336` — product table inserts name/brand/type/serial.
- `frontend/script.js:1985-1990` — admin table inserts username/email and builds inline `onclick` with `'${a.username}'`.
- `frontend/script.js:2516-2526` — rental popup inserts product name.
- `frontend/script.js:163` — brand image `onerror` inline handler (fixed content, lower risk).
- No `escapeHtml`/sanitizer exists.

**Impact**
- A malicious customer name, username, email, product name, description, or uploaded URL can execute JavaScript in an admin's browser.
- Because auth is stored in `localStorage`, XSS can steal or rewrite the admin profile (and, once real sessions exist, perform privileged actions as the admin).
- Inline handlers make a strict CSP impossible without refactoring.

**Fix**
1. Add one `escapeHtml()` helper and use it for **all** text/attribute interpolation.
2. Replace inline `onclick` handlers with `data-*` attributes and delegated listeners.
3. Use `textContent`/DOM APIs where practical.
4. Validate/sanitize image URLs (allow only same-origin paths and `https:` images; reject `javascript:`/unexpected `data:`).
5. Add a Content Security Policy after removing inline handlers; self-host Tailwind build and assets.
6. Add regression tests with payloads such as `"><img src=x onerror=alert(1)>`.

**Acceptance**
- Payloads render as text, never execute.
- CSP has no `unsafe-inline` requirement for scripts.
- Inline event attributes are gone.

**Effort:** M–L

---

#### P0-06 — Rental checkout does not create a rental record and reports an invalid status

**Evidence**
- `backend/database.js:423-485` — `/api/rentals` only reads/locks `EQUIPMENT` and updates stock/status.
- `backend/database.js:468` — `rental_id: Math.floor(100000 + Math.random() * 900000)` (synthetic, not persisted).
- `backend/database.js:476` — `status: 'Confirmed'`.
- `lekhafong_production.sql:88` — allowed statuses are `Active`, `Completed`, `Cancelled`.
- `lekhafong_production.sql:78-100` — `RENTAL.contract_id NOT NULL`, `ITEM` exists.
- Live DB: `RENTAL=0`, `ITEM=0`, `CONTRACT=0` after the app has been used.
- `backend/database.js:424` — accepts `account_id` from the body; `pickup_method` is ignored.

**Impact**
- Customers receive a fake rental ID; there is no way to retrieve, cancel, return, or audit the booking.
- Stock is decremented permanently; there is no return path to increment it.
- Pricing/deposit/contract data is lost.
- The schema's rental integrity constraints are never exercised.
- A retry or double-click can decrement stock twice.

**Fix**
1. Define the rental transaction explicitly:
   - Resolve `customer_id` from the session.
   - Create `CONTRACT` (or use a pre-issued contract) with terms version/signature state.
   - Insert `RENTAL` with `rental_date`, `start_date`, `end_date`, `status='Active'`, `pickup_method`, totals/deposit (new columns).
   - Insert one `ITEM` per equipment with `price_per_day`.
   - Update/decrement stock under a row lock.
   - Return the real `rental_id` and committed totals.
2. Add `pickup_method`, `total_price`, `deposit`, `returned_at`, `created_at`, `cancellation_reason` columns.
3. Add an idempotency key/request ID to prevent double bookings.
4. Add cancellation/return endpoints that restore stock in a transaction.
5. Add availability queries by date range; do not rely on current `stock` alone.
6. Add a rental history page and an admin rental list.

**Acceptance**
- A successful checkout creates exactly one `CONTRACT`, one `RENTAL`, and the expected `ITEM` rows.
- The returned ID is queryable via `GET /api/rentals/:id`.
- Returning/cancelling restores stock exactly once.
- Concurrent bookings obey stock and date availability.
- `status` values always satisfy the schema.

**Effort:** L

---

### P1 — High (fix before LAN demos or any real data)

---

#### P1-01 — LAN access is broken while the API is exposed on all interfaces

**Evidence**
- `frontend/frontserver.js:43` — `server.listen(PORT, 'localhost', ...)`.
- `backend/database.js:579-581` — `app.listen(PORT)` with no host; observed `*:3031`.
- `frontend/script.js:127,132` — hardcoded `http://localhost:3031`.
- `backend/database.js:10-15` — fixed CORS origin `http://localhost:3030`.
- Live probes: LAN frontend request failed; backend accepted a LAN-origin request but returned a mismatched `Access-Control-Allow-Origin`.
- Missing `HOST`/`CORS_ORIGINS`/`BACKEND_URL` configuration.

**Impact**
- A phone or second PC cannot use the app.
- If the frontend were bound to `0.0.0.0` without other changes, the browser would call its own `localhost` and fail.
- The API is reachable by any LAN client (and potentially wider, depending on firewall/router) with no auth.
- If `PORT` is unset, the backend listens on a random port on all interfaces.

**Fix**
1. Bind backend to `127.0.0.1` by default (`HOST` env).
2. Bind frontend to `HOST` env (`127.0.0.1` default; `192.168.1.182` or `0.0.0.0` for LAN).
3. Proxy `/api` and `/uploads` from the frontend server to `127.0.0.1:3031`; make the browser use same-origin relative paths.
4. Remove the hardcoded `localhost` API origin. If direct API access is retained, make CORS a validated allowlist from `CORS_ORIGINS`.
5. Add startup validation and fail fast on missing/invalid config.
6. Document firewall rules (allow only `3030` from the LAN subnet; deny `3031`).

**Acceptance**
- `ss -ltnp` shows `127.0.0.1:3031` and `0.0.0.0:3030` (or the chosen LAN IP).
- `http://192.168.1.182:3030` works from a phone.
- API requests succeed through the proxy with no CORS preflight.
- Direct `http://192.168.1.182:3031` fails from another device.

**Effort:** M

---

#### P1-02 — Static server has a process-crash DoS, path-prefix traversal risk, and serves source/dependencies

**Evidence**
- `frontend/frontserver.js:22` — `decodeURIComponent(req.url...)` unguarded.
- Live probe: `GET /%` crashed the process with `URIError: URI malformed`.
- `frontend/frontserver.js:23-28` — `path.join` then `filePath.startsWith(__dirname)` string check.
- Live probes: `/package.json` → `200`; `/node_modules/express/package.json` → `200`.
- No dotfile deny list, no symlink handling, no allowlist.

**Impact**
- Any malformed URL crashes the frontend (single-request DoS).
- A sibling directory whose name begins with `frontend` (e.g. `frontend-backup`) would pass the string-prefix check if reachable via `..`.
- Symlinks inside `frontend/` could escape the root.
- Source, lockfiles, and dependency code are publicly served.
- Future `.env` or backup files inside `frontend/` would be exposed.

**Fix**
1. Wrap URL parsing/decoding in `try/catch`; return `400` for malformed URLs.
2. Resolve with `path.resolve`, compute `path.relative`, and reject if it starts with `..` or is absolute.
3. Use an explicit allowlist of static roots/extensions, or replace the custom server with nginx/Vite preview/Express static with `dotfiles: 'deny'`.
4. Deny dotfiles, `node_modules`, lockfiles, source maps, and server scripts.
5. Add a top-level error handler and `server.on('clientError')`.
6. Add tests for `/%`, `/%E0%A4%A`, `../`, encoded traversal, symlinks, and dotfiles.

**Acceptance**
- Malformed URLs return `400` and the process stays alive.
- Traversal and dotfile requests return `403/404`.
- `/package.json` and `/node_modules/...` are not served.

**Effort:** S–M

---

#### P1-03 — Upload endpoint is unauthenticated and lacks abuse controls

**Evidence**
- `backend/database.js:77-90` — no auth middleware.
- `backend/database.js:36-47` — 5 MB/MIME allowlist only; trusts `file.mimetype`.
- `backend/database.js:24` — public static `/uploads`.
- No cleanup on delete/cancel/failure; no quota/rate limit.
- `frontend/script.js:2289-2296` uploads sequentially without transactional cleanup.

**Impact**
- Anyone can fill the disk, upload unwanted content, or use the server as free storage.
- A spoofed MIME type can bypass the filter.
- Orphaned files accumulate indefinitely.
- Deleted products leave images behind.

**Fix**
1. Require auth and admin role for product-image uploads (or a signed upload token for a specific product).
2. Verify magic bytes and re-encode images (e.g. `sharp`) to a safe format.
3. Store outside the web root or serve through an authorized route; add `X-Content-Type-Options: nosniff`.
4. Add per-user/IP rate limits and total storage quotas.
5. Clean up orphan images on failed saves and product deletion.
6. Add a virus/malware scan hook for production.

**Acceptance**
- Unauthenticated upload returns `401`.
- Non-image content with an image MIME is rejected.
- Deleting a product removes/queues its images.
- Disk usage is bounded and observable.

**Effort:** M

---

#### P1-04 — Schema lacks uniqueness/auto-increment and has concurrency races

**Evidence**
- All PKs are plain `INT PRIMARY KEY` with no `AUTO_INCREMENT` (`lekhafong_production.sql:7-100`).
- `getNextId()` uses `MAX(id)+1` (`backend/database.js:69-72`).
- Registration allocates two IDs inside a transaction but does not lock the tables (`backend/database.js:180-181`).
- Login allocates `login_id` **outside** the transaction (`backend/database.js:124`).
- No unique constraints on `username`, `email`, `serial_number`, or `account_id` in child tables.
- `ADMIN.email` and `CUSTOMER.email` are both non-unique, so login lookup is ambiguous.

**Impact**
- Concurrent signups/admins/products can collide on PK, causing `500`s.
- Concurrent logins can collide on `login_id`, losing audit rows.
- Duplicate usernames/emails make login and password reset ambiguous.
- Duplicate serial numbers break inventory tracking.
- Multiple customer/admin rows can reference the same account.

**Fix**
1. Convert all PKs to `AUTO_INCREMENT`.
2. Add `UNIQUE` on `USER_ACCOUNT.username`, `CUSTOMER.email`, `ADMIN.email`, `CUSTOMER.account_id`, `ADMIN.account_id`, `EQUIPMENT.serial_number`.
3. Replace `getNextId()` with `INSERT` + `LAST_INSERT_ID()`/`result.insertId`.
4. Add indexes for common filters and date ranges.
5. Add `updated_at`/`created_at`.
6. Add `stock >= 0` and other domain checks.
7. Decide collation/case sensitivity for emails/usernames (normalize to lowercase).

**Acceptance**
- No application-level `MAX+1` remains.
- Duplicate registration returns `409`, not a DB error.
- A 100-way concurrent signup test creates 100 distinct rows.

**Effort:** M

---

#### P1-05 — Registration and login correctness bugs

**Evidence**
- `backend/database.js:183` — `String(password) || 123456`; if `password` is `undefined`, it stores the literal string `"undefined"`; if empty, it stores `123456`.
- `backend/database.js:174-177` — duplicate check only on `CUSTOMER.email`; no username check; no admin email check.
- `backend/database.js:184` — empty phone becomes `0`, not a validation error.
- `backend/database.js:115-131` — distinct “account not found” vs “wrong password” messages.
- `backend/database.js:124-137` — login audit ID allocated outside the transaction.
- `backend/database.js:541` — admin password `Number(password)`.
- `frontend/script.js:214-218` — signup success is shown only via toast; failure resets the form (`event.target.reset()` in `handleSignupSubmit`), losing input.
- The “Keep me signed in” checkbox is ignored.
- No forgot-password implementation.

**Impact**
- Unintended default/`"undefined"` passwords.
- Duplicate usernames and ambiguous logins.
- Account enumeration and brute-force exposure.
- Bad UX on failed signup.
- Admin passwords with leading zeros/non-digits are corrupted.

**Fix**
1. Validate all inputs server-side with a schema (zod/express-validator): required, length, email, phone, password policy.
2. Reject empty passwords; remove all defaults.
3. Check uniqueness for username, email (both tables), and account linkage.
4. Return generic login errors; rate-limit by IP + account.
5. Move login audit insert into a transaction or use auto-increment.
6. Hash admin passwords from raw strings.
7. Preserve form values on failure; show field-level errors.
8. Implement remember-me only after real sessions exist.

**Acceptance**
- Direct API calls cannot create an account without a valid password/email.
- Duplicate username/email returns `409`.
- Failed login never reveals whether the account exists.
- Leading zeros survive admin password updates.

**Effort:** M

---

#### P1-06 — Internal errors and stack traces leak to clients

**Evidence**
- `backend/database.js:165` — returns `'เชื่อมต่อฐานข้อมูลผิดพลาด: ' + err.message`.
- Similar at lines `199`, `219`, `248`, `296`, `305`, `360`, `406`, `481`, `501`, `528`, `550`, `573`.
- No central error handler; Express defaults apply for JSON parse errors and 404s.
- `NODE_ENV` is unset, so development error pages may include stacks.

**Impact**
- Reveals SQL errors, table/column names, connection details, and framework internals.
- Helps attackers refine injection/IDOR attempts.
- Inconsistent error shapes complicate the frontend.

**Fix**
1. Add `NODE_ENV=production` for non-dev runs.
2. Add one Express error middleware that logs the real error server-side and returns a generic JSON envelope.
3. Standardize `{ success: false, code, message }` for API errors.
4. Never concatenate `err.message` into client responses.
5. Map known DB errors (`ER_DUP_ENTRY`, FK violations) to `409`/`400`.
6. Add request IDs to correlate logs.

**Acceptance**
- Client responses contain no SQL/framework details.
- All errors have a consistent shape.
- Logs contain the diagnostic detail with a request ID.

**Effort:** S–M

---

#### P1-07 — Backend trusts client-supplied identifiers and can wipe fields

**Evidence**
- `backend/database.js:424` — rental `account_id` from body.
- `backend/database.js:309-344` — product `equipment_id` and `admin_id` from body; `admin_id || 1` fallback.
- `backend/database.js:381-403` — PUT product always writes `main_image`, `detail_images`, `description`, `model_series`; omitted fields become `null`/`''`/`[]`.
- `backend/database.js:334,381` — `Number(stock)` can become `NaN`, producing a DB error.
- `backend/database.js:326` — `!daily_rate` rejects `0` but accepts negative? `Number(daily_rate) <= 0` catches negatives; non-numeric becomes `NaN` and passes comparisons (then DB error).
- `backend/database.js:184,238` — phone cleaning turns blank into `'0'`.
- No max lengths/type validation before DB writes.

**Impact**
- A customer can create a rental for another account.
- Anyone can assign equipment to an arbitrary admin.
- A partial API update silently deletes images/descriptions.
- Malformed payloads become `500` instead of `400`.
- Data quality degrades (phone `0`, invalid numbers).

**Fix**
1. Derive `account_id`/`customer_id`/`admin_id` from the authenticated session.
2. Validate all payloads with a schema and coerce types explicitly.
3. Use `PATCH` semantics for partial updates or require all fields.
4. Allow `equipment_id` only for admin imports; otherwise let the DB assign it.
5. Enforce max lengths matching the schema; reject unknown fields.
6. Add domain validation for dates (not past, end > start, max duration), prices, stock, and status transitions.

**Acceptance**
- Rental ownership cannot be spoofed.
- Missing fields do not erase existing data.
- Invalid payloads return `400` with field errors.
- No `NaN`/`undefined` reaches SQL.

**Effort:** M

---

#### P1-08 — No health checks, graceful shutdown, or structured logs; DB-down startup still “succeeds”

**Evidence**
- `backend/database.js:59-67` — startup DB check only logs failure; `app.listen` still runs.
- No `/health` or `/ready`.
- No `SIGTERM`/`SIGINT` handling or `pool.end()`.
- Only `console.log`/`console.error`; no request logging, request IDs, or log levels.
- Frontend has no health endpoint either.

**Impact**
- Orchestrators/operators cannot distinguish “server up, DB down” from healthy.
- Deploys may drop in-flight requests.
- Debugging relies on unstructured console output; errors can include sensitive details.
- No way to monitor DB latency or pool saturation.

**Fix**
1. Add `GET /health` (liveness) and `GET /ready` (DB ping) to backend.
2. Fail fast or mark not-ready when DB is unavailable; keep liveness separate.
3. Add `SIGTERM`/`SIGINT` handlers that stop accepting connections, drain, and `pool.end()`.
4. Add structured logging (`pino`) with request IDs and redaction of secrets.
5. Add basic metrics (request count/latency, pool stats, upload disk usage).
6. Add a frontend health check in the static server for orchestration.

**Acceptance**
- `/ready` returns `503` when DB is down and `200` when up.
- `SIGTERM` exits cleanly after draining.
- Logs are JSON and contain no passwords/tokens.

**Effort:** S–M

---

### P2 — Medium (fix before a reliable team workflow / demo)

---

#### P2-01 — Deep links and history navigation are unreliable

**Evidence**
- `frontend/script.js:811-821` — initial load reads only `?page`, not `?id`, then `replaceState` drops `?id`.
- `frontend/script.js:1243-1259` — `detail()` reads `?id`, but falls back to `P[0]` if state is empty.
- `frontend/script.js:1256-1259` — `replaceState({}, ...)` discards depth/history state.
- `frontend/script.js:753-786` — `goToPage('home')` calls `history.go(-currentDepth)` and returns without rendering; behavior depends on `popstate`.
- Two `popstate` listeners (`794` and `2656`) handle navigation and the rental modal separately.
- `frontend/script.js:2656-2660` — modal back handling can race with navigation.

**Impact**
- Refreshing a product URL shows the wrong product.
- Browser Back/Forward can skip pages or lose scroll state.
- The rental popup's Back behavior is inconsistent.
- Bookmarking a detail page is broken.

**Fix**
1. On load, parse both `page` and `id`; hydrate `state.item`.
2. Preserve the existing history state when calling `replaceState`.
3. Merge the two `popstate` handlers into one dispatcher.
4. Add tests for deep link load, refresh, Back, Forward, and modal open/close.
5. Consider a tiny router abstraction with explicit routes.

**Acceptance**
- `?page=detail&id=5` loads item 5 after refresh.
- Back/Forward traverse the expected page sequence.
- Closing the rental modal with Back does not change the page unexpectedly.

**Effort:** M

---

#### P2-02 — Several visible controls are decorative or inconsistent

**Evidence**
- Sort `<select>` at `frontend/script.js:1143` has no handler.
- Pager buttons at `frontend/script.js:1144` have no handler and there is only one page of data.
- Favorites `apiToggleFavorite()` is a toast-only no-op (`frontend/script.js:539-541`).
- Search date fields store `state.filters.pickup`/`return` (`frontend/script.js:937-939`) but `catalog()` never uses them (`frontend/script.js:1133-1142`).
- `apiCreateBooking()` is a no-op (`frontend/script.js:530-537`).
- `DEFAULT_FILTERS.maxPrice = 3000` (`frontend/script.js:109`) vs initial `maxPrice: 50000` (`frontend/script.js:120`) vs slider `max="3000"` (`frontend/script.js:901`).
- `CATS` has 6 categories (`frontend/script.js:45-52`) but `TYPES` has 3 (`frontend/script.js:106`).
- Home copy says “500+ items”; the DB has 14.
- `SL` banner data and `tabs()` appear unused.

**Impact**
- Users believe date availability, sorting, pagination, and favorites work; they do not.
- The catalog can hide items above ฿3,000 once the slider is touched.
- Category filters behave differently between the chips and the advanced panel.
- Misleading marketing copy.

**Fix**
1. Either implement backend-backed availability/sort/pagination/favorites or remove the controls.
2. Make date filters affect availability queries.
3. Unify category taxonomy between `CATS`, `TYPES`, and `EQUIPMENT.type`.
4. Align price-range defaults and maximums; compute max from data.
5. Add empty/loading/error states.
6. Change copy to match real inventory.

**Acceptance**
- Every visible control has an effect.
- Date filtering returns only available equipment.
- Category and price filters are consistent across the UI.
- No control is a dead end.

**Effort:** M

---

#### P2-03 — 2,780-line monolith with duplicate functions and no module/test seams

**Evidence**
- `frontend/script.js` is 2,780 lines and 183 KB.
- Duplicate function declarations listed in §3.5.
- `backend/database.js` is 581 lines and mixes config, middleware, auth, CRUD, uploads, and rental logic.
- No modules/imports; globals (`P`, `state`, `activeProductImages`, `imageModalDraft`).
- No lint/format config.

**Impact**
- Changes are risky; earlier definitions silently shadowed.
- No unit-testable boundaries.
- Merge conflicts and onboarding friction.
- Difficult to add auth/validation consistently.

**Fix**
1. Split backend into `config`, `db`, `middleware`, `routes/auth`, `routes/users`, `routes/products`, `routes/rentals`, `routes/admins`, `services`.
2. Split frontend into modules (`api.js`, `state.js`, `auth.js`, `render/*.js`, `utils/escape.js`) and use a bundler (Vite/esbuild) or ES modules.
3. Remove duplicate functions after confirming behavior.
4. Add ESLint + Prettier with CI.
5. Extract pure functions for tests (`calculateRentalDays`, `mapEquipmentToProduct`, escaping).

**Acceptance**
- No duplicate function names.
- Each route module is independently testable.
- Lint/format run in CI.
- Frontend builds from source into `dist/`.

**Effort:** L

---

#### P2-04 — Repository hygiene and missing onboarding docs

**Evidence**
- `.gitignore` has only `node_modules/`, `.env`, `backend/uploads/`.
- `git ls-files | grep -c node_modules` → **1,966** tracked files.
- Stray root `node_modules` with no root `package.json`.
- No `README`, `.env.example`, `LICENSE`, `.nvmrc`, or `engines`.
- Frontend `package.json` lists backend-only dependencies.
- No `npm run dev`, no combined start, no migration script.
- Node modules have local modifications (`git status`), which can mask real code changes.

**Impact**
- Huge clone/install noise; dependency drift.
- New developers cannot set up reliably.
- `npm ci` behavior is confusing across nested installs.
- Local changes to vendored deps are easy to lose.

**Fix**
1. `git rm -r --cached backend/node_modules frontend/node_modules` (keep files locally); commit the removal.
2. Expand `.gitignore` (env variants, logs, coverage, dist, uploads, OS/editor files).
3. Add root `package.json` with workspaces and scripts.
4. Add `.nvmrc`/`engines` (Node 22 LTS).
5. Add `README.md` with prerequisites, setup, env, DB bootstrap, LAN access, tests.
6. Add `.env.example` files with placeholders.
7. Remove unused frontend deps.

**Acceptance**
- `git ls-files | grep node_modules` is empty.
- Fresh clone + `npm ci` + documented steps works.
- No secret is tracked.

**Effort:** S–M

---

#### P2-05 — Asset weight and CDN dependency hurt reliability/performance

**Evidence**
- `lekhaFongLogo.png` ~1.94 MB.
- `banner/3.png` ~751 KB; banners total ~1.38 MB.
- Member images ~0.14–0.20 MB each.
- Tailwind CDN, Google Fonts, and Font Awesome require internet.
- No compression/cache headers from `frontserver.js`.
- Tailwind CDN compiles CSS at runtime.

**Impact**
- Slow first load, especially over LAN/mobile.
- Offline LAN demos lose styling and icons.
- CDN outage or CSP changes break the UI.
- Runtime Tailwind is explicitly not production-recommended.

**Fix**
1. Optimize/convert images to WebP/AVIF at appropriate dimensions; compress logo.
2. Self-host fonts/icons or use a small icon subset.
3. Build Tailwind at build time; ship static CSS.
4. Add `Content-Encoding`, `Cache-Control`, and immutable hashed filenames (nginx/Vite).
5. Lazy-load below-the-fold images; add width/height to prevent layout shift.

**Acceptance**
- Lighthouse performance improves materially.
- App renders offline on the LAN.
- Production build has no runtime Tailwind CDN.

**Effort:** M

---

#### P2-06 — No automated tests, CI, or migration/deployment pipeline

**Evidence**
- No `*.test.js`, `*.spec.js`, test runner, or CI config.
- No migrations; only a destructive dump.
- No Docker/compose/systemd/nginx.
- No lint/format scripts.
- No health checks.

**Impact**
- Auth, rental, and schema changes cannot be validated safely.
- Regressions are likely, especially around the complex rental transaction and history behavior.
- No reproducible environment for another developer.

**Fix**
1. Add backend integration tests (Node test runner + `supertest`) against a disposable `lekhafong_test` database.
2. Add frontend unit tests for pure logic and Playwright for login/rental/admin flows.
3. Add concurrency tests for stock/ID allocation.
4. Add security regression tests (authz, XSS escaping, traversal, upload).
5. Add GitHub Actions with MariaDB service, `npm ci`, lint, migrate, test, audit.
6. Add `docker-compose.dev.yml` for DB only (or full stack) with health checks and named volumes.
7. Add migration tooling and seed fixtures.

**Acceptance**
- `npm test` runs locally and in CI.
- Tests never touch the dev/prod DB.
- A failing auth/rental test blocks merge.
- Migrations apply from empty and from current schema.

**Effort:** L

---

#### P2-07 — Accessibility and modal UX gaps

**Evidence**
- Auth modal (`index.html:27-200`) lacks `role="dialog"`, `aria-modal="true"`, focus trap, and Escape handling.
- Modals are appended to `body` with no focus management.
- Inline handlers and `innerHTML` make keyboard/screen-reader behavior fragile.
- Some icon-only buttons have labels; others are unlabeled or use visual-only cues.
- `#site` full re-render loses focus after every state change.
- `autocomplete="off"`/`new-password` on login harms password managers.

**Impact**
- Keyboard and screen-reader users cannot reliably use auth/admin modals.
- Focus loss makes forms frustrating.
- Password managers may not fill credentials correctly.

**Fix**
1. Add accessible dialog primitives: `role`, `aria-modal`, labelled title, focus trap, restore focus, Escape close.
2. Use `autocomplete="username"`/`current-password` correctly.
3. Preserve focus across renders or update DOM surgically.
4. Audit color contrast and icon labels.
5. Add Playwright accessibility checks (axe).

**Acceptance**
- Modals are keyboard-operable and screen-reader labeled.
- Focus returns to the trigger on close.
- Password managers recognize the login form.

**Effort:** M

---

### P3 — Low (hardening and operational maturity)

#### P3-01 — Dead code/CSS and naming cleanup
- Remove unused `SL`, `tabs()`, old CSS blocks, `apiCreateBooking`, and duplicate functions.
- Rename `database.js` to `server.js`/`app.js`; it is not a database module.
- Rename `return_date`/`end_date` consistently.
- Rename `release_year` (DATE) to `release_date` or use `YEAR`.

#### P3-02 — Privacy/PDPA and data lifecycle
- Add a privacy notice, retention policy, and deletion/export flow.
- Minimize PII returned by admin lists.
- Do not log passwords/tokens/PII.
- Restrict `GET /api/users` and `GET /api/admins` to authorized roles.
- Add audit logs for admin actions.

#### P3-03 — Backups and disaster recovery
- Add encrypted, scheduled `mysqldump`/physical backups with retention.
- Test restores regularly into a separate DB.
- Back up uploads with the database.
- Document RPO/RTO and ownership.

#### P3-04 — Production deployment hardening
- Reverse proxy (nginx/Caddy) with TLS, HTTP/2, compression, rate limits.
- Run as non-root; read-only filesystem except uploads/tmp.
- Private DB network; no public DB port.
- `NODE_ENV=production`, secure cookies, HSTS, CSP, `trust proxy`.
- Process manager/containers with health checks and rolling restarts.
- Separate migration user from runtime DML user.

---

## 11. Frontend ↔ Backend Mismatch Matrix

| Area | Frontend expectation | Backend/schema reality | Impact |
|---|---|---|---|
| Rental persistence | Success popup with rental ID | Random ID, nothing inserted | Fake confirmation, no history/audit |
| Rental status | `Confirmed` | Only `Active`/`Completed`/`Cancelled` | Would violate constraint if persisted |
| Rental dates | `return_date` | Schema `end_date` | Naming/contract mismatch |
| Pickup method | Sent in payload | Ignored, no column | Lost business data |
| Deposit | Policy says 30%, min ฿500 | Computed but not returned/stored | Customer cannot see/pay/refund it |
| Contract | UI implies signing | No API, no contract record | Legal/compliance gap |
| Availability | Date-range search promised | Global stock only | Overbooking/future-date errors |
| Login identity | Email or username | Lookup order can pick wrong account on collisions | Wrong profile/role |
| Favorites | Heart toggle | No-op toast | Broken feature |
| Sorting | Select control | No handler/backend sort | Broken feature |
| Pagination | Page buttons | No handler/backend page | Broken feature |
| Categories | 6 advanced categories | 3 frontend types; free-text DB type | Inconsistent filtering |
| Price range | Slider max 3000 | Initial max 50000 | Hidden items/incorrect filter |
| Images | `main_image` + 4 details | Matches columns | Mostly aligned |
| Image URLs | `http://localhost:3031` | Backend static path | Breaks on LAN |
| Upload auth | Admin UI implies admin | Endpoint is public | Abuse |
| Admin identity | localStorage role | No server check | Privilege bypass |
| Error shape | `{success,message}` | GET routes return arrays; errors vary | Fragile handling |
| Phone | UI pattern `3-3-4` | Server strips non-digits; blank → `0` | Validation mismatch |
| Signup | Requires password | Server fallback/default bug | Weak/incorrect accounts |
| Remember me | Checkbox | Ignored | UX mismatch |

---

## 12. Target Local Linux Development Environment (Plan)

### 12.1 Recommended topology

```
Host: 192.168.1.182
┌─────────────────────────────────────────────────────────────┐
│ firewall: allow 3030/tcp only from 192.168.1.0/24           │
│           deny 3031, 3306 from LAN                          │
│                                                             │
│  Browser ──HTTP :3030──► frontend static server + proxy     │
│                              │ /api, /uploads               │
│                              ▼                              │
│                        127.0.0.1:3031 backend                │
│                              │                              │
│                              ▼                              │
│                        127.0.0.1:3306 MariaDB               │
└─────────────────────────────────────────────────────────────┘
```

**Why:** one origin removes CORS and hardcoded hosts; the API and DB are never directly reachable from the LAN; only one port is exposed.

### 12.2 Environment contract (to implement later)

Backend (`.env`, never overwrite the existing file; add keys carefully):

```dotenv
NODE_ENV=development
HOST=127.0.0.1
PORT=3031

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=lekha_dev
DB_PASSWORD=<secret>
DB_NAME=lekhafong_production
DB_POOL_SIZE=10
DB_TIMEZONE=Z

CORS_ORIGINS=http://localhost:3030,http://192.168.1.182:3030
SESSION_SECRET=<long-random-secret>
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=5
LOG_LEVEL=info
```

Frontend server (new, or read from process env):

```dotenv
FRONTEND_HOST=127.0.0.1        # set 192.168.1.182 or 0.0.0.0 for LAN
FRONTEND_PORT=3030
BACKEND_ORIGIN=http://127.0.0.1:3031
```

**Rules**
- Validate required variables at startup and fail fast with a clear message.
- No secret defaults; no `localhost` hardcoded in browser JS.
- Public frontend config must contain only public values; never DB/session secrets.
- Use `API_BASE_URL = '/api'` and same-origin `/uploads`.
- Keep `.env` local; commit only `.env.example` with placeholders.

### 12.3 Safe LAN procedure

1. Bind frontend to the LAN IP (preferred) or `0.0.0.0`.
2. Keep backend on `127.0.0.1`.
3. Allow only the frontend port from the LAN subnet:
   ```bash
   sudo ufw allow from 192.168.1.0/24 to any port 3030 proto tcp
   sudo ufw deny 3030
   sudo ufw deny 3031
   sudo ufw deny 3306
   ```
   (Adjust/verify existing rules; do not blindly apply on a remote host.)
4. Verify:
   ```bash
   ss -ltnp | grep -E ':(3030|3031|3306)\b'
   # expect 3030 on LAN/0.0.0.0, 3031 and 3306 on 127.0.0.1
   ```
5. Access `http://192.168.1.182:3030` from a phone on the same Wi-Fi.
6. Never port-forward `3030`/`3031` on the router.
7. For remote demos, use a private VPN (Tailscale/WireGuard), not a public tunnel.

### 12.4 One-command developer workflow (target)

```bash
# after implementation
npm ci
npm run db:migrate
npm run db:seed:dev
npm run dev        # starts frontend + backend with env config
npm test
```

Use `concurrently` or a small supervisor script; print the LAN URL on startup; refuse to start if `DB_NAME` is production during dev seed.

---

## 13. Database Safety Plan

### 13.1 Immediate safeguards (operational, no code behavior change)

1. **Back up now** (before any future work):
   ```bash
   mkdir -p backups
   mysqldump --single-transaction --routines --triggers --events \
     --default-character-set=utf8mb4 \
     --defaults-extra-file="$HOME/.my.cnf.lekhafong" \
     lekhafong_production > "backups/lekhafong_production-$(date +%Y%m%d-%H%M%S).sql"
   ```
   Use a protected option file (mode `600`) instead of a password on the command line.
2. Verify the dump can be restored into a **separate** database:
   ```bash
   mysql -e 'CREATE DATABASE IF NOT EXISTS lekhafong_restore_test'
   mysql lekhafong_restore_test < backups/<file>.sql
   # compare row counts and spot-check data
   ```
3. Do not run `lekhafong_production.sql`.
4. Rotate the DB password after coordinating with the owner; update `.env` manually (not by an agent).

### 13.2 Repository safeguards to implement

- `database/migrations/` with numbered, idempotent SQL.
- `database/seed.dev.sql` with **no real passwords**.
- `scripts/db-migrate.js` + `schema_migrations` table.
- `scripts/db-backup.sh` with retention and checksum.
- `scripts/db-reset-dev.sh` with a hard guard:
  ```bash
  case "$DB_NAME" in
    *_dev|*_test) ;;
    *) echo "Refusing to reset non-dev database: $DB_NAME"; exit 1 ;;
  esac
  ```
- Separate DB users:
  - `lekhafong_app`: `SELECT, INSERT, UPDATE, DELETE` only.
  - `lekhafong_migrator`: DDL, used only by migrations.
- Production: no seed, no reset, no `DROP`.
- Migrations tested from empty and from the current schema; backups before each production migration.
- Never commit uploads or backups.

### 13.3 Test database rules

- Name must end in `_test` (e.g. `lekhafong_test`).
- Test bootstrap may drop **only** `lekhafong_test`.
- Use a dedicated test DB user; never the dev/prod credentials.
- Prefer transaction rollback per test where possible.
- CI uses an ephemeral MariaDB service.

---

## 14. Reproducible Testing Plan

### 14.1 Test pyramid

| Level | Tools | Coverage |
|---|---|---|
| Unit | Node `node:test` / Vitest | `calculateRentalDays`, escaping, mappers, validators |
| API integration | `node:test` + `supertest` | Auth, CRUD, rental transaction, authz, errors |
| DB integration | MariaDB test DB | Constraints, concurrency, migrations |
| Frontend component | Vitest + jsdom | Renderers, filters, modal state |
| E2E | Playwright | Login, signup, browse, rent, admin CRUD, deep links |
| Security regression | API/E2E | XSS, IDOR, traversal, upload, rate limit |

### 14.2 Required test cases

**Auth**
- Register with valid/invalid payloads; duplicate email/username → `409`.
- Login valid/invalid; generic failure message.
- Session cookie is HttpOnly/SameSite; logout invalidates.
- Customer cannot access admin routes (`403`).
- Tampered `localStorage` grants nothing.

**Authorization**
- Unauth `GET /api/users` → `401`.
- Customer `PUT /api/users/:otherId` → `403`.
- Admin can update; last-admin deletion blocked.

**Rental**
- Successful checkout creates `CONTRACT` + `RENTAL` + `ITEM`.
- Returned ID is queryable.
- Stock decrements exactly once; return restores.
- Double-submit with idempotency key creates one rental.
- Concurrent bookings at stock 1: one success, one `409`.
- Date-range availability prevents overlap.
- Invalid dates (past, end ≤ start, excessive) → `400`.
- `status` always satisfies the check constraint.

**Security**
- XSS payload in product/user name renders escaped.
- `/%`, malformed encodings, traversal, dotfiles, `node_modules` → safe errors.
- Upload: unauth `401`, spoofed MIME rejected, oversized rejected, cleanup.
- Error responses contain no SQL/stack details.

**Frontend**
- Deep link `?page=detail&id=5` after refresh.
- Back/Forward sequence.
- Filters, date availability, sort, pagination (once implemented).
- Modal focus/Escape behavior.

### 14.3 CI pipeline

```yaml
# outline
services:
  mariadb:
    image: mariadb:10.11
    env: ...
    ports: ["3306:3306"]
steps:
  - checkout
  - setup-node 22
  - npm ci
  - npm run lint
  - npm run db:migrate:test
  - npm test
  - npm audit --omit=dev
  - npm run test:e2e
```

### 14.4 Reproducibility requirements

- Commit both lockfiles; use `npm ci`.
- Pin Node via `.nvmrc` and `engines`.
- Pin MariaDB version in compose/CI.
- Deterministic seed fixtures with fixed IDs (insert explicit IDs or capture returned IDs).
- No network access required for tests (self-host assets or mock CDNs).
- Test commands documented in `README.md`.

---

## 15. Prioritized Fix Roadmap

### Phase 0 — Safety net (do first; no app behavior change)

| Order | Task | Finding | Effort | Exit criteria |
|---:|---|---|---|---|
| 1 | Take verified DB + uploads backup | P0-02/03 | S | Restore test passes |
| 2 | Rotate DB credentials and seeded/default passwords | P0-01 | S | Old creds fail |
| 3 | Stop using `lekhafong_production.sql`; add warning/rename | P0-02 | S | No destructive default path |
| 4 | Add `.env.example`, README, expanded `.gitignore` | P2-04 | S | Fresh setup documented |
| 5 | Untrack `node_modules` | P2-04 | S | `git ls-files` clean |
| 6 | Add LAN firewall rules and verify listeners | P1-01 | S | Only 3030 exposed |
| 7 | Add secret scanning to CI/pre-commit | P0-01 | S | New secrets blocked |

### Phase 1 — P0 application security (before any shared use)

| Order | Task | Finding | Effort | Depends on |
|---:|---|---|---|---|
| 8 | Password hashing + migration/reset path | P0-03 | M | Phase 0 |
| 9 | Server-side sessions + login/logout/me | P0-04 | L | 8 |
| 10 | Authz middleware + ownership checks on every route | P0-04/P1-07 | L | 9 |
| 11 | Central escaping + remove inline handlers + CSP | P0-05 | M–L | 10 |
| 12 | Persist rental transaction (`CONTRACT`/`RENTAL`/`ITEM`) | P0-06 | L | 10, schema migration |
| 13 | Rental status/columns/idempotency/return/cancel | P0-06 | M | 12 |

### Phase 2 — P1 reliability and data integrity

| Order | Task | Finding | Effort | Depends on |
|---:|---|---|---|---|
| 14 | Single-origin proxy + env config + bindings | P1-01 | M | Phase 0 |
| 15 | Harden static server (decode/traversal/allowlist) | P1-02 | S–M | 14 |
| 16 | Upload auth, magic bytes, cleanup, quotas | P1-03 | M | 10 |
| 17 | Schema migration: AUTO_INCREMENT, uniques, FKs, timestamps | P1-04 | M | Backup |
| 18 | Validation schemas + error envelope + no internals | P1-05/P1-06/P1-07 | M | 10 |
| 19 | Rate limiting, generic login errors, audit logs | P1-05 | S–M | 9 |
| 20 | Health/readiness, graceful shutdown, structured logs | P1-08 | S–M | 14 |

### Phase 3 — P2 frontend/workflow quality

| Order | Task | Finding | Effort |
|---:|---|---|---|
| 21 | Router/deep-link/history fixes | P2-01 | M |
| 22 | Implement or remove sort/pager/favorites/date filters | P2-02 | M |
| 23 | Split monolith; remove duplicate functions; add lint | P2-03 | L |
| 24 | Asset optimization; self-host Tailwind/fonts/icons | P2-05 | M |
| 25 | Tests + CI + migrations + docker-compose dev | P2-06 | L |
| 26 | Accessibility pass on modals/forms | P2-07 | M |

### Phase 4 — P3 hardening and operations

| Order | Task | Finding | Effort |
|---:|---|---|---|
| 27 | Privacy/PDPA notice, retention, audit logs | P3-02 | M |
| 28 | Scheduled encrypted backups + restore drills | P3-03 | M |
| 29 | Production reverse proxy/TLS/non-root/read-only FS | P3-04 | L |
| 30 | Dead code/naming cleanup | P3-01 | S |

### Recommended ordering rationale

1. **Backups and credential rotation first** — they protect data and accounts regardless of code changes.
2. **Auth/authz before LAN exposure** — the API currently allows anyone to become an admin.
3. **XSS before storing any new user content** — otherwise admin sessions are compromiseable.
4. **Rental persistence before marketing the rental flow** — the current success screen is misleading.
5. **Schema hardening before concurrency** — otherwise new features inherit the `MAX+1` race.
6. **Frontend polish after the data/auth contract is stable** — avoids rework.

---

## 16. Acceptance / Verification Checklist

### Security
- [ ] Old DB/session credentials rotated; historical secrets treated as compromised.
- [ ] No plaintext passwords in DB, logs, dumps, or API responses.
- [ ] All non-public API routes return `401` without a valid session.
- [ ] Customer cannot access admin routes or another customer's records.
- [ ] Tampering with `localStorage` grants no privileges.
- [ ] Stored XSS payloads render as text.
- [ ] CSP has no `unsafe-inline` for scripts; no inline `onclick`.
- [ ] Upload requires admin auth; MIME spoofing rejected.
- [ ] `/api/users` and `/api/admins` require admin role.
- [ ] Error responses contain no SQL/framework details.
- [ ] Rate limiting on login/register; generic failure messages.

### Data integrity
- [ ] `lekhafong_production.sql` cannot drop a live DB.
- [ ] Migrations are idempotent and versioned.
- [ ] All PKs auto-increment; uniques enforced.
- [ ] Rental creates `CONTRACT` + `RENTAL` + `ITEM` in one transaction.
- [ ] Returned rental ID is queryable.
- [ ] Return/cancel restores stock exactly once.
- [ ] Concurrent booking test passes.
- [ ] Date-range availability is enforced.
- [ ] Status values satisfy constraints.
- [ ] Deletes handle dependent rows or soft-delete.
- [ ] Backup restore verified.

### Local dev/LAN
- [ ] `ss -ltnp` shows backend/DB on loopback only.
- [ ] Frontend reachable at `http://192.168.1.182:3030` from phone.
- [ ] API works through same-origin proxy; no CORS errors.
- [ ] No hardcoded `localhost:3031` in browser code.
- [ ] `.env` values validated at startup.
- [ ] Firewall blocks `3031`/`3306` from LAN.
- [ ] No public port forwarding.

### Frontend
- [ ] `?page=detail&id=5` survives refresh.
- [ ] Back/Forward works; modal Back is consistent.
- [ ] Every visible control has an effect.
- [ ] No duplicate function definitions.
- [ ] Empty/loading/error states exist.
- [ ] Auth/admin modals are keyboard accessible.
- [ ] Assets load offline on the LAN.

### Testing/ops
- [ ] `npm ci` works from a fresh clone.
- [ ] `npm test` passes locally and in CI.
- [ ] Tests use a disposable `*_test` DB only.
- [ ] Lint/format run in CI.
- [ ] Health/readiness endpoints work.
- [ ] Graceful shutdown works.
- [ ] Structured logs with request IDs.
- [ ] Backup/restore documented and tested.

---

## 17. What Was Not Done (by design)

- No source file was edited.
- No `.env` was created, overwritten, or reordered.
- No database was dropped, reset, truncated, seeded, or migrated.
- No login or rental endpoint was called, so `LOGIN`, `RENTAL`, `ITEM`, and `CONTRACT` remain unchanged.
- No server was left running.
- No public exposure was configured.
- No secret values are printed in this document.

---

## Appendix A — Evidence Index

| Evidence | Location |
|---|---|
| Destructive dump header | `lekhafong_production.sql:1-4` |
| Plaintext password compare | `backend/database.js:119-122` |
| Password fallback | `backend/database.js:183` |
| Admin password `Number()` | `backend/database.js:541` |
| Fixed CORS | `backend/database.js:10-15` |
| Unauthenticated upload | `backend/database.js:77-90` |
| `MAX+1` helper | `backend/database.js:69-72` |
| Rental transaction without rental insert | `backend/database.js:423-485` |
| Synthetic rental ID | `backend/database.js:468` |
| Invalid rental status | `backend/database.js:476` |
| Backend all-interface bind | `backend/database.js:579-581` |
| Frontend loopback bind | `frontend/frontserver.js:43` |
| Unsafe URL decode | `frontend/frontserver.js:22` |
| Prefix-only traversal check | `frontend/frontserver.js:23-28` |
| Hardcoded API origin | `frontend/script.js:127,132` |
| localStorage auth | `frontend/script.js:439-458,481` |
| Client-only admin guard | `frontend/script.js:460-467` |
| XSS sinks | `frontend/script.js:388-390,416-418,853,1851-1856,1903-1905,1985-1990,2323-2336,2516-2526` |
| Duplicate functions | `frontend/script.js:1797/2078,1893/2314,1919/2345,1937/2379,1951/2396,1963/2371` |
| Deep-link state loss | `frontend/script.js:811-821,1243-1259` |
| Unused date filters | `frontend/script.js:937-939,1133-1142` |
| Decorative sort/pager | `frontend/script.js:1143-1144` |
| No-op favorites | `frontend/script.js:539-541` |
| CDN dependencies | `frontend/index.html:12-16` |
| Schema status mismatch | `lekhafong_production.sql:85-88` vs `backend/database.js:476` |
| `RENTAL.contract_id NOT NULL` | `lekhafong_production.sql:78-81` |
| Seed credentials | `lekhafong_production.sql:112-118` |
| `.env` history commits | `894a556`, `e61a9df` (`git log --all -- backend/.env`) |
| Tracked node_modules | `git ls-files | grep -c node_modules` → 1966 |

## Appendix B — Suggested `.env.example` (placeholders only)

```dotenv
# Copy to .env and fill locally. Never commit .env.
NODE_ENV=development
HOST=127.0.0.1
PORT=3031

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=lekhafong_app
DB_PASSWORD=replace-me
DB_NAME=lekhafong_production
DB_POOL_SIZE=10
DB_TIMEZONE=Z

CORS_ORIGINS=http://localhost:3030
SESSION_SECRET=replace-with-a-long-random-value
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=5
LOG_LEVEL=info
```

Frontend server example:

```dotenv
FRONTEND_HOST=127.0.0.1
FRONTEND_PORT=3030
BACKEND_ORIGIN=http://127.0.0.1:3031
```

## Appendix C — Recommended LAN verification commands (after implementation)

```bash
# listeners
ss -ltnp | grep -E ':(3030|3031|3306)\b'

# backend should be loopback-only
curl -sS http://127.0.0.1:3031/api/health

# frontend through LAN
curl -sS -o /dev/null -w '%{http_code}\n' http://192.168.1.182:3030/

# API through the frontend proxy
curl -sS http://192.168.1.182:3030/api/products | head -c 200

# direct backend from LAN should fail (run from another device)
curl -sS --max-time 2 http://192.168.1.182:3031/api/products || echo "blocked (expected)"
```

---

**End of audit.** The application should remain in read-only/isolated development mode until at least Phase 0 and Phase 1 are complete.
