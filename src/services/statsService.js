import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATS_FILE = path.join(__dirname, '../../data/stats.json');

// Estructura en memoria
let stats = {
  totalViews: 0,
  byDate: {},
  sources: {},
  devices: {
    mobile: 0,
    desktop: 0
  }
};

// Cargar estadísticas guardadas al iniciar
try {
  if (fs.existsSync(STATS_FILE)) {
    const raw = fs.readFileSync(STATS_FILE, 'utf8');
    stats = JSON.parse(raw);
  }
} catch (e) {
  console.warn('[Stats] No se pudo leer archivo de estadísticas:', e.message);
}

function saveStatsDebounced() {
  try {
    const dir = path.dirname(STATS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), 'utf8');
  } catch (e) {
    console.error('[Stats] Error guardando archivo:', e.message);
  }
}

export function recordVisit(req) {
  try {
    // 1. Ignorar si es el dueño (cookie dolar_admin=1)
    const cookieHeader = req.headers.cookie || '';
    if (cookieHeader.includes('dolar_admin=1')) {
      return;
    }

    // 2. Solo contar rutas de páginas HTML (ignorar recursos estáticos o APIs)
    const p = req.path;
    if (
      p.startsWith('/api') ||
      p.startsWith('/health') ||
      p.includes('.') // archivos como .svg, .png, .css, .js, .txt, .xml
    ) {
      return;
    }

    // 3. Ignorar llamadas de robots conocidos (Googlebot, Bingbot, etc.)
    const ua = req.headers['user-agent'] || '';
    if (/bot|crawl|spider|slurp|facebookexternalhit/i.test(ua)) {
      return;
    }

    // Fecha en Colombia (YYYY-MM-DD)
    const now = new Date();
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);

    // 4. Incrementar Total y Día
    stats.totalViews = (stats.totalViews || 0) + 1;
    stats.byDate = stats.byDate || {};
    stats.byDate[today] = (stats.byDate[today] || 0) + 1;

    // 5. Detectar Dispositivo
    const isMobile = /mobile|android|iphone|ipad|tablet/i.test(ua);
    stats.devices = stats.devices || { mobile: 0, desktop: 0 };
    if (isMobile) {
      stats.devices.mobile = (stats.devices.mobile || 0) + 1;
    } else {
      stats.devices.desktop = (stats.devices.desktop || 0) + 1;
    }

    // 6. Detectar Fuente (Referrer o parámetro ?ref=)
    const refParam = (req.query.ref || '').toLowerCase();
    const referrer = (req.headers.referer || req.headers.referrer || '').toLowerCase();
    let source = 'Directo / Otro';

    if (refParam.includes('whatsapp') || referrer.includes('whatsapp') || referrer.includes('wa.me')) {
      source = 'WhatsApp';
    } else if (refParam.includes('telegram') || referrer.includes('t.me') || referrer.includes('telegram')) {
      source = 'Telegram';
    } else if (refParam.includes('facebook') || referrer.includes('facebook') || referrer.includes('fb.')) {
      source = 'Facebook';
    } else if (refParam.includes('instagram') || referrer.includes('instagram')) {
      source = 'Instagram';
    } else if (referrer.includes('google')) {
      source = 'Google';
    } else if (referrer.includes('twitter') || referrer.includes('t.co') || referrer.includes('x.com')) {
      source = 'Twitter / X';
    }

    stats.sources = stats.sources || {};
    stats.sources[source] = (stats.sources[source] || 0) + 1;

    // Guardar a disco
    saveStatsDebounced();

  } catch (err) {
    console.error('[Stats] Error registrando visita:', err.message);
  }
}

export function getStats() {
  return stats;
}

export function resetStats() {
  stats = {
    totalViews: 0,
    byDate: {},
    sources: {},
    devices: {
      mobile: 0,
      desktop: 0
    }
  };
  saveStatsDebounced();
  return stats;
}
