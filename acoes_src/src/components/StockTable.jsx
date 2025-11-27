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
                                <td className="text-right font-mono">{(stock.marketCap / 1e9).toFixed(2)}B</td>
                            </tr>
                        ))}
                        {filteredStocks.length === 0 && (
                            <tr>
                                <td colSpan="10" className="text-center py-4">Nenhuma ação encontrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default StockTable;
