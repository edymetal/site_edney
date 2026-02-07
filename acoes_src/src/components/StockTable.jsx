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
                        {/* Gauge SVG Progressive - Large viewBox and centered layout to avoid text cutting */}
                        <div style={{ width: '100%', maxWidth: '600px', height: '260px', position: 'relative', overflow: 'hidden', margin: '0 auto' }}>
                            <svg viewBox="0 0 440 200" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#bdbdbd" />
                                        <stop offset="100%" stopColor="#e0e0e0" />
                                    </linearGradient>
                                </defs>

                                {/* Background Segmented Arc - Order of layers: Inactive segments first, ACTIVE LAST */}
                                {(() => {
                                    const total = sentiment.total || 1;
                                    const score = ((sentiment.buy * 1 + sentiment.neutral * 0.5) / total) * 100;

                                    // Centered at 220, 160
                                    const centerX = 220;
                                    const centerY = 160;
                                    const radius = 90;

                                    const getEx = (deg) => centerX + radius * Math.cos(deg * Math.PI / 180);
                                    const getEy = (deg) => centerY - radius * Math.sin(deg * Math.PI / 180);

                                    const segments = [
                                        { start: 180, end: 144, color: "#d50000", range: [0, 20] },   // Venda Forte
                                        { start: 144, end: 108, color: "#ff5252", range: [20, 40] },  // Venda
                                        { start: 108, end: 72, color: "#ffd600", range: [40, 60] },   // Neutro
                                        { start: 72, end: 36, color: "#69f0ae", range: [60, 80] },    // Compra
                                        { start: 36, end: 0, color: "#00c853", range: [80, 100] }    // Compra Forte
                                    ];

                                    // Sort segments: inactive ones first, active one last to be on top
                                    const sortedSegments = [...segments].sort((a, b) => {
                                        const aActive = score > a.range[0] && score <= a.range[1];
                                        const bActive = score > b.range[0] && score <= b.range[1];
                                        return aActive ? 1 : bActive ? -1 : 0;
                                    });

                                    return sortedSegments.map((seg, i) => {
                                        const isActive = score > seg.range[0] && score <= seg.range[1] || (seg.range[0] === 0 && score === 0);
                                        return (
                                            <path
                                                key={i}
                                                d={`M ${getEx(seg.start)},${getEy(seg.start)} A ${radius},${radius} 0 0 1 ${getEx(seg.end)},${getEy(seg.end)}`}
                                                fill="none"
                                                stroke={seg.color}
                                                strokeWidth={isActive ? 16 : 5}
                                                strokeLinecap="round"
                                                style={{ transition: 'stroke-width 0.3s ease' }}
                                                opacity={isActive ? 1 : 0.4}
                                            />
                                        );
                                    });
                                })()}


                                {/* Labels External and Highly spaced */}
                                <g style={{ fontSize: '13px', fill: '#9e9e9e', fontFamily: 'Inter, sans-serif', fontWeight: 'bold' }}>
                                    {(() => {
                                        const centerX = 220;
                                        const centerY = 160;
                                        const labelRadius = 125;
                                        const getLx = (deg) => centerX + labelRadius * Math.cos(deg * Math.PI / 180);
                                        const getLy = (deg) => centerY - labelRadius * Math.sin(deg * Math.PI / 180);

                                        return (
                                            <>
                                                <text x={getLx(180) - 15} y={getLy(180) + 5} textAnchor="end">Venda Forte</text>
                                                <text x={getLx(144) - 5} y={getLy(144) - 5} textAnchor="end">Venda</text>
                                                <text x={getLx(90)} y={getLy(90) - 10} textAnchor="middle">Neutro</text>
                                                <text x={getLx(36) + 5} y={getLy(36) - 5} textAnchor="start">Compra</text>
                                                <text x={getLx(0) + 15} y={getLy(0) + 5} textAnchor="start">Compra Forte</text>
                                            </>
                                        );
                                    })()}
                                </g>

                                {/* Needle Thicker and Lighter Gray */}
                                <g transform={`rotate(${(() => {
                                    const total = sentiment.total || 1;
                                    const score = ((sentiment.buy * 1 + sentiment.neutral * 0.5) / total) * 100;
                                    return 180 + (score / 100) * 180;
                                })()
                                    }, 220, 160)`}>
                                    <line x1="220" y1="160" x2="300" y2="160" stroke="#bdbdbd" strokeWidth="6" strokeLinecap="round" />
                                    <circle cx="220" cy="160" r="7" fill="#bdbdbd" />
                                    <circle cx="220" cy="160" r="3" fill="#eeeeee" />
                                </g>
                            </svg>
                        </div>

                        {/* Text Verdict */}
                        <div className="text-center mt-2">
                            <h2 className={`mb-0 fw-bold`} style={{
                                color: (() => {
                                    const total = sentiment.total || 1;
                                    const score = ((sentiment.buy * 1 + sentiment.neutral * 0.5) / total) * 100;
                                    if (score <= 20) return '#d50000';
                                    if (score <= 40) return '#ff5252';
                                    if (score <= 60) return '#ffc107';
                                    if (score <= 80) return '#00c853'; // Using vibrant green for contrast
                                    return '#00e676';
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
                            <div className="d-flex justify-content-center flex-wrap gap-5 mt-3" style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                <span style={{ color: '#ff5252', whiteSpace: 'nowrap' }}><i className="bi bi-circle-fill me-2"></i>{sentiment.sell} Venda</span>
                                <span style={{ color: '#ffc107', whiteSpace: 'nowrap' }}><i className="bi bi-circle-fill me-2"></i>{sentiment.neutral} Neutro</span>
                                <span style={{ color: '#00c853', whiteSpace: 'nowrap' }}><i className="bi bi-circle-fill me-2"></i>{sentiment.buy} Compra</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StockTable;
