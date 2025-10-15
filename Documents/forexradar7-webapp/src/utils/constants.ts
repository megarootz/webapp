// Application constants and configuration values
export class AppConstants {
  // API Configuration
  static readonly BASE_URL = 'https://pb.brokersreview360.com';
  static readonly AUTO_REFRESH_SEC = 30;
  static readonly MAX_RECOMMENDED_LOT = 100.0;
  static readonly DEFAULT_BALANCE = 1000.0;
  
  // Trading Configuration
  static readonly DEFAULT_RISK_PERCENT = 0.01; // 1%
  static readonly IS_JPY_PAIR = true;
  static readonly HISTORY_PER_PAGE = 50;
  
  // UI Configuration
  static readonly MIN_TAP_TARGET = 44.0;
  static readonly MAX_TEXT_SCALING = 1.2;
  static readonly ANIMATION_DURATION = 300;
  static readonly SNACKBAR_DURATION = 3000;
}

// ForexRadar7 color palette for modern dark theme (2025)
export class AppColors {
  // Primary Colors - Deep comfortable blues
  static readonly primary = '#0F1419'; // Very deep blue-gray
  static readonly secondary = '#1A202C'; // Card background
  static readonly accent = '#38D9A9'; // Modern teal accent

  // Text Colors - High contrast and readable
  static readonly textPrimary = '#F7FAFC'; // Off-white primary text
  static readonly textSecondary = '#E2E8F0'; // Light gray secondary
  static readonly textMuted = '#A0AEC0'; // Muted gray

  // Status Colors - Clear and distinct
  static readonly profit = '#48BB78'; // Soft green for profit
  static readonly loss = '#F56565'; // Soft red for loss
  static readonly warning = '#ED8936'; // Orange for warning
  static readonly info = '#4299E1'; // Blue for info

  // Trade Side Colors
  static readonly buy = '#48BB78'; // Green for buy
  static readonly sell = '#F56565'; // Red for sell

  // Background Colors - Comfortable dark tones
  static readonly background = '#0F1419'; // Main background
  static readonly surface = '#1A202C'; // Card/surface background
  static readonly surfaceVariant = '#2D3748'; // Elevated surfaces

  // Border Colors - Subtle separation
  static readonly border = '#2D3748'; // Default borders
  static readonly borderLight = '#4A5568'; // Light borders
  
  // Utility Colors
  static readonly transparent = 'transparent';
  static readonly white = '#FFFFFF';
  static readonly black = '#000000';
}

// Spacing and sizing constants
export class AppSpacing {
  static readonly xs = 4;
  static readonly sm = 8;
  static readonly md = 16;
  static readonly lg = 24;
  static readonly xl = 32;
  static readonly xxl = 48;
}

// Border radius constants
export class AppRadius {
  static readonly sm = 4;
  static readonly md = 8;
  static readonly lg = 12;
  static readonly xl = 16;
  static readonly xxl = 24;
}
