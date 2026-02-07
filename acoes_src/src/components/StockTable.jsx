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

            {/* Market Sentiment Indicator - Gauge Style */}
            <div className="sentiment-container mt-4 p-4 card border-0 shadow-sm" style={{ background: 'var(--bg-secondary)' }}>
                <div className="text-center mb-4">
                    <h4 style={{ color: 'var(--text-primary)', fontWeight: '600', letterSpacing: '0.5px' }}>
                        <i className="bi bi-speedometer2 me-2"></i>Termômetro do Mercado
                    </h4>
                </div>

                <div className="row align-items-center justify-content-center">
                    <div className="col-md-8 d-flex flex-column align-items-center">
                        {/* Gauge SVG */}
                        <div style={{ width: '300px', height: '160px', position: 'relative', overflow: 'hidden' }}>
                            <svg viewBox="0 0 200 110" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                                {/* Background Arcs using thick stroke paths
                                    Center 100,100. Radius 80.
                                    Start 180 -> End 0 (Clockwise).
                                    Segment 1: 180 -> 144 (Strong Buy - Green)
                                    Segment 2: 144 -> 108 (Buy - Light Green)
                                    Segment 3: 108 -> 72 (Neutral - Yellow)
                                    Segment 4: 72 -> 36 (Sell - Orange)
                                    Segment 5: 36 -> 0 (Strong Sell - Red)
                                 */}
                                <path d="M 20,100 A 80,80 0 0 1 44.7,52.9" fill="none" stroke="#2e7d32" strokeWidth="25" /> {/* Strong Buy */}
                                <path d="M 46.5,50.5 A 80,80 0 0 1 85,21.5" fill="none" stroke="#66bb6a" strokeWidth="25" />   {/* Buy */}
                                <path d="M 87,20.8 A 80,80 0 0 1 123,20.8" fill="none" stroke="#fdd835" strokeWidth="25" />   {/* Neutral */}
                                <path d="M 125,21.5 A 80,80 0 0 1 163.5,50.5" fill="none" stroke="#fb8c00" strokeWidth="25" /> {/* Sell */}
                                <path d="M 165.3,52.9 A 80,80 0 0 1 190,100" fill="none" stroke="#c62828" strokeWidth="25" />   {/* Strong Sell */}

                                {/* Needle */}
                                {/* Rotation: 0 (Left/Green) to 180 (Right/Red). Value 0-100 maps to 0-180deg */}
                                <g transform={`rotate(${(() => {
                                        // Score calculation
                                        // 0 (All Buy) -> 100 (All Sell)
                                        // Neutral pulls to 50
                                        const total = sentiment.total || 1;
                                        // Weighted: Sell=1, Neutral=0.5, Buy=0
                                        // Score = (Sell*1 + Neutral*0.5 + Buy*0) / Total * 100
                                        const score = ((sentiment.sell * 1 + sentiment.neutral * 0.5) / total) * 100;
                                        return (score / 100) * 180;
                                    })()
                                    }, 100, 100)`}>
                                    <polygon points="100,105 100,90 20,100" fill="#546e7a" />
                                    <circle cx="100" cy="100" r="8" fill="#546e7a" />
                                    <circle cx="100" cy="100" r="4" fill="#cfd8dc" />
                                </g>
                            </svg>
                        </div>

                        {/* Text Verdict */}
                        <div className="text-center mt-3">
                            <h3 className={`mb-0 fw-bold`} style={{
                                color: (() => {
                                    // Match color to verdict text
                                    if (verdict.color === 'success') return '#2e7d32'; // Green
                                    if (verdict.color === 'danger') return '#c62828';  // Red
                                    return '#607d8b'; // Neutral Grey
                                })()
                            }}>
                                {verdict.text}
                            </h3>
                            <div className="d-flex justify-content-center gap-4 mt-3 text-muted" style={{ fontSize: '0.9rem' }}>
                                <span><i className="bi bi-circle-fill text-success me-1"></i>{sentiment.buy} Compra</span>
                                <span><i className="bi bi-circle-fill text-warning me-1"></i>{sentiment.neutral} Neutro</span>
                                <span><i className="bi bi-circle-fill text-danger me-1"></i>{sentiment.sell} Venda</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StockTable;
