import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE = path.join(__dirname, '../../data/cache_trm.json');

// Memoria en caliente
let memoryCache = null;
let lastFetchTime = null;

export function formatCOP(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '$ 0,00';
  return '$ ' + Number(value).toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatDateCO(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function getTodayCOString() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now); // "YYYY-MM-DD"
}

export async function fetchTRMData(forceRefresh = false) {
  const now = Date.now();
  // Cache en memoria por 5 minutos si no es forzado
  if (!forceRefresh && memoryCache && lastFetchTime && (now - lastFetchTime < 5 * 60 * 1000)) {
    return memoryCache;
  }

  try {
    const url = 'https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=35';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Error en API datos.gov.co: HTTP ${res.status}`);
    }

    const rawData = await res.json();
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Respuesta vacía de datos.gov.co');
    }

    // Normalizar datos
    const parsedItems = rawData.map(item => ({
      valor: parseFloat(item.valor),
      unidad: item.unidad || 'COP',
      vigenciadesde: item.vigenciadesde,
      vigenciahasta: item.vigenciahasta,
      fechaCorta: item.vigenciadesde.substring(0, 10)
    }));

    const todayStr = getTodayCOString();

    let hoyIndex = -1;
    let mananaIndex = -1;

    // Buscar si el primer elemento es para mañana o fecha futura
    if (parsedItems[0].fechaCorta > todayStr) {
      mananaIndex = 0;
      hoyIndex = 1;
    } else {
      hoyIndex = 0;
      mananaIndex = -1; // Todavía no publicada
    }

    const hoy = parsedItems[hoyIndex] || parsedItems[0];
    const ayer = parsedItems[hoyIndex + 1] || hoy;
    const manana = mananaIndex >= 0 ? parsedItems[mananaIndex] : null;

    // Variación Hoy vs Ayer
    const diffHoyAyer = hoy.valor - ayer.valor;
    const pctHoyAyer = ayer.valor > 0 ? (diffHoyAyer / ayer.valor) * 100 : 0;
    const tendenciaHoy = diffHoyAyer > 0.05 ? 'subio' : (diffHoyAyer < -0.05 ? 'bajo' : 'igual');

    // Variación Mañana vs Hoy (si existe)
    let diffMananaHoy = 0;
    let pctMananaHoy = 0;
    let tendenciaManana = 'igual';

    if (manana) {
      diffMananaHoy = manana.valor - hoy.valor;
      pctMananaHoy = hoy.valor > 0 ? (diffMananaHoy / hoy.valor) * 100 : 0;
      tendenciaManana = diffMananaHoy > 0.05 ? 'subio' : (diffMananaHoy < -0.05 ? 'bajo' : 'igual');
    }

    // Estadísticas 30 días
    const slice30 = parsedItems.slice(hoyIndex, hoyIndex + 30);
    const valores30 = slice30.map(i => i.valor);
    const min30 = Math.min(...valores30);
    const max30 = Math.max(...valores30);
    const promedio30 = valores30.reduce((acc, curr) => acc + curr, 0) / valores30.length;

    // Gráfica cronológica (de más antiguo a más reciente)
    const historicoGrafica = slice30.slice().reverse().map(item => {
      const parts = item.fechaCorta.split('-'); // [YYYY, MM, DD]
      return {
        fecha: `${parts[2]}/${parts[1]}`,
        fechaCompleta: item.fechaCorta,
        valor: item.valor
      };
    });

    const result = {
      hoy: {
        valor: hoy.valor,
        valorFormateado: formatCOP(hoy.valor),
        vigenciaDesde: hoy.vigenciadesde,
        vigenciaHasta: hoy.vigenciahasta,
        fechaTexto: formatDateCO(hoy.vigenciadesde),
        fechaCorta: hoy.fechaCorta,
        diferencia: diffHoyAyer,
        diferenciaFormateada: (diffHoyAyer >= 0 ? '+' : '') + formatCOP(diffHoyAyer),
        porcentaje: pctHoyAyer.toFixed(2),
        tendencia: tendenciaHoy
      },
      manana: manana ? {
        publicada: true,
        valor: manana.valor,
        valorFormateado: formatCOP(manana.valor),
        vigenciaDesde: manana.vigenciadesde,
        fechaTexto: formatDateCO(manana.vigenciadesde),
        fechaCorta: manana.fechaCorta,
        diferencia: diffMananaHoy,
        diferenciaFormateada: (diffMananaHoy >= 0 ? '+' : '') + formatCOP(diffMananaHoy),
        porcentaje: pctMananaHoy.toFixed(2),
        tendencia: tendenciaManana
      } : {
        publicada: false,
        mensaje: 'La Superfinanciera publica la TRM de mañana a las ~4:30 PM de lunes a viernes.'
      },
      ayer: {
        valor: ayer.valor,
        valorFormateado: formatCOP(ayer.valor),
        fechaTexto: formatDateCO(ayer.vigenciadesde)
      },
      estadisticas: {
        minimo30: min30,
        minimo30Formateado: formatCOP(min30),
        maximo30: max30,
        maximo30Formateado: formatCOP(max30),
        promedio30: promedio30,
        promedio30Formateado: formatCOP(promedio30)
      },
      historicoGrafica,
      historicoTabla: slice30.map((item, idx, arr) => {
        const nextItem = arr[idx + 1];
        const diff = nextItem ? item.valor - nextItem.valor : 0;
        const pct = nextItem && nextItem.valor > 0 ? (diff / nextItem.valor) * 100 : 0;
        return {
          fecha: formatDateCO(item.vigenciadesde),
          fechaCorta: item.fechaCorta,
          valor: item.valor,
          valorFormateado: formatCOP(item.valor),
          diferencia: (diff >= 0 ? '+' : '') + formatCOP(diff),
          porcentaje: (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%',
          tendencia: diff > 0.05 ? 'subio' : (diff < -0.05 ? 'bajo' : 'igual')
        };
      }),
      ultimaActualizacion: new Date().toISOString(),
      origen: 'Superintendencia Financiera de Colombia (datos.gov.co)'
    };

    memoryCache = result;
    lastFetchTime = now;

    // Guardar en disco persistente
    try {
      const dataDir = path.dirname(CACHE_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(result, null, 2), 'utf8');
    } catch (e) {
      console.warn('No se pudo guardar cache en disco:', e.message);
    }

    return result;

  } catch (error) {
    console.error('Error al obtener TRM oficial:', error.message);

    // Intentar leer caché en disco
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        memoryCache = cached;
        return cached;
      } catch (e) {
        console.error('Error leyendo cache disco:', e.message);
      }
    }

    if (memoryCache) return memoryCache;

    // Contingencia extrema si todo falla
    return getFallbackData();
  }
}

function getFallbackData() {
  const fallbackVal = 3505.92;
  return {
    hoy: {
      valor: fallbackVal,
      valorFormateado: formatCOP(fallbackVal),
      vigenciaDesde: new Date().toISOString(),
      fechaTexto: 'Hoy',
      fechaCorta: getTodayCOString(),
      diferencia: 0,
      diferenciaFormateada: '$ 0,00',
      porcentaje: '0.00',
      tendencia: 'igual'
    },
    manana: {
      publicada: false,
      mensaje: 'La Superfinanciera publica la TRM de mañana a las ~4:30 PM.'
    },
    ayer: {
      valor: fallbackVal,
      valorFormateado: formatCOP(fallbackVal),
      fechaTexto: 'Ayer'
    },
    estadisticas: {
      minimo30: fallbackVal,
      minimo30Formateado: formatCOP(fallbackVal),
      maximo30: fallbackVal,
      maximo30Formateado: formatCOP(fallbackVal),
      promedio30: fallbackVal,
      promedio30Formateado: formatCOP(fallbackVal)
    },
    historicoGrafica: [],
    historicoTabla: [],
    ultimaActualizacion: new Date().toISOString(),
    origen: 'Datos en caché de respaldo'
  };
}
