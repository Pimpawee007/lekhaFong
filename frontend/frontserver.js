const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.FRONTEND_PORT) || 3030;
const HOST = process.env.FRONTEND_HOST || 'localhost';
const ROOT = fs.realpathSync(__dirname);

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

// Only front-end assets may be served. Server-side source, dependency folders,
// lockfiles and dotfiles are never part of this allowlist.
const ALLOWED_EXTENSIONS = new Set(Object.keys(MIME_TYPES));
const FORBIDDEN_SEGMENTS = new Set(['node_modules', '.git']);
const FORBIDDEN_FILES = new Set([
    'package.json',
    'package-lock.json',
    'npm-shrinkwrap.json',
    'frontserver.js',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.env'
]);

function sendText(res, statusCode, message) {
    if (res.headersSent) {
        return res.end();
    }
    res.writeHead(statusCode, {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
    });
    res.end(message);
}

function isForbiddenPath(urlPath) {
    const segments = urlPath.split('/').filter(Boolean);
    return segments.some(segment => {
        const decoded = segment.toLowerCase();
        return decoded.startsWith('.') || FORBIDDEN_SEGMENTS.has(decoded);
    });
}

function resolveSafePath(urlPath) {
    const relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');

    if (!relativePath || relativePath.includes('\0') || isForbiddenPath(relativePath)) {
        return { forbidden: true };
    }

    const fileName = path.basename(relativePath);
    if (FORBIDDEN_FILES.has(fileName.toLowerCase()) || fileName.startsWith('.')) {
        return { forbidden: true };
    }

    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return { forbidden: true };
    }

    const candidate = path.resolve(ROOT, relativePath);
    const relativeToRoot = path.relative(ROOT, candidate);
    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
        return { forbidden: true };
    }

    return { filePath: candidate };
}

const server = http.createServer((req, res) => {
    try {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return sendText(res, 405, '405 Method Not Allowed');
        }

        let rawPath;
        try {
            rawPath = String(req.url || '/').split('?')[0].split('#')[0];
        } catch {
            return sendText(res, 400, '400 Bad Request');
        }

        let urlPath;
        try {
            // decodeURIComponent throws URIError for malformed encodings such as "/%".
            urlPath = decodeURIComponent(rawPath);
        } catch {
            return sendText(res, 400, '400 Bad Request');
        }

        // Normalise backslashes so Windows-style traversal cannot slip through.
        urlPath = urlPath.replace(/\\/g, '/');
        if (!urlPath.startsWith('/')) urlPath = `/${urlPath}`;

        const resolved = resolveSafePath(urlPath);
        if (resolved.forbidden) {
            return sendText(res, 403, '403 Forbidden');
        }

        let realPath;
        try {
            realPath = fs.realpathSync(resolved.filePath);
        } catch (err) {
            return sendText(res, err.code === 'ENOENT' ? 404 : 500, err.code === 'ENOENT' ? '404 Not Found' : '500 Server Error');
        }

        // Symlinks must not escape the frontend directory.
        const relativeToRoot = path.relative(ROOT, realPath);
        if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
            return sendText(res, 403, '403 Forbidden');
        }

        let stat;
        try {
            stat = fs.statSync(realPath);
        } catch (err) {
            return sendText(res, err.code === 'ENOENT' ? 404 : 500, err.code === 'ENOENT' ? '404 Not Found' : '500 Server Error');
        }

        if (!stat.isFile()) {
            return sendText(res, 404, '404 Not Found');
        }

        const ext = path.extname(realPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stat.size,
            'X-Content-Type-Options': 'nosniff'
        });

        if (req.method === 'HEAD') {
            return res.end();
        }

        const stream = fs.createReadStream(realPath);
        stream.on('error', () => {
            // Headers may already be sent; just terminate the response safely.
            if (!res.writableEnded) res.end();
        });
        stream.pipe(res);
    } catch (err) {
        console.error('Static server error:', err.message);
        sendText(res, 500, '500 Server Error');
    }
});

server.on('clientError', (err, socket) => {
    if (socket.writable) {
        socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
    } else {
        socket.destroy();
    }
});

server.listen(PORT, HOST, () => {
    console.log(`Frontend running at http://${HOST}:${PORT}`);
});
