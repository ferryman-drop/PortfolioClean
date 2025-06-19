'use client';

import React, { useState, useEffect } from 'react';
import { PortfolioItem, MarketData, PortfolioLevel, PortfolioAllocation, CategoryLimit, PortfolioCategory } from '../types';
import { fetchTokenData, calculatePortfolioValue, calculateAllocation, fetchMarketData, getTargetAllocation } from '../utils/api';
import { formatCurrency } from '../utils/dateUtils';
import { getPortfolioLevel, applyLevelReductions } from '../utils/portfolioLevels';
import PortfolioOverview from '../components/PortfolioOverview';
import TokenManager from '../components/TokenManager';
import Analytics from '../components/Analytics';
import MarketDataComponent from '../components/MarketData';
import PortfolioLevelDisplay from '../components/PortfolioLevelDisplay';
import { Settings, TrendingUp, BarChart3, Coins, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [marketData, setMarketData] = useState<MarketData>({
    btcDominance: 52.5,
    totalMarketCap: 2500000000000,
    marketTrend: 'SIDEWAYS'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchMarketData();
        setMarketData(data);
      } catch (error) {
        console.error('Failed to load market data:', error);
        // Use fallback data
        setMarketData({
          btcDominance: 52.5,
          totalMarketCap: 2500000000000,
          marketTrend: 'SIDEWAYS'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketData();
    const interval = setInterval(loadMarketData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const addToken = (item: PortfolioItem) => {
    setItems(prev => {
      const newItems = [...prev, item];
      return newItems;
    });
  };

  const removeToken = (tokenId: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.token.id !== tokenId);
      return newItems;
    });
  };

  const updateTokenAmount = (tokenId: string, newAmount: number) => {
    setItems(prev => {
      const newItems = prev.map(item => 
        item.token.id === tokenId 
          ? { ...item, amount: newAmount, value: newAmount * item.token.current_price }
          : item
      );
      return newItems;
    });
  };

  const totalValue = calculatePortfolioValue(items);
  const currentLevel = getPortfolioLevel(totalValue);
  const currentAllocation = calculateAllocation(items);
  const targetAllocation = getTargetAllocation(marketData.btcDominance, true);
  
  // Demo category limits for PortfolioOverview
  const categoryLimits: CategoryLimit[] = [
    { category: 'BTC', minPercentage: 20, maxPercentage: 30, enabled: true },
    { category: 'ETH_BLUECHIPS', minPercentage: 20, maxPercentage: 30, enabled: true },
    { category: 'STABLECOINS', minPercentage: 20, maxPercentage: 30, enabled: true },
    { category: 'DEFI_ALTCOINS', minPercentage: 20, maxPercentage: 30, enabled: true }
  ];
  const adjustedLimits = applyLevelReductions(categoryLimits, currentLevel);

  // Check for violations
  const violations: { category: PortfolioCategory; violation: string }[] = [];
  adjustedLimits.forEach(limit => {
    if (limit.enabled) {
      const currentPercentage = currentAllocation[limit.category];
      if (currentPercentage < limit.minPercentage) {
        violations.push({
          category: limit.category,
          violation: `Below minimum (${currentPercentage.toFixed(1)}% < ${limit.minPercentage.toFixed(1)}%)`
        });
      }
      if (currentPercentage > limit.maxPercentage) {
        violations.push({
          category: limit.category,
          violation: `Above maximum (${currentPercentage.toFixed(1)}% > ${limit.maxPercentage.toFixed(1)}%)`
        });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 font-serif">
            Crypto Portfolio Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your crypto portfolio intelligently. Automatic allocation, analytics, and rebalancing recommendations.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link 
            href="/limits"
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Category Limits</h3>
                <p className="text-gray-600 text-sm">Configure category restrictions</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Auto-Rebalancing</h3>
                <p className="text-gray-600 text-sm">Enabled</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics</h3>
                <p className="text-gray-600 text-sm">Real-time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Level Display */}
        <div className="mb-8">
          <PortfolioLevelDisplay totalValue={totalValue} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Overview */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <PortfolioOverview 
                items={items} 
                totalValue={totalValue}
                currentAllocation={currentAllocation}
                targetAllocation={targetAllocation}
                violations={violations}
                level={currentLevel}
                adjustedLimits={adjustedLimits}
              />
            </div>

            {/* Portfolio Analytics (moved before Token Manager) */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <Analytics 
                items={items}
                currentAllocation={currentAllocation}
                targetAllocation={targetAllocation}
                marketData={marketData}
                level={currentLevel}
              />
            </div>

            {/* Token Manager */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <TokenManager 
                items={items}
                onAddToken={addToken}
                onRemoveToken={removeToken}
                onUpdateToken={updateTokenAmount}
                marketData={marketData}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Market Data */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <MarketDataComponent 
                marketData={marketData}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <p className="text-sm">
            Data updates every 5 minutes. Source: CoinGecko API
          </p>
        </div>
      </div>
    </div>
  );
} 