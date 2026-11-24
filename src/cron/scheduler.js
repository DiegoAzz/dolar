import cron from 'node-cron';
import { fetchTRMData } from '../services/trmService.js';
import { notifyMorningTRM, notifyTomorrowTRM } from '../services/telegramService.js';

let lastNotifiedTomorrowDate = null;
let lastNotifiedMorningDate = null;

export function initScheduler() {
  console.log('[Scheduler] Inicializando tareas programadas (Zona horaria: America/Bogota)...');

  // 1. Refresco general cada 15 minutos
  cron.schedule('*/15 * * * *', async () => {
    try {
      await fetchTRMData(true);
    } catch (e) {
      console.error('[Scheduler] Error en refresco periódico:', e.message);
    }
  });

  // 2. Monitoreo intensivo de la TRM de mañana entre las 4:15 PM y 5:45 PM (Lunes a Viernes)
  // Cada 3 minutos verifica si la Superfinanciera ya publicó la tasa de mañana
  cron.schedule('*/3 16-17 * * 1-5', async () => {
    try {
      const data = await fetchTRMData(true);
      if (data && data.manana && data.manana.publicada) {
        const mananaFecha = data.manana.fechaCorta;
        if (lastNotifiedTomorrowDate !== mananaFecha) {
          console.log(`[Scheduler] ¡Nueva TRM para mañana detectada (${mananaFecha})! Disparando alerta Telegram...`);
          const sent = await notifyTomorrowTRM(data);
          if (sent) {
            lastNotifiedTomorrowDate = mananaFecha;
          }
        }
      }
    } catch (e) {
      console.error('[Scheduler] Error en chequeo de TRM de mañana:', e.message);
    }
  }, {
    timezone: 'America/Bogota'
  });

  // 3. Notificación matutina a las 8:00 AM (Lunes a Viernes)
  cron.schedule('0 8 * * 1-5', async () => {
    try {
      const data = await fetchTRMData(true);
      const hoyFecha = data.hoy.fechaCorta;
      if (lastNotifiedMorningDate !== hoyFecha) {
        console.log(`[Scheduler] 8:00 AM - Enviando reporte de apertura TRM (${hoyFecha})...`);
        const sent = await notifyMorningTRM(data);
        if (sent) {
          lastNotifiedMorningDate = hoyFecha;
        }
      }
    } catch (e) {
      console.error('[Scheduler] Error en notificación matutina:', e.message);
    }
  }, {
    timezone: 'America/Bogota'
  });

  console.log('[Scheduler] Cron activo: Refresco cada 15 min, Monitoreo 4:15-5:45 PM y Reporte 8:00 AM.');
}
