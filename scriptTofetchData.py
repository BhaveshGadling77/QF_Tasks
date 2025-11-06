import yfinance as yf
import json as js
tickers = ["OEDV" , "AAPL" , "BAC", "AMZN" , "T" , "GOOG" , "MO", "DAL",  "AA",  "AXP",  "ABT" , "UA",  "AMAT" 
                , "AMGN" , "AAL", "AIG", "ALL", "ADBE", "GOOGL", "ACN", "ABBV", "MT",  "LLY", "AGN", "APA",
                "ADP", "APC", "AKAM", "NLY", "ABX", "ATVI", "ADSK", "ADM", "BMH.AX", "WBA", "ARNA", "LUV", 
                "ACAD", "PANW", "AMD", "AET", "AEP", "ALXN", "CLMS", "AVGO", "EA", "DB", "RAI", "AEM", "NVS"]

for ticker in tickers:
    data = yf.download(ticker, period="2y")
    file_name = f"./data/{ticker}.json"
    data.to_json(file_name)
    print(f"Downloaded {file_name}")
