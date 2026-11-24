import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchTRMData } from './services/trmService.js';
import { fetchExtraRates } from './services/extraRatesService.js';
import { initScheduler } from './cron/scheduler.js';

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

// Endpoint de Salud para Coolify / Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
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
