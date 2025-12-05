import React, { useEffect, useState } from 'react';
import { getStocks, getMarketSummary } from '../utils/dataUtils';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [stocks, setStocks] = useState([]);
    const [marketSummary, setMarketSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stocksData, summaryData] = await Promise.all([
                    getStocks(),
                    getMarketSummary()
                ]);
                setStocks(stocksData.filter(s => s.ticker !== 'last_updated'));
                setMarketSummary(summaryData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="loading">Carregando dados do mercado...</div>;
    }

    // Calculate Rankings
    const sortedByPE = [...stocks].sort((a, b) => b.pe - a.pe);
    const highestPE = sortedByPE[0];
    const lowestPE = sortedByPE[sortedByPE.length - 1];

    const sortedByYield = [...stocks].sort((a, b) => b.dividendYield - a.dividendYield);
    const highestYield = sortedByYield[0];

    const sortedByChange = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
    const highestGain = sortedByChange[0];
    const highestLoss = sortedByChange[sortedByChange.length - 1];

    // Stocks near 52-week high (within 5%)
    const nearHigh = stocks.filter(s => s.price >= s.high52 * 0.95);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const formatLargeNumber = (num) => {
        if (num >= 1.0e+12) return (num / 1.0e+12).toFixed(2) + " T";
        if (num >= 1.0e+9) return (num / 1.0e+9).toFixed(2) + " B";
        if (num >= 1.0e+6) return (num / 1.0e+6).toFixed(2) + " M";
        return num;
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header-actions">
                <a href="https://edney.it/" className="btn-home">
                    <i className="bi bi-house-door-fill"></i>
                    Home
                </a>
            </div>

            {/* Summary Cards */}
            <section className="summary-cards">
                <div className="card summary-card">
                    <div className="card-icon blue">
                        <i className="bi bi-collection"></i>
                    </div>
                    <div className="card-info">
                        <h3>Total de Ações</h3>
                        <p className="card-value">{marketSummary?.totalStocks}</p>
                    </div>
                </div>
                <div className="card summary-card">
                    <div className="card-icon green">
                        <i className="bi bi-cash-stack"></i>
                    </div>
                    <div className="card-info">
                        <h3>Média Cap. Mercado</h3>
                        <p className="card-value">${formatLargeNumber(marketSummary?.avgMarketCap)}</p>
                    </div>
                </div>
                <div className="card summary-card">
                    <div className="card-icon purple">
                        <i className="bi bi-calendar-check"></i>
                    </div>
                    <div className="card-info">
                        <h3>Última Atualização</h3>
                        <p className="card-value text-sm">{marketSummary?.lastUpdated}</p>
                    </div>
                </div>
            </section>

            {/* Highlights Section */}
            <h2 className="section-title">Destaques do Mercado</h2>
            <section className="highlights-grid">

                {/* Highest Dividend Yield */}
                <div className="card highlight-card">
                    <div className="highlight-header">
                        <span className="badge success">Maior Dividend Yield</span>
                        <i className="bi bi-piggy-bank text-success"></i>
                    </div>
                    <div className="highlight-body">
                        <div className="highlight-title-row">
                            <img
                                src={`https://financialmodelingprep.com/image-stock/${highestYield.ticker}.png`}
                                alt={highestYield.ticker}
                                className="company-logo-md"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                            <div>
                                <h4>{highestYield.ticker}</h4>
                                <p className="company-name">{highestYield.name}</p>
                            </div>
                        </div>
                        <div className="highlight-metric">
                            <span className="metric-value">{highestYield.dividendYield}%</span>
                            <span className="metric-label">Yield</span>
                        </div>
                        <Link to={`/stocks/${highestYield.ticker}`} className="btn-link">Ver Detalhes</Link>
                    </div>
                </div>

                {/* Highest P/E */}
                <div className="card highlight-card">
                    <div className="highlight-header">
                        <span className="badge warning">Maior P/L</span>
                        <i className="bi bi-graph-up text-warning"></i>
                    </div>
                    <div className="highlight-body">
                        <div className="highlight-title-row">
                            <img
                                src={`https://financialmodelingprep.com/image-stock/${highestPE.ticker}.png`}
                                alt={highestPE.ticker}
                                className="company-logo-md"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                            <div>
                                <h4>{highestPE.ticker}</h4>
                                <p className="company-name">{highestPE.name}</p>
                            </div>
                        </div>
                        <div className="highlight-metric">
                            <span className="metric-value">{highestPE.pe}</span>
                            <span className="metric-label">P/L</span>
                        </div>
                        <Link to={`/stocks/${highestPE.ticker}`} className="btn-link">Ver Detalhes</Link>
                    </div>
                </div>

                {/* Lowest P/E */}
                <div className="card highlight-card">
                    <div className="highlight-header">
                        <span className="badge info">Menor P/L</span>
                        <i className="bi bi-graph-down text-info"></i>
                    </div>
                    <div className="highlight-body">
                        <div className="highlight-title-row">
                            <img
                                src={`https://financialmodelingprep.com/image-stock/${lowestPE.ticker}.png`}
                                alt={lowestPE.ticker}
                                className="company-logo-md"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                            <div>
                                <h4>{lowestPE.ticker}</h4>
                                <p className="company-name">{lowestPE.name}</p>
                            </div>
                        </div>
                        <div className="highlight-metric">
                            <span className="metric-value">{lowestPE.pe}</span>
                            <span className="metric-label">P/L</span>
                        </div>
                        <Link to={`/stocks/${lowestPE.ticker}`} className="btn-link">Ver Detalhes</Link>
                    </div>
                </div>

                {/* Top Gainer */}
                <div className="card highlight-card">
                    <div className="highlight-header">
                        <span className="badge success">Maior Alta</span>
                        <i className="bi bi-arrow-up-right text-success"></i>
                    </div>
                    <div className="highlight-body">
                        <div className="highlight-title-row">
                            <img
                                src={`https://financialmodelingprep.com/image-stock/${highestGain.ticker}.png`}
                                alt={highestGain.ticker}
                                className="company-logo-md"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                            <div>
                                <h4>{highestGain.ticker}</h4>
                                <p className="company-name">{highestGain.name}</p>
                            </div>
                        </div>
                        <div className="highlight-metric">
                            <span className="metric-value text-success">+{highestGain.changePercent.toFixed(2)}%</span>
                            <span className="metric-label">Variação</span>
                        </div>
                        <Link to={`/stocks/${highestGain.ticker}`} className="btn-link">Ver Detalhes</Link>
                    </div>
                </div>

            </section>

            {/* Near Highs List */}
            <h2 className="section-title">Próximos da Máxima (52 Semanas)</h2>
            <section className="card list-card">
                <div className="table-responsive">
                    <table className="simple-table">
                        <thead>
                            <tr>
                                <th>Ticker</th>
                                <th>Preço</th>
                                <th>Máxima 52s</th>
                                <th>Distância</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nearHigh.slice(0, 5).map(stock => (
                                <tr key={stock.ticker}>
                                    <td>
                                        <div className="ticker-wrapper">
                                            <img
                                                src={`https://financialmodelingprep.com/image-stock/${stock.ticker}.png`}
                                                alt={stock.ticker}
                                                className="company-logo-sm"
                                                onError={(e) => { e.target.style.display = 'none' }}
                                            />
                                            <Link to={`/stocks/${stock.ticker}`} className="ticker-link">{stock.ticker}</Link>
                                        </div>
                                    </td>
                                    <td>{formatCurrency(stock.price)}</td>
                                    <td>{formatCurrency(stock.high52)}</td>
                                    <td className="text-success">
                                        {((stock.price / stock.high52 - 1) * 100).toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                            {nearHigh.length === 0 && (
                                <tr><td colSpan="4" className="text-center">Nenhuma ação próxima da máxima.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
