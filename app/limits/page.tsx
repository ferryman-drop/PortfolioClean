'use client';

import React, { useState, useEffect } from 'react';
import { CategoryLimit, PortfolioCategory, LimitPreset, PortfolioSettings } from '../../types';
import { limitPresets, validateCategoryLimits } from '../../utils/limitPresets';
import { applyLevelReductions, getPortfolioLevel } from '../../utils/portfolioLevels';
import { Settings, Save, RotateCcw, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LimitsPage() {
  const [settings, setSettings] = useState<PortfolioSettings>({
    autoMode: true,
    categoryLimits: [
      { category: 'BTC', minPercentage: 20, maxPercentage: 30, enabled: true },
      { category: 'ETH_BLUECHIPS', minPercentage: 20, maxPercentage: 30, enabled: true },
      { category: 'STABLECOINS', minPercentage: 20, maxPercentage: 30, enabled: true },
      { category: 'DEFI_ALTCOINS', minPercentage: 20, maxPercentage: 30, enabled: true }
    ],
    customAllocation: null,
    rebalancingThreshold: 5,
    riskTolerance: 'MEDIUM'
  });
  
  const [localLimits, setLocalLimits] = useState<CategoryLimit[]>(settings.categoryLimits);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [totalValue, setTotalValue] = useState(15000); // Demo value

  const currentLevel = getPortfolioLevel(totalValue);
  const adjustedLimits = applyLevelReductions(localLimits, currentLevel);

  useEffect(() => {
    setLocalLimits(settings.categoryLimits);
  }, [settings.categoryLimits]);

  useEffect(() => {
    const errors: string[] = [];
    if (!validateCategoryLimits(localLimits)) {
      errors.push('Category limits are invalid. Please check minimum and maximum values.');
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
      setSettings({
        ...settings,
        categoryLimits: localLimits
      });
      alert('Settings saved!');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Portfolio
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 font-serif">Category Limits Management</h1>
          <p className="text-gray-600">Configure restrictions for each asset category</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Level Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 font-serif">Level Information</h2>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="text-lg text-blue-800 mb-4">
                  <strong>Portfolio Level:</strong> {currentLevel.name} (${totalValue.toLocaleString()})
                </div>
                {currentLevel.level > 1 && (
                  <div className="text-blue-700 mb-4">
                    All limits automatically reduced by {currentLevel.limitReduction}% due to portfolio size
                  </div>
                )}
                <div className="text-sm text-blue-600">
                  {currentLevel.description}
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-serif">Quick Settings</h3>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetSelect(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg transition-all duration-300"
              >
                <option value="">Select preset...</option>
                {limitPresets.map((preset: LimitPreset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} - {preset.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Limits Configuration */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-serif">Limit Configuration</h3>
              
              <div className="space-y-6">
                {localLimits.map((limit) => (
                  <div key={limit.category} className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={limit.enabled}
                          onChange={() => handleToggleLimit(limit.category)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className={`px-4 py-2 rounded-xl text-sm font-medium ${getCategoryColor(limit.category)}`}>
                          {getCategoryName(limit.category)}
                        </span>
                      </div>
                      {limit.enabled && currentLevel.level > 1 && (
                        <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                          Adjusted: {adjustedLimits.find(l => l.category === limit.category)?.minPercentage.toFixed(1)}% - {adjustedLimits.find(l => l.category === limit.category)?.maxPercentage.toFixed(1)}%
                        </div>
                      )}
                    </div>

                    {limit.enabled && (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Minimum (%)
                          </label>
                          <input
                            type="number"
                            value={limit.minPercentage}
                            onChange={(e) => handleLimitChange(limit.category, 'minPercentage', parseFloat(e.target.value) || 0)}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Maximum (%)
                          </label>
                          <input
                            type="number"
                            value={limit.maxPercentage}
                            onChange={(e) => handleLimitChange(limit.category, 'maxPercentage', parseFloat(e.target.value) || 0)}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
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
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 text-red-800 mb-4">
                  <AlertTriangle className="w-6 h-6" />
                  <span className="text-lg font-semibold">Validation Errors:</span>
                </div>
                <ul className="text-red-700 space-y-2">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={validationErrors.length > 0}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-4 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-all duration-300 font-semibold text-lg"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>

            {validationErrors.length === 0 && (
              <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-2xl border border-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Settings are valid</span>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Level Benefits */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 font-serif">Level Benefits</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>Level {currentLevel.level}: {currentLevel.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>{currentLevel.description}</span>
                </div>
                {currentLevel.level > 1 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span>Limit reduction: {currentLevel.limitReduction}%</span>
                  </div>
                )}
                {currentLevel.level < 5 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Next level: {currentLevel.level + 1} (from ${(currentLevel.maxValue + 1).toLocaleString()})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Portfolio Value Demo */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 font-serif">Demo Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Portfolio Value (for demo)
                  </label>
                  <input
                    type="number"
                    value={totalValue}
                    onChange={(e) => setTotalValue(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter portfolio value"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Change the value to see how the portfolio level changes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 