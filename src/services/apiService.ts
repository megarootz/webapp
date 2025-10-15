import axios, { AxiosResponse } from 'axios';
import { TradeItem, TradeApiResponse } from '../types/TradeItem';
import { AppConstants } from '../utils/constants';

export class ApiService {
  private static readonly baseUrl = AppConstants.BASE_URL;
  private static readonly timeoutDuration = 45000; // 45 seconds
  private static readonly maxRetries = 5;
  private static readonly initialRetryDelay = 1500;

  /**
   * Fetches the currently running trade (open trade)
   * Returns null if no running trade is found
   */
  static async fetchRunningTrade(): Promise<TradeItem | null> {
    return this.executeWithRetry(async () => {
      try {
        const url = `${this.baseUrl}/api/collections/trades/records?filter=close_price=0&sort=-opened_at&perPage=1`;
        console.log('ApiService: Fetching running trade from:', url);
        
        const response: AxiosResponse<TradeApiResponse> = await axios.get(url, {
          timeout: this.timeoutDuration,
        });

        console.log('ApiService: Running trade response status:', response.status);

        if (response.status !== 200) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = response.data;
        if (!data.items || data.items.length === 0) {
          console.log('ApiService: No running trade found');
          return null;
        }

        const trade = this.parseTradeItem(data.items[0]);
        console.log('ApiService: Running trade found:', trade.ticket);
        return trade;
      } catch (error) {
        console.error('ApiService: Error fetching running trade:', error);
        throw error;
      }
    });
  }

  /**
   * Fetches trade history (closed trades)
   * Returns list of closed trades sorted by close date (newest first)
   */
  static async fetchHistory(perPage: number = 50): Promise<TradeItem[]> {
    return this.executeWithRetry(async () => {
      try {
        // Filter for closed trades (close_price > 0)
        const url = `${this.baseUrl}/api/collections/trades/records?filter=close_price>0&sort=-closed_at&perPage=${perPage}`;
        console.log('ApiService: Fetching history from:', url);
        
        const response: AxiosResponse<TradeApiResponse> = await axios.get(url, {
          timeout: this.timeoutDuration,
        });

        console.log('ApiService: History response status:', response.status);

        if (response.status !== 200) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = response.data;
        if (!data.items) {
          console.log('ApiService: No history data found');
          return [];
        }

        const trades = data.items.map(item => this.parseTradeItem(item));
        console.log(`ApiService: Found ${trades.length} history trades`);
        return trades;
      } catch (error) {
        console.error('ApiService: Error fetching history:', error);
        throw error;
      }
    });
  }

  /**
   * Fetches both running trade and history in parallel
   * Returns a map with 'running' and 'history' keys
   */
  static async fetchAllTrades(historyPerPage: number = 50): Promise<{
    running: TradeItem | null;
    history: TradeItem[];
  }> {
    try {
      const [running, history] = await Promise.all([
        this.fetchRunningTrade(),
        this.fetchHistory(historyPerPage),
      ]);

      return { running, history };
    } catch (error) {
      throw new Error(`Failed to fetch trades: ${error}`);
    }
  }

  /**
   * Tests the API connection
   * Returns true if the API is reachable, false otherwise
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/health`, {
        timeout: 10000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parses a trade item from the API response
   */
  private static parseTradeItem(item: any): TradeItem {
    return {
      pair: item.pair as string,
      side: item.side as 'buy' | 'sell',
      entryPrice: Number(item.entry_price),
      stopLoss: Number(item.stop_loss),
      closePrice: (item.close_price === null || item.close_price === 0) ? undefined : Number(item.close_price),
      openedAt: item.opened_at as string,
      closedAt: (item.closed_at === null || item.closed_at === '') ? undefined : item.closed_at as string,
      ticket: item.ticket as string,
    };
  }

  /**
   * Executes a request with retry logic
   */
  private static async executeWithRetry<T>(
    request: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await request();
    } catch (error: any) {
      // Handle network connection errors
      if (this.isNetworkError(error) && retryCount < this.maxRetries) {
        const delay = this.initialRetryDelay * (retryCount + 1);
        console.log(`ApiService: Network error, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(request, retryCount + 1);
      }

      if (this.isNetworkError(error)) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      throw error;
    }
  }

  /**
   * Checks if an error is a network-related error
   */
  private static isNetworkError(error: any): boolean {
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      error.message?.includes('Connection failed')
    );
  }
}
