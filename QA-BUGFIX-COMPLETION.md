# LeKhaFong Production — QA Bug Fix Completion Report

**Date:** 2026-11-26  
**Repository:** `/home/bewithnn/lekhaFong`  
**Scope:** Functional QA fixes only. Security redesign deferred as instructed.  
**Git state:** Changes are left uncommitted and unpushed.

---

## 1. Executive Summary

All requested functional bugs were implemented and verified:

- The frontend static server no longer crashes on malformed URLs and no longer serves server-side files, dependencies, dotfiles, or package manifests.
- The backend now defaults to port `3031` when `PORT` is absent and rejects invalid port values with a clear startup error.
- Dead duplicate JavaScript declarations were removed; the active, more complete implementations were preserved and hardened. The two `popstate` listeners were consolidated into one dispatcher.
- Admin product image state is now scoped to the selected product, survives an edit without opening the image manager, is discarded on cancel, and is normalised to avoid duplicated/malformed upload URLs.
- Customer registration rejects missing/empty passwords, rejects duplicate usernames and emails with `409`, validates Thai mobile numbers in both supported formats, preserves leading zeros, and no longer leaks SQL error details.
- Delivery pricing now uses one shared calculation helper: equipment fee + `฿150` delivery for delivery orders, `฿0` for store pickup.
- Catalog sorting now works for default, price ascending/descending, and Thai/English name A–Z/Z–A, including with filters.
- Favorites are now functional and persisted in `localStorage`, synchronised across catalog cards and product detail pages.
- The Forgot Password link shows the requested Thai administrator-contact toast.
- Product detail deep links survive refresh; Back/Forward navigation and the rental modal Back behaviour were verified.

**Verification totals:** 6 static-server checks, 3 port checks, 8 backend registration/image checks, and 33 read-only browser checks passed. A separate write-enabled browser suite also passed **44/44** checks against a disposable test database.

No schema changes were made. The MariaDB development database and `backend/.env` were preserved.

---

## 2. Original QA Findings Addressed

| # | QA finding | Status |
|---|---|---|
| 1 | Malformed URL crashes `frontserver.js` | Fixed |
| 2 | Static server exposes `package.json`, lockfiles, `frontserver.js`, `.env`, `node_modules`, and allows traversal | Fixed |
| 3 | Backend picks a random port when `PORT` is missing; invalid ports are not validated | Fixed |
| 4 | Duplicate `handleLoginSubmit`, `renderAdminProductsTable`, `openProductDetailById`, `submitProductUpdate`, `submitNewProduct`, `showAddProduct`, `scrollBrands`, plus two `popstate` handlers | Fixed |
| 5 | Admin product editor retains stale image state and can overwrite another product’s images | Fixed |
| 6 | Registration accepts empty/missing passwords via `String(password) \|\| 123456` | Fixed |
| 7 | Registration does not reject duplicate usernames; duplicate email returns the wrong status | Fixed |
| 8 | Phone input only accepts `081-234-5678` | Fixed |
| 9 | Delivery charge advertised but not included in rental total | Fixed in the UI calculation and confirmation; backend persistence limitation documented |
| 10 | Catalog sort dropdown is non-functional | Fixed |
| 11 | Favorites button is a toast-only no-op | Fixed with browser-local persistence |
| 12 | Forgot Password link only calls `preventDefault()` | Fixed |
| 13 | Deep links, Back/Forward, and rental-modal history handling are unreliable | Fixed |

---

## 3. Implemented Fixes

### 3.1 Static server — `frontend/frontserver.js`

**Root cause**

- `decodeURIComponent(req.url...)` was unguarded, so `GET /%` threw an uncaught `URIError` and terminated the process.
- The path check used a string-prefix test (`filePath.startsWith(__dirname)`) that does not prove the resolved path is inside the frontend directory.
- All file types and all files under the frontend directory were served, including `package.json`, lockfiles, `frontserver.js`, and `node_modules`.

