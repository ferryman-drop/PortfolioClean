# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Your Browser
Navigate to `http://localhost:3000`

### 4. Add Your First Token
1. In the "Token Manager" section, enter a token ID (e.g., "bitcoin")
2. Enter the amount you hold
3. Click "Add Token"

## 📝 Popular Token IDs

Use these CoinGecko IDs to quickly add common cryptocurrencies:

| Token | ID | Symbol |
|-------|----|--------|
| Bitcoin | `bitcoin` | BTC |
| Ethereum | `ethereum` | ETH |
| USD Coin | `usd-coin` | USDC |
| Tether | `tether` | USDT |
| BNB | `binancecoin` | BNB |
| Cardano | `cardano` | ADA |
| Solana | `solana` | SOL |
| Polkadot | `polkadot` | DOT |
| Chainlink | `chainlink` | LINK |
| Uniswap | `uniswap` | UNI |

## 🎯 Understanding the 4 Categories

### 1. BTC (Bitcoin)
- **Purpose**: Store of value, digital gold
- **Target**: 25% (adjusts based on BTC dominance)
- **Examples**: Bitcoin

### 2. ETH & Blue Chips
- **Purpose**: Smart contract platforms, established projects
- **Target**: 25%
- **Examples**: Ethereum, BNB, Cardano, Solana

### 3. Stablecoins
- **Purpose**: Low volatility, USD-pegged assets
- **Target**: 25%
- **Examples**: USDC, USDT, DAI, BUSD

### 4. DeFi & Altcoins
- **Purpose**: Higher risk/reward, innovative projects
- **Target**: 25%
- **Examples**: Uniswap, Aave, Compound, Chainlink

## 🔄 Auto Mode Explained

### When Auto Mode is ON:
- **High BTC Dominance (>50%)**: Conservative allocation
  - BTC: 35%, ETH: 25%, Stablecoins: 25%, DeFi: 15%
- **Moderate BTC Dominance (40-50%)**: Balanced allocation
  - BTC: 30%, ETH: 25%, Stablecoins: 25%, DeFi: 20%
- **Low BTC Dominance (<40%)**: Equal allocation
  - BTC: 25%, ETH: 25%, Stablecoins: 25%, DeFi: 25%

### When Auto Mode is OFF:
- Fixed 25% allocation across all categories

## 📊 Understanding the Dashboard

### Portfolio Overview
- **Current Allocation**: Your actual portfolio distribution
- **Target Allocation**: Recommended distribution based on market conditions
- **Total Value**: Sum of all your holdings in USD

### Analytics & Recommendations
- **Risk Score**: Portfolio risk assessment (0-100)
- **Rebalancing Recommendations**: Actions needed to reach target allocation
- **Market Analysis**: BTC dominance and market trend

### Market Data
- **BTC Dominance**: Percentage of Bitcoin in total market cap
- **Total Market Cap**: Overall cryptocurrency market size
- **Market Trend**: Bull/Bear/Sideways market detection

## ⚠️ Important Notes

1. **API Rate Limits**: CoinGecko free tier has 50 calls/minute limit
2. **Real-time Data**: Prices update automatically every minute
3. **No Data Persistence**: Portfolio data is stored in browser memory only
4. **Educational Purpose**: This is a demo application for learning

## 🆘 Troubleshooting

### "Token not found" Error
- Check the token ID spelling
- Use the exact CoinGecko ID (lowercase, no spaces)
- Try searching on [CoinGecko](https://coingecko.com) first

### Charts Not Loading
- Ensure you have a stable internet connection
- Check browser console for errors
- Refresh the page

### Slow Performance
- Reduce the number of tokens in your portfolio
- Check your internet connection
- Consider upgrading CoinGecko API plan

## 🎉 Next Steps

1. **Add Your Portfolio**: Start with your actual holdings
2. **Monitor Recommendations**: Check rebalancing suggestions
3. **Adjust Auto Mode**: Toggle between automatic and manual allocation
4. **Track Performance**: Monitor your portfolio over time

---

**Need Help?** Check the main README.md for detailed documentation and API information. 