# Polymarket Market Monitor 📊

A real-time prediction market monitoring dashboard built with Next.js 14, TypeScript, and Polymarket's Gamma API. This template demonstrates production-ready patterns for building developer tools and integrations with Polymarket.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css)

> 🎓 **Educational Template**: This is a learning resource and starter template for developers building on Polymarket. Perfect for DevRel portfolios and understanding modern React patterns with real-world APIs.

## 🎯 What This Template Teaches

This is a **production-ready starter template** that teaches developers:

### 1. **Polymarket Gamma API Integration**
- How to fetch market data without authentication
- Understanding market data structures (odds, volume, liquidity)
- Real-time data fetching patterns
- API error handling and retry logic

### 2. **Modern React Patterns**
- TanStack Query for server state management
- Automatic background refetching (30-second intervals)
- Optimistic UI updates and caching strategies
- Clean component composition

### 3. **Production-Ready Architecture**
- TypeScript for type safety
- Modular file structure
- Utility functions for formatting and calculations
- Responsive design (mobile-first)

### 4. **UI/UX Best Practices**
- shadcn/ui component library integration
- Accessible components (Radix UI primitives)
- Smooth animations and transitions
- Loading and error states

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager

### Installation

```bash
# Clone or navigate to the project
cd polymarket-market-monitor

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
polymarket-market-monitor/
├── app/                      # Next.js 14 App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page
│   ├── providers.tsx        # TanStack Query setup
│   └── globals.css          # Global styles + Tailwind
├── components/
│   ├── market-dashboard.tsx # Main dashboard orchestrator
│   ├── market-card.tsx      # Individual market card
│   └── ui/                  # shadcn/ui components
│       ├── card.tsx
│       ├── tabs.tsx
│       ├── input.tsx
│       └── badge.tsx
├── lib/
│   ├── api.ts               # Gamma API client & helpers
│   └── utils.ts             # Utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔌 Gamma API Overview

### What is the Gamma API?

The **Gamma API** is Polymarket's public REST API for accessing market data. It requires **no authentication** for read-only operations, making it perfect for integrations.

**Base URL:** `https://gamma-api.polymarket.com`

### Key Endpoints

#### 1. `GET /markets`
List markets (**paginated**).

**Important:** calling `/markets` with **no** query params typically returns ~20 markets. Use `limit`/`offset` (and optional filters) to get a useful dataset for dashboards.

**Response includes:**
- Market question/title
- Current odds (0-1 probability scale)
- Trading volume and liquidity
- Category and metadata
- Active/closed status

**Example (open markets, bigger page — what this template does):**
```typescript
const url = new URL('https://gamma-api.polymarket.com/markets');
url.searchParams.set('limit', '500');
url.searchParams.set('active', 'true');
url.searchParams.set('closed', 'false');

const response = await fetch(url);
const markets = await response.json();
```

**Example (pagination):**
- Page 1: `/markets?limit=100&offset=0`
- Page 2: `/markets?limit=100&offset=100`

#### 2. `GET /markets/:slug`
Fetch a specific market by its URL slug.

**Example:**
```typescript
const market = await fetch(
  'https://gamma-api.polymarket.com/markets/will-trump-win-2024'
);
```

### Understanding Market Data

```typescript
interface Market {
  id: string;
  question: string;          // "Will Bitcoin hit $100K in 2024?"
  slug: string;              // "bitcoin-100k-2024"
  category: string;          // "Crypto"
  volume: string;            // "1234567.89" (in USDC)
  outcomePrices: string;     // '["0.65", "0.35"]' (YES/NO odds)
  endDate: string;           // "2024-12-31T23:59:59Z"
  active: boolean;           // true if still trading
  closed: boolean;           // true if resolved
}
```

**Odds Explained:**
- Prices are on a 0-1 scale representing probability
- `outcomePrices: ["0.65", "0.35"]` means:
  - 65% chance of YES
  - 35% chance of NO
- Prices always sum to ~1.00 (with small variance for fees)

## 🛠️ Key Implementation Details

### 1. TanStack Query Configuration

Located in `app/providers.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20 * 1000,     // Data fresh for 20 seconds
      gcTime: 5 * 60 * 1000,    // Cache for 5 minutes
      refetchInterval: 30 * 1000, // Auto-refresh every 30s
      refetchOnWindowFocus: true, // Refetch when tab focused
    },
  },
});
```

**Why this matters:**
- Keeps odds updated in real-time
- Reduces API calls with smart caching
- Provides smooth UX during navigation

### 2. Data Fetching Pattern

Located in `components/market-dashboard.tsx`:

```typescript
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ['markets'],
  queryFn: fetchMarkets,
  refetchInterval: 30 * 1000,
});
```

**Benefits:**
- Automatic loading/error states
- Background refetching
- Request deduplication
- Built-in retry logic

### 3. Sorting & Search

The dashboard implements efficient client-side sorting and search:

```typescript
const filteredMarkets = useMemo(() => {
  let processed = getTopMarkets(markets, 100);
  processed = sortMarkets(processed, selectedSort); // All, Trending, Ending Soon, etc.
  processed = searchMarkets(processed, searchQuery);
  return processed;
}, [markets, selectedSort, searchQuery]);
```

