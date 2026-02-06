import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

async function inspect() {
    const ticker = 'KO';
    try {
        const quote = await yahooFinance.quote(ticker);
        const summary = await yahooFinance.quoteSummary(ticker, {
            modules: ['summaryDetail']
        });

        const data = {
            ticker: ticker,
            quoteDividend: quote.dividendYield,
            quoteTrailingDividend: quote.trailingAnnualDividendYield,
            summaryDividend: summary.summaryDetail?.dividendYield,
            summaryTrailingDividend: summary.summaryDetail?.trailingAnnualDividendYield
        };
        
        console.log('Dados encontrados:');
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

inspect();