# Gas Tracker - Multi-Chain Fee Monitor

Live cryptocurrency transaction fee tracker for Ethereum, Bitcoin, and Solana networks.

## Features
- 🟠 **Ethereum**: Real-time gas prices from Etherscan API
- 🟡 **Bitcoin**: Live fee estimates from Mempool.space API  
- 🟣 **Solana**: Low-cost transaction monitoring
- 💰 **Live Prices**: CoinGecko integration for price tracking
- 📱 **Responsive**: Works on desktop and mobile
- ⚡ **Auto-refresh**: Updates every 30 seconds

## Tech Stack
- Next.js 14
- React 18
- Tailwind CSS
- Lucide React Icons

## Development
```bash
npm install
npm run dev
```

## Deployment
```bash
npm run build
npm run export
```

Then upload the `out/` folder to your hosting provider.

## APIs Used
- Etherscan Gas Tracker API
- Mempool.space Bitcoin Fees API
- CoinGecko Prices API

## License
MIT License

---
Built for gas-tracker.de