import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

async function testUpdate() {
    console.log('--- TESTE DE ATUALIZAÇÃO (CORRIGIDO) ---');
    const testTickers = ['AAPL', 'TSLA'];
    const results = {};

    for (const ticker of testTickers) {
        console.log(`Buscando dados para ${ticker}...`);
        try {
            const quote = await yahooFinance.quote(ticker);
            const summary = await yahooFinance.quoteSummary(ticker, {
                modules: ['assetProfile', 'summaryDetail', 'price']
            });

            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(endDate.getFullYear() - 1);

            const history = await yahooFinance.historical(ticker, {
                period1: startDate,
                period2: endDate,
                interval: '1d'
            });

            results[ticker] = {
                name: quote.longName,
                price: quote.regularMarketPrice,
                historyCount: history.length,
                sector: summary.assetProfile?.sector
            };
            console.log(`[OK] ${ticker}: ${quote.regularMarketPrice} ${quote.currency}`);
        } catch (error) {
            console.error(`[ERRO] ${ticker}:`, error.message);
        }
    }

    console.log('\nResumo do Teste:');
    console.log(results);
    console.log('\n--- TESTE CONCLUÍDO ---');
}

testUpdate();
