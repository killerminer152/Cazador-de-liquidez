export type Timeframe = '12H' | '24H' | '48H';

export type LiquidationSide = 'SHORT_LIQ' | 'LONG_LIQ';

export type LeverageTier = '100x' | '50x' | '25x' | '10x';

export interface LiquidityCluster {
  id: string;
  price: number;
  volumeUsdt: number;
  density: number; // 0.0 to 1.0 (normalized)
  side: LiquidationSide; // SHORT_LIQ (above price, buy orders from forced stop shorts) | LONG_LIQ (below price, sell orders)
  distancePct: number; // Signed or absolute % from current price
  leverage: LeverageTier;
  persistence: {
    '12H': number;
    '24H': number;
    '48H': number;
  };
  isMagneticWall: boolean;
  macroScore: number; // 1 to 10
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export interface MarketData {
  symbol: string;
  displaySymbol: string;
  currentPrice: number;
  previousClose: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  fundingRate: number;
  openInterestUsdt: number;
  longShortRatio: number;
  candles: Candle[];
  clusters: LiquidityCluster[];
  orderBook: {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
  };
  lastUpdated: number;
}

export interface CorrelationAnalysis {
  pearsonR: number; // -1 to 1
  rSquared: number; // 0 to 1
  isMirrorActive: boolean; // r > 0.85
  sampleSize: number;
  timeframe: Timeframe;
  lagMinutes: number; // Lead-lag relationship
  beta: number; // PEPE sensitivity to BTC
  historicalCorrelation: { time: number; r: number }[];
}

export interface MagneticRadarConfluence {
  isDetected: boolean;
  type: 'BULLISH_SHORT_HUNT' | 'BEARISH_LONG_HUNT' | 'BALANCED_RANGE' | 'NO_CONFLUENCE';
  pepeTargetCluster: LiquidityCluster | null;
  btcTargetCluster: LiquidityCluster | null;
  magneticScore: number; // 1 to 10
  distanceAlignmentPct: number;
  macroPersistenceScore: number; // 1 to 10
  densityScore: number; // 1 to 10
  symmetryScore: number; // 1 to 10
  headline: string;
  description: string;
  recommendedBufferPct: number;
  estimatedPiercingZone: {
    minPrice: number;
    maxPrice: number;
    optimalSafetyStop: number;
  };
}
