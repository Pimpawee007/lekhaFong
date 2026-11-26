# Regression tests

These tests were added with the QA bug-fix task. None of them touch the
development database unless you explicitly point them at a disposable test
database.

## 1. Static server (no database)

```bash
node --test tests/static-server.test.js
```

Covers homepage/assets, malformed URL handling (`400`, process stays alive),
sensitive files (`package.json`, lockfiles, `frontserver.js`, `.env`,
`node_modules`), traversal attempts, method restrictions and `HEAD`.

## 2. Backend PORT validation (no database)

Stop the backend first if it is listening on `3031` (the fallback test skips
itself when the port is busy).

```bash
node --test tests/backend-port.test.js
```

## 3. Registration + product image preservation (writes — disposable DB only)

These tests create users and edit one product. **Never run them against
`lekhafong_production`.**

1. Start an isolated MariaDB instance (or create a separate `lekhafong_test`
   database with an account that has privileges only on that database).
2. Import the schema **without** the destructive header from
   `lekhafong_production.sql`:
   ```bash
   sed '1,4d' lekhafong_production.sql | mysql -u <test_user> -p lekhafong_test
   ```
3. Start the API against the test database:
   ```bash
   PORT=3101 DB_HOST=127.0.0.1 DB_PORT=3307 DB_USER=<test_user> \
   DB_PASSWORD=<test_password> DB_NAME=lekhafong_test node backend/database.js
   ```
4. Run the confirmed write tests:
   ```bash
   QA_TEST_DB_CONFIRMED=1 QA_API_BASE=http://localhost:3101 \
   node --test tests/backend-registration.test.js
   ```

The `QA_TEST_DB_CONFIRMED=1` guard intentionally prevents accidental writes to
a development database.

## 4. Browser UI checks (read-only)

The UI suite does not submit rentals, register users, upload files, or save
products. It reads the catalog and admin data and uses browser storage only.

```bash
npm install --no-save playwright-core
npx playwright install chromium      # if no browser is installed

# backend :3031 and frontend :3030 must be running
QA_E2E_BASE=http://localhost:3030 node tests/e2e/qa-ui.cjs
```

Optional: `CHROME_PATH=/path/to/chrome` selects a specific Chromium binary.

Covered: all sort modes (including category filter), favourites (toggle,
refresh, detail consistency, corrupted storage), delivery calculation
(pickup vs delivery, confirmation breakdown), browser Back/Forward, deep-link
refresh, rental modal Back behaviour, Forgot Password toast, and admin image
state isolation/upload URL normalisation.
