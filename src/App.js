import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_KEY = 'crmhfb1r01qsa2lao270crmhfb1r01qsa2lao27g'; // Replace with your Finnhub API key
const INITIAL_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'FB'];

const StockDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchStockData = useCallback(async (symbol) => {
    try {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      return {
        symbol,
        price: data.c || 0,
        change: data.d || 0,
        changePercent: data.dp || 0,
      };
    } catch (err) {
      console.error(`Error fetching data for ${symbol}:`, err);
      return {
        symbol,
        price: 0,
        change: 0,
        changePercent: 0,
        error: err.message,
      };
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const stockData = await Promise.all(INITIAL_STOCKS.map(fetchStockData));
      setStocks(stockData);
      setFilteredStocks(stockData);
    } catch (err) {
      setError('Failed to fetch initial stock data. Please try again later.');
    }
  }, [fetchStockData]);

  useEffect(() => {
    fetchInitialData();

    // Set up periodic refresh (every 5 minutes)
    const intervalId = setInterval(fetchInitialData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchInitialData]);

  useEffect(() => {
    const filtered = stocks.filter((stock) =>
      stock.symbol.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStocks(filtered);
  }, [search, stocks]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const formatValue = (value) => {
    return value !== null && value !== undefined ? value.toFixed(2) : 'N/A';
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Real-Time Stock Market Dashboard</h1>
      
      {error && (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #F87171', borderRadius: '0.375rem', padding: '1rem', marginBottom: '1rem' }}>
          <p style={{ color: '#B91C1C', fontWeight: 'bold' }}>Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <input
        type="text"
        placeholder="Search stocks..."
        value={search}
        onChange={handleSearch}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem' }}
      />
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F3F4F6' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Symbol</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Price</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Change</th>
              <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Change %</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr key={stock.symbol}>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>{stock.symbol}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #E5E7EB' }}>${formatValue(stock.price)}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #E5E7EB', color: stock.change >= 0 ? 'green' : 'red' }}>
                  {formatValue(stock.change)}
                </td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #E5E7EB', color: stock.changePercent >= 0 ? 'green' : 'red' }}>
                  {formatValue(stock.changePercent)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '2rem', height: '20rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stocks}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="symbol" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="price" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockDashboard;