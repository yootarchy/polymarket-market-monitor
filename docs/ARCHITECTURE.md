# Architecture Documentation

## Overview

This document explains the technical architecture and key design decisions in the Polymarket Market Monitor template.

## Tech Stack Decisions

### Next.js 14 with App Router

**Why:** 
- Server Components for improved performance
- Built-in routing and API routes
- Excellent TypeScript support
- Industry-standard for React applications

**Trade-offs:**
- App Router is relatively new (but stable)
- Learning curve for developers familiar with Pages Router

### TanStack Query (React Query)

**Why:**
- Best-in-class server state management
- Automatic caching and background refetching
- Built-in loading/error states
- Optimistic updates support

**Trade-offs:**
- Adds bundle size (~13KB gzipped)
- Additional abstraction layer

**Alternatives considered:**
- SWR: Simpler but less powerful
- Plain fetch + useState: Too much boilerplate
- Redux: Overkill for API data

### shadcn/ui + Radix UI

**Why:**
- Accessible components out of the box
- Unstyled primitives (full customization)
- Copy-paste components (no NPM bloat)
- Built on Radix UI (battle-tested)

**Trade-offs:**
- Initial setup requires copying components
- Not a traditional component library

**Alternatives considered:**
- Material UI: Too opinionated for Polymarket brand
- Ant Design: Heavy bundle size
- Headless UI: Good but less comprehensive

### Tailwind CSS

**Why:**
- Utility-first approach speeds development
- Excellent mobile-responsive utilities
- Small production bundle (purged CSS)
- Great TypeScript integration

**Trade-offs:**
- Verbose className strings
- Learning curve for new developers

## Project Structure

```
polymarket-market-monitor/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout (providers, fonts)
│   ├── page.tsx           # Home page (dashboard)
│   ├── providers.tsx      # React Query setup
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── market-dashboard.tsx  # Main orchestrator
│   ├── market-card.tsx       # Market display
│   └── ui/                   # shadcn/ui components
├── lib/                   # Business logic
│   ├── api.ts            # Gamma API client
│   └── utils.ts          # Utility functions
└── ...config files
```

### Why This Structure?

**Separation of Concerns:**
- `app/` - Routing and page composition
- `components/` - Reusable UI components
- `lib/` - Pure business logic (no React)

**Benefits:**
- Easy to test (`lib/` has no React dependencies)
- Components are reusable
- Clear file organization

## Data Flow

```
Gamma API
    ↓
fetchMarkets() (lib/api.ts)
    ↓
TanStack Query (caching layer)
    ↓
MarketDashboard (state management)
    ↓
MarketCard (presentation)
    ↓
User sees data
```

### Caching Strategy

```typescript
// Query client config
{
  staleTime: 20 * 1000,     // Fresh for 20 seconds
  gcTime: 5 * 60 * 1000,    // Cache for 5 minutes
  refetchInterval: 30 * 1000, // Refresh every 30s
}
```

**Flow:**
1. User visits page → API fetch
2. Data cached for 20 seconds (no refetch)
3. After 20 seconds, background refetch on next render
4. Auto-refetch every 30 seconds while page active
5. Cache cleared after 5 minutes of inactivity

**Benefits:**
- Reduced API calls (better performance)
- Always fresh data (30s max staleness)
- Smooth UX (no loading spinners)

## Component Architecture

### MarketDashboard (Container)

**Responsibilities:**
- Fetch data via TanStack Query
- Manage filters (category, search)
- Handle loading/error states
- Pass data to child components

**Why this pattern:**
- Single source of truth for data
- Easy to add new filters
- Clear parent-child relationship

### MarketCard (Presentation)

**Responsibilities:**
- Display single market data
- Visual odds representation
- Link to Polymarket.com

**Why this pattern:**
- Pure presentational component
- Easy to test
- Reusable in different contexts

## Performance Optimizations

### 1. useMemo for Filtering

