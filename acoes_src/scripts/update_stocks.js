import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YahooFinance from 'yahoo-finance2';

// Configuração com validação relaxada para evitar quebras por mudanças na API do Yahoo
const yahooFinance = new YahooFinance({ 
    suppressNotices: ['yahooSurvey', 'ripHistorical'],
    validation: { logErrors: false } // Não trava o script se um campo novo ou estranho aparecer
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../db/dados_acoes.json');

// Mapeamento de tickers que o Yahoo Finance usa formato diferente
const TICKER_MAPPING = {
    'BRK.B': 'BRK-B',
    'BF.B': 'BF-B'
};

async function updateStocks() {
    console.log('🚀 Iniciando atualização automatizada de ações...');

    if (!fs.existsSync(dbPath)) {
        console.error('❌ Arquivo dados_acoes.json não encontrado!');
        return;
    }

    const rawData = fs.readFileSync(dbPath, 'utf8');
    const stocks = JSON.parse(rawData.replace(/: NaN/g, ': null').replace(/: Infinity/g, ': null'));
    const tickers = Object.keys(stocks).filter(t => t !== 'last_updated');

    console.log(`📊 Encontrados ${tickers.length} tickers na base de dados.`);

    const updatedData = { ...stocks };
    const batchSize = 3;
    const waitTime = 1500;

    for (let i = 0; i < tickers.length; i += batchSize) {
        const batch = tickers.slice(i, i + batchSize);
        console.log(`[${i + batch.length}/${tickers.length}] Processando: ${batch.join(', ')}...`);

        await Promise.all(batch.map(async (originalTicker) => {
            // Usa o mapeamento se existir, senão usa o original
            const yahooTicker = TICKER_MAPPING[originalTicker] || originalTicker;
            
            try {
                // 1. Buscar Cotação e Resumo
                const quote = await yahooFinance.quote(yahooTicker);
                const summary = await yahooFinance.quoteSummary(yahooTicker, {
                    modules: ['assetProfile', 'summaryDetail', 'price']
                });

                // 2. Buscar Histórico
                const endDate = new Date();
                const startDate = new Date();
                startDate.setFullYear(endDate.getFullYear() - 1);

                const chartData = await yahooFinance.chart(yahooTicker, {
                    period1: startDate,
                    period2: endDate,
                    interval: '1d'
                });

                // 3. Mapear para o formato original (mantendo o ticker original como chave)
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
                        dividendYield: (quote.dividendYield || 0) / 100,
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

                console.log(`   ✅ ${originalTicker} atualizado. (Yahoo: ${yahooTicker})`);
            } catch (error) {
                console.error(`   ⚠️ Erro em ${originalTicker}: ${error.message}`);
            }
        }));

        if (i + batchSize < tickers.length) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    updatedData.last_updated = new Date().toISOString();

    console.log('\n💾 Gravando alterações no banco de dados...');
    fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 4));
    console.log('✨ Processo concluído com sucesso!');
}

updateStocks();
