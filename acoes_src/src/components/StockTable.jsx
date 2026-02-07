import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/StockTable.css';

const StockTable = ({ stocks }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'ticker', direction: 'ascending' });
    const [filter, setFilter] = useState('');

    const sortedStocks = React.useMemo(() => {
        let sortableStocks = [...stocks];
        if (sortConfig !== null) {
            sortableStocks.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableStocks;
    }, [stocks, sortConfig]);

    const filteredStocks = sortedStocks.filter(stock =>
        stock.ticker.toLowerCase().includes(filter.toLowerCase()) ||
        stock.name.toLowerCase().includes(filter.toLowerCase())
    );

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name) => {
        if (!sortConfig || sortConfig.key !== name) {
            return <i className="bi bi-arrow-down-up text-muted sort-icon"></i>;
        }
        return sortConfig.direction === 'ascending' ?
            <i className="bi bi-arrow-up sort-icon"></i> :
            <i className="bi bi-arrow-down sort-icon"></i>;
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    const sentiment = React.useMemo(() => {
        let buy = 0;
        let sell = 0;
        let neutral = 0;

        stocks.forEach(stock => {
            if (stock.price >= stock.high52 * 0.95) {
                sell++;
            } else if (stock.price <= stock.low52 * 1.05) {
                buy++;
            } else {
                neutral++;
            }
        });

        const total = stocks.length;
        return {
            buy,
            sell,
            neutral,
            buyPct: total > 0 ? (buy / total) * 100 : 0,
            sellPct: total > 0 ? (sell / total) * 100 : 0,
            neutralPct: total > 0 ? (neutral / total) * 100 : 0,
            total
        };
    }, [stocks]);

    const getVerdict = () => {
        // Se não houver nenhuma sugestão de compra nem de venda, é Neutro
        if (sentiment.buy === 0 && sentiment.sell === 0) {
            return { text: "Mercado Neutro", color: "secondary", icon: "bi-dash-lg" };
        }

        // Se houver qualquer sugestão, decide pela maioria entre Compra e Venda
        // Em caso de empate, priorizamos a Compra (ou poderia mostrar 'Indefinido', mas a regra é mostrar opção)
        if (sentiment.buy >= sentiment.sell) {
            return { text: "Mercado Comprador", color: "success", icon: "bi-graph-up-arrow" };
        } else {
            return { text: "Mercado Vendedor", color: "danger", icon: "bi-graph-down-arrow" };
        }
    };

    const verdict = getVerdict();

    return (
        <div className="stock-table-container">
            <div className="table-controls">
                <div className="search-bar">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Buscar por ticker ou nome..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="table-stats">
                    Exibindo {filteredStocks.length} de {stocks.length} ações
                </div>
            </div>

            <div className="table-responsive">
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('ticker')}>Ticker {getSortIcon('ticker')}</th>
                            <th onClick={() => requestSort('name')}>Empresa {getSortIcon('name')}</th>
                            <th onClick={() => requestSort('sector')}>Setor {getSortIcon('sector')}</th>
                            <th onClick={() => requestSort('price')} className="text-right">Preço {getSortIcon('price')}</th>
                            <th onClick={() => requestSort('changePercent12M')} className="text-right">Var % (12M) {getSortIcon('changePercent12M')}</th>
                            <th onClick={() => requestSort('dividendYield')} className="text-right">Div. Yield {getSortIcon('dividendYield')}</th>
                            <th onClick={() => requestSort('variationMean')} className="text-right">Var. Média {getSortIcon('variationMean')}</th>
                            <th onClick={() => requestSort('aboveHigh12M')} className="text-center">Acima Máx. 12M {getSortIcon('aboveHigh12M')}</th>
                            <th onClick={() => requestSort('distFromLow12M')} className="text-center">Acima Mín. 12M {getSortIcon('distFromLow12M')}</th>
                            <th className="text-center">Sugestão</th>
                            <th onClick={() => requestSort('marketCap')} className="text-right">Cap. Mercado {getSortIcon('marketCap')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStocks.map(stock => (
                            <tr key={stock.ticker}>
                                <td>
                                    <div className="ticker-wrapper">
                                        <img
                                            src={`https://financialmodelingprep.com/image-stock/${stock.ticker}.png`}
                                            alt={stock.ticker}
                                            className="company-logo-sm"
                                            onError={(e) => { e.target.style.display = 'none' }}
                                        />
                                        <Link to={`/stocks/${stock.ticker}`} className="ticker-cell">
                                            {stock.ticker}
                                        </Link>
                                    </div>
                                </td>
                                <td>{stock.name}</td>
                                <td><span className="sector-badge">{stock.sector}</span></td>
                                <td className="text-right font-mono">{formatCurrency(stock.price)}</td>
                                <td className={`text-right font-mono ${stock.changePercent12M >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {stock.changePercent12M > 0 ? '+' : ''}{stock.changePercent12M.toFixed(2)}%
                                </td>

                                <td className="text-right font-mono">{stock.dividendYield.toFixed(2)}%</td>
                                <td className={`text-right font-mono ${stock.variationMean >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {stock.variationMean > 0 ? '+' : ''}{stock.variationMean.toFixed(2)}%
                                </td>
                                <td className={`text-center font-mono ${stock.aboveHigh12M >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {stock.aboveHigh12M > 0 ? '+' : ''}{stock.aboveHigh12M.toFixed(2)}%
                                </td>
                                <td className={`text-center font-mono ${stock.distFromLow12M >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {stock.distFromLow12M > 0 ? '+' : ''}{stock.distFromLow12M.toFixed(2)}%
                                </td>
                                <td className="text-center">
                                    {(() => {
                                        if (stock.price >= stock.high52 * 0.95) {
                                            return <span className="text-danger fw-bold">Venda</span>;
                                        } else if (stock.price <= stock.low52 * 1.05) {
                                            return <span className="text-success fw-bold">Compra</span>;
                                        } else {
                                            return <span className="text-muted">-</span>;
                                        }
                                    })()}
                                </td>
                                <td className="text-right font-mono">{(stock.marketCap / 1e9).toFixed(2)}B</td>
                            </tr>
                        ))}
                        {filteredStocks.length === 0 && (
                            <tr>
                                <td colSpan="11" className="text-center py-4">Nenhuma ação encontrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Market Sentiment Indicator - Professional Style */}
            <div className="sentiment-container mt-4 p-4 card border-0 shadow-sm" style={{ background: 'var(--bg-secondary)' }}>
                <h4 className="text-center mb-4" style={{ color: 'var(--text-primary)', fontWeight: '600', letterSpacing: '0.5px' }}>
                    <i className="bi bi-speedometer2 me-2"></i>Termômetro do Mercado
                </h4>

                <div className="row align-items-center g-4">
                    {/* Stats Cards */}
                    <div className="col-md-8">
                        <div className="d-flex justify-content-between text-center mb-2">
                            <div className="sentiment-stat">
                                <span className="d-block text-success fw-bold mb-1">COMPRA</span>
                                <span className="h4 mb-0">{sentiment.buy}</span>
                                <small className="d-block text-muted">{sentiment.buyPct.toFixed(1)}%</small>
                            </div>
                            <div className="sentiment-stat">
                                <span className="d-block text-muted fw-bold mb-1">NEUTRO</span>
                                <span className="h4 mb-0">{sentiment.neutral}</span>
                                <small className="d-block text-muted">{sentiment.neutralPct.toFixed(1)}%</small>
                            </div>
                            <div className="sentiment-stat">
                                <span className="d-block text-danger fw-bold mb-1">VENDA</span>
                                <span className="h4 mb-0">{sentiment.sell}</span>
                                <small className="d-block text-muted">{sentiment.sellPct.toFixed(1)}%</small>
                            </div>
                        </div>

                        {/* Multi-colored Progress Bar */}
                        <div className="progress" style={{ height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                            <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${sentiment.buyPct}%` }}
                                aria-valuenow={sentiment.buyPct}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                            <div
                                className="progress-bar bg-secondary" // Neutro com cor cinza/secondary
                                role="progressbar"
                                style={{ width: `${sentiment.neutralPct}%`, opacity: 0.5 }}
                                aria-valuenow={sentiment.neutralPct}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                            <div
                                className="progress-bar bg-danger"
                                role="progressbar"
                                style={{ width: `${sentiment.sellPct}%` }}
                                aria-valuenow={sentiment.sellPct}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                        <div className="d-flex justify-content-between mt-1" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span>Dominância Compradora</span>
                            <span>Equilíbrio</span>
                            <span>Dominância Vendedora</span>
                        </div>
                    </div>

                    {/* Verdict Card */}
                    <div className="col-md-4">
                        <div className={`card h-100 border-${verdict.color} bg-soft-${verdict.color} text-center p-3 d-flex flex-column justify-content-center align-items-center`}>
                            <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.8rem' }}>Veredito Atual</h6>
                            <h3 className={`text-${verdict.color} mb-0 fw-bold`}>
                                <i className={`bi ${verdict.icon} me-2`}></i>
                                {verdict.text}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StockTable;
