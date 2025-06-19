import { Portfolio, CryptoToken } from '../types';

// Demo tokens for testing
export const demoTokens: CryptoToken[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    current_price: 45000,
    market_cap: 850000000000,
    price_change_percentage_24h: 2.5,
    image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    category: 'BTC'
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    current_price: 3200,
    market_cap: 380000000000,
    price_change_percentage_24h: 1.8,
    image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    category: 'ETH_BLUECHIPS'
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    current_price: 1.00,
    market_cap: 25000000000,
    price_change_percentage_24h: 0.01,
    image: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    category: 'STABLECOINS'
  },
  {
    id: 'uniswap',
    symbol: 'UNI',
    name: 'Uniswap',
    current_price: 12.50,
    market_cap: 7500000000,
    price_change_percentage_24h: -1.2,
    image: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
    category: 'DEFI_ALTCOINS'
  }
];

// Demo portfolio
export const demoPortfolio: Portfolio = {
  items: [
    {
      token: demoTokens[0],
      amount: 0.5,
      value: 22500,
      percentage: 25
    },
    {
      token: demoTokens[1],
      amount: 7.0,
      value: 22400,
      percentage: 24.9
    },
    {
      token: demoTokens[2],
      amount: 25000,
      value: 25000,
      percentage: 27.8
    },
    {
      token: demoTokens[3],
      amount: 1800,
      value: 22500,
      percentage: 25
    }
  ],
  totalValue: 92400,
  allocation: {
    BTC: 25,
    ETH_BLUECHIPS: 24.9,
    STABLECOINS: 27.8,
    DEFI_ALTCOINS: 25
  },
  riskScore: 45.2,
  lastRebalanced: new Date()
};

// Popular token IDs for quick reference
export const popularTokens = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
  { id: 'usd-coin', name: 'USD Coin', symbol: 'USDC' },
  { id: 'tether', name: 'Tether', symbol: 'USDT' },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
  { id: 'solana', name: 'Solana', symbol: 'SOL' },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI' },
  { id: 'aave', name: 'Aave', symbol: 'AAVE' },
  { id: 'compound', name: 'Compound', symbol: 'COMP' },
  { id: 'maker', name: 'Maker', symbol: 'MKR' },
  { id: 'dai', name: 'Dai', symbol: 'DAI' },
  { id: 'busd', name: 'Binance USD', symbol: 'BUSD' }
]; 