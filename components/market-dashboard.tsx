"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMarkets,
  getTopMarkets,
  sortMarkets,
  searchMarkets,
} from "@/lib/api";
import { MarketCard } from "./market-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Market Sort Options
 * 
 * Different ways to sort/filter markets for discovery
 */
const SORT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "trending", label: "Trending" },
  { value: "ending-soon", label: "Ending Soon" },
  { value: "long-term", label: "Long-Term" },
  { value: "new", label: "New" },
] as const;

type SortOption = typeof SORT_OPTIONS[number]["value"];

/**
 * Market Dashboard Component
 * 
 * Main dashboard that orchestrates:
 * - Data fetching from Gamma API via TanStack Query
 * - Category filtering via tabs
 * - Search functionality
 * - Auto-refresh every 30 seconds
 * - Loading and error states
 * - Responsive grid layout
 */
export function MarketDashboard() {
  const [selectedSort, setSelectedSort] = useState<SortOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Fetch markets with TanStack Query
   * 
   * Benefits:
   * - Automatic caching (avoid redundant API calls)
   * - Background refetching (keep data fresh)
   * - Loading/error state management
   * - Retry logic on failure
   * 
   * refetchInterval: Auto-refresh every 30 seconds for live odds
   */
  const {
    data: markets = [],
    isLoading,
    isError,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["markets"],
    queryFn: fetchMarkets,
    // Auto-refetch every 30 seconds for live data
    refetchInterval: 30 * 1000,
    // Refetch when window regains focus
    refetchOnWindowFocus: true,
    // Retry failed requests up to 3 times
    retry: 3,
  });

  /**
   * Filtered and processed markets
   * 
   * Processing pipeline:
   * 1. Get top markets by volume (most active)
   * 2. Sort by selected criteria
   * 3. Filter by search query
   * 
   * useMemo: Recalculate only when dependencies change
   */
  const filteredMarkets = useMemo(() => {
    // Start with top 100 markets by volume
    let processed = getTopMarkets(markets, 100);
    
    // Apply sorting
    processed = sortMarkets(processed, selectedSort);
    
    // Apply search filter
    processed = searchMarkets(processed, searchQuery);
    
    return processed;
  }, [markets, selectedSort, searchQuery]);

  /**
   * Format last update time
   */
  const lastUpdated = useMemo(() => {
    if (!dataUpdatedAt) return "";
    const date = new Date(dataUpdatedAt);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [dataUpdatedAt]);

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading markets...</p>
        </div>
      </div>
    );
  }

  /**
   * Error State
   */
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <p className="text-lg font-semibold mb-2">Failed to load markets</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort Tabs */}
        <Tabs
          value={selectedSort}
          onValueChange={(value) => setSelectedSort(value as SortOption)}
          className="w-full"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <TabsList className="flex-wrap h-auto">
              {SORT_OPTIONS.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Status Bar */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline">
                {filteredMarkets.length} market{filteredMarkets.length !== 1 ? "s" : ""}
              </Badge>
              {lastUpdated && (
                <span className="hidden sm:inline">
                  Updated: {lastUpdated}
                </span>
              )}
              <button
                onClick={() => refetch()}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Markets Grid */}
      {filteredMarkets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No markets found matching your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
}