```typescript
const filteredMarkets = useMemo(() => {
  // Expensive filtering logic
}, [markets, category, search]);
```

**Why:** Avoid recalculating filtered list on every render.

### 2. React Query Caching

**Benefits:**
- Automatic request deduplication
- Background refetching doesn't block UI
- Stale-while-revalidate pattern

### 3. Next.js Image Optimization

```typescript
import Image from "next/image";
```

**Benefits:**
- Automatic lazy loading
- WebP conversion
- Responsive images

### 4. CSS Purging

Tailwind removes unused CSS in production:
- Development: ~3MB CSS
- Production: ~10KB CSS

## Error Handling

### API Errors

```typescript
const { data, isError, error, retry } = useQuery({
  queryKey: ['markets'],
  queryFn: fetchMarkets,
  retry: 3, // Exponential backoff
});
```

**Strategy:**
1. Retry failed requests (network issues)
2. Show user-friendly error message
3. Provide manual retry button

### Type Safety

TypeScript catches errors at compile time:
- API response types
- Component props
- Utility function inputs

## Scalability Considerations

### Adding More Data

**Current:** Fetches all markets (~1000)
**Scale to 10,000+:**
- Implement pagination
- Add server-side filtering
- Use infinite scroll

### Adding Real-Time Updates

**Current:** 30-second polling
**Scale to real-time:**
- WebSocket connection
- Server-Sent Events (SSE)
- Optimistic updates

### Multi-User Features

**Future additions:**
- User authentication
- Personal watch lists
- Price alerts
- Trading interface

## Testing Strategy (Not Implemented)

### Recommended Tests

**Unit Tests:**
- `lib/api.ts` - API client functions
- `lib/utils.ts` - Utility functions
- Component rendering

**Integration Tests:**
- MarketDashboard filtering
- Search functionality
- API error handling

**E2E Tests:**
- Full user flow
- Mobile responsiveness
- Link navigation

### Test Stack Recommendations

- **Jest** - Unit testing
- **React Testing Library** - Component tests
- **Playwright** - E2E tests

## Security Considerations

### API Security

**Current:**
- Read-only public API
- No authentication required
- No sensitive data

**If adding write operations:**
- Environment variables for API keys
- Never expose keys in client-side code
- Use Next.js API routes as proxy

### XSS Protection

- React escapes all strings by default
- External links use `rel="noopener noreferrer"`

## Deployment

### Recommended Platform: Vercel

**Why:**
- Zero-config Next.js deployment
- Automatic HTTPS
- Edge network (fast globally)
- Free hobby tier

### Environment Variables

```bash
# None required for current version
# Future: Add API keys via Vercel dashboard
```

### Build Process

```bash
npm run build  # Creates .next/ directory
npm start      # Serves production build
```

## Future Enhancements

### High Priority

1. **Market detail pages** - Full descriptions, charts
2. **Price alerts** - Notify users on odds changes
3. **Historical data** - Chart odds over time

### Medium Priority

4. **Advanced filtering** - Volume, liquidity, date ranges
5. **Social features** - Share markets, comments
6. **Mobile app** - React Native version

### Low Priority

7. **Trading interface** - Buy/sell shares
8. **Portfolio tracking** - User positions
9. **Analytics dashboard** - Market trends

## Lessons Learned

### What Worked Well

✅ TanStack Query simplified data fetching
✅ shadcn/ui provided great UI foundation
✅ TypeScript caught many bugs early
✅ Next.js App Router improved performance

### What Could Be Improved

⚠️ API category inconsistency required normalization
⚠️ Large initial data fetch (could paginate)
⚠️ No type definitions from API (had to infer)

## Conclusion

This architecture balances:
- **Developer experience** (fast to build)
- **User experience** (fast to load)
- **Maintainability** (clear structure)
- **Scalability** (room to grow)

Perfect for a DevRel portfolio project that teaches real-world patterns!
