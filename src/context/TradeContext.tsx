import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { TradeItem } from '../types/TradeItem';
import { ApiService } from '../services/apiService';
import { AppConstants } from '../utils/constants';
import { PositionCalculator } from '../utils/calculations';

interface TradeState {
  runningTrade: TradeItem | null;
  history: TradeItem[];
  balance: number;
  riskPercent: number;
  totalProfit: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

type TradeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRADES'; payload: { running: TradeItem | null; history: TradeItem[] } }
  | { type: 'SET_BALANCE'; payload: number }
  | { type: 'SET_RISK_PERCENT'; payload: number }
  | { type: 'CALCULATE_TOTAL_PROFIT' };

const initialState: TradeState = {
  runningTrade: null,
  history: [],
  balance: AppConstants.DEFAULT_BALANCE,
  riskPercent: AppConstants.DEFAULT_RISK_PERCENT,
  totalProfit: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

function tradeReducer(state: TradeState, action: TradeAction): TradeState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_TRADES':
      return {
        ...state,
        runningTrade: action.payload.running,
        history: action.payload.history,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
      };
    
    case 'SET_BALANCE':
      return { ...state, balance: action.payload };
    
    case 'SET_RISK_PERCENT':
      return { ...state, riskPercent: action.payload };
    
    case 'CALCULATE_TOTAL_PROFIT':
      let totalProfit = 0;
      
      // Only calculate if we have history data
      if (state.history.length > 0) {
        for (const trade of state.history) {
          if (trade.closePrice !== undefined) {
            try {
              const slPips = PositionCalculator.computeSlPips(trade.entryPrice, trade.stopLoss);
              const lot = PositionCalculator.computeLot(
                state.balance,
                slPips,
                trade.entryPrice,
                { riskPct: state.riskPercent }
              );
              const pl = PositionCalculator.computePl(
                trade.entryPrice,
                trade.closePrice,
                trade.side,
                lot
              );
              totalProfit += pl;
            } catch (e) {
              console.error(`Error calculating P/L for trade ${trade.ticket}:`, e);
            }
          }
        }
      }
      
      return { ...state, totalProfit };
    
    default:
      return state;
  }
}

interface TradeContextType {
  state: TradeState;
  fetchTrades: () => Promise<void>;
  setBalance: (balance: number) => void;
  setRiskPercent: (percent: number) => void;
  getLotForTrade: (trade: TradeItem) => number;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tradeReducer, initialState);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedBalance = localStorage.getItem('forexradar7_balance');
    const savedRiskPercent = localStorage.getItem('forexradar7_risk_percent');
    
    if (savedBalance) {
      dispatch({ type: 'SET_BALANCE', payload: parseFloat(savedBalance) });
    }
    
    if (savedRiskPercent) {
      dispatch({ type: 'SET_RISK_PERCENT', payload: parseFloat(savedRiskPercent) });
    }
  }, []);

  // Recalculate total profit when balance, risk percent, or history changes
  useEffect(() => {
    dispatch({ type: 'CALCULATE_TOTAL_PROFIT' });
  }, [state.balance, state.riskPercent, state.history]);

  // Auto-refresh trades every 30 seconds
  useEffect(() => {
    fetchTrades(); // Initial fetch
    
    const interval = setInterval(() => {
      fetchTrades();
    }, AppConstants.AUTO_REFRESH_SEC * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchTrades = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const { running, history } = await ApiService.fetchAllTrades(AppConstants.HISTORY_PER_PAGE);
      
      dispatch({ type: 'SET_TRADES', payload: { running, history } });
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch trades' });
    }
  };

  const setBalance = (balance: number) => {
    dispatch({ type: 'SET_BALANCE', payload: balance });
    localStorage.setItem('forexradar7_balance', balance.toString());
  };

  const setRiskPercent = (percent: number) => {
    dispatch({ type: 'SET_RISK_PERCENT', payload: percent });
    localStorage.setItem('forexradar7_risk_percent', percent.toString());
  };

  const getLotForTrade = (trade: TradeItem): number => {
    try {
      const slPips = PositionCalculator.computeSlPips(trade.entryPrice, trade.stopLoss);
      return PositionCalculator.computeLot(
        state.balance,
        slPips,
        trade.entryPrice,
        { riskPct: state.riskPercent }
      );
    } catch (e) {
      console.error(`Error calculating lot for trade ${trade.ticket}:`, e);
      return 0.01; // Return minimum lot as fallback
    }
  };

  const value: TradeContextType = {
    state,
    fetchTrades,
    setBalance,
    setRiskPercent,
    getLotForTrade,
  };

  return (
    <TradeContext.Provider value={value}>
      {children}
    </TradeContext.Provider>
  );
}

export function useTradeContext() {
  const context = useContext(TradeContext);
  if (context === undefined) {
    throw new Error('useTradeContext must be used within a TradeProvider');
  }
  return context;
}
