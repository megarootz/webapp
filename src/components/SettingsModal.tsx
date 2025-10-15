import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AppColors, AppSpacing, AppRadius } from '../utils/constants';
import { useTradeContext } from '../context/TradeContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
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

const Section = styled.div`
  margin-bottom: ${AppSpacing.xl}px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${AppColors.textPrimary};
  margin-bottom: ${AppSpacing.md}px;
`;

const InputGroup = styled.div`
  margin-bottom: ${AppSpacing.md}px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${AppColors.textSecondary};
  margin-bottom: ${AppSpacing.sm}px;
`;

const Input = styled.input`
  width: 100%;
  padding: ${AppSpacing.md}px;
  border: 1px solid ${AppColors.border};
  border-radius: ${AppRadius.sm}px;
  background-color: ${AppColors.background};
  color: ${AppColors.textPrimary};
  font-size: 16px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${AppColors.accent};
  }

  &::placeholder {
    color: ${AppColors.textMuted};
  }
`;

const InfoBox = styled.div`
  background-color: ${AppColors.accent}22;
  border: 1px solid ${AppColors.accent};
  border-radius: ${AppRadius.sm}px;
  padding: ${AppSpacing.md}px;
  margin-top: ${AppSpacing.sm}px;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: ${AppColors.textSecondary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${AppSpacing.sm}px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${AppSpacing.md}px;
  justify-content: flex-end;
  margin-top: ${AppSpacing.xl}px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${AppSpacing.md}px ${AppSpacing.lg}px;
  border-radius: ${AppRadius.sm}px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => props.variant === 'primary' ? `
    background-color: ${AppColors.accent};
    color: ${AppColors.primary};
    
    &:hover {
      background-color: ${AppColors.accent}dd;
    }
  ` : `
    background-color: ${AppColors.surfaceVariant};
    color: ${AppColors.textSecondary};
    
    &:hover {
      background-color: ${AppColors.border};
      color: ${AppColors.textPrimary};
    }
  `}
`;

const ErrorText = styled.p`
  color: ${AppColors.loss};
  font-size: 14px;
  margin: ${AppSpacing.sm}px 0 0 0;
`;

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { state, setBalance, setRiskPercent } = useTradeContext();
  const [balanceInput, setBalanceInput] = useState(state.balance.toString());
  const [riskInput, setRiskInput] = useState((state.riskPercent * 100).toString());
  const [balanceError, setBalanceError] = useState('');
  const [riskError, setRiskError] = useState('');

  useEffect(() => {
    setBalanceInput(state.balance.toString());
    setRiskInput((state.riskPercent * 100).toString());
  }, [state.balance, state.riskPercent]);

  const validateBalance = (value: string): boolean => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setBalanceError('Please enter a valid balance amount greater than 0');
      return false;
    }
    setBalanceError('');
    return true;
  };

  const validateRisk = (value: string): boolean => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0 || num > 10) {
      setRiskError('Risk percentage must be between 0.1% and 10%');
      return false;
    }
    setRiskError('');
    return true;
  };

  const handleSave = () => {
    const isBalanceValid = validateBalance(balanceInput);
    const isRiskValid = validateRisk(riskInput);

    if (isBalanceValid && isRiskValid) {
      setBalance(parseFloat(balanceInput));
      setRiskPercent(parseFloat(riskInput) / 100);
      onClose();
    }
  };

  const handleCancel = () => {
    setBalanceInput(state.balance.toString());
    setRiskInput((state.riskPercent * 100).toString());
    setBalanceError('');
    setRiskError('');
    onClose();
  };

  const currentRiskAmount = state.balance * state.riskPercent;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Settings</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <Section>
          <SectionTitle>Account Balance</SectionTitle>
          <InputGroup>
            <Label htmlFor="balance">Balance (USD)</Label>
            <Input
              id="balance"
              type="number"
              value={balanceInput}
              onChange={(e) => {
                setBalanceInput(e.target.value);
                if (balanceError) validateBalance(e.target.value);
              }}
              onBlur={() => validateBalance(balanceInput)}
              placeholder="Enter your account balance"
              step="0.01"
              min="0"
            />
            {balanceError && <ErrorText>{balanceError}</ErrorText>}
          </InputGroup>
        </Section>

        <Section>
          <SectionTitle>Risk Management</SectionTitle>
          <InputGroup>
            <Label htmlFor="risk">Risk Percentage per Trade</Label>
            <Input
              id="risk"
              type="number"
              value={riskInput}
              onChange={(e) => {
                setRiskInput(e.target.value);
                if (riskError) validateRisk(e.target.value);
              }}
              onBlur={() => validateRisk(riskInput)}
              placeholder="Enter risk percentage"
              step="0.1"
              min="0.1"
              max="10"
            />
            {riskError && <ErrorText>{riskError}</ErrorText>}
            <InfoBox>
              <InfoText>
                <span>ℹ️</span>
                Current: {(state.riskPercent * 100).toFixed(1)}% = ${currentRiskAmount.toFixed(2)} per trade
              </InfoText>
            </InfoBox>
          </InputGroup>
        </Section>

        <ButtonGroup>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SettingsModal;
