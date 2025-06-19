import axios from 'axios';
import { CryptoToken, PortfolioCategory, MarketData, PortfolioAllocation, PortfolioItem } from '../types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Create axios instance with better configuration
const apiClient = axios.create({
  baseURL: COINGECKO_API,
  timeout: 5000, // Reduced timeout to prevent hanging
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'CryptoPortfolioManager/1.0'
  }
});

// Add request interceptor for rate limiting
apiClient.interceptors.request.use((config) => {
  // Add delay to respect rate limits
  return new Promise(resolve => {
    setTimeout(() => resolve(config), 50); // Reduced delay
  });
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded, retrying in 500ms...');
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(apiClient.request(error.config));
        }, 500);
      });
    }
    return Promise.reject(error);
  }
);

// Fallback data for when API fails
const FALLBACK_MARKET_DATA: MarketData = {
  btcDominance: 52.5,
  totalMarketCap: 2500000000000,
  marketTrend: 'SIDEWAYS'
};

// CoinGecko API functions with improved error handling
export const fetchTokenPrice = async (tokenId: string): Promise<number> => {
  try {
    const response = await apiClient.get('/simple/price', {
      params: {
        ids: tokenId,
        vs_currencies: 'usd'
      }
    });
    
    if (response.data && response.data[tokenId] && response.data[tokenId].usd) {
      return response.data[tokenId].usd;
    }
    
    console.warn(`No price data found for token: ${tokenId}`);
    return 0;
  } catch (error) {
    console.error(`Error fetching token price for ${tokenId}:`, error);
    // Return fallback price based on token
    const fallbackPrices: { [key: string]: number } = {
      'bitcoin': 45000,
      'ethereum': 2500,
      'usd-coin': 1,
      'tether': 1,
      'binancecoin': 300,
      'cardano': 0.5,
      'solana': 100,
      'polkadot': 7
    };
    return fallbackPrices[tokenId] || 1;
  }
};

