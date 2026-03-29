// ─────────────────────────────────────────
//  ENVIRONMENT SWITCHER
//  Change ENV to 'local' or 'production'
// ─────────────────────────────────────────

const ENV = 'production'; // <── change this

const URLS = {
  local:      'http://localhost:3000',
  production: 'https://saki-beta-five.vercel.app',
};

const BASE_URL = URLS[ENV];