**Fix**

- URL parsing/decoding is wrapped in `try/catch`; malformed encodings return HTTP `400`.
- Paths are resolved with `path.resolve`, checked with `path.relative` (rejecting `..` and absolute results), and re-checked with `fs.realpathSync` to block symlink escapes.
- Added an extension allowlist (`.html`, `.css`, `.js`, images, fonts).
- Added deny rules for dotfiles/dot-directories, `.git`, `node_modules`, `package.json`, lockfiles, `frontserver.js`, and `.env`.
- Added `GET`/`HEAD` handling, `405` for other methods, safe text error responses, stream error handling, and a `clientError` handler.
- Optional `FRONTEND_PORT`/`FRONTEND_HOST` environment support was added for tests and deployment; defaults remain `3030` / `localhost`.

Verified normal HTML, CSS, JS, logo, banner, and member images still load.

### 3.2 Backend port fallback — `backend/database.js`

**Root cause**

- `const PORT = process.env.PORT;` caused Node to listen on a random port when the value was missing.
- Invalid values were not validated.

**Fix**

- `resolvePort()` returns `3031` when `PORT` is missing/blank.
- Non-integer, zero, negative, or out-of-range values print a clear error and exit with code `1`.
- Existing valid configuration is preserved.
- Optional `DB_PORT` support was added (defaults to `3306`, so existing `.env` files without `DB_PORT` behave exactly as before).

### 3.3 Duplicate JavaScript declarations — `frontend/script.js`

Because function declarations are hoisted and later declarations override earlier ones, the **later** implementations were active:

| Function | Active implementation kept | Useful behaviour preserved |
|---|---|---|
| `handleLoginSubmit` | Later version | Login-form reset, pending rental draft continuation |
| `renderAdminProductsTable` | Later version | Product thumbnail column, stock count |
| `openProductDetailById` | Later version | Stock field and image state initialization (further hardened) |
| `submitProductUpdate` | Later version | Stock + image payload |
| `submitNewProduct` | Later version | Stock + image payload |
| `showAddProduct` | Later version | Image-state reset |
| `scrollBrands` | Consolidated | Accepts both `b1` and `track-b1`; `window.scrollBrands` alias preserved |

The earlier dead copies were removed. All global names and inline `onclick` callers remain compatible.

### 3.4 Browser history — `frontend/script.js`

**Root cause**

- Initial load read `?page` but not `?id`, then `replaceState` dropped the product ID.
- Two `popstate` listeners (navigation and rental modal) could race.

**Fix**

- `DOMContentLoaded` now reads `page`, `id`, and `type`, and hydrates `state.item` before the first render.
- `buildPageQuery()` preserves `?page=detail&id=...`; `detail()` preserves history state when correcting the URL.
- The two `popstate` handlers were merged into one dispatcher that closes an open rental popup first, then applies navigation state.
- Back/Forward, deep-link refresh, and rental-popup Back were verified.

### 3.5 Admin product image management — `frontend/script.js`, `backend/database.js`

**Root cause**

- `activeProductImages` was a single global object with no product ownership.
- The dead earlier `openProductDetailById` did not initialise images; the active one did, but there was no guard against stale ownership, no normalisation of absolute backend URLs, and drafts could outlive the editor.
- The product `PUT` route always rewrote `main_image` and `detail_images`, even when omitted, which could wipe images.

**Fix**

- `activeProductImages` now carries a `productId` and is rebuilt from the selected product every time the editor opens.
- `showAddProduct()` and `backToProductList()` reset image state; cancelling the image modal discards only the draft.
- Switching products cannot carry over the previous product’s images.
- Saving without opening the image manager sends the product’s existing images.
- `normalizeImagePath()` converts absolute backend URLs back to `/uploads/...` and prevents double-origin URLs; `resolveImageUrl()` never prepends the backend origin twice.
- Upload preview uses a blob URL; on confirm it becomes exactly one `/uploads/...` path.
- Main image + up to four detail images remain supported; empty slots are filtered before saving.
- Backend `PUT /api/products/:id` now preserves existing images when `main_image`/`detail_images` are omitted, accepts array or JSON-string detail images, filters empties, and caps the list at four.
- The `PUT` route now returns `404` for a missing product instead of silently reporting success.

