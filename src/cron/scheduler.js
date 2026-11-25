import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchTRMData } from '../services/trmService.js';
import { notifyMorningTRM, notifyTomorrowTRM } from '../services/telegramService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HISTORY_FILE = path.join(__dirname, '../../data/telegram_history.json');

function loadNotificationHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('[Scheduler] Error leyendo historial de notificaciones:', e.message);
  }
  return { lastTomorrowDate: null, lastMorningDate: null };
}

function saveNotificationHistory(history) {
  try {
    const dir = path.dirname(HISTORY_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (e) {
    console.error('[Scheduler] Error guardando historial de notificaciones:', e.message);
  }
}

export async function checkAndSendTomorrowAlert(force = false) {
  try {
    const data = await fetchTRMData(true);
    if (data && data.manana && data.manana.publicada) {
      const history = loadNotificationHistory();
      const mananaFecha = data.manana.fechaCorta;

      if (force || history.lastTomorrowDate !== mananaFecha) {
        console.log(`[Scheduler] 🚨 Publicando alerta TRM de mañana (${mananaFecha}) en Telegram...`);
        const sent = await notifyTomorrowTRM(data);
        if (sent) {
          history.lastTomorrowDate = mananaFecha;
          saveNotificationHistory(history);
          console.log(`[Scheduler] ✅ Alerta de mañana enviada con éxito para vigencia: ${mananaFecha}`);
          return true;
        }
      }
    }
    return false;
  } catch (e) {
    console.error('[Scheduler] Error verificando TRM de mañana:', e.message);
    return false;
  }
}

export async function checkAndSendMorningAlert(force = false) {
  try {
    const data = await fetchTRMData(true);
    if (data && data.hoy) {
      const history = loadNotificationHistory();
      const hoyFecha = data.hoy.fechaCorta;

      if (force || history.lastMorningDate !== hoyFecha) {
        console.log(`[Scheduler] ☀️ Publicando reporte matutino TRM (${hoyFecha}) en Telegram...`);
        const sent = await notifyMorningTRM(data);
        if (sent) {
          history.lastMorningDate = hoyFecha;
          saveNotificationHistory(history);
          console.log(`[Scheduler] ✅ Reporte matutino enviado con éxito para fecha: ${hoyFecha}`);
          return true;
        }
      }
    }
    return false;
  } catch (e) {
    console.error('[Scheduler] Error enviando reporte matutino:', e.message);
    return false;
  }
}

export function initScheduler() {
  console.log('[Scheduler] Inicializando tareas programadas automáticas...');

  // 1. Refresco continuo cada 10 minutos (y verificación de TRM de mañana)
  // De esta forma, sin importar a qué hora exacta la Superfinanciera publique la tasa, se detecta de inmediato
  cron.schedule('*/10 * * * *', async () => {
    try {
      await fetchTRMData(true);
      await checkAndSendTomorrowAlert();
    } catch (e) {
      console.error('[Scheduler] Error en refresco periódico:', e.message);
    }
  });

  // 2. Monitoreo intensivo cada 2 minutos entre las 4:00 PM y las 6:30 PM (Lunes a Viernes, Hora Colombia)
  cron.schedule('*/2 16-18 * * 1-5', async () => {
    await checkAndSendTomorrowAlert();
  }, {
    timezone: 'America/Bogota'
  });

  // 3. Notificación matutina a las 8:00 AM (Lunes a Viernes, Hora Colombia)
  cron.schedule('0 8 * * 1-5', async () => {
    await checkAndSendMorningAlert();
  }, {
    timezone: 'America/Bogota'
  });

  // 4. Verificación de seguridad al arrancar el contenedor:
  // Si al iniciar ya está publicada la TRM de mañana y no se había notificado, la envía
  setTimeout(async () => {
    console.log('[Scheduler] Verificación inicial de arranque...');
    await checkAndSendTomorrowAlert();
  }, 10000);

  console.log('[Scheduler] Cron activo: Refresco y alertas automáticas aseguradas.');
}
