// server/src/cors.config.js
import cors from 'cors';

const raw = process.env.ALLOWED_ORIGINS || '';
// You can add a wildcard for Netlify previews by including "https://*.netlify.app" in ALLOWED_ORIGINS
const defaults = [
  'http://localhost:5173',
  'http://localhost:3000',
];

function normalize(origin) {
  if (!origin) return '';
  return origin.replace(/\/+$/, '').toLowerCase();
}

const envList = raw
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(normalize);

const allowlist = [...new Set([...defaults, ...envList])];

function isAllowed(origin) {
  if (!origin) return true; // allow same-origin / server-to-server / Postman
  const o = normalize(origin);
  if (allowlist.includes(o)) return true;
  // simple wildcard: *.netlify.app
  if (o.endsWith('.netlify.app') && allowlist.includes('https://*.netlify.app')) return true;
  return false;
}

export const corsOptions = {
  origin: function (origin, cb) {
    if (isAllowed(origin)) return cb(null, true);
    cb(new Error('CORS'));
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export function corsMiddleware() {
  return cors(corsOptions);
}

export function logOrigin(req, _res, next) {
  // Helpful when debugging on Render
  const o = req.headers.origin || '';
  if (process.env.NODE_ENV !== 'production') {
    console.log('CORS check:', { origin: o, allowed: isAllowed(o), allowlist });
  }
  next();
}
