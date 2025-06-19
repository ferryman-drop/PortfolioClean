'use client';

import React, { useState } from 'react';
import { PortfolioItem, CryptoToken, PortfolioCategory, MarketData } from '../types';
import { fetchTokenData, calculatePortfolioValue, calculateAllocation } from '../utils/api';
import { formatCurrency } from '../utils/dateUtils';
import { Plus, Trash2, TrendingUp, TrendingDown, Filter, ExternalLink, Calculator } from 'lucide-react';

interface TokenManagerProps {
  items: PortfolioItem[];
  onAddToken: (item: PortfolioItem) => void;
  onRemoveToken: (tokenId: string) => void;
  onUpdateToken: (tokenId: string, amount: number) => void;
  marketData: MarketData;
}

const CATEGORY_COLORS = {
  BTC: 'bg-orange-100 text-orange-800 border-orange-200',
  ETH_BLUECHIPS: 'bg-blue-100 text-blue-800 border-blue-200',
  STABLECOINS: 'bg-green-100 text-green-800 border-green-200',
  DEFI_ALTCOINS: 'bg-purple-100 text-purple-800 border-purple-200'
};

const CATEGORY_LABELS = {
  BTC: 'Bitcoin',
  ETH_BLUECHIPS: 'ETH & Blue Chips',
  STABLECOINS: 'Stablecoins',
  DEFI_ALTCOINS: 'DeFi/Altcoins'
};

interface TokenFormData {
  tokenId: string;
  amount: string;
  purchasePrice: string;
  currentPrice: string;
  transactionLink: string;
  category: PortfolioCategory;
}

