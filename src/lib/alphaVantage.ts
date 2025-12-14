const API_KEY = "7D8SE8X42I3UU1BY";
const BASE_URL = "https://www.alphavantage.co/query";

export interface StockDataPoint {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  latestTradingDay: string;
}

// Fetch daily stock data (last 100 days)
export async function fetchDailyStockData(
  symbol: string = "SPY"
): Promise<StockDataPoint[]> {
  try {
    const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data["Error Message"]) {
      throw new Error(data["Error Message"]);
    }

    if (data["Note"]) {
      // API rate limit reached
      console.warn("Alpha Vantage API rate limit:", data["Note"]);
      return [];
    }

    const timeSeries = data["Time Series (Daily)"];
    if (!timeSeries) {
      return [];
    }

    const stockData: StockDataPoint[] = Object.entries(timeSeries)
      .map(([dateStr, values]: [string, any]) => {
        // Parse date properly to avoid timezone issues
        // dateStr format is "YYYY-MM-DD"
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day, 12, 0, 0); // Set to noon to avoid timezone issues
        
        return {
          date,
          open: parseFloat(values["1. open"]),
          high: parseFloat(values["2. high"]),
          low: parseFloat(values["3. low"]),
          close: parseFloat(values["4. close"]),
          volume: parseInt(values["5. volume"]),
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Return last 60 days of available data
    return stockData.slice(-60);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return [];
  }
}

// Fetch real-time quote
export async function fetchStockQuote(
  symbol: string = "SPY"
): Promise<StockQuote | null> {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data["Error Message"]) {
      throw new Error(data["Error Message"]);
    }

    if (data["Note"]) {
      console.warn("Alpha Vantage API rate limit:", data["Note"]);
      return null;
    }

    const quote = data["Global Quote"];
    if (!quote || Object.keys(quote).length === 0) {
      return null;
    }

    return {
      symbol: quote["01. symbol"],
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"]?.replace("%", "")),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      volume: parseInt(quote["06. volume"]),
      latestTradingDay: quote["07. latest trading day"],
    };
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return null;
  }
}

// Popular stock symbols
export const STOCK_SYMBOLS = [
  { symbol: "SPY", name: "S&P 500 ETF" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF" },
  { symbol: "DIA", name: "Dow Jones ETF" },
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "GOOGL", name: "Google" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "TSLA", name: "Tesla" },
];
