import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchTRMData } from './services/trmService.js';
import { fetchExtraRates } from './services/extraRatesService.js';
import { initScheduler, checkAndSendTomorrowAlert, checkAndSendMorningAlert } from './cron/scheduler.js';
import { recordVisit, getStats, resetStats } from './services/statsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || 'https://dolar.appzplay.online';
const ADSENSE_ID = process.env.ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX';
const TELEGRAM_URL = process.env.TELEGRAM_CHANNEL_URL || 'https://t.me/+hLULrDoazSwzNWNh';

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos con caché
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: '1h'
}));

// Middleware de analítica interna en tiempo real (ignora estáticos y admin)
app.use((req, res, next) => {
  recordVisit(req);
  next();
});

// Endpoint de Salud para Coolify / Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// PANEL DE TRÁFICO EN VIVO
app.get('/stats', (req, res) => {
  res.render('stats');
});

// API DE ESTADÍSTICAS
app.get('/api/stats', (req, res) => {
  res.json(getStats());
});

app.post('/api/stats/reset', (req, res) => {
  res.json(resetStats());
});

// DISPARADORES MANUALES DE TELEGRAM (Para pruebas inmediatas)
app.get('/api/telegram/trigger-tomorrow', async (req, res) => {
  try {
    const success = await checkAndSendTomorrowAlert(true);
    res.json({ success, message: success ? 'Alerta de mañana enviada a Telegram' : 'No se pudo enviar o no está publicada la TRM de mañana' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/telegram/trigger-morning', async (req, res) => {
  try {
    const success = await checkAndSendMorningAlert(true);
    res.json({ success, message: success ? 'Reporte matutino enviado a Telegram' : 'No se pudo enviar el reporte matutino' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Endpoint API JSON de la TRM
app.get('/api/trm', async (req, res) => {
  try {
    const data = await fetchTRMData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint API JSON de divisas secundarias
app.get('/api/extras', async (req, res) => {
  try {
    const trmData = await fetchTRMData();
    const extras = await fetchExtraRates(trmData.hoy.valor);
    res.json(extras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PÁGINA PRINCIPAL
app.get('/', async (req, res) => {
  try {
    const trmData = await fetchTRMData();
    const extras = await fetchExtraRates(trmData.hoy.valor);

    const title = `Dólar Hoy en Colombia: ${trmData.hoy.valorFormateado} COP | TRM Oficial y Calculadora`;
    const description = `Consulta la TRM oficial del Dólar hoy en Colombia (${trmData.hoy.valorFormateado} COP). Monitoreo en vivo, TRM de mañana a las 4:30 PM, convertidor y gráfica histórica.`;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      "name": "Dólar TRM Oficial Colombia",
      "description": description,
      "provider": {
        "@type": "GovernmentOrganization",
        "name": "Superintendencia Financiera de Colombia"
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "COP",
        "price": trmData.hoy.valor.toString()
      }
    };

    res.render('index', {
      title,
      description,
      siteUrl: SITE_URL,
      canonicalPath: '',
      adsenseId: ADSENSE_ID,
      telegramUrl: TELEGRAM_URL,
      trm: trmData,
      extras,
      structuredData
    });
  } catch (error) {
    console.error('Error renderizando index:', error);
    res.status(500).send('Error interno cargando la cotización.');
  }
});

// PÁGINA HISTÓRICO
app.get('/historico', async (req, res) => {
  try {
    const trmData = await fetchTRMData();

    const title = `Histórico Dólar TRM Colombia (Últimos 30 días) | Dólar AppzPlay`;
    const description = `Histórico oficial de la Tasa Representativa del Mercado (TRM) en Colombia durante el último mes. Registro diario, variaciones y estadísticas.`;

    res.render('historico', {
      title,
      description,
      siteUrl: SITE_URL,
      canonicalPath: '/historico',
      adsenseId: ADSENSE_ID,
      telegramUrl: TELEGRAM_URL,
      trm: trmData
    });
  } catch (error) {
    console.error('Error renderizando historico:', error);
    res.status(500).send('Error interno.');
  }
});

// PÁGINAS DE GUÍAS FINANCIERAS (SEO & ADSENSE DEPTH)
app.get('/guias', (req, res) => {
  res.render('guias', {
    title: 'Guías del Dólar y Divisas en Colombia | Dólar AppzPlay',
    description: 'Aprende a proteger tu dinero frente a la TRM, cómo pagar compras internacionales con tarjeta y recibir remesas con la menor comisión.',
    siteUrl: SITE_URL,
    canonicalPath: '/guias',
    adsenseId: ADSENSE_ID,
    telegramUrl: TELEGRAM_URL
  });
});

app.get('/guias/compras-tarjeta-dolares-colombia', (req, res) => {
  res.render('guia-tarjetas', {
    title: 'Cómo Pagar Compras en Dólares con Tarjeta en Colombia | Dólar AppzPlay',
    description: 'Guía práctica para evitar el sobreprecio de conversión de divisas en Amazon y PayPal, y comisiones de bancos colombianos.',
    siteUrl: SITE_URL,
    canonicalPath: '/guias/compras-tarjeta-dolares-colombia',
    adsenseId: ADSENSE_ID,
    telegramUrl: TELEGRAM_URL
  });
});

app.get('/guias/mejor-momento-comprar-dolares-colombia', (req, res) => {
  res.render('guia-comprar-dolares', {
    title: 'Cuándo y Dónde Comprar Dólares en Colombia | Dólar AppzPlay',
    description: 'Horarios de Set-FX, por qué la TRM de las 4:30 PM te da ventaja y comparativa de casas de cambio físicas vs plataformas digitales.',
    siteUrl: SITE_URL,
    canonicalPath: '/guias/mejor-momento-comprar-dolares-colombia',
    adsenseId: ADSENSE_ID,
    telegramUrl: TELEGRAM_URL
  });
});

app.get('/guias/remesas-recibir-dolares-colombia', (req, res) => {
  res.render('guia-remesas', {
    title: 'Cómo Recibir Remesas en Dólares en Colombia con la Mejor Tasa | Dólar AppzPlay',
    description: 'Comparativa de Western Union, Bancolombia, Daviplata y cuentas fintech en dólares para cobrar giros con el menor spread.',
    siteUrl: SITE_URL,
    canonicalPath: '/guias/remesas-recibir-dolares-colombia',
    adsenseId: ADSENSE_ID,
    telegramUrl: TELEGRAM_URL
  });
});

// PÁGINA POLÍTICA DE PRIVACIDAD
app.get('/privacidad', (req, res) => {
  res.render('privacidad', {
    title: 'Política de Privacidad | Dólar AppzPlay',
    description: 'Política de privacidad, uso de cookies de terceros y protección de datos conforme a la legislación colombiana y Google AdSense.',
    siteUrl: SITE_URL,
    canonicalPath: '/privacidad',
    adsenseId: ADSENSE_ID,
    telegramUrl: TELEGRAM_URL
  });
});

// PÁGINA TÉRMINOS Y CONDICIONES
app.get('/terminos', (req, res) => {
  res.render('terminos', {
    title: 'Términos de Uso y Descargo de Responsabilidad | Dólar AppzPlay',
    description: 'Términos de servicio, descargo de responsabilidad financiera y condiciones de uso del portal Dólar AppzPlay.',
    siteUrl: SITE_URL,
    canonicalPath: '/terminos',
    adsenseId: ADSENSE_ID,
    telegramUrl: TELEGRAM_URL
  });
});

// PÁGINA CONTACTO
app.get('/contacto', (req, res) => {
  res.render('contacto', {
    title: 'Contacto y Sobre Nosotros | Dólar AppzPlay',
    description: 'Información institucional sobre el proyecto Dólar AppzPlay y canales de contacto oficial.',
    siteUrl: SITE_URL,
    canonicalPath: '/contacto',
    adsenseId: ADSENSE_ID,
    telegramUrl: TELEGRAM_URL
  });
});

// Iniciar servidor y Cron
app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`🚀 Dólar AppzPlay ejecutándose en http://localhost:${PORT}`);
  console.log(`🌐 Dominio configurado: ${SITE_URL}`);
  console.log(`=========================================`);

  // Pre-calentar caché con la TRM oficial
  try {
    await fetchTRMData();
    console.log('✅ TRM Oficial precargada en memoria.');
  } catch (e) {
    console.warn('⚠️ No se pudo precargar TRM:', e.message);
  }

  // Arrancar scheduler de Telegram y refrescos
  initScheduler();
});
