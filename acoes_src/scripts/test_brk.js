import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

async function testBRK() {
    const ticker = 'BRK-B'; // Testando com hífen
    console.log(`Testando cotação para ${ticker}...`);
    try {
        const quote = await yahooFinance.quote(ticker);
        console.log(`✅ Sucesso! Preço de ${ticker}: ${quote.regularMarketPrice}`);
    } catch (error) {
        console.error(`❌ Falha com ${ticker}: ${error.message}`);
    }
}

testBRK();
