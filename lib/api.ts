/**
 * Polymarket Gamma API Client
 * 
 * The Gamma API is Polymarket's public REST API for accessing market data.
 * No authentication required for read-only operations.
 * 
 * API Base URL: https://gamma-api.polymarket.com
 * 
 * Key Endpoints:
 * - GET /markets - List all markets with comprehensive data
 * - GET /markets/:slug - Get specific market by slug
 * 
 * Rate Limits: Be respectful with requests. Use caching and reasonable polling intervals.
 */

export const GAMMA_API_BASE_URL = "https://gamma-api.polymarket.com";

/**
 * Market data structure from Gamma API
 * 
 * This interface represents the core market data returned by the API.
 * Each market is a prediction market with YES/NO outcomes (binary) or
 * multiple outcomes (categorical).
 */
export interface Market {
  id: string;
  question: string; // The market question/title
  slug: string; // URL-friendly identifier
  category: string; // Category like "Politics", "Crypto", "Sports"
  image: string; // Market thumbnail image URL
  icon: string; // Market icon URL
  endDate: string; // ISO date when market closes
  volume: string; // Total trading volume in USDC
  liquidity: string; // Available liquidity
  outcomes: string; // JSON string array of outcome names
  outcomePrices: string; // JSON string array of current prices (0-1)
  active: boolean; // Whether market is still accepting trades
  closed: boolean; // Whether market has closed
  volume24hr: number; // Trading volume in last 24 hours
  liquidityNum: number; // Liquidity as number
  volumeNum: number; // Volume as number
  description?: string; // Detailed market description
}

/**
 * Fetch all markets from Gamma API
 * 
 * Returns an array of all active and closed markets.
 * Data includes current odds, volume, liquidity, and metadata.
 * 
 * Usage:
 * ```ts
 * const markets = await fetchMarkets();
 * ```
 */
export async function fetchMarkets(): Promise<Market[]> {
  try {
    /**
     * IMPORTANT: /markets is paginated.
     * If you call it without query params, Gamma currently returns ~20 markets.
     *
     * For a dashboard experience, we request a larger page size and only
     * open markets by default.
     * 
     * Note: We use our own API route (/api/markets) as a proxy to avoid CORS issues.
     * The browser can't directly call gamma-api.polymarket.com due to CORS policy,
     * so we proxy through our Next.js API route which makes the request server-side.
     */
    const url = new URL('/api/markets', window.location.origin);
    url.searchParams.set("limit", "500");
    url.searchParams.set("active", "true");
    url.searchParams.set("closed", "false");

    const response = await fetch(url.toString(), {
      // Disable Next.js cache for real-time data
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching markets:", error);
    throw error;
  }
}

/**
 * Fetch a single market by slug
 * 
 * @param slug - The market's URL slug identifier
 */
export async function fetchMarket(slug: string): Promise<Market> {
  try {
    const response = await fetch(`${GAMMA_API_BASE_URL}/markets/${slug}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching market ${slug}:`, error);
    throw error;
  }
}

/**
 * Sort markets by different criteria
 */
export function sortMarkets(
  markets: Market[],
  sortBy: "trending" | "ending-soon" | "long-term" | "new" | "all"
): Market[] {
  const now = new Date().getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  switch (sortBy) {
    case "all":
      return sortByVolume(markets);
      
    case "trending":
      // High 24hr volume
      return [...markets].sort((a, b) => b.volume24hr - a.volume24hr);
      
    case "ending-soon":
      // Markets ending within 7 days, sorted by end date
      return markets
        .filter((market) => {
          const endTime = new Date(market.endDate).getTime();
          const daysUntilEnd = (endTime - now) / oneDayMs;
          return daysUntilEnd > 0 && daysUntilEnd <= 7;
        })
        .sort((a, b) => {
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        });
      
    case "long-term":
      // Markets ending in 30+ days
      return markets
        .filter((market) => {
          const endTime = new Date(market.endDate).getTime();
          const daysUntilEnd = (endTime - now) / oneDayMs;
          return daysUntilEnd >= 30;
        })
        .sort((a, b) => b.volumeNum - a.volumeNum);
      
    case "new":
      // Recently created (if we had createdAt, but we'll use end date as proxy)
      return [...markets].sort((a, b) => {
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      });
      
    default:
      return markets;
  }
}

/**
 * Search markets by title/question
 * 
 * Case-insensitive search across market questions.
 */
export function searchMarkets(markets: Market[], query: string): Market[] {
  if (!query.trim()) return markets;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return markets.filter((market) =>
    market.question.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Sort markets by volume (highest first)
 * 
 * Useful for showing the most active/popular markets.
 */
export function sortByVolume(markets: Market[]): Market[] {
  return [...markets].sort((a, b) => b.volumeNum - a.volumeNum);
}

/**
 * Get active markets only
 * 
 * Filters out closed/resolved markets.
 */
export function getActiveMarkets(markets: Market[]): Market[] {
  return markets.filter((market) => market.active && !market.closed);
}

/**
 * Get top N markets by volume
 * 
 * Returns the most actively traded markets.
 */
export function getTopMarkets(markets: Market[], limit: number = 50): Market[] {
  return sortByVolume(getActiveMarkets(markets)).slice(0, limit);
}