export const fetchTokenData = async (tokenId: string): Promise<CryptoToken | null> => {
  try {
    const response = await apiClient.get(`/coins/${tokenId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      }
    });
    
    const data = response.data;
    
    if (!data || !data.market_data) {
      console.warn(`Invalid data received for token: ${tokenId}`);
      return null;
    }
    
    return {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      current_price: data.market_data.current_price?.usd || 0,
      market_cap: data.market_data.market_cap?.usd || 0,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h || 0,
      image: data.image?.small || '',
      category: determineCategory(data.id, data.symbol)
    };
  } catch (error) {
    console.error(`Error fetching token data for ${tokenId}:`, error);
    // Return fallback token data
    const fallbackTokens: { [key: string]: CryptoToken } = {
      'bitcoin': {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 45000,
        market_cap: 850000000000,
        price_change_percentage_24h: 2.5,
        image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
        category: 'BTC'
      },
      'ethereum': {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: 2500,
        market_cap: 300000000000,
        price_change_percentage_24h: 1.8,
        image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        category: 'ETH_BLUECHIPS'
      },
      'usd-coin': {
        id: 'usd-coin',
        symbol: 'USDC',
        name: 'USD Coin',
        current_price: 1,
        market_cap: 25000000000,
        price_change_percentage_24h: 0,
        image: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
        category: 'STABLECOINS'
      }
    };
    return fallbackTokens[tokenId] || null;
  }
};

export const fetchMarketData = async (): Promise<MarketData> => {
  try {
    const response = await apiClient.get('/global');
    const data = response.data.data;
    
    if (!data) {
      throw new Error('Invalid market data response');
    }
    
    return {
      btcDominance: data.market_cap_percentage?.btc || 52.5,
      totalMarketCap: data.total_market_cap?.usd || 2500000000000,
      marketTrend: determineMarketTrend(data.market_cap_change_percentage_24h_usd || 0)
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    return FALLBACK_MARKET_DATA;
  }
};

// Enhanced function to update portfolio prices with batch processing
export const updatePortfolioPrices = async (items: PortfolioItem[]): Promise<PortfolioItem[]> => {
  if (items.length === 0) return items;
  
  try {
    // Batch request for better performance
    const tokenIds = items.map(item => item.token.id).join(',');
    const response = await apiClient.get('/simple/price', {
      params: {
        ids: tokenIds,
        vs_currencies: 'usd'
      }
    });
    
    const priceData = response.data;
    
    return items.map(item => {
      const newPrice = priceData[item.token.id]?.usd;
      if (newPrice && newPrice > 0) {
        return {
          ...item,
          token: {
            ...item.token,
            current_price: newPrice
          },
          value: item.amount * newPrice
        };
      }
      return item;
    });
  } catch (error) {
    console.error('Error updating portfolio prices:', error);
    // Fallback to individual requests
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const newPrice = await fetchTokenPrice(item.token.id);
          if (newPrice > 0) {
            return {
              ...item,
              token: {
                ...item.token,
                current_price: newPrice
              },
              value: item.amount * newPrice
            };
          }
          return item;
        } catch (error) {
          console.error(`Error updating price for ${item.token.symbol}:`, error);
          return item;
        }
      })
    );
    
    return updatedItems;
  }
};

// Helper functions with improved logic
const determineCategory = (id: string, symbol: string): PortfolioCategory => {
  const symbolUpper = symbol.toUpperCase();
  const idLower = id.toLowerCase();
  
  // Bitcoin
  if (idLower === 'bitcoin' || symbolUpper === 'BTC') return 'BTC';
  
  // Ethereum and major blue chips
  if (idLower === 'ethereum' || symbolUpper === 'ETH') return 'ETH_BLUECHIPS';
  if (['binancecoin', 'bnb'].includes(idLower) || symbolUpper === 'BNB') return 'ETH_BLUECHIPS';
  if (['cardano', 'ada'].includes(idLower) || symbolUpper === 'ADA') return 'ETH_BLUECHIPS';
  if (['solana', 'sol'].includes(idLower) || symbolUpper === 'SOL') return 'ETH_BLUECHIPS';
  if (['polkadot', 'dot'].includes(idLower) || symbolUpper === 'DOT') return 'ETH_BLUECHIPS';
  
  // Stablecoins
  const stablecoinIds = ['usd-coin', 'tether', 'dai', 'busd', 'true-usd', 'frax'];
  const stablecoinSymbols = ['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'FRAX'];
  
  if (stablecoinIds.includes(idLower) || stablecoinSymbols.includes(symbolUpper)) {
    return 'STABLECOINS';
  }
  
  // Default to DeFi/Altcoins
  return 'DEFI_ALTCOINS';
};

const determineMarketTrend = (change24h: number): 'BULL' | 'BEAR' | 'SIDEWAYS' => {
  if (change24h > 2) return 'BULL';
  if (change24h < -2) return 'BEAR';
  return 'SIDEWAYS';
};

// Portfolio management functions
export const calculatePortfolioValue = (items: PortfolioItem[]): number => {
  return items.reduce((total, item) => total + item.value, 0);
};

export const calculateAllocation = (items: PortfolioItem[]): PortfolioAllocation => {
  const totalValue = calculatePortfolioValue(items);
  const allocation: PortfolioAllocation = {
    BTC: 0,
    ETH_BLUECHIPS: 0,
    STABLECOINS: 0,
    DEFI_ALTCOINS: 0
  };

  if (totalValue > 0) {
    items.forEach(item => {
      const percentage = (item.value / totalValue) * 100;
      allocation[item.token.category as keyof PortfolioAllocation] += percentage;
    });
  }

  return allocation;
};

export const getTargetAllocation = (btcDominance: number, autoMode: boolean = true): PortfolioAllocation => {
  if (autoMode) {
    // Adjust allocation based on BTC dominance with more granular control
    if (btcDominance > 55) {
      return { BTC: 40, ETH_BLUECHIPS: 25, STABLECOINS: 20, DEFI_ALTCOINS: 15 };
    } else if (btcDominance > 50) {
      return { BTC: 35, ETH_BLUECHIPS: 25, STABLECOINS: 25, DEFI_ALTCOINS: 15 };
    } else if (btcDominance > 45) {
      return { BTC: 30, ETH_BLUECHIPS: 25, STABLECOINS: 25, DEFI_ALTCOINS: 20 };
    } else if (btcDominance > 40) {
      return { BTC: 25, ETH_BLUECHIPS: 25, STABLECOINS: 25, DEFI_ALTCOINS: 25 };
    } else {
      return { BTC: 20, ETH_BLUECHIPS: 25, STABLECOINS: 25, DEFI_ALTCOINS: 30 };
    }
  }
  
  // Default 25% each
  return { BTC: 25, ETH_BLUECHIPS: 25, STABLECOINS: 25, DEFI_ALTCOINS: 25 };
}; 