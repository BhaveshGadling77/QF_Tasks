import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Pause, SkipBack, SkipForward, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const HistoricalStockDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [stockData, setStockData] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Stock symbols to load - update this array with your actual stock symbols
  const STOCK_SYMBOLS = [
    'AA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT',
    'JNJ', 'PG', 'MA', 'HD', 'BAC', 'DIS', 'ADBE', 'CRM', 'NFLX', 'CSCO',
    'PFE', 'ABT', 'TMO', 'COST', 'NKE', 'ABBV', 'MRK', 'AVGO', 'PEP', 'CVX',
    'INTC', 'ORCL', 'ACN', 'CMCSA', 'DHR', 'VZ', 'AMD', 'TXN', 'QCOM', 'UNP',
    'NEE', 'PM', 'HON', 'LOW', 'UPS', 'BMY', 'LIN', 'RTX', 'SBUX', 'T',
    'INTU', 'AMGN', 'ELV', 'SPGI', 'DE', 'GS', 'BLK', 'CAT', 'AXP', 'BKNG',
    'MDLZ', 'GILD', 'TJX', 'MMC', 'SYK', 'ADI', 'VRTX', 'ADP', 'CVS', 'CI',
    'ISRG', 'ZTS', 'LRCX', 'AMT', 'TMUS', 'REGN', 'MO', 'PLD', 'SCHW', 'BDX',
    'NOC', 'ETN', 'DUK', 'CB', 'SO', 'BSX', 'SLB', 'EQIX', 'MU', 'ITW',
    'AON', 'HCA', 'PNC', 'USB', 'APD', 'GE', 'MMM', 'EW', 'CL', 'FCX'
  ];

  // Load stock data from JSON files
  useEffect(() => {
    const loadStockData = async () => {
      try {
        setLoadingFiles(true);
        
        const loadedData = {};
        const availableStocks = [];

        for (const symbol of STOCK_SYMBOLS) {
          try {
            // Fetch JSON file from public/data folder
            const response = await fetch(`/data/${symbol}.json`);
            
            if (!response.ok) {
              console.log(`Could not load ${symbol}.json - Status: ${response.status}`);
              continue;
            }

            const jsonData = await response.json();
            console.log(`Loaded ${symbol}.json`);
            
            // Handle the nested timestamp format
            // Expected structure: { "('Close', 'AA')": { "timestamp": value, ... }, ... }
            
            // Find the Close, Open, High, Low, Volume keys
            const closeKey = Object.keys(jsonData).find(k => k.includes('Close'));
            const openKey = Object.keys(jsonData).find(k => k.includes('Open'));
            const highKey = Object.keys(jsonData).find(k => k.includes('High'));
            const lowKey = Object.keys(jsonData).find(k => k.includes('Low'));
            const volumeKey = Object.keys(jsonData).find(k => k.includes('Volume'));
            
            if (!closeKey) {
              console.log(`${symbol}: Could not find Close data`);
              continue;
            }
            
            const closeData = jsonData[closeKey];
            const openData = jsonData[openKey] || {};
            const highData = jsonData[highKey] || {};
            const lowData = jsonData[lowKey] || {};
            const volumeData = jsonData[volumeKey] || {};
            
            // Get all timestamps and convert to data array
            const timestamps = Object.keys(closeData);
            const data = timestamps.map(timestamp => {
              const date = new Date(parseInt(timestamp));
              return {
                date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
                close: parseFloat(closeData[timestamp]),
                open: parseFloat(openData[timestamp] || closeData[timestamp]),
                high: parseFloat(highData[timestamp] || closeData[timestamp]),
                low: parseFloat(lowData[timestamp] || closeData[timestamp]),
                volume: parseFloat(volumeData[timestamp] || 0)
              };
            }).filter(d => !isNaN(d.close))
              .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date

            console.log(`${symbol}: Parsed ${data.length} valid data rows`);
            
            if (data.length > 0) {
              loadedData[symbol] = data;
              availableStocks.push(symbol);
            }
          } catch (err) {
            console.log(`Error loading ${symbol}:`, err.message);
          }
        }

        if (availableStocks.length === 0) {
          throw new Error('No stock data files found. Make sure JSON files are in the public/data folder.');
        }

        setStockData(loadedData);
        setStocks(availableStocks.sort());
        setSelectedStocks(availableStocks.slice(0, Math.min(5, availableStocks.length)));
        
        // Find common date range
        const allDates = Object.values(loadedData).flatMap(d => d.map(r => r.date));
        const uniqueDates = [...new Set(allDates)].sort();
        setDateRange({ start: uniqueDates[0], end: uniqueDates[uniqueDates.length - 1] });
        
        setLoadingFiles(false);
      } catch (err) {
        console.error('Error loading stock data:', err);
        setError(err.message);
        setLoadingFiles(false);
      }
    };

    loadStockData();
  }, []);

  // Playback control
  useEffect(() => {
    if (isPlaying && selectedStocks.length > 0) {
      const maxLength = Math.max(
        ...selectedStocks.map(s => stockData[s]?.length || 0)
      );

      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= maxLength - 1) {
            setIsPlaying(false);
            return maxLength - 1;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, selectedStocks, stockData]);

  const toggleStock = (symbol) => {
    setSelectedStocks(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const getChartData = () => {
    if (selectedStocks.length === 0) return [];
    
    const data = [];
    const maxLength = Math.max(
      ...selectedStocks.map(s => stockData[s]?.length || 0)
    );
    
    for (let i = 0; i <= Math.min(currentIndex, maxLength - 1); i++) {
      const point = { index: i };
      selectedStocks.forEach(symbol => {
        if (stockData[symbol] && stockData[symbol][i]) {
          point[symbol] = stockData[symbol][i].close;
          point.date = stockData[symbol][i].date;
        }
      });
      data.push(point);
    }
    
    return data;
  };

  const getCurrentMetrics = (symbol) => {
    if (!stockData[symbol] || currentIndex >= stockData[symbol].length) return null;
    
    const current = stockData[symbol][currentIndex];
    const previous = currentIndex > 0 ? stockData[symbol][currentIndex - 1] : current;
    const change = current.close - previous.close;
    const changePercent = (change / previous.close) * 100;
    
    return {
      price: current.close,
      change,
      changePercent,
      volume: current.volume,
      date: current.date
    };
  };

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
  ];

  if (loadingFiles) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center max-w-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Error Loading Data</h2>
          <p className="mb-4">{error}</p>
          <div className="text-left bg-gray-800 p-4 rounded-lg text-sm">
            <p className="font-bold mb-2">Setup Instructions for Vite + React with JSON:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Convert your CSV files to JSON format</li>
              <li>Place JSON files in <code className="bg-gray-700 px-2 py-1 rounded">public/data/</code></li>
              <li>Files should be named like: AA.json, AAPL.json, etc.</li>
              <li>JSON format: <code className="bg-gray-700 px-2 py-1 rounded">[{`{date: "2023-12-11", open: 24.15, high: 24.71, low: 24.07, close: 24.33, volume: 4290700}`}]</code></li>
              <li>Update the STOCK_SYMBOLS array with your symbols</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const currentDate = chartData.length > 0 ? chartData[chartData.length - 1].date : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="text-blue-400" size={40} />
            Historical Stock Data Player
          </h1>
          <p className="text-gray-400">Playing through {stocks.length} stocks</p>
        </div>

        {/* Current Date Display */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Current Date</p>
            <p className="text-3xl font-bold text-blue-400">{currentDate}</p>
            <p className="text-gray-500 text-sm mt-2">
              Day {currentIndex + 1} of {Math.max(...selectedStocks.map(s => stockData[s]?.length || 0))}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value) => {
                  if (!value) return '';
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Legend />
              {selectedStocks.map((symbol, idx) => (
                <Line
                  key={symbol}
                  type="monotone"
                  dataKey={symbol}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  animationDuration={300}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Playback Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setCurrentIndex(0)}
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition"
              title="Reset to start"
            >
              <SkipBack size={24} />
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg transition"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>
            
            <button
              onClick={() => {
                const maxLength = Math.max(...selectedStocks.map(s => stockData[s]?.length || 0));
                setCurrentIndex(maxLength - 1);
              }}
              className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition"
              title="Skip to end"
            >
              <SkipForward size={24} />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Playback Speed: {playbackSpeed}ms per day
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Timeline Position</label>
            <input
              type="range"
              min="0"
              max={Math.max(...selectedStocks.map(s => stockData[s]?.length || 0)) - 1}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Stock Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {selectedStocks.slice(0, 10).map((symbol) => {
            const metrics = getCurrentMetrics(symbol);
            if (!metrics) return null;

            return (
              <div key={symbol} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{symbol}</h3>
                  {metrics.change >= 0 ? (
                    <TrendingUp size={20} className="text-green-400" />
                  ) : (
                    <TrendingDown size={20} className="text-red-400" />
                  )}
                </div>
                <div className="text-2xl font-bold mb-1">
                  ${metrics.price.toFixed(2)}
                </div>
                <div className={`text-sm ${metrics.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.change >= 0 ? '+' : ''}{metrics.change.toFixed(2)} 
                  ({metrics.changePercent.toFixed(2)}%)
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Vol: {(metrics.volume / 1000000).toFixed(2)}M
                </div>
              </div>
            );
          })}
        </div>

        {/* Stock Selection */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Select Stocks to Display</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
            {stocks.map((symbol, idx) => (
              <button
                key={symbol}
                onClick={() => toggleStock(symbol)}
                className={`p-3 rounded-lg font-semibold transition ${
                  selectedStocks.includes(symbol)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                style={selectedStocks.includes(symbol) ? {
                  backgroundColor: colors[selectedStocks.indexOf(symbol) % colors.length]
                } : {}}
              >
                {symbol}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-4">
            {selectedStocks.length} stock{selectedStocks.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoricalStockDashboard;