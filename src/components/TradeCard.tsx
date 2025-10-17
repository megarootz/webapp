import React, { useState } from 'react';
import styled from 'styled-components';
import { AppColors, AppSpacing, AppRadius } from '../utils/constants';
import { TradeItem } from '../types/TradeItem';
import { useTradeContext } from '../context/TradeContext';
import { PipsCalculator, LotCalculator } from '../utils/calculations';
import TradeDetailsModal from './TradeDetailsModal';

const TradeContainer = styled.div`
  background-color: ${AppColors.surface};
  border-radius: ${AppRadius.md}px;
  padding: ${AppSpacing.md}px;
  margin-bottom: ${AppSpacing.md}px;
  border: 1px solid ${AppColors.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${AppColors.borderLight};
    background-color: ${AppColors.surfaceVariant};
  }
`;

const TradeHeader = styled.div`
  margin-bottom: ${AppSpacing.md}px;
`;

const TradeSide = styled.span<{ side: 'buy' | 'sell' }>`
  background-color: ${props => props.side === 'buy' ? AppColors.buy : AppColors.sell};
  color: ${AppColors.white};
  padding: ${AppSpacing.xs}px ${AppSpacing.sm}px;
  border-radius: ${AppRadius.sm}px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const PriceDisplay = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${AppColors.textPrimary};
  font-feature-settings: 'tnum';
  margin: ${AppSpacing.sm}px 0;
`;

const ProfitDisplay = styled.div<{ isProfit: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.isProfit ? AppColors.profit : AppColors.loss};
  font-feature-settings: 'tnum';
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${AppSpacing.xs}px 0;
`;

const StatusBadge = styled.span<{ isOpen: boolean }>`
  background-color: ${props => props.isOpen ? AppColors.info : AppColors.surfaceVariant};
  color: ${props => props.isOpen ? AppColors.white : AppColors.textSecondary};
  padding: ${AppSpacing.xs}px ${AppSpacing.sm}px;
  border-radius: ${AppRadius.sm}px;
  font-size: 12px;
  font-weight: 500;
`;

const Flex = styled.div<{
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  align?: 'flex-start' | 'center' | 'flex-end';
  gap?: number;
}>`
  display: flex;
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  gap: ${props => props.gap || 0}px;
`;

const Text = styled.span<{
  size?: 'sm' | 'md' | 'lg';
  weight?: 'normal' | 'semibold';
  color?: string;
}>`
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return '14px';
      case 'md': return '16px';
      case 'lg': return '18px';
      default: return '14px';
    }
  }};
  font-weight: ${props => props.weight === 'semibold' ? '600' : '400'};
  color: ${props => props.color || AppColors.textPrimary};
`;

interface TradeCardProps {
  trade: TradeItem;
  showProfit?: boolean;
}

const formatPrice = (price: number): string => {
  return price.toFixed(3);
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDateTime = (dateString: string): string => {
  // Parse the date string manually to avoid timezone conversion
  // Expected format: "2024-12-17T14:30:45.123Z" or "2024-12-17T14:30:45"
  const cleanDateString = dateString.replace('Z', '').replace('T', ' ');
  const [datePart, timePart] = cleanDateString.split(' ');

  if (!datePart || !timePart) {
    return dateString; // Return original if parsing fails
  }

  const [, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');

  // Create month names array
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthName = monthNames[parseInt(month) - 1];

  // Format: "Dec 17, 14:30"
  const formattedHour = hour.padStart(2, '0');
  const formattedMinute = minute.padStart(2, '0');

  return `${monthName} ${parseInt(day)}, ${formattedHour}:${formattedMinute}`;
};

const TradeCard: React.FC<TradeCardProps> = ({ trade, showProfit = false }) => {
  const { getLotForTrade } = useTradeContext();
  const [showDetails, setShowDetails] = useState(false);
  
  const isOpen = trade.closePrice === undefined;
  const lot = getLotForTrade(trade);
  const slPips = PipsCalculator.slPips(trade.entryPrice, trade.stopLoss);
  
  let resultPips = 0;
  let profitUsd = 0;
  
  if (!isOpen && trade.closePrice) {
    resultPips = PipsCalculator.resultPips(trade.closePrice, trade.entryPrice, trade.side);
    profitUsd = LotCalculator.profitUsd(lot, trade.entryPrice, resultPips);
  }

  const handleCardClick = () => {
    setShowDetails(true);
  };

  return (
    <>
      <TradeContainer onClick={handleCardClick}>
        <TradeHeader>
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={AppSpacing.sm}>
              <TradeSide side={trade.side}>{trade.side}</TradeSide>
              <Text size="lg" weight="semibold">{trade.pair}</Text>
            </Flex>
            <StatusBadge isOpen={isOpen}>
              {isOpen ? 'OPEN' : 'CLOSED'}
            </StatusBadge>
          </Flex>
        </TradeHeader>

        <PriceDisplay>
          {formatPrice(trade.entryPrice)}
        </PriceDisplay>

        <DetailRow>
          <Text size="sm" color={AppColors.textSecondary}>Stop Loss:</Text>
          <Text size="sm">{formatPrice(trade.stopLoss)}</Text>
        </DetailRow>

        <DetailRow>
          <Text size="sm" color={AppColors.textSecondary}>SL Pips:</Text>
          <Text size="sm">{slPips.toFixed(1)}</Text>
        </DetailRow>

        <DetailRow>
          <Text size="sm" color={AppColors.textSecondary}>Lot Size:</Text>
          <Text size="sm">{lot.toFixed(2)}</Text>
        </DetailRow>

        {!isOpen && trade.closePrice && (
          <>
            <DetailRow>
              <Text size="sm" color={AppColors.textSecondary}>Close Price:</Text>
              <Text size="sm">{formatPrice(trade.closePrice)}</Text>
            </DetailRow>
            
            {showProfit && (
              <>
                <DetailRow>
                  <Text size="sm" color={AppColors.textSecondary}>Result Pips:</Text>
                  <Text size="sm" color={resultPips >= 0 ? AppColors.profit : AppColors.loss}>
                    {resultPips >= 0 ? '+' : ''}{resultPips.toFixed(1)}
                  </Text>
                </DetailRow>
                
                <DetailRow>
                  <Text size="sm" color={AppColors.textSecondary}>Profit/Loss:</Text>
                  <ProfitDisplay isProfit={profitUsd >= 0}>
                    {profitUsd >= 0 ? '+' : ''}{formatCurrency(profitUsd)}
                  </ProfitDisplay>
                </DetailRow>
              </>
            )}
          </>
        )}

        <DetailRow>
          <Text size="sm" color={AppColors.textSecondary}>
            {isOpen ? 'Opened' : 'Closed'} (broker time):
          </Text>
          <Text size="sm">
            {formatDateTime(isOpen ? trade.openedAt : (trade.closedAt || trade.openedAt))}
          </Text>
        </DetailRow>
      </TradeContainer>

      {showDetails && <TradeDetailsModal trade={trade} onClose={() => setShowDetails(false)} />}
    </>
  );
};

export default TradeCard;
