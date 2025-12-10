import yfinance as yf
import json as js
tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'WMT',
    'JNJ', 'PG', 'MA', 'HD', 'BAC', 'DIS', 'ADBE', 'CRM', 'NFLX', 'CSCO',
    'PFE', 'ABT', 'TMO', 'COST', 'NKE', 'ABBV', 'MRK', 'AVGO', 'PEP', 'CVX',
    'INTC', 'ORCL', 'ACN', 'CMCSA', 'DHR', 'VZ', 'AMD', 'TXN', 'QCOM', 'UNP',
    'NEE', 'PM', 'HON', 'LOW', 'UPS', 'BMY', 'LIN', 'RTX', 'SBUX', 'T',
    'INTU', 'AMGN', 'ELV', 'SPGI', 'DE', 'GS', 'BLK', 'CAT', 'AXP', 'BKNG',
    'MDLZ', 'GILD', 'TJX', 'MMC', 'SYK', 'ADI', 'VRTX', 'ADP', 'CVS', 'CI',
    'ISRG', 'ZTS', 'LRCX', 'AMT', 'TMUS', 'REGN', 'MO', 'PLD', 'SCHW', 'BDX',
    'NOC', 'ETN', 'DUK', 'CB', 'SO', 'BSX', 'SLB', 'EQIX', 'MU', 'ITW',
    'AON', 'HCA', 'PNC', 'USB', 'APD', 'GE', 'MMM', 'EW', 'CL', 'FCX']

for ticker in tickers:
    data = yf.download(ticker, period="2y")
    file_name = f"./frontend/public/data/{ticker}.json"
    data.to_json(file_name)
    print(f"Downloaded {file_name}")
