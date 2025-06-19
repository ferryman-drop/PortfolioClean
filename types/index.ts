export interface CryptoToken {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  image: string;
  category: PortfolioCategory;
}

export type PortfolioCategory = 'BTC' | 'ETH_BLUECHIPS' | 'STABLECOINS' | 'DEFI_ALTCOINS';

export interface PortfolioAllocation {
  BTC: number;
  ETH_BLUECHIPS: number;
  STABLECOINS: number;
  DEFI_ALTCOINS: number;
}

export interface PortfolioItem {
  token: CryptoToken;
  amount: number;
  value: number;
  percentage: number;
  purchasePrice?: number;
  transactionLink?: string;
  roi?: number;
}

export interface Portfolio {
  items: PortfolioItem[];
  totalValue: number;
  allocation: PortfolioAllocation;
  riskScore: number;
  lastRebalanced: Date;
  level: PortfolioLevel;
}

export interface RebalancingRecommendation {
  token: CryptoToken;
  currentPercentage: number;
  targetPercentage: number;
  recommendedAction: 'BUY' | 'SELL' | 'HOLD';
  amount: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MarketData {
  btcDominance: number;
  totalMarketCap: number;
  marketTrend: 'BULL' | 'BEAR' | 'SIDEWAYS';
}

export interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  var95: number; // Value at Risk 95%
}

// New types for category limits management
export interface CategoryLimit {
  category: PortfolioCategory;
  minPercentage: number;
  maxPercentage: number;
  enabled: boolean;
}

export interface PortfolioSettings {
  autoMode: boolean;
  categoryLimits: CategoryLimit[];
  customAllocation: PortfolioAllocation | null;
  rebalancingThreshold: number; // Minimum difference to trigger rebalancing
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface LimitPreset {
  id: string;
  name: string;
  description: string;
  btcDominanceRange: { min: number; max: number };
  allocation: PortfolioAllocation;
  categoryLimits: CategoryLimit[];
}

// Portfolio Level System
export interface PortfolioLevel {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  minValue: number;
  maxValue: number;
  limitReduction: number; // Percentage reduction from base limits
  description: string;
  color: string;
}

export const PORTFOLIO_LEVELS: PortfolioLevel[] = [
  {
    level: 1,
    name: 'Новичок',
    minValue: 0,
    maxValue: 5000,
    limitReduction: 0,
    description: 'Базовые лимиты без изменений',
    color: 'bg-gray-100 text-gray-800'
  },
  {
    level: 2,
    name: 'Начинающий',
    minValue: 5000,
    maxValue: 10000,
    limitReduction: 5,
    description: 'Лимиты снижены на 5%',
    color: 'bg-green-100 text-green-800'
  },
  {
    level: 3,
    name: 'Средний',
    minValue: 10000,
    maxValue: 20000,
    limitReduction: 10,
    description: 'Лимиты снижены на 10%',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    level: 4,
    name: 'Продвинутый',
    minValue: 20000,
    maxValue: 50000,
    limitReduction: 15,
    description: 'Лимиты снижены на 15%',
    color: 'bg-purple-100 text-purple-800'
  },
  {
    level: 5,
    name: 'Эксперт',
    minValue: 50000,
    maxValue: 100000,
    limitReduction: 20,
    description: 'Лимиты снижены на 20%',
    color: 'bg-red-100 text-red-800'
  }
]; 