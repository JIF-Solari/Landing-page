document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('navbar-menu').classList.toggle('active');
    });

    let dollarChartInstance;

    async function getDollarHistory(daysAgo = 7) {
        const API_KEY = 'zs4w8QJ3BQTMd7UDsdfR6xmvzVJ3s86c';

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - daysAgo);

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
                const ctx = document.getElementById('dollarChart').getContext('2d');
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.font = "16px Urbanist";
                ctx.fillStyle = "#0a0a23";
                ctx.textAlign = "center";
                ctx.fillText("No hay datos disponibles para este período.", ctx.canvas.width / 2, ctx.canvas.height / 2);
                return;
            }

            const labels = Object.keys(data.rates);
            const values = labels.map(date => data.rates[date].PEN);

            if (dollarChartInstance) {
                dollarChartInstance.destroy();
            }

            const chartLineColor = '#230a1cff';
            const chartFillColor = 'rgba(102, 110, 187, 0.2)';

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
                        pointBorderColor: '#ffffff',
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: chartLineColor,
                        pointHoverBorderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
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
                        tooltip: {
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
                                font: {
                                    family: 'Urbanist, sans-serif',
                                    size: 12
                                },
                                autoSkip: true,
                                maxTicksLimit: 6,
                                // === AÑADE ESTE CALLBACK PARA FORMATEAR LA FECHA ===
                                callback: function(value, index, ticks) {
                                    // 'value' es la fecha en formato 'YYYY-MM-DD'
                                    const date = new Date(this.getLabelForValue(value));
                                    // Formatea a 'MM-DD' (mes-día)
                                    return date.toLocaleDateString('es-PE', { month: '2-digit', day: '2-digit' });
                                }
                                // ===================================================
                            },
                            grid: {
                                display: false,
                                borderColor: '#a8a8c7'
                            }
                        },
                        y: {
                        ticks: {
                            color: '#0a0a23',
                            font: {
                                family: 'Urbanist, sans-serif',
                                size: 12
                            },
                            callback: function(value) {
                                return `S/ ${value}`;
                            },
                            padding: 25
                        },
                            grid: {
                                drawTicks: false,
                                drawBorder: false,
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error("❌ Error al conectar con la API:", error);
            const ctx = document.getElementById('dollarChart').getContext('2d');
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = "16px Urbanist";
            ctx.fillStyle = "#ff0000";
            ctx.textAlign = "center";
            ctx.fillText("Error al cargar los datos del dólar. Intenta de nuevo más tarde.", ctx.canvas.width / 2, ctx.canvas.height / 2);
        }
    }

    getDollarHistory();

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const days = parseInt(this.dataset.days);
            getDollarHistory(days);
        });
    });
});