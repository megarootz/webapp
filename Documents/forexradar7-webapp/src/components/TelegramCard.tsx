import React from 'react';
import styled from 'styled-components';
import { AppColors, AppSpacing, AppRadius } from '../utils/constants';

const TelegramContainer = styled.div`
  background-color: ${AppColors.surface};
  border-radius: ${AppRadius.md}px;
  padding: ${AppSpacing.md}px;
  margin-bottom: ${AppSpacing.md}px;
  border: 1px solid ${AppColors.border};
`;

const TelegramIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: #0088cc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  margin-right: ${AppSpacing.md}px;
`;

const Flex = styled.div<{
  align?: 'flex-start' | 'center' | 'flex-end';
}>`
  display: flex;
  align-items: ${props => props.align || 'stretch'};
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
  margin-bottom: ${props => props.size === 'md' ? AppSpacing.xs : 0}px;
`;

const Button = styled.button`
  background-color: ${AppColors.accent};
  color: ${AppColors.primary};
  border: none;
  padding: ${AppSpacing.sm}px ${AppSpacing.md}px;
  border-radius: ${AppRadius.sm}px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${AppColors.accent}dd;
  }
`;

const TelegramCard: React.FC = () => {
  const handleJoinTelegram = () => {
    window.open('https://t.me/forexradar7', '_blank', 'noopener,noreferrer');
  };

  return (
    <TelegramContainer>
      <Flex align="center">
        <TelegramIcon>📱</TelegramIcon>
        <div style={{ flex: 1 }}>
          <Text size="md" weight="semibold" style={{ display: 'block', marginBottom: AppSpacing.xs }}>
            Get Instant Notifications
          </Text>
          <Text size="sm" color={AppColors.textSecondary} style={{ display: 'block', marginBottom: AppSpacing.sm }}>
            Join our Telegram channel for real-time trading entry alerts
          </Text>
          <Button onClick={handleJoinTelegram}>
            Join Telegram Channel
          </Button>
        </div>
      </Flex>
    </TelegramContainer>
  );
};

export default TelegramCard;
