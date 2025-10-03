document.addEventListener('DOMContentLoaded', () => {
    // A variável API_KEY é carregada do arquivo js/config.js
    const API_BASE_URL = 'https://api.coingecko.com/api/v3';
    const API_KEY_PARAM = `x_cg_demo_api_key=${COINGECKO_API_KEY}`;
    const COINS_ID = 'bitcoin,ethereum,binancecoin,solana,dogecoin';

    const dashboardContainer = document.getElementById('crypto-dashboard');
    const lastUpdatedElement = document.getElementById('last-updated');

    // Gráficos do Topo
    const lineChartCtx = document.getElementById('price-chart').getContext('2d');
    const marketCapChartCtx = document.getElementById('market-cap-chart').getContext('2d');
    let priceHistoryChart;
    let marketCapChart;

    async function initializeDashboard() {
        console.log('Iniciando o dashboard...');
        dashboardContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div></div>';

        const marketData = await fetchMarketData();
        if (!marketData) return;

        dashboardContainer.innerHTML = '';

        // Atualiza o gráfico de dominância
        createMarketCapChart(marketData);

        const historicalDataPromises = marketData.map(coin => fetchHistoricalData(coin.id));
        const historicalDataArray = await Promise.all(historicalDataPromises);

        // Atualiza o gráfico de histórico de preços
        updatePriceHistoryChart(marketData, historicalDataArray);

        // Cria os blocos individuais
        marketData.forEach((coin, index) => {
            const historicalData = historicalDataArray[index];
            createCoinBlock(coin, historicalData);
        });

        lastUpdatedElement.textContent = `Atualizado em: ${new Date().toLocaleTimeString()}`;
    }

    async function fetchMarketData() {
        const url = `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${COINS_ID}&order=market_cap_desc&${API_KEY_PARAM}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro na API de Mercado: ${response.statusText}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao buscar dados de mercado:', error);
            dashboardContainer.innerHTML = `<p class="col-12 text-danger text-center">Erro ao carregar os dados de mercado.</p>`;
            return null;
        }
    }

    async function fetchHistoricalData(coinId) {
        const url = `${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=365&${API_KEY_PARAM}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Erro na API de Histórico: ${response.statusText}`);
            const data = await response.json();
            return data.prices;
        } catch (error) {
            console.error(`Falha ao buscar dados históricos para ${coinId}:`, error);
            return [];
        }
    }

    function formatLargeNumber(num) {
        if (num >= 1e12) {
            return '$' + (num / 1e12).toFixed(2) + 'T';
        }
        if (num >= 1e9) {
            return '$' + (num / 1e9).toFixed(2) + 'B';
        }
        if (num >= 1e6) {
            return '$' + (num / 1e6).toFixed(2) + 'M';
        }
        return '$' + num.toLocaleString();
    }

    function createMarketCapChart(marketData) {
        // Ordena os dados por market cap (menor para o maior) para o empilhamento correto
        const sortedMarketData = [...marketData].sort((a, b) => a.market_cap - b.market_cap);

        const colors = ['rgba(153, 102, 255, 0.7)', 'rgba(201, 203, 207, 0.7)', 'rgba(255, 205, 86, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 159, 64, 0.7)'];

        const datasets = sortedMarketData.map((coin, index) => ({
            label: coin.name,
            data: [coin.market_cap],
            backgroundColor: colors[index % colors.length]
        }));

        if (marketCapChart) {
            marketCapChart.data.datasets = datasets;
            marketCapChart.update();
        } else {
            marketCapChart = new Chart(marketCapChartCtx, {
                type: 'bar',
                data: {
                    labels: [''], // Apenas uma barra
                    datasets: datasets
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: true,
                            ticks: {
                                callback: value => formatLargeNumber(value)
                            }
                        },
                        y: {
                            stacked: true,
                            display: false
                        }
                    },
                    plugins: {
                        legend: {
                            display: false // Desativa a legenda padrão do Chart.js
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.x !== null) {
                                        label += formatLargeNumber(context.parsed.x);
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }
        // Gera a legenda HTML customizada
        generateCustomMarketCapLegend(sortedMarketData, colors);
    }

    function generateCustomMarketCapLegend(marketData, colors) {
        const legendContainer = document.getElementById('market-cap-legend');
        legendContainer.innerHTML = ''; // Limpa a legenda existente

        marketData.forEach((coin, index) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'd-flex align-items-center me-3 mb-2'; // Flexbox para alinhar item e texto
            legendItem.innerHTML = `
                <span style="background-color: ${colors[index % colors.length]}; width: 15px; height: 15px; border-radius: 50%; display: inline-block; margin-right: 5px;"></span>
                <div>
                    <div class="fw-bold">${coin.name}</div>
                    <div class="small text-muted">${formatLargeNumber(coin.market_cap)}</div>
                </div>
            `;
            legendContainer.appendChild(legendItem);
        });
    }

    function updatePriceHistoryChart(marketData, historicalDataArray) {
        const colors = ['rgba(153, 102, 255, 1)', 'rgba(201, 203, 207, 1)', 'rgba(255, 205, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 159, 64, 1)'];
        
        let absoluteMaxPrice = 0;
        historicalDataArray.forEach(prices => {
            prices.forEach(price => {
                if (price[1] > absoluteMaxPrice) {
                    absoluteMaxPrice = price[1];
                }
            });
        });

        const suggestedMax = absoluteMaxPrice * 1.25;

        const datasets = marketData.map((coin, index) => ({
            label: coin.name,
            data: historicalDataArray[index].map(price => ({x: price[0], y: price[1]})),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length], // Adiciona background para preencher a legenda
            borderWidth: 2,
            pointRadius: 0,
            fill: false
        }));

        if (priceHistoryChart) {
            priceHistoryChart.data.datasets = datasets;
            priceHistoryChart.options.scales.y.max = suggestedMax;
            priceHistoryChart.update();
        } else {
            priceHistoryChart = new Chart(lineChartCtx, {
                type: 'line',
                data: { datasets: datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        x: { type: 'time', time: { unit: 'month' }, grid: { display: false } },
                        y: { 
                            type: 'logarithmic', 
                            max: suggestedMax, // Define o máximo dinâmico
                            grid: { color: 'rgba(0,0,0,0.05)' }, 
                            ticks: { callback: (value) => '$' + Number(value).toLocaleString() } 
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'rect',
                                fillStyle: (context) => context.dataset.borderColor // Usa a cor da linha para preencher a caixa
                            }
                        },
                        tooltip: { mode: 'index', intersect: false }
                    }
                }
            });
        }
    }

    function createCoinBlock(coin, historicalData) {
        const change24h = coin.price_change_percentage_24h;
        const price = coin.current_price;
        const colorClass = change24h >= 0 ? 'text-success' : 'text-danger';
        const icon = change24h >= 0 ? 'bi-arrow-up' : 'bi-arrow-down';

        const blockDiv = document.createElement('div');
        blockDiv.className = 'col-12 mb-4';
        blockDiv.innerHTML = `
            <div class="card shadow-sm h-100">
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4 col-12 border-end">
                            <div class="d-flex align-items-center mb-3">
                                <img src="${coin.image}" alt="${coin.name}" width="50" class="me-3">
                                <div>
                                    <h2 class="card-title h4 mb-1">${coin.name} <span class="text-muted">${coin.symbol.toUpperCase()}</span></h2>
                                </div>
                            </div>
                            <p class="card-text h3 mb-1">$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <span class="${colorClass} fw-bold fs-5"><i class="bi ${icon}"></i> ${change24h.toFixed(2)}%</span>
                            <div class="mt-3 small text-muted">
                                <span>Máx 24h: <span class="fw-bold">$${coin.high_24h.toLocaleString('en-US')}</span></span><br>
                                <span>Mín 24h: <span class="fw-bold">$${coin.low_24h.toLocaleString('en-US')}</span></span><br>
                                <span>Market Cap: <span class="fw-bold">${formatLargeNumber(coin.market_cap)}</span></span>
                            </div>
                        </div>
                        <div class="col-md-8 col-12">
                            <div class="chart-container">
                                <canvas id="chart-${coin.id}"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        dashboardContainer.appendChild(blockDiv);

        if (historicalData && historicalData.length > 0) {
            createIndividualChart(document.getElementById(`chart-${coin.id}`), coin, historicalData);
        }
    }

    function createIndividualChart(ctx, coin, prices) {
        const data = prices.map(price => ({x: price[0], y: price[1]}));

        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: `Preço de ${coin.name} (USD)`,
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    fill: true,
                    pointRadius: 0,
                    borderWidth: 1.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { type: 'time', time: { unit: 'month' }, grid: { display: false }, ticks: { autoSkip: true, maxTicksLimit: 12 } },
                    y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: value => '$' + value.toLocaleString() } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
    }

    initializeDashboard();
    setInterval(initializeDashboard, 300000);
});