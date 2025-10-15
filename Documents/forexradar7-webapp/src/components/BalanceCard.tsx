import React from 'react';
import styled from 'styled-components';
import { AppColors, AppSpacing, AppRadius } from '../utils/constants';
import { useTradeContext } from '../context/TradeContext';

const BalanceContainer = styled.div`
  background-color: ${AppColors.surface};
  border-radius: ${AppRadius.md}px;
  padding: ${AppSpacing.lg}px;
  margin-bottom: ${AppSpacing.md}px;
  border: 1px solid ${AppColors.border};
`;

const BalanceAmount = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${AppColors.textPrimary};
  margin-bottom: ${AppSpacing.sm}px;
  font-feature-settings: 'tnum';
`;

const ProfitAmount = styled.div<{ isProfit: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.isProfit ? AppColors.profit : AppColors.loss};
  font-feature-settings: 'tnum';
`;

const RiskInfo = styled.div`
  background-color: ${AppColors.surfaceVariant};
  border-radius: ${AppRadius.sm}px;
  padding: ${AppSpacing.md}px;
  margin-top: ${AppSpacing.md}px;
`;

const Flex = styled.div<{
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  align?: 'flex-start' | 'center' | 'flex-end';
  gap?: number;
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  gap: ${props => props.gap || 0}px;
`;

const Text = styled.span<{
  size?: 'sm' | 'md' | 'lg';
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
  color: ${props => props.color || AppColors.textPrimary};
`;

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatPercent = (percent: number): string => {
  return `${(percent * 100).toFixed(1)}%`;
};

const BalanceCard: React.FC = () => {
  const { state } = useTradeContext();
  const { balance, totalProfit, riskPercent } = state;

  const riskAmount = balance * riskPercent;
  const isProfit = totalProfit >= 0;
  const profitPercentage = balance > 0 ? (totalProfit / balance) * 100 : 0;

  return (
    <BalanceContainer>
      <Flex direction="column" gap={AppSpacing.sm}>
        <Text size="sm" color={AppColors.textSecondary}>
          Account Balance
        </Text>
        <BalanceAmount>
          {formatCurrency(balance)}
        </BalanceAmount>
      </Flex>

      {/* Total Profit/Loss - More prominent display with percentage */}
      <Flex justify="space-between" align="center" style={{ marginTop: AppSpacing.md }}>
        <Text size="md" color={AppColors.textSecondary}>
          Total Profit/Loss:
        </Text>
        <Flex direction="column" align="flex-end">
          <ProfitAmount isProfit={isProfit}>
            {isProfit ? '+' : ''}{formatCurrency(totalProfit)}
          </ProfitAmount>
          <Text size="sm" color={isProfit ? AppColors.profit : AppColors.loss}>
            {isProfit ? '+' : ''}{profitPercentage.toFixed(2)}%
          </Text>
        </Flex>
      </Flex>

      <RiskInfo>
        <Flex justify="space-between" align="center">
          <Text size="sm" color={AppColors.textSecondary}>
            Risk per Trade:
          </Text>
          <Text size="sm">
            {formatPercent(riskPercent)} ({formatCurrency(riskAmount)})
          </Text>
        </Flex>
      </RiskInfo>
    </BalanceContainer>
  );
};

export default BalanceCard;
