import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { AppColors, AppSpacing, AppRadius } from './utils/constants';
import { TradeProvider, useTradeContext } from './context/TradeContext';
import BalanceCard from './components/BalanceCard';
import TelegramCard from './components/TelegramCard';
import TradeCard from './components/TradeCard';
import SettingsModal from './components/SettingsModal';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${AppColors.background};
    color: ${AppColors.textPrimary};
    line-height: 1.5;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${AppSpacing.md}px;
`;

const Header = styled.header`
  background-color: ${AppColors.background};
  padding: ${AppSpacing.md}px 0;
  border-bottom: 1px solid ${AppColors.border};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${AppSpacing.md}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: ${AppColors.textPrimary};
`;

const SettingsButton = styled.button`
  background: none;
  border: none;
  color: ${AppColors.textSecondary};
  font-size: 20px;
  padding: ${AppSpacing.sm}px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${AppColors.surface};
    color: ${AppColors.textPrimary};
  }
`;

const HomeContainer = styled.div`
  min-height: calc(100vh - 80px);
  background-color: ${AppColors.background};
  padding: ${AppSpacing.md}px 0;
`;

const Section = styled.section`
  margin-bottom: ${AppSpacing.xl}px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${AppColors.textPrimary};
  margin-bottom: ${AppSpacing.md}px;
  padding: 0 ${AppSpacing.md}px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${AppSpacing.xl}px;
  background-color: ${AppColors.surface};
  border-radius: ${AppRadius.md}px;
  border: 1px solid ${AppColors.border};
  margin: 0 ${AppSpacing.md}px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${AppColors.border};
  border-top: 3px solid ${AppColors.accent};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: ${AppSpacing.lg}px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background-color: ${AppColors.loss}22;
  border: 1px solid ${AppColors.loss};
  color: ${AppColors.loss};
  padding: ${AppSpacing.md}px;
  border-radius: ${AppRadius.sm}px;
  margin: ${AppSpacing.md}px;
  text-align: center;
`;

const RefreshButton = styled.button`
  background-color: ${AppColors.accent};
  color: ${AppColors.primary};
  border: none;
  padding: ${AppSpacing.sm}px ${AppSpacing.md}px;
  border-radius: ${AppRadius.sm}px;
  font-weight: 600;
  cursor: pointer;
  margin-top: ${AppSpacing.md}px;

  &:hover {
    background-color: ${AppColors.accent}dd;
  }
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

const LastUpdated = styled.div`
  text-align: center;
  margin-top: ${AppSpacing.lg}px;
  padding: ${AppSpacing.sm}px;
  background-color: ${AppColors.surface};
  border-radius: ${AppRadius.sm}px;
  border: 1px solid ${AppColors.border};
  margin-left: ${AppSpacing.md}px;
  margin-right: ${AppSpacing.md}px;
`;

function HomeScreen() {
  const { state, fetchTrades } = useTradeContext();
  const { runningTrade, history, isLoading, error, lastUpdated } = state;
  const [showSettings, setShowSettings] = useState(false);

  const handleRefresh = () => {
    fetchTrades();
  };

  const formatLastUpdated = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <>
      <Header>
        <HeaderContent>
          <Title>ForexRadar7 – USDJPY</Title>
          <SettingsButton onClick={() => setShowSettings(true)}>
            ⚙️
          </SettingsButton>
        </HeaderContent>
      </Header>

      <HomeContainer>
        <Container>
          {/* Balance Card */}
          <div style={{ padding: `0 ${AppSpacing.md}px` }}>
            <BalanceCard />
          </div>

          {/* Telegram Card */}
          <div style={{ padding: `0 ${AppSpacing.md}px` }}>
            <TelegramCard />
          </div>

          {/* Error Display */}
          {error && (
            <ErrorMessage>
              {error}
              <RefreshButton onClick={handleRefresh}>
                Try Again
              </RefreshButton>
            </ErrorMessage>
          )}

          {/* Loading State */}
          {isLoading && !runningTrade && history.length === 0 && (
            <LoadingSpinner />
          )}

          {/* Running Entries Section */}
          <Section>
            <SectionTitle>Running Entries (Analysis)</SectionTitle>
            {runningTrade ? (
              <div style={{ padding: `0 ${AppSpacing.md}px` }}>
                <TradeCard trade={runningTrade} />
              </div>
            ) : (
              <EmptyState>
                <Text size="md" color={AppColors.textSecondary}>
                  No running entries at the moment
                </Text>
                <Text size="sm" color={AppColors.textMuted} style={{ marginTop: AppSpacing.sm, display: 'block' }}>
                  New trading opportunities will appear here when available
                </Text>
              </EmptyState>
            )}
          </Section>

          {/* History Section */}
          <Section>
            <SectionTitle>History</SectionTitle>
            {history.length > 0 ? (
              <div style={{ padding: `0 ${AppSpacing.md}px` }}>
                {history.map((trade) => (
                  <TradeCard
                    key={trade.ticket}
                    trade={trade}
                    showProfit={true}
                  />
                ))}
              </div>
            ) : (
              <EmptyState>
                <Text size="md" color={AppColors.textSecondary}>
                  No trade history available
                </Text>
                <Text size="sm" color={AppColors.textMuted} style={{ marginTop: AppSpacing.sm, display: 'block' }}>
                  Completed trades will appear here
                </Text>
              </EmptyState>
            )}
          </Section>

          {/* Last Updated */}
          {lastUpdated && (
            <LastUpdated>
              <Text size="sm" color={AppColors.textMuted}>
                Last updated: {formatLastUpdated(lastUpdated)}
              </Text>
              <RefreshButton onClick={handleRefresh}>
                Refresh Now
              </RefreshButton>
            </LastUpdated>
          )}
        </Container>
      </HomeContainer>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

function App() {
  return (
    <TradeProvider>
      <GlobalStyle />
      <div className="App">
        <HomeScreen />
      </div>
    </TradeProvider>
  );
}

export default App;
