// Trading calculation utilities - exact replicas from Android app

export class PositionCalculator {
  // Constants for USDJPY calculations
  static readonly pipMultiplier = 100; // For JPY pairs: 1 pip = 0.01
  static readonly defaultRiskPercent = 0.01; // 1%
  static readonly defaultLotStep = 0.01;
  static readonly defaultMinLot = 0.01;
  static readonly defaultMaxLot = 100.0; // Updated to match Android app

  /**
   * Computes stop loss distance in pips
   * For USDJPY: pip = 0.01, so multiply price difference by 100
   * Returns absolute value rounded to 1 decimal place
   */
  static computeSlPips(entry: number, sl: number): number {
    const pips = Math.abs(entry - sl) * this.pipMultiplier;
    return Math.round(pips * 10) / 10;
  }

  /**
   * Computes result pips for a closed trade
   * BUY: (close - entry) * 100
   * SELL: (entry - close) * 100
   * Returns value rounded to 1 decimal place (can be negative for losses)
   */
  static computeResultPips(entry: number, close: number, side: string): number {
    const pips = side.toLowerCase() === 'buy' 
        ? (close - entry) * this.pipMultiplier
        : (entry - close) * this.pipMultiplier;
    return Math.round(pips * 10) / 10;
  }

  /**
   * Computes pip value per lot for USDJPY
   * Formula: pip_value = 1000 / entry_price
   */
  static computePipValuePerLot(entry: number): number {
    return 1000.0 / entry;
  }

  /**
   * Computes position size based on risk management
   * Formula: lot = (balance * risk_pct) / (sl_pips * pip_value_per_lot)
   */
  static computeLot(
    balance: number,
    slPips: number,
    entry: number,
    options: {
      riskPct?: number;
      step?: number;
      minLot?: number;
      maxLot?: number;
    } = {}
  ): number {
    const {
      riskPct = this.defaultRiskPercent,
      step = this.defaultLotStep,
      minLot = this.defaultMinLot,
      maxLot = this.defaultMaxLot,
    } = options;

    // Validate inputs
    if (slPips <= 0 || balance <= 0 || entry <= 0) {
      return minLot;
    }

    // Calculate pip value per lot
    const pipValuePerLot = this.computePipValuePerLot(entry);
    
    // Calculate raw lot size based on risk
    const riskAmount = balance * riskPct;
    const rawLot = riskAmount / (slPips * pipValuePerLot);
    
    // Round to step
    const steppedLot = Math.round(rawLot / step) * step;
    
    // Clamp to broker limits
    const clampedLot = Math.max(minLot, Math.min(maxLot, steppedLot));
    
    // Return with proper precision
    return Math.round(clampedLot * 100) / 100;
  }

  /**
   * Computes profit/loss for a closed trade
   * Formula: pl = result_pips * pip_value_per_lot * lot
   */
  static computePl(entry: number, close: number, side: string, lot: number): number {
    const resultPips = this.computeResultPips(entry, close, side);
    const pipValuePerLot = this.computePipValuePerLot(entry);
    
    return resultPips * pipValuePerLot * lot;
  }
}

export class PipsCalculator {
  /**
   * Calculates the result pips for a closed trade
   * Returns positive pips for profitable trades, negative for losses
   */
  static resultPips(closePrice: number, entryPrice: number, side: string): number {
    const signed = side.toLowerCase() === 'buy'
        ? (closePrice - entryPrice)
        : (entryPrice - closePrice);
    return signed * 100.0; // Convert to pips for JPY pairs
  }

  /**
   * Calculates the stop loss distance in pips
   * Returns the absolute distance in pips
   */
  static slPips(entryPrice: number, stopLoss: number): number {
    return Math.abs(entryPrice - stopLoss) * 100.0;
  }
}

export class LotCalculator {
  static readonly maxRecommendedLot = 100.00; // Updated to match Android app
  static readonly defaultRiskPercent = 0.01;

  /**
   * Calculates the recommended lot size based on risk baseline
   * Formula: lot = (balance * risk_pct * entryPrice) / (slPips * 1000)
   */
  static lotSize(
    balance: number,
    entryPrice: number,
    slPips: number,
    riskPercent: number = this.defaultRiskPercent
  ): number {
    if (slPips <= 0 || balance <= 0 || entryPrice <= 0) return 0;
    
    const calculatedLot = (balance * riskPercent * entryPrice) / (slPips * 1000.0);
    
    // Cap the lot size to prevent excessive risk
    return calculatedLot > this.maxRecommendedLot ? this.maxRecommendedLot : calculatedLot;
  }

  /**
   * Calculates the pip value for a given entry price
   * Formula: pipValue = 1000 / entryPrice
   */
  static pipValue(entryPrice: number): number {
    if (entryPrice <= 0) return 0;
    return 1000.0 / entryPrice;
  }

  /**
   * Calculates the profit/loss in USD
   * Formula: pl = lot * pipValue * resultPips
   */
  static profitUsd(lot: number, entryPrice: number, resultPips: number): number {
    if (lot <= 0 || entryPrice <= 0) return 0;
    return lot * this.pipValue(entryPrice) * resultPips;
  }

  /**
   * Calculates the maximum risk amount in USD for a given balance and risk percentage
   */
  static maxRiskAmount(balance: number, riskPercent: number = this.defaultRiskPercent): number {
    return balance * riskPercent;
  }
}
