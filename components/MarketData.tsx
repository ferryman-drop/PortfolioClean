'use client';

import React from 'react';
import { MarketData as MarketDataType } from '../types';
import { formatNumberWithCommas } from '../utils/dateUtils';
import { TrendingUp, TrendingDown, Minus, Bitcoin, DollarSign, Activity } from 'lucide-react';

interface MarketDataProps {
  marketData: MarketDataType;
}

export default function MarketData({ marketData }: MarketDataProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'BULL':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'BEAR':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'BULL':
        return 'text-green-600';
      case 'BEAR':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAutoModeDescription = () => {
    if (marketData.btcDominance > 50) {
      return "Высокое доминирование BTC. Распределение скорректировано в пользу BTC и стейблкоинов.";
    } else if (marketData.btcDominance > 40) {
      return "Умеренное доминирование BTC. Сбалансированное распределение с небольшим предпочтением BTC.";
    } else {
      return "Низкое доминирование BTC. Равное распределение по всем категориям.";
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 border-2 border-indigo-500 dark:border-cyan-500 dark:text-white transition-colors">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-l-4 border-indigo-500 dark:border-cyan-400 pl-4 transition-colors">Рыночные данные</h2>

      <div className="space-y-6">
        {/* BTC Dominance */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Bitcoin className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Доминирование BTC</h3>
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {marketData.btcDominance.toFixed(1)}%
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
            <div 
              className="bg-orange-500 h-2 rounded-full" 
              style={{ width: `${Math.min(marketData.btcDominance, 100)}%` }}
            />
          </div>
          <div className="text-sm text-orange-700">
            {marketData.btcDominance > 50 ? 'Высокое доминирование - Консервативный режим' :
             marketData.btcDominance > 40 ? 'Умеренное доминирование - Сбалансированный режим' :
             'Низкое доминирование - Агрессивный режим'}
          </div>
        </div>

        {/* Total Market Cap */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Общая рыночная капитализация</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">
            ${(marketData.totalMarketCap / 1e12).toFixed(1)}T
          </div>
          <div className="text-sm text-green-700 mt-1">
            {formatNumberWithCommas(marketData.totalMarketCap)} USD
          </div>
        </div>

        {/* Market Trend */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Рыночный тренд</h3>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon(marketData.marketTrend)}
            <span className={`text-xl font-bold ${getTrendColor(marketData.marketTrend)}`}>
              {marketData.marketTrend === 'BULL' ? 'Бычий' : 
               marketData.marketTrend === 'BEAR' ? 'Медвежий' : 'Боковой'}
            </span>
          </div>
          <div className="text-sm text-blue-700 mt-2">
            {marketData.marketTrend === 'BULL' ? 'Обнаружены бычьи рыночные условия' :
             marketData.marketTrend === 'BEAR' ? 'Обнаружены медвежьи рыночные условия' :
             'Боковое движение рынка'}
          </div>
        </div>

        {/* Market Insights */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Рыночная аналитика</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Уровень доминирования BTC:</span>
              <span className="font-medium">
                {marketData.btcDominance > 50 ? 'Высокий' :
                 marketData.btcDominance > 40 ? 'Умеренный' : 'Низкий'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Рыночные настроения:</span>
              <span className={`font-medium ${getTrendColor(marketData.marketTrend)}`}>
                {marketData.marketTrend === 'BULL' ? 'бычьи' : 
                 marketData.marketTrend === 'BEAR' ? 'медвежьи' : 'нейтральные'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Рекомендуемая стратегия:</span>
              <span className="font-medium">
                {marketData.btcDominance > 50 ? 'Консервативная' :
                 marketData.btcDominance > 40 ? 'Сбалансированная' : 'Агрессивная'}
              </span>
            </div>
          </div>
        </div>

        {/* Auto Mode Description */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Автоматический режим</h3>
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              АКТИВЕН
            </div>
          </div>
          <div className="text-sm text-purple-700">
            {getAutoModeDescription()}
          </div>
        </div>
      </div>
    </div>
  );
} 