export interface TradeItem {
  pair: string; // e.g., "USDJPY"
  side: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  closePrice?: number; // null if running
  openedAt: string; // ISO string
  closedAt?: string; // ISO string
  ticket: string;
}

export interface TradeApiResponse {
  items: TradeItem[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
