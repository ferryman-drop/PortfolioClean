import { PortfolioLevel, PORTFOLIO_LEVELS, CategoryLimit } from '../types';

// Function to determine portfolio level based on total value
export const getPortfolioLevel = (totalValue: number): PortfolioLevel => {
  return PORTFOLIO_LEVELS.find(level => 
    totalValue >= level.minValue && totalValue < level.maxValue
  ) || PORTFOLIO_LEVELS[0]; // Default to level 1
};

// Function to apply level-based limit reductions
export const applyLevelReductions = (
  baseLimits: CategoryLimit[], 
  level: PortfolioLevel
): CategoryLimit[] => {
  if (level.limitReduction === 0) {
    return baseLimits; // No changes for level 1
  }

  return baseLimits.map(limit => {
    if (!limit.enabled) return limit;

    const reductionMultiplier = (100 - level.limitReduction) / 100;
    
    return {
      ...limit,
      minPercentage: Math.max(0, limit.minPercentage * reductionMultiplier),
      maxPercentage: Math.min(100, limit.maxPercentage * reductionMultiplier)
    };
  });
};

// Function to get level progress (how close to next level)
export const getLevelProgress = (totalValue: number): { current: PortfolioLevel; next: PortfolioLevel | null; progress: number } => {
  const currentLevel = getPortfolioLevel(totalValue);
  const nextLevel = PORTFOLIO_LEVELS.find(level => level.level === currentLevel.level + 1);
  
  if (!nextLevel) {
    return { current: currentLevel, next: null, progress: 100 };
  }

  const currentRange = currentLevel.maxValue - currentLevel.minValue;
  const currentProgress = totalValue - currentLevel.minValue;
  const progress = Math.min(100, (currentProgress / currentRange) * 100);

  return { current: currentLevel, next: nextLevel, progress };
};

// Function to get level benefits description
export const getLevelBenefits = (level: PortfolioLevel): string[] => {
  const benefits = [
    `Уровень ${level.level}: ${level.name}`,
    level.description
  ];

  if (level.level > 1) {
    benefits.push(`Снижение лимитов: ${level.limitReduction}%`);
  }

  if (level.level < 5) {
    const nextLevel = PORTFOLIO_LEVELS.find(l => l.level === level.level + 1);
    if (nextLevel) {
      benefits.push(`Следующий уровень: ${nextLevel.name} (от $${nextLevel.minValue.toLocaleString()})`);
    }
  }

  return benefits;
};

// Function to calculate adjusted allocation based on level
export const getAdjustedAllocation = (
  baseAllocation: { [key: string]: number }, 
  level: PortfolioLevel
): { [key: string]: number } => {
  if (level.limitReduction === 0) {
    return baseAllocation;
  }

  const reductionMultiplier = (100 - level.limitReduction) / 100;
  const adjusted: { [key: string]: number } = {};

  Object.entries(baseAllocation).forEach(([category, percentage]) => {
    adjusted[category] = percentage * reductionMultiplier;
  });

  return adjusted;
}; 