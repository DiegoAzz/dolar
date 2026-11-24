document.addEventListener('DOMContentLoaded', () => {
  const config = window.APP_CONFIG || { trmHoy: 3505.92, historico: [] };
  const trmRate = config.trmHoy;

  // ==========================================
  // GENERADOR Y COMPARTIR IMAGEN PARA ESTADOS
  // ==========================================
  const btnShareStory = document.getElementById('btnShareStory');
  if (btnShareStory) {
    btnShareStory.addEventListener('click', async () => {
      const origText = btnShareStory.innerHTML;
      btnShareStory.innerHTML = `<span>⏳ Generando imagen...</span>`;
      btnShareStory.disabled = true;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d');

        // 1. Fondo Degradado Oscuro Fintech
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
        bgGrad.addColorStop(0, '#050811');
        bgGrad.addColorStop(0.3, '#0F172A');
        bgGrad.addColorStop(0.7, '#0B1324');
        bgGrad.addColorStop(1, '#03060B');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1080, 1920);

        // 2. Luces Neón de Ambiente
        const rad1 = ctx.createRadialGradient(200, 400, 10, 200, 400, 300);
        rad1.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
        rad1.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = rad1;
        ctx.fillRect(0, 0, 1080, 1920);

        const rad2 = ctx.createRadialGradient(900, 700, 10, 900, 700, 350);
        rad2.addColorStop(0, 'rgba(14, 165, 233, 0.18)');
        rad2.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = rad2;
        ctx.fillRect(0, 0, 1080, 1920);

        // 3. Bandera de Colombia en el borde superior
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(0, 0, 1080, 14);
        ctx.fillStyle = '#2563EB';
        ctx.fillRect(0, 14, 1080, 9);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(0, 23, 1080, 9);

        // 4. Marca Cabecera
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        roundRect(ctx, 480, 140, 120, 120, 32, true, false);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 4;
        roundRect(ctx, 480, 140, 120, 120, 32, false, true);

        ctx.fillStyle = '#34D399';
        ctx.font = '900 70px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('$', 540, 225);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 44px system-ui, sans-serif';
        ctx.letterSpacing = '4px';
        ctx.fillText('DÓLAR APPZPLAY', 540, 320);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '700 24px system-ui, sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText('COTIZACIÓN OFICIAL EN VIVO • COLOMBIA', 540, 365);

        // 5. Tarjeta Principal (Hero TRM)
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 24;

        const cardGrad = ctx.createLinearGradient(80, 440, 1000, 960);
        cardGrad.addColorStop(0, '#1E293B');
        cardGrad.addColorStop(1, '#0F172A');
        ctx.fillStyle = cardGrad;
        roundRect(ctx, 80, 440, 920, 520, 48, true, false);
        ctx.restore();

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        roundRect(ctx, 80, 440, 920, 520, 48, false, true);

        // Badge Estado
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        roundRect(ctx, 140, 500, 380, 48, 24, true, false);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        roundRect(ctx, 140, 500, 380, 48, 24, false, true);

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(170, 524, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#34D399';
        ctx.font = '800 20px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('TRM OFICIAL VIGENTE HOY', 195, 532);

        // Texto 1 USD
        ctx.fillStyle = '#94A3B8';
        ctx.font = '800 32px system-ui, sans-serif';
        ctx.fillText(`1 Dólar Estadounidense (USD) =`, 140, 615);

        // Cifra Gigante
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 96px system-ui, monospace';
        ctx.fillText(config.trmFormatted, 140, 720);

        // Píldora Variación
        const isUp = config.trmTrend === 'subio';
        ctx.fillStyle = isUp ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
        roundRect(ctx, 140, 765, 460, 60, 20, true, false);
        ctx.strokeStyle = isUp ? '#EF4444' : '#10B981';
        ctx.lineWidth = 2;
        roundRect(ctx, 140, 765, 460, 60, 20, false, true);

        ctx.fillStyle = isUp ? '#F87171' : '#34D399';
        ctx.font = '900 28px system-ui, sans-serif';
        ctx.fillText(`${isUp ? '▲' : '▼'} ${isUp ? 'Subió' : 'Bajó'} ${config.trmDiff} COP (${config.trmPct}%)`, 165, 806);

        ctx.fillStyle = '#64748B';
        ctx.font = '600 22px system-ui, sans-serif';
        ctx.fillText('🏛️ Certificado por la Superintendencia Financiera', 140, 890);

        // 6. Tarjeta Secundaria: TRM Mañana a las 4:30 PM
        ctx.fillStyle = '#0C192E';
        roundRect(ctx, 80, 1000, 920, 260, 40, true, false);
        ctx.strokeStyle = '#1E3A8A';
        ctx.lineWidth = 3;
        roundRect(ctx, 80, 1000, 920, 260, 40, false, true);

        ctx.fillStyle = '#38BDF8';
        ctx.font = '900 32px system-ui, sans-serif';
        ctx.fillText('🚨 ¿En cuánto quedará el dólar MAÑANA?', 140, 1070);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '600 24px system-ui, sans-serif';
        ctx.fillText('La tasa oficial de mañana se calcula a las 4:30 PM.', 140, 1120);

        ctx.fillStyle = '#0284C7';
        roundRect(ctx, 140, 1150, 400, 55, 18, true, false);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📲 Ver primicia a las 4:30 PM', 340, 1186);

        // 7. Tres Columnas Divisas
        ctx.textAlign = 'left';
        // Euro
        ctx.fillStyle = '#0F172A';
        roundRect(ctx, 80, 1300, 280, 160, 28, true, false);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        roundRect(ctx, 80, 1300, 280, 160, 28, false, true);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '800 20px system-ui, sans-serif';
        ctx.fillText('EURO OFICIAL', 115, 1350);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 34px system-ui, sans-serif';
        ctx.fillText(config.euro, 115, 1405);
        ctx.fillStyle = '#64748B';
        ctx.font = '600 16px system-ui, sans-serif';
        ctx.fillText('COP / EUR', 115, 1435);

        // USDT
        ctx.fillStyle = '#0F172A';
        roundRect(ctx, 400, 1300, 280, 160, 28, true, false);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        roundRect(ctx, 400, 1300, 280, 160, 28, false, true);
        ctx.fillStyle = '#34D399';
        ctx.font = '800 20px system-ui, sans-serif';
        ctx.fillText('DÓLAR USDT', 435, 1350);
        ctx.fillStyle = '#34D399';
        ctx.font = '900 34px system-ui, sans-serif';
        ctx.fillText(config.usdt, 435, 1405);
        ctx.fillStyle = '#64748B';
        ctx.font = '600 16px system-ui, sans-serif';
        ctx.fillText('Cripto / Paridad', 435, 1435);

        // Casas
        ctx.fillStyle = '#0F172A';
        roundRect(ctx, 720, 1300, 280, 160, 28, true, false);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        roundRect(ctx, 720, 1300, 280, 160, 28, false, true);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '800 20px system-ui, sans-serif';
        ctx.fillText('CASAS CAMBIO', 755, 1350);
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '800 22px system-ui, sans-serif';
        ctx.fillText(`C: ${config.casasCompra}`, 755, 1395);
        ctx.fillText(`V: ${config.casasVenta}`, 755, 1430);

        // 8. Botón CTA / Enlace
        const btnGrad = ctx.createLinearGradient(140, 1540, 940, 1540);
        btnGrad.addColorStop(0, '#34D399');
        btnGrad.addColorStop(1, '#10B981');
        ctx.fillStyle = btnGrad;
        roundRect(ctx, 140, 1540, 800, 120, 60, true, false);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 34px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🧮 TOCA EL ENLACE PARA CALCULAR', 540, 1612);

        // Dominio
        ctx.fillStyle = '#38BDF8';
        ctx.font = '900 42px system-ui, monospace';
        ctx.letterSpacing = '3px';
        ctx.fillText('dolar.appzplay.online', 540, 1720);

        // Exportar a Blob PNG
        canvas.toBlob(async (blob) => {
          if (!blob) throw new Error('No se pudo generar la imagen');
          const file = new File([blob], `dolar-colombia-hoy.png`, { type: 'image/png' });

          // Si el navegador soporta compartir archivos nativos (Android / iOS)
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: 'Dólar Hoy en Colombia',
                text: `💵 Dólar Oficial Hoy: ${config.trmFormatted} COP. Míralo en vivo: https://dolar.appzplay.online`
              });
            } catch (shareErr) {
              if (shareErr.name !== 'AbortError') {
                downloadFallback(blob);
              }
            }
          } else {
            // Descarga directa en Desktop o navegadores sin share API de archivos
            downloadFallback(blob);
          }
          btnShareStory.innerHTML = origText;
          btnShareStory.disabled = false;
        }, 'image/png');

      } catch (err) {
        console.error('Error generando tarjeta:', err);
        alert('Hubo un problema generando la imagen. Por favor intenta de nuevo.');
        btnShareStory.innerHTML = origText;
        btnShareStory.disabled = false;
      }
    });
  }

  function downloadFallback(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dolar-appzplay-estado.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('✅ ¡Tarjeta generada y descargada! Ya puedes subirla directamente a tu Estado de WhatsApp.');
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  const inputFrom = document.getElementById('inputFrom');
  const inputTo = document.getElementById('inputTo');
  const labelFrom = document.getElementById('labelFrom');
  const labelTo = document.getElementById('labelTo');
  const symFrom = document.getElementById('symFrom');
  const symTo = document.getElementById('symTo');
  const btnSwitch = document.getElementById('btnSwitch');
  const quickButtons = document.querySelectorAll('.btnQuick');

  let mode = 'USD_TO_COP'; // 'USD_TO_COP' o 'COP_TO_USD'

  function formatNumberCO(num, decimals = 2) {
    if (isNaN(num)) return '0';
    return Number(num).toLocaleString('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function calculate() {
    if (!inputFrom || !inputTo) return;
    const rawVal = parseFloat(inputFrom.value) || 0;

    if (mode === 'USD_TO_COP') {
      const res = rawVal * trmRate;
      inputTo.value = formatNumberCO(res, 2);
    } else {
      const res = trmRate > 0 ? (rawVal / trmRate) : 0;
      inputTo.value = formatNumberCO(res, 2);
    }
  }

  if (inputFrom) {
    inputFrom.addEventListener('input', calculate);
  }

  if (btnSwitch) {
    btnSwitch.addEventListener('click', () => {
      if (mode === 'USD_TO_COP') {
        mode = 'COP_TO_USD';
        labelFrom.textContent = 'Pesos Colombianos (COP)';
        labelTo.textContent = 'Dólares Estadounidenses (USD)';
        inputFrom.value = 500000;
      } else {
        mode = 'USD_TO_COP';
        labelFrom.textContent = 'Dólares Estadounidenses (USD)';
        labelTo.textContent = 'Pesos Colombianos (COP)';
        inputFrom.value = 100;
      }
      calculate();
    });
  }

  quickButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const amt = btn.getAttribute('data-amount');
      if (mode !== 'USD_TO_COP') {
        mode = 'USD_TO_COP';
        labelFrom.textContent = 'Dólares Estadounidenses (USD)';
        labelTo.textContent = 'Pesos Colombianos (COP)';
      }
      inputFrom.value = amt;
      calculate();
    });
  });

  // Ejecutar cálculo inicial
  calculate();

  // ==========================================
  // GRÁFICA INTERACTIVA CON CHART.JS
  // ==========================================
  const canvas = document.getElementById('chartTRM');
  if (canvas && config.historico && config.historico.length > 0) {
    const ctx = canvas.getContext('2d');

    const labels = config.historico.map(i => i.fecha);
    const dataVals = config.historico.map(i => i.valor);

    // Gradiente esmeralda
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'TRM Oficial (COP)',
          data: dataVals,
          borderColor: '#10b981',
          borderWidth: 2.5,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#0f172a',
          pointBorderWidth: 1.5,
          pointRadius: 3,
          pointHoverRadius: 6,
          fill: true,
          backgroundColor: gradient,
          tension: 0.25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#94a3b8',
            bodyColor: '#ffffff',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return '$ ' + Number(context.parsed.y).toLocaleString('es-CO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) + ' COP';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(51, 65, 85, 0.25)' },
            ticks: {
              color: '#64748b',
              font: { size: 10 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 7
            }
          },
          y: {
            grid: { color: 'rgba(51, 65, 85, 0.25)' },
            ticks: {
              color: '#64748b',
              font: { size: 10 },
              callback: function(val) {
                return '$' + Number(val).toLocaleString('es-CO');
              }
            }
          }
        }
      }
    });
  }
});
