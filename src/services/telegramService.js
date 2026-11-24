export async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!token || !channelId) {
    console.log('[Telegram] Bot no configurado (TELEGRAM_BOT_TOKEN o TELEGRAM_CHANNEL_ID vacíos). Mensaje omitido.');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });

    const resData = await response.json();
    if (!resData.ok) {
      console.error('[Telegram] Error al enviar mensaje:', resData.description);
      return false;
    }

    console.log('[Telegram] Mensaje publicado exitosamente en canal:', channelId);
    return true;
  } catch (error) {
    console.error('[Telegram] Fallo de conexión:', error.message);
    return false;
  }
}

export async function notifyMorningTRM(trmData) {
  const siteUrl = process.env.SITE_URL || 'https://dolar.appzplay.online';
  const flecha = trmData.hoy.tendencia === 'subio' ? '🔺' : (trmData.hoy.tendencia === 'bajo' ? '🔻' : '➖');
  const textoTendencia = trmData.hoy.tendencia === 'subio' ? 'Subió' : (trmData.hoy.tendencia === 'bajo' ? 'Bajó' : 'Se mantuvo');

  const mensaje = `
🇨🇴 <b>TRM DÓLAR COLOMBIA HOY</b>
📅 <i>${trmData.hoy.fechaTexto}</i>

💵 <b>1 USD = ${trmData.hoy.valorFormateado} COP</b>

📊 <b>Variación frente a ayer:</b>
${flecha} ${textoTendencia} <b>${trmData.hoy.diferenciaFormateada} COP</b> (${trmData.hoy.porcentaje}%)

📈 <b>Rango 30 días:</b>
• Mínimo: ${trmData.estadisticas.minimo30Formateado}
• Máximo: ${trmData.estadisticas.maximo30Formateado}

📱 <b>Calculadora y comparador en vivo:</b>
👉 <a href="${siteUrl}">${siteUrl}</a>
`.trim();

  return await sendTelegramMessage(mensaje);
}

export async function notifyTomorrowTRM(trmData) {
  if (!trmData.manana || !trmData.manana.publicada) return false;

  const siteUrl = process.env.SITE_URL || 'https://dolar.appzplay.online';
  const flecha = trmData.manana.tendencia === 'subio' ? '🔺' : (trmData.manana.tendencia === 'bajo' ? '🔻' : '➖');
  const accion = trmData.manana.tendencia === 'subio' ? 'SUBE' : (trmData.manana.tendencia === 'bajo' ? 'BAJA' : 'SE MANTIENE');

  const mensaje = `
🚨 <b>ÚLTIMA HORA: TRM OFICIAL CONFIRMADA PARA MAÑANA</b>
📅 <i>Vigencia: ${trmData.manana.fechaTexto}</i>

💵 <b>1 USD = ${trmData.manana.valorFormateado} COP</b>

📊 <b>${flecha} El dólar ${accion} ${trmData.manana.diferenciaFormateada} COP</b> (${trmData.manana.porcentaje}%) respecto a hoy.

🏛️ <i>Certificado oficial por la Superintendencia Financiera de Colombia.</i>

📱 <b>Calcula tu cambio en vivo aquí:</b>
👉 <a href="${siteUrl}">${siteUrl}</a>
`.trim();

  return await sendTelegramMessage(mensaje);
}
