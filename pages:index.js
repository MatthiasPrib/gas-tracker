import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, TrendingUp, Fuel, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import Head from 'next/head';

const MultiChainFeeTracker = () => {
  const [selectedCoin, setSelectedCoin] = useState('ethereum');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    gasData: {
      slow: 15,
      standard: 25, 
      fast: 35,
      instant: 50,
      unit: 'gwei',
      timestamp: new Date().toISOString()
    },
    prices: {
      ethereum: 2500,
      bitcoin: 45000,
      solana: 100
    },
    trends: {
      ethereum: 2.5,
      bitcoin: -1.2,
      solana: 5.8
    },
    isLive: false
  });

  const coins = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: '⟠', color: 'from-blue-500 to-purple-600' },
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: 'from-orange-400 to-yellow-600' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', icon: '◎', color: 'from-purple-400 to-pink-600' }
  ];

  const defaultGasData = {
    ethereum: { slow: 15, standard: 25, fast: 35, instant: 50, unit: 'gwei' },
    bitcoin: { slow: 5, standard: 10, fast: 20, instant: 30, unit: 'sat/vB' },
    solana: { slow: 0.000005, standard: 0.000005, fast: 0.00001, instant: 0.000015, unit: 'SOL' }
  };

  // Fetch data function
  const fetchData = async () => {
    try {
      console.log('Fetching data...');
      
      // Fetch gas data based on selected coin
      let gasData = { ...defaultGasData[selectedCoin] };
      
      if (selectedCoin === 'ethereum') {
        try {
          const gasResponse = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
          const gasResult = await gasResponse.json();
          if (gasResult.status === '1' && gasResult.result) {
            gasData = {
              slow: parseInt(gasResult.result.SafeGasPrice) || 15,
              standard: parseInt(gasResult.result.ProposeGasPrice) || 25,
              fast: parseInt(gasResult.result.FastGasPrice) || 35,
              instant: Math.floor(parseInt(gasResult.result.FastGasPrice) * 1.5) || 50,
              unit: 'gwei'
            };
          }
        } catch (e) {
          console.log('Ethereum API failed, using defaults');
        }
      } else if (selectedCoin === 'bitcoin') {
        try {
          const btcResponse = await fetch('https://mempool.space/api/v1/fees/recommended');
          const btcResult = await btcResponse.json();
          gasData = {
            slow: btcResult.hourFee || 5,
            standard: btcResult.halfHourFee || 10,
            fast: btcResult.fastestFee || 20,
            instant: Math.floor((btcResult.fastestFee || 20) * 1.5),
            unit: 'sat/vB'
          };
        } catch (e) {
          console.log('Bitcoin API failed, using defaults');
        }
      }

      // Fetch prices
      let prices = data.prices;
      let trends = data.trends;
      let isLive = false;

      try {
        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana&vs_currencies=usd&include_24hr_change=true');
        const priceResult = await priceResponse.json();
        
        if (priceResult && priceResult.ethereum) {
          prices = {
            ethereum: priceResult.ethereum?.usd || 2500,
            bitcoin: priceResult.bitcoin?.usd || 45000,
            solana: priceResult.solana?.usd || 100
          };
          trends = {
            ethereum: priceResult.ethereum?.usd_24h_change || 0,
            bitcoin: priceResult.bitcoin?.usd_24h_change || 0,
            solana: priceResult.solana?.usd_24h_change || 0
          };
          isLive = true;
          console.log('Live prices loaded:', prices);
        }
      } catch (e) {
        console.log('Price API failed, using defaults');
      }

      setData({
        gasData: { ...gasData, timestamp: new Date().toISOString() },
        prices,
        trends,
        isLive
      });

    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and coin change
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [selectedCoin]);

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedCoin]);

  // Cost calculation
  const calculateCost = (gasPrice, gasLimit) => {
    if (!gasPrice || !data.prices[selectedCoin]) return 0;
    
    switch(selectedCoin) {
      case 'ethereum':
        return ((gasPrice * gasLimit) / 1000000000) * data.prices.ethereum;
      case 'bitcoin':
        return ((gasPrice * gasLimit / 100000000) * data.prices.bitcoin);
      case 'solana':
        return gasPrice * data.prices.solana;
      default:
        return 0;
    }
  };

  const getTransactionTypes = () => {
    switch(selectedCoin) {
      case 'ethereum':
        return [
          { name: 'Simple Transfer', gasLimit: 21000, icon: '💸' },
          { name: 'ERC-20 Transfer', gasLimit: 65000, icon: '🪙' },
          { name: 'Uniswap Swap', gasLimit: 150000, icon: '🔄' },
          { name: 'NFT Mint', gasLimit: 200000, icon: '🖼️' },
          { name: 'DeFi Transaction', gasLimit: 350000, icon: '🏦' }
        ];
      case 'bitcoin':
        return [
          { name: 'Simple Transfer', gasLimit: 140, icon: '💸' },
          { name: 'Multi-Input TX', gasLimit: 250, icon: '🔗' },
          { name: 'SegWit Transfer', gasLimit: 110, icon: '⚡' },
          { name: 'Taproot Transfer', gasLimit: 100, icon: '🌿' },
          { name: 'Complex Script', gasLimit: 400, icon: '📜' }
        ];
      case 'solana':
        return [
          { name: 'Simple Transfer', gasLimit: 1, icon: '💸' },
          { name: 'Token Transfer', gasLimit: 1, icon: '🪙' },
          { name: 'DEX Swap', gasLimit: 1, icon: '🔄' },
          { name: 'NFT Mint', gasLimit: 1, icon: '🖼️' },
          { name: 'Program Interaction', gasLimit: 1, icon: '⚙️' }
        ];
      default:
        return [];
    }
  };

  const getSpeedConfig = (speed) => {
    const configs = {
      slow: { icon: <Clock className="w-4 h-4" />, color: 'text-green-400 bg-green-400/10 border-green-400/20', desc: 'Save money', time: '~5 min' },
      standard: { icon: <Minus className="w-4 h-4" />, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', desc: 'Balanced', time: '~2 min' },
      fast: { icon: <Zap className="w-4 h-4" />, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', desc: 'Quick confirm', time: '~30s' },
      instant: { icon: <ArrowUp className="w-4 h-4" />, color: 'text-red-400 bg-red-400/10 border-red-400/20', desc: 'Emergency', time: '~15s' }
    };
    return configs[speed] || configs.standard;
  };

  const formatGasValue = (value) => {
    if (selectedCoin === 'solana') {
      return `${(value * 1000000).toFixed(0)} lamports`;
    }
    return `${value} ${data.gasData.unit}`;
  };

  const currentCoin = coins.find(c => c.id === selectedCoin);
  const currentPrice = data.prices[selectedCoin] || 0;
  const currentTrend = data.trends[selectedCoin] || 0;

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading Gas Tracker...</title>
          <meta name="description" content="Multi-chain cryptocurrency gas fee tracker for Ethereum, Bitcoin, and Solana" />
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <Fuel className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
            <p className="text-purple-300">Loading {currentCoin?.name} Data...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Gas Tracker - Live Crypto Fees für Ethereum, Bitcoin & Solana</title>
        <meta name="description" content="Echtzeitvergleich der Transaktionsgebühren für Ethereum, Bitcoin und Solana. Optimiere deine Crypto-Transaktionen und spare Gebühren." />
        <meta name="keywords" content="Gas Fees, Ethereum, Bitcoin, Solana, Crypto, Blockchain, Transaktionsgebühren" />
        <meta property="og:title" content="Gas Tracker - Live Crypto Fee Monitor" />
        <meta property="og:description" content="Track live transaction fees across Ethereum, Bitcoin & Solana networks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Fuel className="w-8 h-8 text-purple-400 mr-3" />
              <h1 className="text-4xl font-bold text-white">Gas Tracker</h1>
            </div>
            <p className="text-purple-300">Live Transaktionsgebühren für Ethereum, Bitcoin & Solana</p>
            
            {/* Coin Selector */}
            <div className="flex justify-center mt-6 mb-4">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-2 flex gap-2">
                {coins.map(coin => (
                  <button
                    key={coin.id}
                    onClick={() => setSelectedCoin(coin.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      selectedCoin === coin.id 
                        ? `bg-gradient-to-r ${coin.color} text-white shadow-lg` 
                        : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-lg">{coin.icon}</span>
                    <span className="font-medium">{coin.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Price Display */}
            <div className="flex items-center justify-center mt-4 gap-6">
              <div className="flex items-center gap-2 text-purple-200">
                <span>{currentCoin?.symbol}:</span>
                <span className="font-bold text-white">${currentPrice.toFixed(selectedCoin === 'bitcoin' ? 0 : 2)}</span>
                {data.isLive && <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live data"></span>}
                {!data.isLive && <span className="text-xs text-orange-400">(demo)</span>}
              </div>
              <div className="flex items-center gap-1">
                {currentTrend > 0 ? (
                  <ArrowUp className="w-4 h-4 text-green-400" />
                ) : currentTrend < 0 ? (
                  <ArrowDown className="w-4 h-4 text-red-400" />
                ) : (
                  <Minus className="w-4 h-4 text-gray-400" />
                )}
                <span className={currentTrend > 0 ? 'text-green-400' : currentTrend < 0 ? 'text-red-400' : 'text-gray-400'}>
                  {Math.abs(currentTrend).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Fee Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {['slow', 'standard', 'fast', 'instant'].map((speed) => {
              const config = getSpeedConfig(speed);
              return (
                <div key={speed} className={`bg-slate-800/50 backdrop-blur border rounded-xl p-6 text-center hover:scale-105 transition-all duration-300 ${config.color}`}>
                  <div className="flex items-center justify-center mb-3">
                    {config.icon}
                    <span className="ml-2 font-semibold capitalize">{speed === 'slow' ? 'Langsam' : speed === 'standard' ? 'Standard' : speed === 'fast' ? 'Schnell' : 'Sofort'}</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatGasValue(data.gasData[speed])}
                  </div>
                  <div className="text-sm opacity-70 mb-2">{config.desc === 'Save money' ? 'Geld sparen' : config.desc === 'Balanced' ? 'Ausgewogen' : config.desc === 'Quick confirm' ? 'Schnell' : 'Notfall'}</div>
                  <div className="text-xs opacity-60">{config.time}</div>
                </div>
              );
            })}
          </div>

          {/* Cost Calculator */}
          <div className="bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-purple-400" />
              {currentCoin?.name} Kostenrechner
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-purple-300 py-3 px-2">Transaktionstyp</th>
                    <th className="text-center text-purple-300 py-3 px-2">
                      {selectedCoin === 'bitcoin' ? 'Größe (vBytes)' : selectedCoin === 'solana' ? 'Gebühr' : 'Gas Limit'}
                    </th>
                    <th className="text-center text-purple-300 py-3 px-2">Langsam</th>
                    <th className="text-center text-purple-300 py-3 px-2">Standard</th>
                    <th className="text-center text-purple-300 py-3 px-2">Schnell</th>
                    <th className="text-center text-purple-300 py-3 px-2">Sofort</th>
                  </tr>
                </thead>
                <tbody>
                  {getTransactionTypes().map((tx, index) => (
                    <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{tx.icon}</span>
                          <span className="text-white font-medium">{tx.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-2 text-purple-200">
                        {selectedCoin === 'solana' ? '~0.000005 SOL' : tx.gasLimit.toLocaleString()}
                      </td>
                      {['slow', 'standard', 'fast', 'instant'].map(speed => (
                        <td key={speed} className="text-center py-4 px-2">
                          <div className="text-white font-medium">
                            ${calculateCost(data.gasData[speed], tx.gasLimit).toFixed(4)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">💡 {currentCoin?.name} Optimierungs-Tipps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-200">
              {selectedCoin === 'ethereum' && (
                <>
                  <div>• Nutze "Langsam" für nicht-dringende Transaktionen</div>
                  <div>• Wochenendmorgen haben oft niedrigere Gebühren</div>
                  <div>• Erwäge Layer 2 Lösungen wie Polygon</div>
                  <div>• Mehrere Transaktionen wenn möglich bündeln</div>
                </>
              )}
              {selectedCoin === 'bitcoin' && (
                <>
                  <div>• SegWit-Adressen sparen Gebühren</div>
                  <div>• UTXOs während niedriger Gebühren konsolidieren</div>
                  <div>• Lightning Network für kleine Beträge nutzen</div>
                  <div>• Wochenendgebühren sind meist niedriger</div>
                </>
              )}
              {selectedCoin === 'solana' && (
                <>
                  <div>• Gebühren sind konstant niedrig (~0.00025$)</div>
                  <div>• Kein Timing-Optimierung nötig</div>
                  <div>• Priority Fees für schnellere Verarbeitung</div>
                  <div>• Fokus auf Netzwerk-Überlastung statt Gebühren</div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-purple-400 text-sm">
            <div className="mb-2">
              Aktualisiert: {new Date(data.gasData.timestamp).toLocaleTimeString()} • Alle 30s refresh
            </div>
            <div className="text-xs opacity-60">
              {data.isLive ? '🟢 Live-Daten von APIs' : '🟡 Demo-Daten - APIs nicht verfügbar'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MultiChainFeeTracker;