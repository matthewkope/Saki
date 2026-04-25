// ─────────────────────────────────────────
//  ENVIRONMENT SWITCHER
//  Copy this file to env.config.js and fill in your values.
//  env.config.js is gitignored — never commit it.
// ─────────────────────────────────────────

const ENV = 'production'; // 'local' or 'production'

const URLS = {
  local:      'http://localhost:3000',
  production: 'https://your-domain.vercel.app',
};

const BASE_URL = URLS[ENV];

// Must match INGEST_API_KEY in your server .env
const INGEST_API_KEY = 'replace-with-your-secret-key';
