# Code Examples & Snippets

This document provides practical examples for extending the Polymarket Market Monitor.

## Table of Contents
- [API Usage Examples](#api-usage-examples)
- [Custom Hooks](#custom-hooks)
- [Component Extensions](#component-extensions)
- [Utility Functions](#utility-functions)

## API Usage Examples

### Basic Market Fetching

```typescript
import { fetchMarkets } from '@/lib/api';

// Fetch all markets
const markets = await fetchMarkets();

// Get first 10 markets
const topTen = markets.slice(0, 10);
```

### Fetch Single Market

```typescript
import { fetchMarket } from '@/lib/api';

// Fetch by slug
const market = await fetchMarket('bitcoin-100k-2024');

console.log(market.question); // "Will Bitcoin hit $100K in 2024?"
console.log(market.outcomePrices); // '["0.65", "0.35"]'
```

### Filter Markets by Category

```typescript
import { fetchMarkets, filterByCategory } from '@/lib/api';

const markets = await fetchMarkets();

// Get only crypto markets
const cryptoMarkets = filterByCategory(markets, 'Crypto');

// Get only politics markets
const politicsMarkets = filterByCategory(markets, 'Politics');
```

### Search Markets

```typescript
import { fetchMarkets, searchMarkets } from '@/lib/api';

const markets = await fetchMarkets();

// Search for markets about Trump
const trumpMarkets = searchMarkets(markets, 'Trump');

// Search is case-insensitive
const bitcoinMarkets = searchMarkets(markets, 'bitcoin');
```

### Get Top Markets by Volume

```typescript
import { fetchMarkets, getTopMarkets } from '@/lib/api';

const markets = await fetchMarkets();

// Get top 20 by volume
const topMarkets = getTopMarkets(markets, 20);

// These are the most actively traded markets
topMarkets.forEach(market => {
  console.log(`${market.question}: ${market.volumeNum}`);
});
```

## Custom Hooks

### useMarkets Hook

Create a reusable hook for fetching markets:

```typescript
// lib/hooks/useMarkets.ts
import { useQuery } from '@tanstack/react-query';
import { fetchMarkets } from '@/lib/api';

export function useMarkets() {
  return useQuery({
    queryKey: ['markets'],
    queryFn: fetchMarkets,
    refetchInterval: 30 * 1000,
    staleTime: 20 * 1000,
  });
}

// Usage in components
function MyComponent() {
  const { data: markets, isLoading, isError } = useMarkets();
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error!</div>;
  
  return <div>{markets.length} markets</div>;
}
```

### useMarketSearch Hook

Create a hook for searching with debouncing:

```typescript
// lib/hooks/useMarketSearch.ts
import { useState, useEffect, useMemo } from 'react';
import { searchMarkets } from '@/lib/api';
import type { Market } from '@/lib/api';

export function useMarketSearch(markets: Market[], delay: number = 300) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  // Perform search with debounced query
  const results = useMemo(() => {
    return searchMarkets(markets, debouncedQuery);
  }, [markets, debouncedQuery]);

  return { query, setQuery, results };
}

// Usage
function SearchableMarketList({ markets }: { markets: Market[] }) {
  const { query, setQuery, results } = useMarketSearch(markets);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <div>{results.length} results</div>
    </div>
  );
}
```

### useMarketOdds Hook

Parse and format market odds:

```typescript
// lib/hooks/useMarketOdds.ts
import { useMemo } from 'react';
import { parseOutcomePrices } from '@/lib/utils';
import type { Market } from '@/lib/api';

export function useMarketOdds(market: Market) {
  return useMemo(() => {
    const prices = parseOutcomePrices(market.outcomePrices);
    const yesPrice = prices[0] || 0;
    const noPrice = prices[1] || 0;

    return {
      yesPrice,
      noPrice,
      yesPercentage: Math.round(yesPrice * 100),
      noPercentage: Math.round(noPrice * 100),
      isYesFavored: yesPrice > 0.5,
      confidence: Math.abs(yesPrice - 0.5) * 2, // 0-1 scale
    };
  }, [market.outcomePrices]);
}

// Usage
function MarketOddsDisplay({ market }: { market: Market }) {
  const odds = useMarketOdds(market);

  return (
    <div>
      <div>YES: {odds.yesPercentage}%</div>
      <div>NO: {odds.noPercentage}%</div>
      <div>Confidence: {(odds.confidence * 100).toFixed(0)}%</div>
    </div>
  );
}
```

## Component Extensions

### Market Detail Modal

```typescript
// components/market-detail-modal.tsx
'use client';

import { Market } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMarketOdds } from '@/lib/hooks/useMarketOdds';

interface MarketDetailModalProps {
  market: Market;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MarketDetailModal({ market, open, onOpenChange }: MarketDetailModalProps) {
  const odds = useMarketOdds(market);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{market.question}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Market image */}
          {market.image && (
            <img src={market.image} alt="" className="w-full rounded-lg" />
          )}
          
          {/* Full description */}
          <div className="prose prose-sm max-w-none">
            <p>{market.description}</p>
          </div>
          
          {/* Detailed odds */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">YES</div>
              <div className="text-3xl font-bold text-green-600">
                {odds.yesPercentage}%
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-600">NO</div>
              <div className="text-3xl font-bold text-red-600">
                {odds.noPercentage}%
              </div>
            </div>
          </div>
          
          {/* View on Polymarket button */}
          <a
            href={`https://polymarket.com/event/${market.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 text-center bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            View on Polymarket
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Price Alert Component

```typescript
// components/price-alert.tsx
'use client';

import { useState } from 'react';
import { Market } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell } from 'lucide-react';

interface PriceAlertProps {
  market: Market;
}

export function PriceAlert({ market }: PriceAlertProps) {
  const [targetPrice, setTargetPrice] = useState('');
  const [isSet, setIsSet] = useState(false);

  const handleSetAlert = () => {
    // In a real app, you'd save this to a database or local storage
    const price = parseFloat(targetPrice);
    if (price >= 0 && price <= 100) {
      console.log(`Alert set for ${market.question} at ${price}%`);
      setIsSet(true);
    }
  };

  if (isSet) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Bell className="h-4 w-4" />
        <span>Alert set for {targetPrice}%</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        min="0"
        max="100"
        value={targetPrice}
        onChange={(e) => setTargetPrice(e.target.value)}
        placeholder="Target %"
        className="w-24"
      />
      <Button onClick={handleSetAlert} size="sm">
        <Bell className="h-4 w-4 mr-1" />
        Set Alert
      </Button>
    </div>
  );
}
```

### Market Comparison View

```typescript
// components/market-comparison.tsx
'use client';

import { Market } from '@/lib/api';
import { useMarketOdds } from '@/lib/hooks/useMarketOdds';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MarketComparisonProps {
  markets: Market[];
}

export function MarketComparison({ markets }: MarketComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {markets.map((market) => (
            <ComparisonRow key={market.id} market={market} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonRow({ market }: { market: Market }) {
  const odds = useMarketOdds(market);

  return (
    <div className="flex items-center justify-between py-2 border-b">
      <div className="flex-1 text-sm">{market.question}</div>
      <div className="flex gap-4 text-sm font-semibold">
        <span className="text-green-600">{odds.yesPercentage}%</span>
        <span className="text-red-600">{odds.noPercentage}%</span>
      </div>
    </div>
  );
}
```

## Utility Functions

### Calculate Potential Profit

```typescript
// lib/utils.ts
export function calculateProfit(
  investmentAmount: number,
  buyPrice: number,
  outcomeOccurs: boolean
): number {
  if (outcomeOccurs) {
    // If you bought YES at 0.65 and it resolves YES, you get $1 per share
    return (investmentAmount / buyPrice) * 1 - investmentAmount;
  } else {
    // If outcome doesn't occur, you lose your investment
    return -investmentAmount;
  }
}

// Example usage
const profit = calculateProfit(100, 0.65, true);
console.log(`Profit: $${profit.toFixed(2)}`); // Profit: $53.85
```

### Market Sentiment Analysis

```typescript
// lib/utils.ts
export function getMarketSentiment(yesPrice: number): {
  sentiment: 'Very Likely' | 'Likely' | 'Toss Up' | 'Unlikely' | 'Very Unlikely';
  color: string;
} {
  if (yesPrice >= 0.8) {
    return { sentiment: 'Very Likely', color: 'text-green-700' };
  } else if (yesPrice >= 0.6) {
    return { sentiment: 'Likely', color: 'text-green-500' };
  } else if (yesPrice >= 0.4) {
    return { sentiment: 'Toss Up', color: 'text-yellow-500' };
  } else if (yesPrice >= 0.2) {
    return { sentiment: 'Unlikely', color: 'text-red-500' };
  } else {
    return { sentiment: 'Very Unlikely', color: 'text-red-700' };
  }
}
```

### Time Until Market Close

```typescript
// lib/utils.ts
export function getTimeUntilClose(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs < 0) return 'Closed';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 30) {
    return `${Math.floor(diffDays / 30)}mo ${diffDays % 30}d`;
  } else if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
}
```

### Export Markets to CSV

```typescript
// lib/utils.ts
export function exportMarketsToCSV(markets: Market[]): string {
  const headers = ['Question', 'Category', 'YES %', 'NO %', 'Volume', 'End Date'];
  
  const rows = markets.map(market => {
    const prices = parseOutcomePrices(market.outcomePrices);
    return [
      market.question,
      market.category,
      (prices[0] * 100).toFixed(2),
      (prices[1] * 100).toFixed(2),
      market.volumeNum.toFixed(2),
      market.endDate,
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

// Usage
function downloadCSV(markets: Market[]) {
  const csv = exportMarketsToCSV(markets);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `polymarket-markets-${new Date().toISOString()}.csv`;
  a.click();
}
```

## Advanced Examples

### WebSocket Integration (Conceptual)

```typescript
// lib/websocket.ts
export function createMarketWebSocket(marketId: string) {
  // This is conceptual - Polymarket would need to provide a WebSocket endpoint
  const ws = new WebSocket(`wss://gamma-api.polymarket.com/markets/${marketId}`);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Updated odds:', data.outcomePrices);
  };

  return ws;
}
```

### Market History Chart (with Chart.js)

```typescript
// components/market-chart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import type { Market } from '@/lib/api';

interface MarketChartProps {
  market: Market;
  historicalData: Array<{ timestamp: number; yesPrice: number }>;
}

export function MarketChart({ market, historicalData }: MarketChartProps) {
  const data = {
    labels: historicalData.map(d => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'YES Price',
        data: historicalData.map(d => d.yesPrice * 100),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
      },
    ],
  };

  return <Line data={data} options={{ responsive: true }} />;
}
```

---

## More Examples Needed?

Check out the [GitHub repository](https://github.com/yourusername/polymarket-market-monitor) for more examples and community contributions!
