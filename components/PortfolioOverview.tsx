'use client';

import React from 'react';
import { 
  PortfolioItem, 
  PortfolioAllocation, 
  MarketData, 
  PortfolioLevel, 
  CategoryLimit,
  PortfolioCategory 
} from '../types';
import { getTargetAllocation } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/dateUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioOverviewProps {
  items: PortfolioItem[];
  totalValue: number;
  currentAllocation: PortfolioAllocation;
  targetAllocation: PortfolioAllocation;
  violations: { category: PortfolioCategory; violation: string }[];
  level: PortfolioLevel;
  adjustedLimits: CategoryLimit[];
}

const COLORS = {
  BTC: '#f7931a',
  ETH_BLUECHIPS: '#627eea',
  STABLECOINS: '#00d4aa',
  DEFI_ALTCOINS: '#ff6b6b'
};

const CATEGORY_LABELS = {
  BTC: 'Bitcoin',
  ETH_BLUECHIPS: 'ETH & Blue Chips',
  STABLECOINS: 'Stablecoins',
  DEFI_ALTCOINS: 'DeFi & Altcoins'
};

export default function PortfolioOverview({ 
  items, 
  totalValue, 
  currentAllocation, 
  targetAllocation, 
  violations,
  level,
  adjustedLimits
}: PortfolioOverviewProps) {
  
  const chartData = Object.entries(currentAllocation).map(([category, percentage]) => ({
    name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
    value: percentage,
    color: COLORS[category as keyof typeof COLORS]
  }));

  const targetChartData = Object.entries(targetAllocation).map(([category, percentage]) => ({
    name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
    value: percentage,
    color: COLORS[category as keyof typeof COLORS]
  }));

  // Calculate category statistics
  const categoryStats = Object.entries(currentAllocation).map(([category, percentage]) => {
    const categoryTokens = items.filter(item => item.token.category === category);
    const totalValue = categoryTokens.reduce((sum, item) => sum + item.value, 0);
    const avgPriceChange = categoryTokens.length > 0 
      ? categoryTokens.reduce((sum, item) => sum + item.token.price_change_percentage_24h, 0) / categoryTokens.length
      : 0;
    
    const limit = adjustedLimits.find(l => l.category === category);
    const isViolation = violations.some(v => v.category === category);
    
    return {
      category: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
      percentage,
      totalValue,
      tokenCount: categoryTokens.length,
      avgPriceChange: parseFloat(avgPriceChange.toFixed(2)),
      color: COLORS[category as keyof typeof COLORS],
      limit,
      isViolation
    };
  });

  const riskScore = calculateRiskScore(items, currentAllocation);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Обзор портфеля</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
              {level.name}
            </span>
            {level.level > 1 && (
              <span className="text-xs text-orange-600">
                Лимиты снижены на {level.limitReduction}%
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-sm text-gray-600">Общая стоимость</div>
        </div>
      </div>

      {/* Violations Alert */}
      {violations.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Нарушения лимитов</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {violations.map((violation, index) => (
              <li key={index}>
                • {CATEGORY_LABELS[violation.category]}: {violation.violation}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Allocation */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Текущее распределение</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Распределение']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="ml-auto text-sm font-medium">{item.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Target Allocation */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Целевое распределение</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {targetChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Цель']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {targetChartData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="ml-auto text-sm font-medium">{item.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Детализация по категориям</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryStats.map((stat) => (
            <div key={stat.category} className={`rounded-lg p-4 ${
              stat.isViolation ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{stat.category}</h4>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: stat.color }}
                  />
                  {stat.isViolation && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Распределение:</span>
                  <span className="font-medium">{stat.percentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Стоимость:</span>
                  <span className="font-medium">{formatCurrency(stat.totalValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Токены:</span>
                  <span className="font-medium">{stat.tokenCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Изменение:</span>
                  <span className={`font-medium flex items-center gap-1 ${
                    stat.avgPriceChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.avgPriceChange > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.avgPriceChange > 0 ? '+' : ''}{stat.avgPriceChange}%
                  </span>
                </div>
                {stat.limit && stat.limit.enabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Лимит:</span>
                    <span className="font-medium">
                      {stat.limit.minPercentage.toFixed(1)}% - {stat.limit.maxPercentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{items.length}</div>
          <div className="text-sm text-gray-600">Всего токенов</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{riskScore.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Оценка риска</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{level.level}</div>
          <div className="text-sm text-gray-600">Уровень портфеля</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{violations.length}</div>
          <div className="text-sm text-gray-600">Нарушения лимитов</div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate risk score
function calculateRiskScore(items: PortfolioItem[], allocation: PortfolioAllocation): number {
  if (items.length === 0 || !allocation) return 0;
  
  // Base risk score from allocation
  let riskScore = 0;
  
  // Higher risk for DeFi/Altcoins
  riskScore += (allocation.DEFI_ALTCOINS ?? 0) * 0.8;
  
  // Medium risk for ETH & Blue Chips
  riskScore += (allocation.ETH_BLUECHIPS ?? 0) * 0.5;
  
  // Lower risk for BTC
  riskScore += (allocation.BTC ?? 0) * 0.3;
  
  // Lowest risk for Stablecoins
  riskScore += (allocation.STABLECOINS ?? 0) * 0.1;
  
  // Adjust based on number of tokens (more diversification = lower risk)
  const diversificationFactor = Math.min(items.length / 10, 1);
  riskScore *= (1 - diversificationFactor * 0.2);
  
  return Math.min(riskScore, 100);
} 