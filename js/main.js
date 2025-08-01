document.addEventListener("DOMContentLoaded", function () {
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('navbar-menu').classList.toggle('active');
  });

  // Variable para almacenar la instancia del gráfico
  let dollarChartInstance;

  // ========== GRÁFICO DÓLAR ========== //
  async function getDollarHistory(daysAgo = 7) { // Por defecto, muestra los últimos 7 días
    const API_KEY = 'zs4w8QJ3BQTMd7UDsdfR6xmvzVJ3s86c';

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysAgo); // Ajusta la fecha de inicio según los días

    const format = date => date.toISOString().split('T')[0];
    const start = format(startDate);
    const end = format(endDate);

    const url = `https://api.apilayer.com/exchangerates_data/timeseries?start_date=${start}&end_date=${end}&base=USD&symbols=PEN`;

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': API_KEY
        }
      });

      const data = await res.json();

      if (!data.success || !data.rates) {
        console.error("❌ La API no devolvió datos válidos:", data);
        // Mostrar un mensaje al usuario si no hay datos
        const ctx = document.getElementById('dollarChart').getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Limpiar el canvas
        ctx.font = "16px Urbanist";
        ctx.fillStyle = "#0a0a23";
        ctx.textAlign = "center";
        ctx.fillText("No hay datos disponibles para este período.", ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
      }

      const labels = Object.keys(data.rates);
      const values = labels.map(date => data.rates[date].PEN);

      // Si ya existe una instancia del gráfico, la destruimos para crear una nueva
      if (dollarChartInstance) {
        dollarChartInstance.destroy();
      }

      // Colores basados en tu colorimetría:
      // #0a0a23 (azul oscuro/negro) - para texto, ejes
      // #a8a8c7 (gris azulado/morado claro) - para la línea del gráfico
      const chartLineColor = '#a8a8c7'; // Usando tu color de acento
      const chartFillColor = 'rgba(168, 168, 199, 0.2)'; // Versión más transparente del color de acento

      dollarChartInstance = new Chart(document.getElementById('dollarChart'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'USD → PEN',
            data: values,
            borderColor: chartLineColor,
            backgroundColor: chartFillColor,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: chartLineColor,
            pointBorderColor: '#ffffff', // Borde blanco para los puntos
            pointHoverRadius: 6,
            pointHoverBackgroundColor: chartLineColor,
            pointHoverBorderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true, // Permite que el gráfico se ajuste mejor al contenedor
          plugins: {
            title: {
              display: true,
              text: `Evolución del dólar (últimos ${daysAgo} días)`,
              color: '#0a0a23',
              font: {
                size: 18,
                weight: 'bold',
                family: 'Urbanist, sans-serif'
              }
            },
            legend: {
              display: false,
              labels: {
                color: '#0a0a23',
                font: {
                    family: 'Urbanist, sans-serif'
                }
              }
            },
            tooltip: { // Estilos del tooltip
                backgroundColor: '#0a0a23',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                titleFont: { family: 'Urbanist, sans-serif' },
                bodyFont: { family: 'Urbanist, sans-serif' },
                borderColor: '#a8a8c7',
                borderWidth: 1
            }
          },
          scales: {
            x: {
              ticks: { 
                color: '#0a0a23',
                font: { family: 'Urbanist, sans-serif' }
              },
              grid: {
                  borderColor: '#a8a8c7', // Color de la línea de la cuadrícula
                  color: 'rgba(0, 0, 0, 0.1)' // Cuadrícula más clara
              }
            },
            y: {
              ticks: { 
                color: '#0a0a23',
                font: { family: 'Urbanist, sans-serif' }
              },
              grid: {
                  borderColor: '#a8a8c7', // Color de la línea de la cuadrícula
                  color: 'rgba(0, 0, 0, 0.1)' // Cuadrícula más clara
              }
            }
          }
        }
      });

    } catch (error) {
      console.error("❌ Error al conectar con la API:", error);
      // Mostrar un mensaje de error al usuario
      const ctx = document.getElementById('dollarChart').getContext('2d');
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Limpiar el canvas
      ctx.font = "16px Urbanist";
      ctx.fillStyle = "#ff0000"; // Color rojo para errores
      ctx.textAlign = "center";
      ctx.fillText("Error al cargar los datos del dólar. Intenta de nuevo más tarde.", ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
  }

  // Cargar el gráfico inicial (7 días)
  getDollarHistory();

  // Event Listeners para los botones de filtro
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remover la clase 'active' de todos los botones
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Añadir la clase 'active' al botón clickeado
      this.classList.add('active');

      const days = parseInt(this.dataset.days);
      getDollarHistory(days); // Llama a la función con el número de días
    });
  });
});