### 3.6 Customer registration — `backend/database.js`, `frontend/index.html`, `frontend/script.js`

**Root cause**

- `const finalPassword = String(password) || 123456;` created default passwords and could store the literal string `"undefined"`.
- Only `CUSTOMER.email` was checked, and duplicates returned `400`; usernames were never checked.
- Phone handling stripped every non-digit character and stored `0` for blank input.
- SQL error text was returned to the client.

**Fix**

- Missing, `null`, empty, whitespace-only, and over-length passwords return `400` with Thai validation messages. No default password is assigned.
- Email format, first name, last name, username, and phone are validated server-side.
- Duplicate username and duplicate email (customer or admin) return `409 Conflict` with readable Thai messages.
- Duplicate checks and `MAX(id)+1` allocation are serialised with MariaDB `GET_LOCK('lekhafong_register', 10)`; concurrent duplicates produce exactly one success.
- Phone validation accepts `0812345678` and `081-234-5678` (also the `06x`/`09x` mobile ranges), rejects letters/symbols and wrong lengths, and stores a normalised 10-digit string with the leading zero preserved.
- Internal SQL errors are logged server-side and mapped to generic client messages.
- Frontend phone input pattern/maxlength/placeholder updated; the signup handler validates before calling the API and keeps the form values when registration fails.

### 3.7 Delivery fee — `frontend/script.js`

**Root cause**

- The confirmation-popup total was `days × dailyRate` only. The advertised `เริ่ม ฿150` delivery charge was never added.

**Fix**

- Added one shared helper:
  - `equipmentFee = rentalDays × dailyRate`
  - `deliveryFee = pickupMethod === 'จัดส่งถึงที่' ? 150 : 0`
  - `total = equipmentFee + deliveryFee`
- The product detail page now shows a live estimate that updates when dates or pickup method change.
- The confirmation popup separates equipment fee, delivery fee, and grand total.
- The success popup shows the persisted equipment charge, the delivery estimate, the displayed grand total, and an explicit note that delivery is **not** recorded in the database.
- Example verified: `฿500/day × 3 = ฿1,500`, delivery `฿150`, grand total `฿1,650` (the live fixture was ฿1,500/day, producing `฿4,500 + ฿150 = ฿4,650`).

### 3.8 Sorting — `frontend/script.js`

**Root cause**

- The sort `<select>` had no `onchange` handler.

**Fix**

- Added `state.sort` with options:
  - Default/original order
  - Price low → high
  - Price high → low
  - Name A–Z
  - Name Z–A
- Sorting operates on a copied, already-filtered list; the canonical `P` array is not mutated.
- Prices use numeric comparison; names use `localeCompare(..., 'th', { sensitivity: 'base', numeric: true })`.
- The selected option is driven by `state.sort`, so it survives normal re-renders and interacts correctly with category/search filters.

### 3.9 Favorites — `frontend/script.js`, `frontend/style.css`, `frontend/index.html` (via script markup)

**Root cause**

- `apiToggleFavorite()` only displayed a toast.

**Fix**

- Added `localStorage['lekhafong_favorites']` as an array of stable product IDs.
- Duplicates are prevented with a `Set`.
- Corrupted/unreadable storage is caught, reset, and does not break rendering.
- Catalog cards and product detail hearts share the same state; `.on`, `aria-pressed`, and Font Awesome solid/regular hearts are synchronised after each render.
- The navbar heart opens a favorites-only catalog view using the existing catalog UI; a clear-filter control is provided.
- Favorites survive refresh and logout (`logoutUser()` now removes only the auth profile instead of clearing all origin storage).
- This is browser-local only; it is not account-synchronised.

