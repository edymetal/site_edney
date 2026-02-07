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
                    <div className="col-12 d-flex flex-column align-items-center">
                        {/* Gauge SVG Minimalist */}
                        <div style={{ width: '380px', height: '180px', position: 'relative', overflow: 'hidden', margin: '0 auto' }}>
                            <svg viewBox="0 0 240 130" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#212121" />
                                        <stop offset="100%" stopColor="#424242" />
                                    </linearGradient>
                                </defs>

                                {/* Background Thin Arc (Gray) */}
                                <path d="M 30,110 A 90,90 0 0 1 210,110" fill="none" stroke="#eeeeee" strokeWidth="3" strokeLinecap="round" />

                                {/* Active Segment Highlight */}
                                {(() => {
                                    const total = sentiment.total || 1;
                                    const score = ((sentiment.buy * 1 + sentiment.neutral * 0.5) / total) * 100;

                                    let color = "#bdbdbd";
                                    let pathD = "";

                                    const getEx = (deg) => 120 + 90 * Math.cos(deg * Math.PI / 180);
                                    const getEy = (deg) => 110 - 90 * Math.sin(deg * Math.PI / 180);

                                    if (score <= 20) {
                                        color = "#b71c1c"; // Strong Sell - Dark Red
                                        pathD = `M ${getEx(180)},${getEy(180)} A 90,90 0 0 1 ${getEx(144)},${getEy(144)}`;
                                    } else if (score <= 40) {
                                        color = "#ef9a9a"; // Sell - Light Red
                                        pathD = `M ${getEx(144)},${getEy(144)} A 90,90 0 0 1 ${getEx(108)},${getEy(108)}`;
                                    } else if (score <= 60) {
                                        color = "#bdbdbd"; // Neutral - Gray
                                        pathD = `M ${getEx(108)},${getEy(108)} A 90,90 0 0 1 ${getEx(72)},${getEy(72)}`;
                                    } else if (score <= 80) {
                                        color = "#a5d6a7"; // Buy - Light Green
                                        pathD = `M ${getEx(72)},${getEy(72)} A 90,90 0 0 1 ${getEx(36)},${getEy(36)}`;
                                    } else {
                                        color = "#2e7d32"; // Strong Buy - Dark Green
                                        pathD = `M ${getEx(36)},${getEy(36)} A 90,90 0 0 1 ${getEx(0)},${getEy(0)}`;
                                    }

                                    return <path d={pathD} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />;
                                })()}


                                {/* Labels */}
                                <g style={{ fontSize: '10px', fill: '#9e9e9e', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
                                    <text x="25" y="125" textAnchor="middle">Venda Forte</text>
                                    <text x="65" y="55" textAnchor="middle">Venda</text>
                                    <text x="120" y="15" textAnchor="middle">Neutro</text>
                                    <text x="175" y="55" textAnchor="middle">Compra</text>
                                    <text x="215" y="125" textAnchor="middle">Compra Forte</text>
                                </g>

                                {/* Needle */}
                                <g transform={`rotate(${(() => {
                                    const total = sentiment.total || 1;
                                    const score = ((sentiment.buy * 1 + sentiment.neutral * 0.5) / total) * 100;
                                    return 180 + (score / 100) * 180;
                                })()
                                    }, 120, 110)`}>
                                    <line x1="120" y1="110" x2="200" y2="110" stroke="#333333" strokeWidth="3" strokeLinecap="round" />
                                    <circle cx="120" cy="110" r="4" fill="#333333" />
                                </g>
                            </svg>
                        </div>

                        {/* Text Verdict */}
                        <div className="text-center mt-0">
                            <h2 className={`mb-0 fw-bold`} style={{
                                color: (() => {
                                    const total = sentiment.total || 1;
                                    const score = ((sentiment.buy * 1 + sentiment.neutral * 0.5) / total) * 100;
                                    if (score <= 20) return '#b71c1c';
                                    if (score <= 40) return '#ef9a9a';
                                    if (score <= 60) return '#757575';
                                    if (score <= 80) return '#a5d6a7';
                                    return '#2e7d32';
                                })()
                            }}>
                                {(() => {
                                    const total = sentiment.total || 1;
                                    const score = ((sentiment.buy * 1 + sentiment.neutral * 0.5) / total) * 100;
                                    if (score <= 20) return "Venda Forte";
                                    if (score <= 40) return "Venda";
                                    if (score <= 60) return "Neutro";
                                    if (score <= 80) return "Compra";
                                    return "Compra Forte";
                                })()}
                            </h2>
                            <div className="d-flex justify-content-center gap-4 mt-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                                <span style={{ color: '#d32f2f' }}><i className="bi bi-circle-fill me-2" style={{ color: '#ef9a9a' }}></i>{sentiment.sell} Venda</span>
                                <span style={{ color: '#9e9e9e' }}><i className="bi bi-circle-fill me-2" style={{ color: '#bdbdbd' }}></i>{sentiment.neutral} Neutro</span>
                                <span style={{ color: '#2e7d32' }}><i className="bi bi-circle-fill me-2" style={{ color: '#a5d6a7' }}></i>{sentiment.buy} Compra</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StockTable;
