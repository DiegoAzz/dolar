import { formatCOP } from './trmService.js';

let extraRatesCache = null;
let lastExtraFetch = null;

export async function fetchExtraRates(currentTRM = 3505.92) {
  const now = Date.now();
  if (extraRatesCache && lastExtraFetch && (now - lastExtraFetch < 10 * 60 * 1000)) {
    return extraRatesCache;
  }

  let eurRate = null;
  let usdtRate = null;

  // 1. Obtener Euro desde open.er-api.com
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { timeout: 5000 });
    if (res.ok) {
      const data = await res.json();
      if (data.rates && data.rates.COP && data.rates.EUR) {
        // 1 EUR en COP = COP / EUR
        eurRate = Math.round((data.rates.COP / data.rates.EUR) * 100) / 100;
      }
    }
  } catch (err) {
    console.warn('Error obteniendo Euro:', err.message);
  }

  // 2. Obtener USDT desde CoinGecko
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=cop', { timeout: 5000 });
    if (res.ok) {
      const data = await res.json();
      if (data.tether && data.tether.cop) {
        usdtRate = Math.round(data.tether.cop * 100) / 100;
      }
    }
  } catch (err) {
    console.warn('Error obteniendo USDT:', err.message);
  }

  // Fallbacks razonables basados en TRM si las APIs fallan
  if (!eurRate) eurRate = Math.round(currentTRM * 1.09 * 100) / 100;
  if (!usdtRate) usdtRate = Math.round(currentTRM * 1.025 * 100) / 100;

  // Estimado Casas de Cambio (Spread de referencia en Bogotá / Medellín)
  // Generalmente compran ~100 pesos por debajo y venden ~50 pesos por debajo de TRM
  const casasCambioCompra = Math.round((currentTRM - 110) / 10) * 10;
  const casasCambioVenta = Math.round((currentTRM - 40) / 10) * 10;

  // Salario Mínimo Legal Vigente Colombia 2026 (Referencia oficial estimada con auxilio de transporte)
  const smlv = 1423500; // Salario base de referencia
  const smlvUsd = Math.round((smlv / currentTRM) * 100) / 100;

  const result = {
    euro: {
      valor: eurRate,
      formateado: formatCOP(eurRate),
      unidad: 'COP / EUR',
      nombre: 'Euro Oficial'
    },
    usdt: {
      valor: usdtRate,
      formateado: formatCOP(usdtRate),
      unidad: 'COP / USDT',
      nombre: 'Dólar Cripto (USDT)'
    },
    casasCambio: {
      compra: casasCambioCompra,
      compraFormateado: formatCOP(casasCambioCompra, 0),
      venta: casasCambioVenta,
      ventaFormateado: formatCOP(casasCambioVenta, 0),
      nombre: 'Casas de Cambio (Promedio)'
    },
    salarioMinimo: {
      cop: smlv,
      copFormateado: formatCOP(smlv, 0),
      usd: smlvUsd,
      nombre: 'Salario Mínimo Colombia'
    }
  };

  extraRatesCache = result;
  lastExtraFetch = now;
  return result;
}