**Optimized with `useMemo`** to avoid unnecessary recalculations.

### 4. Odds Visualization

Each market card displays visual odds:

```typescript
const prices = parseOutcomePrices(market.outcomePrices);
const yesPercentage = Math.round(prices[0] * 100);

<div className="h-2 bg-gradient-to-r from-green-500 to-green-600"
     style={{ width: `${yesPercentage}%` }} />
```

## 🎨 Customization Guide

### Changing Sort Options

Edit `components/market-dashboard.tsx`:

```typescript
const SORT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "trending", label: "Trending" },
  { value: "ending-soon", label: "Ending Soon" },
  { value: "long-term", label: "Long-Term" },
  { value: "new", label: "New" },
  // Add custom sorting here
] as const;
```

### Adjusting Refresh Rate

Edit `components/market-dashboard.tsx`:

```typescript
refetchInterval: 60 * 1000, // Change to 60 seconds
```

### Changing Number of Markets

Edit `components/market-dashboard.tsx`:

```typescript
let processed = getTopMarkets(markets, 200); // Show top 200
```

### Modifying Card Layout

Edit `components/market-card.tsx` to customize:
- Displayed information
- Visual styling
- Interaction behavior

## 🔐 Rate Limits & Best Practices

### API Rate Limits

The Gamma API doesn't publish official rate limits, but follow these best practices:

1. **Use caching** (TanStack Query handles this)
2. **Reasonable polling intervals** (30-60 seconds)
3. **Avoid parallel requests** when possible
4. **Implement exponential backoff** on errors

### Error Handling

```typescript
const { data, isError, error, retry } = useQuery({
  queryKey: ['markets'],
  queryFn: fetchMarkets,
  retry: 3, // Retry failed requests 3 times
});
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

This is a standard Next.js app and works on:
- Netlify
- AWS Amplify
- Cloudflare Pages
- Railway
- Render

## 📚 Learning Resources

### Polymarket Resources
- [Polymarket Docs](https://docs.polymarket.com)
- [Gamma API Reference](https://docs.polymarket.com/api-reference)
- [Polymarket Blog](https://polymarket.com/blog)

### Tech Stack Resources
- [Next.js 14 Docs](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing Ideas

This template is a starting point. Here are ideas to extend it:

### Feature Ideas
- [ ] Market detail pages with full description
- [ ] Historical odds charting
- [ ] Price alerts and notifications
- [ ] Social sharing functionality
- [ ] Advanced filtering (by volume, liquidity, end date)
- [ ] Portfolio tracking (watch list)
- [ ] Market comparison view
- [ ] Twitter integration (embed market tweets)

### Advanced Integrations
- [ ] Polymarket CLOB API (order book data)
- [ ] WebSocket connections for real-time updates
- [ ] User wallet integration (view positions)
- [ ] Trading interface (buy/sell shares)

## 🐛 Troubleshooting

### Markets not loading?
- Check your internet connection
- Verify the Gamma API is accessible: `curl https://gamma-api.polymarket.com/markets?limit=1`
- Check the browser console for error messages

### Slow performance?
- Reduce the number of markets displayed (default: 100)
- Increase the refresh interval (default: 30 seconds)
- Check your browser's memory usage

### CORS errors?
- This template uses a Next.js API route (`/api/markets`) to proxy requests and avoid CORS issues
- If you see CORS errors, ensure the API route is working correctly

## 📖 Further Reading

### Want to dive deeper?
- **Blog Post**: [Building a Polymarket Market Monitor](https://yootarchy.vercel.app/blog/building-polymarket-scanner) - Detailed walkthrough
- **Resources**: [Awesome Polymarket](https://yootarchy.vercel.app/resources) - Curated list of tools and SDKs
- **More Experiments**: [Yootarchy Experiments](https://yootarchy.vercel.app/experiments) - Other starter templates

### Building something more advanced?
- Check out [py-clob-client](https://github.com/Polymarket/py-clob-client) for trading
- See [poly-maker](https://github.com/warproxxx/poly-maker) for market making
- Read the [official docs](https://docs.polymarket.com) for comprehensive guides

## 💬 Community & Support

- **Issues**: Found a bug? [Open an issue](https://github.com/yootarchy/polymarket-market-monitor/issues)
- **Discussions**: Questions? Use [GitHub Discussions](https://github.com/yootarchy/polymarket-market-monitor/discussions)
- **Twitter**: Follow [@yoot_hfact](https://x.com/yoot_hfact) for updates
- **Polymarket Discord**: Join the [official Discord](https://discord.gg/polymarket)

## 📄 License

MIT License - feel free to use this template for any project.

## 🙏 Acknowledgments

- [Polymarket](https://polymarket.com) for the Gamma API
- [shadcn](https://ui.shadcn.com/) for the excellent component library
- [Vercel](https://vercel.com) for Next.js and hosting

---

**Built with ❤️ for the Polymarket developer community**

Questions? Open an issue or reach out on [Twitter](https://x.com/yoot_hfact)!

---

### 📸 Preview

![Market Monitor Dashboard](https://raw.githubusercontent.com/yootarchy/polymarket-market-monitor/main/public/preview.png)

*Real-time market monitoring with search, filters, and auto-refresh*
