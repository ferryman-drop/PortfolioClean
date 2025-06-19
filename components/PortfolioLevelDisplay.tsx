'use client';

import React from 'react';
import { PortfolioLevel, PORTFOLIO_LEVELS } from '../types';
import { getLevelProgress, getLevelBenefits } from '../utils/portfolioLevels';
import { TrendingUp, Award, Target } from 'lucide-react';

interface PortfolioLevelDisplayProps {
  totalValue: number;
  className?: string;
}

export default function PortfolioLevelDisplay({ totalValue, className = '' }: PortfolioLevelDisplayProps) {
  const { current, next, progress } = getLevelProgress(totalValue);
  const benefits = getLevelBenefits(current);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Уровень портфеля
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${current.color}`}>
          {current.name}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Прогресс до следующего уровня</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            {benefit}
          </div>
        ))}
      </div>

      {next && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-800 mb-1">
            <Target className="w-4 h-4" />
            <span className="font-medium">Следующий уровень</span>
          </div>
          <div className="text-sm text-blue-700">
            {next.name} - от ${next.minValue.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Осталось: ${(next.minValue - totalValue).toLocaleString()}
          </div>
        </div>
      )}

      {current.level > 1 && (
        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 text-sm text-orange-800">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Активные ограничения</span>
          </div>
          <div className="text-sm text-orange-700 mt-1">
            Все лимиты категорий снижены на {current.limitReduction}%
          </div>
        </div>
      )}
    </div>
  );
} 