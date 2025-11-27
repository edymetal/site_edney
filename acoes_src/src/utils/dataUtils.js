import rawDataString from '../assets/dados_acoes.txt?raw';

const parseStockData = (jsonString) => {
    try {
        // Replace NaN, Infinity, -Infinity with null
        // We use a regex that matches these values when they are values in JSON (after a colon)
        // or just globally if we want to be aggressive, but let's be safe.
        // Typically in JSON dump they appear as: "key": NaN
        const sanitizedString = jsonString
            .replace(/:\s*NaN/g, ': null')
            .replace(/:\s*Infinity/g, ': null')
            .replace(/:\s*-Infinity/g, ': null');

        return JSON.parse(sanitizedString);
    } catch (error) {
        console.error("Failed to parse stock data:", error);
        return {};
    }
};

const rawData = parseStockData(rawDataString);

// Adapter to transform the dictionary format to the array format expected by the app
const adaptStockData = (data) => {
    return Object.entries(data).map(([ticker, stockData]) => {
        // Handle case where stockData might be null or undefined
        if (!stockData) return null;

        const info = stockData.info || {};
        const history = stockData.historico || [];

        // Map history fields
        const formattedHistory = history.map(item => ({
            date: item.Date,
            close: item.Close
        }));

        return {
            ticker: ticker,
            name: info.shortName || info.longName || ticker,
            sector: info.sector || "Desconhecido",
            price: info.currentPrice || info.regularMarketPrice || 0,
            change: info.regularMarketChange || 0,
            changePercent: info.regularMarketChangePercent || 0,
            marketCap: info.marketCap || 0,
            pe: info.trailingPE || info.forwardPE || 0,
            dividendYield: (info.dividendYield || info.trailingAnnualDividendYield || 0),
            high52: info.fiftyTwoWeekHigh || 0,
            low52: info.fiftyTwoWeekLow || 0,
            description: info.longBusinessSummary || "Descrição não disponível.",
            history: formattedHistory,
            variationMean: info.percentual_diferenca_media || 0,
            aboveHigh12M: (info.fiftyTwoWeekHigh && info.currentPrice) ? ((info.currentPrice - info.fiftyTwoWeekHigh) / info.fiftyTwoWeekHigh) * 100 : 0,
            changePercent12M: info.fiftyTwoWeekChangePercent || 0
        };
    }).filter(item => item !== null); // Filter out null items
};

const stocksData = adaptStockData(rawData).filter(stock => stock.ticker !== 'last_updated');

export const getStocks = () => {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            resolve(stocksData);
        }, 500);
    });
};

export const getStockByTicker = (ticker) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const stock = stocksData.find(s => s.ticker === ticker);
            if (stock) {
                resolve(stock);
            } else {
                reject(new Error('Stock not found'));
            }
        }, 300);
    });
};

export const getMarketSummary = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const totalStocks = stocksData.length;
            const totalMarketCap = stocksData.reduce((acc, stock) => acc + stock.marketCap, 0);
            const avgMarketCap = totalStocks > 0 ? totalMarketCap / totalStocks : 0;

            resolve({
                totalStocks,
                avgMarketCap,
                lastUpdated: new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
            });
        }, 300);
    });
};
