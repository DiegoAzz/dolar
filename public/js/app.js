document.addEventListener('DOMContentLoaded', () => {
  const config = window.APP_CONFIG || { trmHoy: 3505.92, historico: [] };
  const trmRate = config.trmHoy;

  // ==========================================
  // CALCULADORA INTERACTIVA
  // ==========================================
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