export default function TokenManager({ 
  items, 
  onAddToken, 
  onRemoveToken, 
  onUpdateToken, 
  marketData 
}: TokenManagerProps) {
  const [formData, setFormData] = useState<TokenFormData>({
    tokenId: '',
    amount: '',
    purchasePrice: '',
    currentPrice: '',
    transactionLink: '',
    category: 'BTC'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory | 'ALL'>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  const addToken = async () => {
    if (!formData.tokenId || !formData.amount || !formData.purchasePrice) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const tokenData = await fetchTokenData(formData.tokenId);
      if (!tokenData) {
        setError('Token not found. Please check the token ID.');
        return;
      }

      const tokenAmount = parseFloat(formData.amount);
      const purchasePrice = parseFloat(formData.purchasePrice);
      const currentPrice = parseFloat(formData.currentPrice) || tokenData.current_price;
      
      // Calculate ROI
      const roi = ((currentPrice - purchasePrice) / purchasePrice) * 100;
      
      const tokenValue = tokenAmount * currentPrice;

      const newItem: PortfolioItem = {
        token: {
          ...tokenData,
          category: formData.category,
          current_price: currentPrice
        },
        amount: tokenAmount,
        value: tokenValue,
        percentage: 0,
        purchasePrice: purchasePrice,
        transactionLink: formData.transactionLink,
        roi: roi
      };

      // Calculate new percentage
      const totalValue = calculatePortfolioValue([...items, newItem]);
      newItem.percentage = (tokenValue / totalValue) * 100;

      onAddToken(newItem);
      
      // Reset form
      setFormData({
        tokenId: '',
        amount: '',
        purchasePrice: '',
        currentPrice: '',
        transactionLink: '',
        category: 'BTC'
      });
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeToken = (tokenId: string) => {
    onRemoveToken(tokenId);
  };

  const updateTokenAmount = (tokenId: string, newAmount: string) => {
    const amount = parseFloat(newAmount) || 0;
    onUpdateToken(tokenId, amount);
  };

  // Filter tokens by category
  const filteredItems = selectedCategory === 'ALL' 
    ? items 
    : items.filter(item => item.token.category === selectedCategory);

  // Calculate category totals
  const categoryTotals = items.reduce((acc, item) => {
    const category = item.token.category;
    acc[category] = (acc[category] || 0) + item.value;
    return acc;
  }, {} as Record<PortfolioCategory, number>);

  const totalValue = calculatePortfolioValue(items);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 font-serif">Token Management</h2>

      {/* Category Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 font-serif">Portfolio by Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
            <div key={category} className="text-center p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
              <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {formatCurrency(categoryTotals[category as PortfolioCategory] || 0)}
              </div>
              <div className="text-xs text-gray-500">
                {items.filter(item => item.token.category === category).length} tokens
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Token Form */}
      <div className="mb-8">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl"
        >
          <Plus className="w-6 h-6" />
          {showAddForm ? 'Hide Form' : 'Add New Token'}
        </button>

        {showAddForm && (
          <div className="mt-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Add New Token</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Token ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  1. Token ID (CoinGecko) *
                </label>
                <input
                  type="text"
                  value={formData.tokenId}
                  onChange={(e) => setFormData({...formData, tokenId: e.target.value})}
                  placeholder="e.g., bitcoin, ethereum"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2. Amount *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  step="0.000001"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  3. Purchase Price *
                </label>
                <input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                />
              </div>

              {/* Current Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  4. Current Price
                </label>
                <input
                  type="number"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({...formData, currentPrice: e.target.value})}
                  placeholder="Auto from API"
                  step="0.01"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                />
              </div>

              {/* Transaction Link */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  5. Transaction Link (SSH)
                </label>
                <input
                  type="url"
                  value={formData.transactionLink}
                  onChange={(e) => setFormData({...formData, transactionLink: e.target.value})}
                  placeholder="https://etherscan.io/tx/..."
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                />
              </div>

              {/* Category */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  6. Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as PortfolioCategory})}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                >
                  {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
                    <option key={category} value={category}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROI Preview */}
            {formData.purchasePrice && formData.currentPrice && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">7. ROI (Return on Investment)</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {((parseFloat(formData.currentPrice) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice) * 100).toFixed(2)}%
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={addToken}
                disabled={isLoading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                {isLoading ? 'Adding...' : 'Add Token'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-lg font-semibold text-gray-700">Filter by category:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 ${
              selectedCategory === 'ALL'
                ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-md'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as PortfolioCategory)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 ${
                selectedCategory === category
                  ? `${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]} shadow-md`
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Token List */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 font-serif">
          Tokens ({filteredItems.length})
        </h3>
        
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-xl font-medium mb-2">
              {selectedCategory === 'ALL' ? 'No tokens in portfolio' : 'No tokens in this category'}
            </div>
            <div className="text-sm">Add your first token above</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <div key={item.token.id} className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-r from-white to-gray-50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={item.token.image} 
                      alt={item.token.name}
                      className="w-12 h-12 rounded-full shadow-md"
                    />
                    <div>
                      <div className="text-xl font-bold text-gray-900">{item.token.name}</div>
                      <div className="text-sm text-gray-600">{item.token.symbol}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${CATEGORY_COLORS[item.token.category]}`}>
                      {CATEGORY_LABELS[item.token.category]}
                    </span>
                    <button
                      onClick={() => removeToken(item.token.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-4">
                  <div>
                    <span className="text-gray-600 font-medium">Amount:</span>
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateTokenAmount(item.token.id, e.target.value)}
                      className="ml-2 w-24 p-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      step="0.000001"
                    />
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Current Price:</span>
                    <span className="ml-2 font-bold">{formatCurrency(item.token.current_price)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Value:</span>
                    <span className="ml-2 font-bold">{formatCurrency(item.value)}</span>
                  </div>
                </div>

                {/* ROI and Transaction Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">ROI:</span>
                    <span className={`font-bold text-lg ${(item.roi || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(item.roi || 0).toFixed(2)}%
                    </span>
                    {(item.roi || 0) > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  {item.transactionLink && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">Transaction:</span>
                      <a
                        href={item.transactionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">Portfolio Share:</span>
                    <span className="font-bold">{item.percentage.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 