### 3.10 Forgot Password — `frontend/index.html`, `frontend/script.js`

- The link now calls `showForgotPasswordHelp()`.
- It displays the requested Thai toast:
  `หากลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบเพื่อดำเนินการรีเซ็ตรหัสผ่าน`
- No reset backend or broken navigation was introduced.

---

## 4. Files Changed

### Application files

| File | Change |
|---|---|
| `backend/database.js` | Port/DB_PORT validation; registration validation, 409 duplicates, advisory lock, Thai phone normalisation; image-preserving product updates; safer error messages |
| `frontend/frontserver.js` | Safe URL decoding, 400 handling, path/realpath enforcement, asset allowlist, sensitive-file denial, method/HEAD handling, stream error handling |
| `frontend/index.html` | Forgot Password handler; phone pattern/placeholder/required update |
| `frontend/script.js` | Duplicate cleanup; history consolidation; image-state scoping/normalisation; registration UX; delivery calculation; sorting; favorites; forgot-password handler |
| `frontend/style.css` | Active-state styling for detail-page favorite buttons |

### New tests / documentation

| File | Purpose |
|---|---|
| `tests/static-server.test.js` | Static server status, crash resistance, sensitive-file and traversal checks |
| `tests/backend-port.test.js` | PORT fallback and invalid-port startup checks |
| `tests/backend-registration.test.js` | Registration, phone, duplicate, concurrency, and image-preservation checks (guarded to disposable DB) |
| `tests/e2e/qa-ui.cjs` | Read-only Playwright checks for sorting, favorites, delivery, navigation, Forgot Password, phone input, admin image state |
| `tests/README.md` | Test instructions and disposable-DB warning |
| `QA-BUGFIX-COMPLETION.md` | This report |

### Unchanged / preserved

- `backend/.env` — unchanged, not overwritten, no credentials reproduced.
- `lekhafong_production.sql` — not executed; no `DROP DATABASE` run.
- MariaDB development database — no schema or row changes.
- Existing unrelated working-tree changes under `backend/node_modules/` — preserved untouched.
- `CODEBASE-AUDIT.md` — left as supplied.
- No commit or push was performed.

---

## 5. Testing and Verification Results

### 5.1 Environment used

- Node.js `v22.23.5`
- MariaDB `10.11.14`
- Browser automation: Playwright Core + cached Chromium (headless)
- Write tests used a **disposable** MariaDB instance on `127.0.0.1:3307`, database `lekhafong_test`, imported from the schema body after removing the destructive `DROP DATABASE` header.

### 5.2 Static server

```bash
node --test tests/static-server.test.js
```

Result: **6/6 passed**

Covers:

- `/` → `200`
- `/style.css`, `/script.js`, logo, banner, member images → `200`
- `/%` and `/%E0%A4%A` → `400`, process still alive
- `/package.json`, `/package-lock.json`, `/frontserver.js`, `/.env`, `/node_modules/...` → denied
- `/../backend/database.js`, encoded traversal, dotfile traversal → denied
- `POST` → `405`
- `HEAD` → headers only

Manual curl probes also returned `400` for malformed URLs and `403` for sensitive/traversal requests.

### 5.3 Backend port behavior

```bash
node --test tests/backend-port.test.js
```

Result: **3/3 passed**

- `PORT=abc` → exit `1`, `Invalid PORT value "abc"`
- `PORT=70000` → exit `1`, `Invalid PORT value "70000"`
- Empty/missing `PORT` → listens on `3031`

### 5.4 Registration and image preservation

```bash
QA_TEST_DB_CONFIRMED=1 \
QA_API_BASE=http://localhost:3031 \
node --test tests/backend-registration.test.js
```

Result: **8/8 passed**

Verified:

