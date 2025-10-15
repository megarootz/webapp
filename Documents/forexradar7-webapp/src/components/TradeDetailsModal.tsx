import React from 'react';
import styled from 'styled-components';
import { AppColors, AppSpacing, AppRadius } from '../utils/constants';
import { TradeItem } from '../types/TradeItem';
import { useTradeContext } from '../context/TradeContext';
import { PipsCalculator, LotCalculator } from '../utils/calculations';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justifyContent: center;
  z-index: 1000;
  padding: ${AppSpacing.md}px;
`;

const ModalContent = styled.div`
  background-color: ${AppColors.surface};
  border-radius: ${AppRadius.md}px;
  padding: ${AppSpacing.lg}px;
  max-width: 500px;
  width: 100%;
  border: 1px solid ${AppColors.border};
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${AppSpacing.lg}px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${AppColors.textPrimary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${AppColors.textSecondary};
  font-size: 24px;
  cursor: pointer;
  padding: ${AppSpacing.xs}px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${AppColors.surfaceVariant};
    color: ${AppColors.textPrimary};
  }
`;

const TradeSide = styled.span<{ side: 'buy' | 'sell' }>`
  background-color: ${props => props.side === 'buy' ? AppColors.buy : AppColors.sell};
  color: ${AppColors.white};
  padding: ${AppSpacing.xs}px ${AppSpacing.sm}px;
  border-radius: ${AppRadius.sm}px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-right: ${AppSpacing.sm}px;
`;

const StatusBadge = styled.span<{ isOpen: boolean }>`
  background-color: ${props => props.isOpen ? AppColors.info : AppColors.surfaceVariant};
  color: ${props => props.isOpen ? AppColors.white : AppColors.textSecondary};
  padding: ${AppSpacing.xs}px ${AppSpacing.sm}px;
  border-radius: ${AppRadius.sm}px;
  font-size: 12px;
  font-weight: 500;
`;

const Section = styled.div`
  margin-bottom: ${AppSpacing.lg}px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${AppColors.textPrimary};
  margin-bottom: ${AppSpacing.md}px;
  border-bottom: 1px solid ${AppColors.border};
  padding-bottom: ${AppSpacing.sm}px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${AppSpacing.sm}px 0;
  border-bottom: 1px solid ${AppColors.border}22;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  color: ${AppColors.textSecondary};
  font-weight: 500;
`;

const DetailValue = styled.span<{ 
  color?: string;
  weight?: 'normal' | 'semibold' | 'bold';
  size?: 'sm' | 'md' | 'lg';
}>`
  font-size: ${props => {
    switch (props.size) {
      case 'sm': return '14px';
      case 'md': return '16px';
      case 'lg': return '18px';
      default: return '14px';
    }
  }};
  font-weight: ${props => {
    switch (props.weight) {
      case 'semibold': return '600';
      case 'bold': return '700';
      default: return '400';
    }
  }};
  color: ${props => props.color || AppColors.textPrimary};
  font-feature-settings: 'tnum';
`;

const ProfitDisplay = styled.div<{ isProfit: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.isProfit ? AppColors.profit : AppColors.loss};
  font-feature-settings: 'tnum';
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

interface TradeDetailsModalProps {
  trade: TradeItem;
  onClose: () => void;
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
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
};

const TradeDetailsModal: React.FC<TradeDetailsModalProps> = ({ trade, onClose }) => {
  const { getLotForTrade } = useTradeContext();
  
  const isOpen = trade.closePrice === undefined;
  const lot = getLotForTrade(trade);
  const slPips = PipsCalculator.slPips(trade.entryPrice, trade.stopLoss);
  const pipValue = LotCalculator.pipValue(trade.entryPrice);
  
  let resultPips = 0;
  let profitUsd = 0;
  
  if (!isOpen && trade.closePrice) {
    resultPips = PipsCalculator.resultPips(trade.closePrice, trade.entryPrice, trade.side);
    profitUsd = LotCalculator.profitUsd(lot, trade.entryPrice, resultPips);
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Trade Details - {trade.pair}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        {/* Trade Overview */}
        <Section>
          <Flex justify="space-between" align="center">
            <Flex align="center">
              <TradeSide side={trade.side}>{trade.side}</TradeSide>
              <DetailValue size="lg" weight="bold">{trade.pair}</DetailValue>
            </Flex>
            <StatusBadge isOpen={isOpen}>
              {isOpen ? 'OPEN' : 'CLOSED'}
            </StatusBadge>
          </Flex>
        </Section>

        {/* Trade Information */}
        <Section>
          <SectionTitle>Trade Information</SectionTitle>
          <DetailRow>
            <DetailLabel>Ticket #:</DetailLabel>
            <DetailValue>{trade.ticket}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Entry Price:</DetailLabel>
            <DetailValue size="md" weight="semibold">{formatPrice(trade.entryPrice)}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Stop Loss:</DetailLabel>
            <DetailValue size="md" weight="semibold">{formatPrice(trade.stopLoss)}</DetailValue>
          </DetailRow>
          {!isOpen && trade.closePrice && (
            <DetailRow>
              <DetailLabel>Close Price:</DetailLabel>
              <DetailValue size="md" weight="semibold">{formatPrice(trade.closePrice)}</DetailValue>
            </DetailRow>
          )}
          <DetailRow>
            <DetailLabel>Opened (broker time):</DetailLabel>
            <DetailValue>{formatDateTime(trade.openedAt)}</DetailValue>
          </DetailRow>
          {!isOpen && trade.closedAt && (
            <DetailRow>
              <DetailLabel>Closed (broker time):</DetailLabel>
              <DetailValue>{formatDateTime(trade.closedAt)}</DetailValue>
            </DetailRow>
          )}
        </Section>

        {/* Calculations */}
        <Section>
          <SectionTitle>Calculations</SectionTitle>
          <DetailRow>
            <DetailLabel>SL Pips:</DetailLabel>
            <DetailValue weight="semibold">{slPips.toFixed(1)}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Recommended Lot:</DetailLabel>
            <DetailValue weight="semibold">{lot.toFixed(2)}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Pip Value:</DetailLabel>
            <DetailValue weight="semibold">{formatCurrency(pipValue)}</DetailValue>
          </DetailRow>
        </Section>

        {/* Results (only for closed trades) */}
        {!isOpen && trade.closePrice && (
          <Section>
            <SectionTitle>Results</SectionTitle>
            <DetailRow>
              <DetailLabel>Result Pips:</DetailLabel>
              <DetailValue 
                weight="semibold" 
                color={resultPips >= 0 ? AppColors.profit : AppColors.loss}
              >
                {resultPips >= 0 ? '+' : ''}{resultPips.toFixed(1)}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Profit/Loss:</DetailLabel>
              <ProfitDisplay isProfit={profitUsd >= 0}>
                {profitUsd >= 0 ? '+' : ''}{formatCurrency(profitUsd)}
              </ProfitDisplay>
            </DetailRow>
          </Section>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default TradeDetailsModal;
