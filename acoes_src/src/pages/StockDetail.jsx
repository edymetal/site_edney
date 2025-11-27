import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStockByTicker } from '../utils/dataUtils';
import StockChart from '../components/StockChart';
import '../styles/StockDetail.css';

const StockDetail = () => {
    const { ticker } = useParams();
    const [stock, setStock] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getStockByTicker(ticker);
                setStock(data);
            } catch (err) {
                setError("Ação não encontrada.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [ticker]);

    if (loading) return <div className="loading">Carregando detalhes...</div>;
    if (error) return <div className="error-message">{error} <Link to="/stocks">Voltar</Link></div>;
    if (!stock) return null;

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatLargeNumber = (num) => {
        if (num >= 1.0e+12) return (num / 1.0e+12).toFixed(2) + " T";
        if (num >= 1.0e+9) return (num / 1.0e+9).toFixed(2) + " B";
        return num;
    };

    const isPositive = stock.changePercent >= 0;
    const chartColor = isPositive ? '#10b981' : '#ef4444';

    return (
        <div className="detail-container">
            <div className="detail-header">
                <div className="header-title">
                    <Link to="/stocks" className="back-link"><i className="bi bi-arrow-left"></i> Voltar</Link>
                    <div className="title-with-logo">
                        <img
                            src={`https://financialmodelingprep.com/image-stock/${stock.ticker}.png`}
                            alt={stock.ticker}
                            className="company-logo-lg"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                        <h1>{stock.name} <span className="ticker-badge">{stock.ticker}</span></h1>
                    </div>
                    <span className="sector-tag">{stock.sector}</span>
                </div>
                <div className="header-price">
                    <div className="current-price">{formatCurrency(stock.price)}</div>
                    <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? <i className="bi bi-caret-up-fill"></i> : <i className="bi bi-caret-down-fill"></i>}
                        {Math.abs(stock.change).toFixed(2)} ({stock.changePercent}%)
                    </div>
                </div>
            </div>

            <div className="detail-grid">
                {/* Main Chart Section */}
                <div className="card chart-section">
                    <h3>Histórico de Preços (1 Ano)</h3>
                    <StockChart data={stock.history} color={chartColor} />
                </div>

                {/* Financial Cards */}
                <div className="financial-grid">
                    <div className="card stat-card">
                        <div className="stat-icon"><i className="bi bi-building"></i></div>
                        <div className="stat-content">
                            <span className="stat-label">Cap. Mercado</span>
                            <span className="stat-value">${formatLargeNumber(stock.marketCap)}</span>
                        </div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon"><i className="bi bi-graph-up"></i></div>
                        <div className="stat-content">
                            <span className="stat-label">P/L (P/E)</span>
                            <span className="stat-value">{stock.pe}</span>
                        </div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon"><i className="bi bi-cash-coin"></i></div>
                        <div className="stat-content">
                            <span className="stat-label">Div. Yield</span>
                            <span className="stat-value">{stock.dividendYield}%</span>
                        </div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon"><i className="bi bi-arrow-up-circle"></i></div>
                        <div className="stat-content">
                            <span className="stat-label">Máxima 52s</span>
                            <span className="stat-value">{formatCurrency(stock.high52)}</span>
                        </div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon"><i className="bi bi-arrow-down-circle"></i></div>
                        <div className="stat-content">
                            <span className="stat-label">Mínima 52s</span>
                            <span className="stat-value">{formatCurrency(stock.low52)}</span>
                        </div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon"><i className="bi bi-receipt"></i></div>
                        <div className="stat-content">
                            <span className="stat-label">Preço/Vendas</span>
                            <span className="stat-value">{(stock.pe * 0.15).toFixed(2)}</span> {/* Mock calc */}
                        </div>
                    </div>
                </div>

                {/* Business Summary */}
                <div className="card summary-section">
                    <h3>Sobre a Empresa</h3>
                    <p>{stock.description}</p>
                    <div className="summary-tags">
                        <span className="tag">Setor: {stock.sector}</span>
                        <span className="tag">Indústria: Variada</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetail;
