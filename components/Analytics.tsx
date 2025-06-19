'use client';

import React from 'react';
import { 
  PortfolioItem, 
  PortfolioAllocation, 
  MarketData, 
  RebalancingRecommendation, 
  PortfolioLevel 
} from '../types';
import { getTargetAllocation } from '../utils/api';
import { formatCurrency } from '../utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, PieChart, Target, CheckCircle, DollarSign, Percent, Activity } from 'lucide-react';

interface AnalyticsProps {
  items: PortfolioItem[];
  currentAllocation: PortfolioAllocation;
  targetAllocation: PortfolioAllocation;
  marketData: MarketData;
  level: PortfolioLevel;
}

const CATEGORY_COLORS = {
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

export default function Analytics({ 
  items, 
  currentAllocation, 
  targetAllocation, 
  marketData, 
  level 
}: AnalyticsProps) {
  
  // Дефолтні значення для allocation
  const safeCurrentAllocation: PortfolioAllocation = currentAllocation ?? {
    BTC: 25,
    ETH_BLUECHIPS: 25,
    STABLECOINS: 25,
    DEFI_ALTCOINS: 25,
  };
  const safeTargetAllocation: PortfolioAllocation = targetAllocation ?? {
    BTC: 25,
    ETH_BLUECHIPS: 25,
    STABLECOINS: 25,
    DEFI_ALTCOINS: 25,
  };

  // Дефолтне значення для level
  const safeLevel: PortfolioLevel = level ?? {
    level: 1,
    name: 'Новичок',
    minValue: 0,
    maxValue: 5000,
    limitReduction: 0,
    description: 'Базовые лимиты без изменений',
    color: 'bg-gray-100 text-gray-800'
  };

  // Calculate rebalancing recommendations
  const recommendations: RebalancingRecommendation[] = [];
  
  Object.entries(safeCurrentAllocation).forEach(([category, currentPercentage]) => {
    const targetPercentage = safeTargetAllocation[category as keyof PortfolioAllocation];
    const difference = targetPercentage - currentPercentage;
    
    if (Math.abs(difference) > 2) { // Only recommend if difference > 2%
      const totalValue = items.reduce((sum, item) => sum + item.value, 0);
      const amount = (Math.abs(difference) / 100) * totalValue;
      
      recommendations.push({
        token: { 
          id: category, 
          symbol: category, 
          name: category, 
          current_price: 0, 
          market_cap: 0, 
          price_change_percentage_24h: 0, 
          image: '', 
          category: category as any 
        },
        currentPercentage,
        targetPercentage,
        recommendedAction: difference > 0 ? 'BUY' : 'SELL',
        amount,
        priority: Math.abs(difference) > 10 ? 'HIGH' : Math.abs(difference) > 5 ? 'MEDIUM' : 'LOW'
      });
    }
  });

  // Sort recommendations by priority
  recommendations.sort((a, b) => {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Calculate risk metrics
  const calculateRiskScore = () => {
    let riskScore = 0;
    // Higher risk for more volatile assets
    // Apply limit reduction only to DEFI_ALTCOINS
    const defiAltcoinsScore = safeCurrentAllocation.DEFI_ALTCOINS * 0.8 * (1 - (safeLevel.limitReduction / 100));
    riskScore += defiAltcoinsScore;
    riskScore += safeCurrentAllocation.BTC * 0.6;
    riskScore += safeCurrentAllocation.ETH_BLUECHIPS * 0.5;
    riskScore += safeCurrentAllocation.STABLECOINS * 0.1;
    // Market trend adjustment
    if (marketData.marketTrend === 'BEAR') {
      riskScore *= 1.2;
    } else if (marketData.marketTrend === 'BULL') {
      riskScore *= 0.9;
    }
    return Math.min(riskScore, 100);
  };

  const riskScore = calculateRiskScore();

  // Prepare chart data
  const allocationComparison = Object.entries(safeCurrentAllocation).map(([category, current]) => ({
    category: category.replace('_', ' '),
    current: parseFloat(current.toFixed(1)),
    target: safeTargetAllocation[category as keyof PortfolioAllocation]
  }));

  // Calculate category performance
  const categoryPerformance = Object.entries(safeCurrentAllocation).map(([category, percentage]) => {
    const categoryTokens = items.filter(item => item.token.category === category);
    const avgPriceChange = categoryTokens.length > 0 
      ? categoryTokens.reduce((sum, item) => sum + item.token.price_change_percentage_24h, 0) / categoryTokens.length
      : 0;
    
    return {
      category: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
      allocation: percentage,
      avgPriceChange: parseFloat(avgPriceChange.toFixed(2)),
      tokenCount: categoryTokens.length,
      totalValue: categoryTokens.reduce((sum, item) => sum + item.value, 0)
    };
  });

  const totalValue = items.reduce((sum, item) => sum + item.value, 0);

  // Calculate additional metrics
  const totalROI = items.reduce((sum, item) => sum + (item.roi || 0), 0);
  const avgROI = items.length > 0 ? totalROI / items.length : 0;
  
  const profitableTokens = items.filter(item => (item.roi || 0) > 0).length;
  const lossTokens = items.filter(item => (item.roi || 0) < 0).length;
  
  const topPerformers = [...items]
    .sort((a, b) => (b.roi || 0) - (a.roi || 0))
    .slice(0, 3);
  
  const worstPerformers = [...items]
    .sort((a, b) => (a.roi || 0) - (b.roi || 0))
    .slice(0, 3);

  // Risk metrics
  const volatility = items.reduce((sum, item) => {
    const change = Math.abs(item.token.price_change_percentage_24h || 0);
    return sum + change;
  }, 0) / Math.max(items.length, 1);

  const diversificationScore = Math.min(
    Object.values(safeCurrentAllocation).filter(p => p > 0).length * 25, 
    100
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border-2 border-blue-500 dark:border-fuchsia-500 dark:text-white transition-colors">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-serif border-l-4 border-indigo-500 dark:border-cyan-400 pl-4 transition-colors">Portfolio Analytics</h2>
      {/* Minimalist Portfolio Level Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">Portfolio Level</span>
          <span className="text-sm font-semibold" style={{ color: safeLevel.color.split(' ')[1]?.replace('text-', '').replace('-', '#') || '#fff' }}>{safeLevel.name} (Level {safeLevel.level})</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 transition-colors">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(safeLevel.level / 5) * 100}%`,
              background: safeLevel.color.includes('bg-') ? undefined : '#22d3ee',
              backgroundColor: safeLevel.color.includes('bg-') ? undefined : safeLevel.color.split(' ')[0]?.replace('bg-', '#') || '#22d3ee',
            }}
          />
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-400">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalValue)}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-400">
          <div className="flex items-center gap-3 mb-3">
            <Percent className="w-6 h-6 text-green-600" />
            <span className="text-sm font-semibold text-green-800">Average ROI</span>
          </div>
          <div className={`text-2xl font-bold ${avgROI >= 0 ? 'text-green-900' : 'text-red-900'}`}>{avgROI.toFixed(2)}%</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-400">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Volatility</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{volatility.toFixed(1)}%</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-400">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">Diversification</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{diversificationScore}%</div>
        </div>
      </div>

      {/* Category Distribution - Enhanced Slider Chart */}
      <div className="mb-8 border-2 border-gray-400 dark:border-cyan-700 rounded-2xl p-6 dark:bg-black/60 transition-colors">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-serif border-l-4 border-green-500 dark:border-cyan-400 pl-3 transition-colors">Category Distribution</h3>
        <div className="space-y-4">
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
            const percentage = safeCurrentAllocation[category as keyof PortfolioAllocation];
            const value = (percentage / 100) * totalValue;
            return (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`} />
                    <span className="font-semibold text-gray-900">{label}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{percentage.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">{formatCurrency(value)}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROI Performance - Slider Chart */}
      <div className="mb-8 border-2 border-green-400 dark:border-fuchsia-500 rounded-2xl p-6 dark:bg-black/60 transition-colors">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-serif border-l-4 border-blue-500 dark:border-cyan-400 pl-3 transition-colors">Token ROI</h3>
        <div className="space-y-4">
          {items.map((item) => {
            const roi = item.roi || 0;
            const absRoi = Math.abs(roi);
            const maxRoi = Math.max(...items.map(i => Math.abs(i.roi || 0)), 1);
            const percentage = (absRoi / maxRoi) * 100;
            return (
              <div key={item.token.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={item.token.image} alt={item.token.name} className="w-6 h-6 rounded-full" />
                    <span className="font-semibold text-gray-900">{item.token.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {roi >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{roi.toFixed(2)}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${roi >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Top Performers */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-600">
          <h4 className="text-lg font-bold text-green-900 dark:text-cyan-300 mb-4 flex items-center gap-2 border-b-4 border-green-500 dark:border-cyan-400 pb-1 transition-colors">Top Performers</h4>
          <div className="space-y-3">
            {topPerformers.map((item, index) => (
              <div key={item.token.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-800">#{index + 1}</span>
                  <span className="font-semibold text-green-900">{item.token.symbol}</span>
                </div>
                <span className="font-bold text-green-900">+{(item.roi || 0).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Performers */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-600">
          <h4 className="text-lg font-bold text-red-900 dark:text-fuchsia-300 mb-4 flex items-center gap-2 border-b-4 border-red-500 dark:border-fuchsia-500 pb-1 transition-colors">Worst Performers</h4>
          <div className="space-y-3">
            {worstPerformers.map((item, index) => (
              <div key={item.token.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-800">#{index + 1}</span>
                  <span className="font-semibold text-red-900">{item.token.symbol}</span>
                </div>
                <span className="font-bold text-red-900">{(item.roi || 0).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Metrics - Slider Charts */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-serif border-l-4 border-indigo-500 dark:border-cyan-400 pl-3 transition-colors">Метрики риска</h3>
        <div className="space-y-6">
          {/* Profit/Loss Distribution */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Распределение прибыли/убытков</span>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">Прибыльные: {profitableTokens}</span>
                <span className="text-red-600">Убыточные: {lossTokens}</span>
              </div>
            </div>
            <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
              {profitableTokens > 0 && (
                <div 
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{ width: `${(profitableTokens / items.length) * 100}%` }}
                />
              )}
              {lossTokens > 0 && (
                <div 
                  className="bg-red-500 h-full transition-all duration-500"
                  style={{ width: `${(lossTokens / items.length) * 100}%` }}
                />
              )}
            </div>
          </div>

          {/* Portfolio Concentration */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Концентрация портфеля</span>
              <span className="text-sm text-gray-600">Наибольшая позиция</span>
            </div>
            {items.length > 0 && (() => {
              const largestPosition = items.reduce((max, item) => 
                item.percentage > max.percentage ? item : max
              );
              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img src={largestPosition.token.image} alt={largestPosition.token.name} className="w-5 h-5 rounded-full" />
                      <span className="font-semibold text-gray-900">{largestPosition.token.symbol}</span>
                    </div>
                    <span className="font-bold text-gray-900">{largestPosition.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${largestPosition.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Market Correlation */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Корреляция с BTC</span>
              <span className="text-sm text-gray-600">Доминирование: {marketData.btcDominance.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${marketData.btcDominance}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <div className="font-semibold text-green-900">Диверсификация</div>
            <div className="text-sm text-green-700">Хорошо сбалансирован</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <BarChart className="w-6 h-6 text-blue-600" />
          <div>
            <div className="font-semibold text-blue-900">Волатильность</div>
            <div className="text-sm text-blue-700">{volatility.toFixed(1)}% (средняя)</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <PieChart className="w-6 h-6 text-purple-600" />
          <div>
            <div className="font-semibold text-purple-900">Категории</div>
            <div className="text-sm text-purple-700">{Object.values(safeCurrentAllocation).filter(p => p > 0).length}/4 активны</div>
          </div>
        </div>
      </div>

      {/* Allocation Comparison Chart */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Распределение vs Цель</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allocationComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="current" fill="#3b82f6" name="Текущее" />
              <Bar dataKey="target" fill="#10b981" name="Цель" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Анализ рисков</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Оценка риска портфеля</span>
              <span className={`text-lg font-bold ${
                riskScore > 70 ? 'text-red-600' : 
                riskScore > 40 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {riskScore.toFixed(1)}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  riskScore > 70 ? 'bg-red-500' : 
                  riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${riskScore}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {marketData.btcDominance.toFixed(1)}%
              </div>
              <div className="text-sm text-blue-700">Доминирование BTC</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${(marketData.totalMarketCap / 1e12).toFixed(1)}T
              </div>
              <div className="text-sm text-green-700">Рыночная капитализация</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            {marketData.marketTrend === 'BULL' ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : marketData.marketTrend === 'BEAR' ? (
              <TrendingDown className="w-5 h-5 text-red-500" />
            ) : (
              <Minus className="w-5 h-5 text-gray-500" />
            )}
            <span className="text-sm font-medium text-gray-700">
              Тренд рынка: {marketData.marketTrend === 'BULL' ? 'Бычий' : marketData.marketTrend === 'BEAR' ? 'Медвежий' : 'Боковой'}
            </span>
          </div>

          {/* Level Info */}
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Target className="w-5 h-5 text-purple-500" />
            <div>
              <span className="text-sm font-medium text-purple-700">
                Portfolio Level: {safeLevel.name}
              </span>
              {safeLevel.level > 1 && (
                <div className="text-xs text-purple-600">
                  DeFi/Altcoins limit reduced by {safeLevel.limitReduction}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance Analysis */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Производительность по категориям</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryPerformance.map((cat) => (
            <div key={cat.category} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{cat.category}</h4>
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: CATEGORY_COLORS[cat.category as keyof typeof CATEGORY_COLORS] }} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Распределение:</span>
                  <span className="font-medium">{cat.allocation.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Стоимость:</span>
                  <span className="font-medium">{formatCurrency(cat.totalValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Токены:</span>
                  <span className="font-medium">{cat.tokenCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Изменение:</span>
                  <span className={`font-medium flex items-center gap-1 ${
                    cat.avgPriceChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {cat.avgPriceChange > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {cat.avgPriceChange > 0 ? '+' : ''}{cat.avgPriceChange}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rebalancing Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Рекомендации по ребалансировке</h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                rec.priority === 'HIGH' ? 'bg-red-50 border-red-200' :
                rec.priority === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      rec.priority === 'HIGH' ? 'bg-red-500' :
                      rec.priority === 'MEDIUM' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div>
                      <div className="font-medium text-gray-900">
                        {CATEGORY_LABELS[rec.token.category as keyof typeof CATEGORY_LABELS]}
                      </div>
                      <div className="text-sm text-gray-600">
                        {rec.currentPercentage.toFixed(1)}% → {rec.targetPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      rec.recommendedAction === 'BUY' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {rec.recommendedAction === 'BUY' ? 'ПОКУПАТЬ' : 'ПРОДАВАТЬ'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(rec.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Сводка портфеля</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
            <div className="text-sm text-gray-600">Общая стоимость</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
            <div className="text-sm text-gray-600">Количество токенов</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{safeLevel.level}</div>
            <div className="text-sm text-gray-600">Уровень портфеля</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{recommendations.length}</div>
            <div className="text-sm text-gray-600">Рекомендаций</div>
          </div>
        </div>
      </div>
    </div>
  );
} 