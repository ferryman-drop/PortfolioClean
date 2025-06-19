import { LimitPreset, PortfolioAllocation, CategoryLimit, PortfolioCategory } from '../types';

// Predefined limit presets based on BTC dominance
export const limitPresets: LimitPreset[] = [
  {
    id: 'conservative',
    name: 'Консервативный',
    description: 'Высокое BTC доминирование - фокус на безопасности',
    btcDominanceRange: { min: 50, max: 100 },
    allocation: {
      BTC: 35,
      ETH_BLUECHIPS: 25,
      STABLECOINS: 30,
      DEFI_ALTCOINS: 10
    },
    categoryLimits: [
      { category: 'BTC', minPercentage: 30, maxPercentage: 40, enabled: true },
      { category: 'ETH_BLUECHIPS', minPercentage: 20, maxPercentage: 30, enabled: true },
      { category: 'STABLECOINS', minPercentage: 25, maxPercentage: 35, enabled: true },
      { category: 'DEFI_ALTCOINS', minPercentage: 5, maxPercentage: 15, enabled: true }
    ]
  },
  {
    id: 'balanced',
    name: 'Сбалансированный',
    description: 'Среднее BTC доминирование - умеренный риск',
    btcDominanceRange: { min: 40, max: 50 },
    allocation: {
      BTC: 30,
      ETH_BLUECHIPS: 25,
      STABLECOINS: 25,
      DEFI_ALTCOINS: 20
    },
    categoryLimits: [
      { category: 'BTC', minPercentage: 25, maxPercentage: 35, enabled: true },
      { category: 'ETH_BLUECHIPS', minPercentage: 20, maxPercentage: 30, enabled: true },
      { category: 'STABLECOINS', minPercentage: 20, maxPercentage: 30, enabled: true },
      { category: 'DEFI_ALTCOINS', minPercentage: 15, maxPercentage: 25, enabled: true }
    ]
  },
  {
    id: 'aggressive',
    name: 'Агрессивный',
    description: 'Низкое BTC доминирование - высокий риск/доходность',
    btcDominanceRange: { min: 0, max: 40 },
    allocation: {
      BTC: 25,
      ETH_BLUECHIPS: 25,
      STABLECOINS: 20,
      DEFI_ALTCOINS: 30
    },
    categoryLimits: [
      { category: 'BTC', minPercentage: 20, maxPercentage: 30, enabled: true },
      { category: 'ETH_BLUECHIPS', minPercentage: 20, maxPercentage: 30, enabled: true },
      { category: 'STABLECOINS', minPercentage: 15, maxPercentage: 25, enabled: true },
      { category: 'DEFI_ALTCOINS', minPercentage: 25, maxPercentage: 35, enabled: true }
    ]
  },
  {
    id: 'defi-focused',
    name: 'DeFi фокус',
    description: 'Фокус на децентрализованных финансах',
    btcDominanceRange: { min: 0, max: 100 },
    allocation: {
      BTC: 20,
      ETH_BLUECHIPS: 30,
      STABLECOINS: 15,
      DEFI_ALTCOINS: 35
    },
    categoryLimits: [
      { category: 'BTC', minPercentage: 15, maxPercentage: 25, enabled: true },
      { category: 'ETH_BLUECHIPS', minPercentage: 25, maxPercentage: 35, enabled: true },
      { category: 'STABLECOINS', minPercentage: 10, maxPercentage: 20, enabled: true },
      { category: 'DEFI_ALTCOINS', minPercentage: 30, maxPercentage: 40, enabled: true }
    ]
  },
  {
    id: 'stable-focused',
    name: 'Стабильность',
    description: 'Фокус на стабильных активах',
    btcDominanceRange: { min: 0, max: 100 },
    allocation: {
      BTC: 30,
      ETH_BLUECHIPS: 20,
      STABLECOINS: 40,
      DEFI_ALTCOINS: 10
    },
    categoryLimits: [
      { category: 'BTC', minPercentage: 25, maxPercentage: 35, enabled: true },
      { category: 'ETH_BLUECHIPS', minPercentage: 15, maxPercentage: 25, enabled: true },
      { category: 'STABLECOINS', minPercentage: 35, maxPercentage: 45, enabled: true },
      { category: 'DEFI_ALTCOINS', minPercentage: 5, maxPercentage: 15, enabled: true }
    ]
  }
];

// Function to get appropriate preset based on BTC dominance
export const getPresetByBTCDominance = (btcDominance: number): LimitPreset => {
  return limitPresets.find(preset => 
    btcDominance >= preset.btcDominanceRange.min && 
    btcDominance <= preset.btcDominanceRange.max
  ) || limitPresets[1]; // Default to balanced
};

// Function to create custom preset
export const createCustomPreset = (
  name: string,
  description: string,
  allocation: PortfolioAllocation,
  categoryLimits: CategoryLimit[]
): LimitPreset => {
  return {
    id: `custom-${Date.now()}`,
    name,
    description,
    btcDominanceRange: { min: 0, max: 100 },
    allocation,
    categoryLimits
  };
};

// Function to validate category limits
export const validateCategoryLimits = (limits: CategoryLimit[]): boolean => {
  const enabledLimits = limits.filter(limit => limit.enabled);
  
  // Check if min percentages sum to <= 100
  const totalMin = enabledLimits.reduce((sum, limit) => sum + limit.minPercentage, 0);
  if (totalMin > 100) return false;
  
  // Check if max percentages sum to >= 100
  const totalMax = enabledLimits.reduce((sum, limit) => sum + limit.maxPercentage, 0);
  if (totalMax < 100) return false;
  
  // Check individual limits
  return enabledLimits.every(limit => 
    limit.minPercentage >= 0 && 
    limit.maxPercentage <= 100 && 
    limit.minPercentage <= limit.maxPercentage
  );
}; 