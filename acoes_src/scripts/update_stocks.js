import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ 
    suppressNotices: ['yahooSurvey', 'ripHistorical'],
    validation: { logErrors: false }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../db/dados_acoes.json');

const TICKER_MAPPING = {
    'BRK.B': 'BRK-B',
    'BF.B': 'BF-B'
};

async function updateStocks() {
    console.log('🚀 Iniciando atualização automatizada de ações (Correção de Dividendos)...');

    if (!fs.existsSync(dbPath)) {
        console.error('❌ Arquivo dados_acoes.json não encontrado!');
        return;
    }

    const rawData = fs.readFileSync(dbPath, 'utf8');
    const stocks = JSON.parse(rawData.replace(/: NaN/g, ': null').replace(/: Infinity/g, ': null'));
    const tickers = Object.keys(stocks).filter(t => t !== 'last_updated');

    const updatedData = { ...stocks };
    const batchSize = 3;
    const waitTime = 1200;

    for (let i = 0; i < tickers.length; i += batchSize) {
        const batch = tickers.slice(i, i + batchSize);
        console.log(`[${i + batch.length}/${tickers.length}] Processando: ${batch.join(', ')}...`);

        await Promise.all(batch.map(async (originalTicker) => {
            const yahooTicker = TICKER_MAPPING[originalTicker] || originalTicker;
            
            try {
                const quote = await yahooFinance.quote(yahooTicker);
                const summary = await yahooFinance.quoteSummary(yahooTicker, {
                    modules: ['assetProfile', 'summaryDetail']
                });

                const endDate = new Date();
                const startDate = new Date();
                startDate.setFullYear(endDate.getFullYear() - 1);

                const chartData = await yahooFinance.chart(yahooTicker, {
                    period1: startDate,
                    period2: endDate,
                    interval: '1d'
                });

                // Lógica corrigida para Dividend Yield
                // O site espera um valor como 2.6 para exibir 2.60%
                let dy = 0;
                if (quote.dividendYield != null) {
                    dy = quote.dividendYield; // quote retorna porcentagem pronta (ex: 2.6)
                } else if (summary.summaryDetail?.dividendYield != null) {
                    dy = summary.summaryDetail.dividendYield * 100; // summary retorna decimal (ex: 0.026)
                } else if (summary.summaryDetail?.trailingAnnualDividendYield != null) {
                    dy = summary.summaryDetail.trailingAnnualDividendYield * 100;
                }

                updatedData[originalTicker] = {
                    info: {
                        ...stocks[originalTicker]?.info,
                        longName: quote.longName || quote.shortName || originalTicker,
                        shortName: quote.shortName || originalTicker,
                        sector: summary.assetProfile?.sector || "Desconhecido",
                        industry: summary.assetProfile?.industry || "Desconhecido",
                        longBusinessSummary: summary.assetProfile?.longBusinessSummary || "Descrição não disponível.",
                        currentPrice: quote.regularMarketPrice,
                        regularMarketPrice: quote.regularMarketPrice,
                        regularMarketChange: quote.regularMarketChange,
                        regularMarketChangePercent: quote.regularMarketChangePercent,
                        marketCap: quote.marketCap,
                        trailingPE: quote.trailingPE,
                        forwardPE: quote.forwardPE,
                        dividendYield: dy, // Agora salvando como porcentagem real
                        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
                        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
                        fiftyTwoWeekChangePercent: quote.fiftyTwoWeekChangePercent,
                        website: summary.assetProfile?.website,
                        percentual_diferenca_media: stocks[originalTicker]?.info?.percentual_diferenca_media || 0
                    },
                    historico: chartData.quotes.map(item => ({
                        Date: item.date instanceof Date ? item.date.toISOString() : item.date,
                        Close: item.close
                    })).filter(q => q.Close != null)
                };

                console.log(`   ✅ ${originalTicker} atualizado. (DY: ${dy.toFixed(2)}%)`);
            } catch (error) {
                console.error(`   ⚠️ Erro em ${originalTicker}: ${error.message}`);
            }
        }));

        if (i + batchSize < tickers.length) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    updatedData.last_updated = new Date().toISOString();
    fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 4));
    console.log('✨ Atualização concluída!');
}

updateStocks();