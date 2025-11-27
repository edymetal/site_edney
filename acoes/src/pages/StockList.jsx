import React, { useEffect, useState } from 'react';
import { getStocks } from '../utils/dataUtils';
import StockTable from '../components/StockTable';

const StockList = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getStocks();
                setStocks(data);
            } catch (error) {
                console.error("Error fetching stocks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="loading">Carregando ações...</div>;
    }

    return (
        <div className="page-container">
            <h2 className="section-title">Todas as Ações</h2>
            <StockTable stocks={stocks} />
        </div>
    );
};

export default StockList;
