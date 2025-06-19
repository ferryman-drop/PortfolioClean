'use client';

import React, { useState, useEffect } from 'react';
import { CategoryLimit, PortfolioCategory, LimitPreset, PortfolioSettings } from '../types';
import { limitPresets, validateCategoryLimits } from '../utils/limitPresets';
import { applyLevelReductions, getPortfolioLevel } from '../utils/portfolioLevels';
import { Settings, Save, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

interface CategoryLimitsManagerProps {
  settings: PortfolioSettings;
  onSettingsChange: (settings: PortfolioSettings) => void;
  totalValue: number;
  className?: string;
}

export default function CategoryLimitsManager({ 
  settings, 
  onSettingsChange, 
  totalValue,
  className = '' 
}: CategoryLimitsManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localLimits, setLocalLimits] = useState<CategoryLimit[]>(settings.categoryLimits);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const currentLevel = getPortfolioLevel(totalValue);
  const adjustedLimits = applyLevelReductions(localLimits, currentLevel);

  useEffect(() => {
    setLocalLimits(settings.categoryLimits);
  }, [settings.categoryLimits]);

  useEffect(() => {
    const errors: string[] = [];
    if (!validateCategoryLimits(localLimits)) {
      errors.push('Лимиты категорий некорректны. Проверьте минимальные и максимальные значения.');
    }
    setValidationErrors(errors);
  }, [localLimits]);

  const handleLimitChange = (category: PortfolioCategory, field: 'minPercentage' | 'maxPercentage', value: number) => {
    setLocalLimits(prev => prev.map(limit => 
      limit.category === category 
        ? { ...limit, [field]: value }
        : limit
    ));
  };

  const handleToggleLimit = (category: PortfolioCategory) => {
    setLocalLimits(prev => prev.map(limit => 
      limit.category === category 
        ? { ...limit, enabled: !limit.enabled }
        : limit
    ));
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = limitPresets.find((p: LimitPreset) => p.id === presetId);
    if (preset) {
      setLocalLimits(preset.categoryLimits);
      setSelectedPreset(presetId);
    }
  };

  const handleSave = () => {
    if (validationErrors.length === 0) {
      onSettingsChange({
        ...settings,
        categoryLimits: localLimits
      });
    }
  };

  const handleReset = () => {
    setLocalLimits(settings.categoryLimits);
    setSelectedPreset('');
  };

  const getCategoryColor = (category: PortfolioCategory): string => {
    switch (category) {
      case 'BTC': return 'bg-orange-100 text-orange-800';
      case 'ETH_BLUECHIPS': return 'bg-blue-100 text-blue-800';
      case 'STABLECOINS': return 'bg-green-100 text-green-800';
      case 'DEFI_ALTCOINS': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: PortfolioCategory): string => {
    switch (category) {
      case 'BTC': return 'Bitcoin';
      case 'ETH_BLUECHIPS': return 'ETH & Blue Chips';
      case 'STABLECOINS': return 'Stablecoins';
      case 'DEFI_ALTCOINS': return 'DeFi/Altcoins';
      default: return category;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Управление лимитами категорий</h3>
        </div>
        <div className="flex items-center gap-2">
          {currentLevel.level > 1 && (
            <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              -{currentLevel.limitReduction}%
            </div>
          )}
          <div className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          {/* Level Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800 mb-2">
              <strong>Уровень портфеля:</strong> {currentLevel.name} (${totalValue.toLocaleString()})
            </div>
            {currentLevel.level > 1 && (
              <div className="text-sm text-blue-700">
                Все лимиты автоматически снижены на {currentLevel.limitReduction}% из-за размера портфеля
              </div>
            )}
          </div>

          {/* Presets */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Быстрые настройки
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetSelect(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите пресет...</option>
              {limitPresets.map((preset: LimitPreset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} - {preset.description}
                </option>
              ))}
            </select>
          </div>

          {/* Limits */}
          <div className="space-y-4">
            {localLimits.map((limit) => (
              <div key={limit.category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={limit.enabled}
                      onChange={() => handleToggleLimit(limit.category)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getCategoryColor(limit.category)}`}>
                      {getCategoryName(limit.category)}
                    </span>
                  </div>
                  {limit.enabled && currentLevel.level > 1 && (
                    <div className="text-xs text-orange-600">
                      Скорректировано: {adjustedLimits.find(l => l.category === limit.category)?.minPercentage.toFixed(1)}% - {adjustedLimits.find(l => l.category === limit.category)?.maxPercentage.toFixed(1)}%
                    </div>
                  )}
                </div>

                {limit.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Минимум (%)
                      </label>
                      <input
                        type="number"
                        value={limit.minPercentage}
                        onChange={(e) => handleLimitChange(limit.category, 'minPercentage', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Максимум (%)
                      </label>
                      <input
                        type="number"
                        value={limit.maxPercentage}
                        onChange={(e) => handleLimitChange(limit.category, 'maxPercentage', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Ошибки валидации:</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={validationErrors.length > 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Сохранить
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
              Сбросить
            </button>
          </div>

          {validationErrors.length === 0 && (
            <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Настройки валидны
            </div>
          )}
        </div>
      )}
    </div>
  );
} 