- Valid signup → `200`
- Empty, missing, and `null` password → `400`
- Duplicate username → `409`
- Duplicate email → `409`
- `0812345678`, `081-234-5678`, `0891234567`, `099-123-4567` → accepted
- Short, too-long, letters, `07x`, symbols, blank, and `null` phones → `400`
- Six simultaneous registrations with the same username → exactly one `200`, five `409`
- Product `PUT` without image fields preserves existing main/detail images

Manual database check confirmed stored phones such as `0812345678` retain the leading zero.

### 5.5 Browser UI / end-to-end

Read-only suite committed to the repo:

```bash
QA_E2E_BASE=http://localhost:3030 node tests/e2e/qa-ui.cjs
```

Result: **33/33 passed**

Covers:

- Every sort mode, default restoration, and sort + category filter
- Favorites toggle, stable IDs, refresh persistence, detail-page consistency, favourites-only view, returning to normal catalog navigation, corrupted storage recovery
- Pickup vs delivery estimate and confirmation breakdown
- Rental popup Back behaviour without leaving the detail page
- Deep-link refresh, Back, Forward
- Forgot Password toast
- Phone input accepts both formats and rejects letters/short numbers with a toast
- Admin image state isolation between products, edit-without-modal payload, upload path normalisation, duplicate-origin guard
- No uncaught page errors

A separate write-enabled E2E suite was also run from `/tmp/opencode/e2e/run-tests.cjs` against the disposable database:

Result: **44/44 passed**

That suite additionally verified:

- Saving an uploaded image and reopening the editor
- Cancelling the editor without saving draft images
- Removing one detail image affecting only the current product draft
- Rental success popup showing persisted equipment fee, delivery estimate, grand total, and the persistence disclaimer

### 5.6 Not executed

- No test was run against the live development database for write operations, by design.
- No load, penetration, or XSS test suite was run; those are outside this functional task.
- Browser automation used Chromium via Playwright Core; no cross-browser matrix was run.

---

## 6. Known Limitations

1. **Rental persistence remains incomplete.** `POST /api/rentals` still only checks/decrements `EQUIPMENT.stock` and returns a synthetic rental ID with status `Confirmed`. It does not insert `RENTAL`, `ITEM`, or `CONTRACT`. This task did not redesign that workflow.
2. **Delivery charges are not persisted.** The UI calculates and displays delivery, and the success popup explicitly states that it is an estimate not recorded in the database. Do not treat the displayed grand total as an accounting record.
3. **Favorites are browser-local only.** They are not tied to an account, not shared between devices, and disappear if browser storage is cleared.
4. **No database uniqueness constraints were added.** Duplicate protection is application-level plus a MariaDB advisory lock. External writers can still create duplicates.
5. **Existing phone data is not migrated.** The seeded `812345678` value remains as-is; only new registrations are normalised.
6. **Sorting/favorites are client-side.** They operate on the products loaded into the catalog. The existing decorative pager was not implemented.
7. **Existing malformed `detail_images` values are handled defensively** (ignored/reset in the UI), but are not automatically repaired in the database.

---

## 7. Remaining Security Limitations

The fixes in this task do **not** make the application secure for production or untrusted networks. Deferred as instructed:

- Passwords are still stored and compared in plaintext.
- There are no sessions, tokens, cookies, or server-side authentication state.
- Admin CRUD, customer PII endpoints, upload, and rental endpoints remain unauthenticated/unauthorised.
- The admin guard is client-side `localStorage` only and can be edited by any browser user.
- Stored XSS remains possible because database/user strings are interpolated into `innerHTML` and inline handlers.
- Uploads still trust the client MIME type; there is no magic-byte validation, auth, quota, or rate limit.
- CORS remains fixed to `http://localhost:3030`; the frontend is still loopback-bound and the backend still listens on all interfaces.
- No CSRF strategy, login rate limiting, account lockout, or password-reset backend exists.
- Known seeded credentials remain usable until rotated.

Treat the current application as a development/demo system, not a secure production deployment.

---

## 8. Database Safety Confirmation

- The destructive `lekhafong_production.sql` bootstrap was **not** run.
- The development database `lekhafong_production` was **not** modified, reset, migrated, seeded, or truncated.
- Only read-only statements (`SHOW GRANTS`, `SHOW DATABASES`) were used against the development database during setup/verification.
- All write tests created users/products only in a disposable `lekhafong_test` database on a temporary MariaDB instance.
- No schema changes or migrations were introduced.
- `backend/.env` was read by the application but **not edited or overwritten**; no credentials appear in this report or test output.
- Test uploads created during browser testing were removed; the pre-existing `backend/uploads` content was left untouched (the directory is now empty of test files).
- Unrelated working-tree changes under `backend/node_modules/` were preserved.
- Changes were not committed or pushed.

---

## 9. Deployment / Restart Instructions (Linux VM)

The existing `.env` in `backend/` continues to be used. New optional variables:

- `PORT` — backend port; defaults to `3031` when absent.
- `DB_PORT` — optional database port; defaults to `3306`.
- `FRONTEND_PORT` — optional frontend port; defaults to `3030`.
- `FRONTEND_HOST` — optional frontend bind host; defaults to `localhost`.

### Stop the old processes

```bash
ps -ef | grep -E 'node (database|frontserver)\.js' | grep -v grep
# then, for each PID:
kill <PID>
```

### Start the backend

```bash
cd /home/bewithnn/lekhaFong/backend
npm start
# or: node database.js
```

Expected log:

```text
LekhaFong Backend running at http://localhost:3031
Connected to MySQL database: <database name>
```

### Start the frontend

In a second terminal:

```bash
cd /home/bewithnn/lekhaFong/frontend
npm start
# or: node frontserver.js
```

Expected log:

```text
Frontend running at http://localhost:3030
```

### Verify

```bash
curl -sI http://localhost:3030/ | head -1
curl -s http://localhost:3031/api/products | head -c 120
```

### Optional background start

```bash
cd /home/bewithnn/lekhaFong/backend
nohup node database.js > backend.out.log 2>&1 &

cd /home/bewithnn/lekhaFong/frontend
nohup node frontserver.js > frontend.out.log 2>&1 &
```

### Re-run the committed checks

```bash
cd /home/bewithnn/lekhaFong
node --test tests/static-server.test.js
node --test tests/backend-port.test.js

# Only with a disposable test DB/API:
QA_TEST_DB_CONFIRMED=1 QA_API_BASE=http://localhost:3101 \
node --test tests/backend-registration.test.js

# Backend :3031 and frontend :3030 running:
QA_E2E_BASE=http://localhost:3030 node tests/e2e/qa-ui.cjs
```

---

## 10. Final Completion Status

| Requirement | Status |
|---|---|
| Static server malformed URLs → `400`, process survives | Complete |
| Sensitive files and traversal blocked | Complete |
| Backend port default `3031` + invalid-port validation | Complete |
| Duplicate function cleanup without losing behaviour | Complete |
| Duplicate `popstate` consolidation | Complete |
| Admin image state isolation, cancel, save, reopen, URL normalisation | Complete |
| Registration password validation | Complete |
| Duplicate username/email → `409` | Complete |
| Phone formats accepted / invalid rejected / leading zero preserved | Complete |
| Delivery fee calculation and confirmation breakdown | Complete (UI; backend persistence limitation documented) |
| Product sorting | Complete |
| Favorites | Complete (browser-local limitation documented) |
| Forgot Password toast | Complete |
| Back/Forward, deep-link refresh, rental modal navigation | Complete |
| Regression tests added and executed | Complete |
| Database and `.env` preserved | Confirmed |
| Completion report created | Complete |

**Overall status: all requested functional fixes are implemented and verified. The application remains a development/demo system with the security limitations listed in §7.**
